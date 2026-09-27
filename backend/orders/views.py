from django.db.models import Count, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.filters import OrderingFilter
from rest_framework.generics import (
    GenericAPIView,
    ListAPIView,
    RetrieveAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdminRole, IsFarmerRole

from .models import Order, OrderItem
from .permissions import CanPurchase, IsOrderOwner
from .serializers import (
    AdminOrderStatusSerializer,
    CheckoutSerializer,
    FarmerOrderItemSerializer,
    FarmerOrderSerializer,
    OrderSerializer,
)
from .services import create_order_from_cart


class CheckoutView(GenericAPIView):
    serializer_class = CheckoutSerializer
    permission_classes = [
        IsAuthenticated,
        CanPurchase,
    ]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        order = create_order_from_cart(
            user=request.user,
            **serializer.validated_data,
        )

        response_serializer = OrderSerializer(
            order
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class OrderListView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [
        IsAuthenticated,
        CanPurchase,
    ]

    def get_queryset(self):
        return (
            Order.objects
            .filter(
                customer=self.request.user
            )
            .select_related(
                "customer",
            )
            .prefetch_related(
                "items__product__farmer__farmer_profile",
            )
        )


class OrderDetailView(RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [
        IsAuthenticated,
        IsOrderOwner,
    ]

    def get_queryset(self):
        return (
            Order.objects
            .filter(
                customer=self.request.user
            )
            .select_related(
                "customer",
            )
            .prefetch_related(
                "items__product__farmer__farmer_profile",
            )
        )



class FarmerOrderListView(ListAPIView):
    """Orders that contain at least one line item from the requesting farmer.

    Annotated with `pending_items` (the farmer's own un-packed rows) so the
    panel can badge orders that still need work, and each order's `items` are
    filtered server-side to just this farmer's rows.
    """

    serializer_class = FarmerOrderSerializer
    permission_classes = [IsAuthenticated, IsFarmerRole]

    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        farmer = self.request.user

        return (
            Order.objects
            .filter(items__farmer=farmer)
            .distinct()
            .select_related("customer")
            .prefetch_related("items")
            .annotate(
                pending_items=Count(
                    "items",
                    filter=Q(items__farmer=farmer, items__farmer_fulfilled=False),
                ),
            )
        )

    def get_serializer_context(self):
        return {
            **super().get_serializer_context(),
            "farmer_id": self.request.user.id,
        }


class FarmerOrderItemFulfilView(GenericAPIView):
    """Marks one of the farmer's line items as packed.

    Ownership is enforced on the queryset (not just object permission) so a
    farmer targeting another farm's row simply gets a 404 rather than a 403 that
    would leak the item's existence.
    """

    queryset = OrderItem.objects.all()
    permission_classes = [IsAuthenticated, IsFarmerRole]

    def post(self, request, *args, **kwargs):
        try:
            item = (
                OrderItem.objects
                .select_for_update()
                .get(pk=self.kwargs["pk"], farmer=request.user)
            )
        except OrderItem.DoesNotExist:
            raise NotFound("This order item does not belong to you.")

        if item.farmer_fulfilled:
            return Response(
                {"detail": "This item is already packed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.farmer_fulfilled = True
        item.fulfilled_at = timezone.now()
        item.save(update_fields=["farmer_fulfilled", "fulfilled_at"])

        return Response(
            FarmerOrderItemSerializer(item).data,
            status=status.HTTP_200_OK,
        )


class AdminOrderListView(ListAPIView):
    """Every order in the marketplace, for the admin dashboard table."""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    filter_backends = [DjangoFilterBackend, OrderingFilter]

    filterset_fields = ["status", "payment_status", "payment_method"]

    ordering_fields = ["created_at", "total", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Order.objects
            .select_related("customer")
            .prefetch_related("items__product__farmer__farmer_profile")
        )


class AdminOrderStatusView(GenericAPIView):
    """Sets an order's status (and optionally its payment status) as an admin."""

    serializer_class = AdminOrderStatusSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        return Order.objects.select_related("customer")

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        update_fields = ["status", "updated_at"]

        order.status = serializer.validated_data["status"]

        if "payment_status" in serializer.validated_data:
            order.payment_status = serializer.validated_data["payment_status"]
            update_fields.append("payment_status")

        order.save(update_fields=update_fields)

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
