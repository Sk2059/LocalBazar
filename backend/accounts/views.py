from django.db.models import Count, Q, Sum
from django.shortcuts import render, HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import (
    CreateAPIView,
    GenericAPIView,
    ListAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from orders.models import Order
from products.models import Category, Product
from profiles.models import FarmerProfile

from .models import User
from .permissions import IsAdminRole
from .serializers import (
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    LoginSerializer,
    RegisterSerializers,
    UserSerializer,
)
# Create your views here.

class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializers
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
            )
        serializer.is_valid(
            raise_exception=True
            )
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        response_data = {
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
        )

class LoginView(GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
            )
        serializer.is_valid(
            raise_exception=True
            )
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        response_data = {
            "user": UserSerializer(user).data,
            "refresh": str(refresh),    
            "access": str(refresh.access_token),
        }

        return Response(
            response_data, 
            status=status.HTTP_200_OK
            )

class MeView(RetrieveUpdateAPIView):
    """The signed-in user's own account.

    `GET` feeds the header menu and checkout prefill; `PATCH` is self-service for
    name, phone and profile picture. Role and email are immutable here — an
    admin must use the admin endpoints to change a role.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminStatsView(GenericAPIView):
    """The numbers behind the admin dashboard.

    One round trip gives the overview cards (users, revenue, orders, products),
    the verification queue size and the five most recent orders, so the
    dashboard's first paint is a single request.
    """

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, *args, **kwargs):
        users = User.objects.all()
        farmers = FarmerProfile.objects.all()
        products = Product.objects.all()

        # Revenue is recognised when the payment settled (Khalti) or the
        # cash-on-delivery order actually reached the customer.
        revenue = (
            Order.objects
            .filter(
                Q(payment_status=Order.PaymentStatus.PAID)
                | Q(
                    payment_method=Order.PaymentMethod.COD,
                    status=Order.Status.DELIVERED,
                )
            )
            .aggregate(total=Sum("total"))["total"]
            or 0
        )

        order_status_counts = list(
            Order.objects
            .values("status")
            .annotate(count=Count("id"))
        )

        recent_orders = (
            Order.objects
            .select_related("customer")
            .order_by("-created_at")[:5]
        )

        return Response(
            {
                "users": {
                    "total": users.count(),
                    "buyers": users.filter(role=User.Role.BUYER).count(),
                    "farmers": users.filter(role=User.Role.FARMER).count(),
                    "admins": users.filter(role=User.Role.ADMIN).count(),
                    "suspended": users.filter(is_active=False).count(),
                },
                "verification": {
                    "pending": farmers.filter(
                        verification_status=FarmerProfile.VerificationStatus.PENDING
                    ).count(),
                    "verified": farmers.filter(
                        verification_status=FarmerProfile.VerificationStatus.VERIFIED
                    ).count(),
                    "rejected": farmers.filter(
                        verification_status=FarmerProfile.VerificationStatus.REJECTED
                    ).count(),
                },
                "orders": {
                    "total": Order.objects.count(),
                    **{
                        item["status"]: item["count"]
                        for item in order_status_counts
                    },
                    "revenue": str(revenue),
                },
                "products": {
                    "total": products.count(),
                    "active": products.filter(is_active=True).count(),
                    "out_of_stock": products.filter(stock=0).count(),
                    "low_stock": products.filter(stock__lt=10, stock__gt=0).count(),
                },
                "categories": Category.objects.count(),
                "recent_orders": [
                    {
                        "id": order.id,
                        "customer_name": order.customer.name,
                        "total": str(order.total),
                        "status": order.status,
                        "payment_status": order.payment_status,
                        "created_at": order.created_at,
                    }
                    for order in recent_orders
                ],
            },
            status=status.HTTP_200_OK,
        )

    
    
    
    
    
class AdminUserListView(ListAPIView):
    """Every account, filterable by role and activity, for the admin directory."""

    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = ["role", "is_active"]

    search_fields = ["name", "email", "phone"]

    ordering_fields = ["created_at", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        # Only count orders that represent real purchasing activity; a basket
        # abandoned mid-checkout never produces an Order row in the first place.
        active_statuses = [
            Order.Status.CONFIRMED,
            Order.Status.PROCESSING,
            Order.Status.READY,
            Order.Status.OUT_FOR_DELIVERY,
            Order.Status.DELIVERED,
        ]

        return (
            User.objects
            .annotate(
                order_count=Count(
                    "orders",
                    filter=Q(orders__status__in=active_statuses),
                ),
            )
        )


class AdminUserDetailView(RetrieveUpdateAPIView):
    """Read or amend one account: rename, re-role, suspend or restore."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return AdminUserUpdateSerializer
        return AdminUserSerializer

    def get_queryset(self):
        active_statuses = [
            Order.Status.CONFIRMED,
            Order.Status.PROCESSING,
            Order.Status.READY,
            Order.Status.OUT_FOR_DELIVERY,
            Order.Status.DELIVERED,
        ]

        return User.objects.annotate(
            order_count=Count(
                "orders",
                filter=Q(orders__status__in=active_statuses),
            ),
        )


def index(request):
    return HttpResponse("Hello, world. You're at the accounts index.")