from django.db.models import Count, ProtectedError
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.filters import (
    OrderingFilter,
    SearchFilter,
)

from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.exceptions import ValidationError

from .models import Category, Product
from .permissions import (
    IsAdmin,
    IsProductOwnerOrAdmin,
    IsVerifiedFarmer,
)
from accounts.permissions import IsFarmerRole
from .serializers import (
    AdminCategorySerializer,
    CategorySerializer,
    ProductSerializer,
)

from .filters import ProductFilter
from .pagination import ProductPagination

class CategoryListCreateView(ListCreateAPIView):
    queryset = Category.objects.filter(
        is_active=True
    )
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [
            IsAuthenticated(),
            IsAdmin(),
        ]

class CategoryDetailView(
    RetrieveUpdateDestroyAPIView
):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]


class AdminCategoryListCreateView(ListCreateAPIView):
    """Every category for the console, archived ones included.

    The public list deliberately hides ``is_active=False`` rows, so the admin
    tab needs its own endpoint to manage the full catalogue. Each row carries a
    product count so the table can show which categories are in use.
    """

    serializer_class = AdminCategorySerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
    ]

    filterset_fields = ["is_active"]

    search_fields = ["name", "description"]

    def get_queryset(self):
        return Category.objects.annotate(
            product_count=Count("products"),
        )


class AdminCategoryDetailView(RetrieveUpdateDestroyAPIView):
    """Read, rename, re-image, archive or delete one category.

    Deleting is refused while products still reference it: ``Product.category``
    is ``PROTECT``, so the delete would otherwise raise a 500. Surfacing it as
    a validation error keeps the console's message honest.
    """

    serializer_class = AdminCategorySerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def get_queryset(self):
        return Category.objects.annotate(
            product_count=Count("products"),
        )

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError(
                "This category still has products in it. Move or remove them "
                "before deleting the category."
            )


class ProductListCreateView(
    ListCreateAPIView
):
    serializer_class = ProductSerializer
    pagination_class = ProductPagination

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_class = ProductFilter

    search_fields = [
        "name",
        "slug",
        "description",
        "farmer__name",
        "farmer__farmer_profile__farm_name",
        "category__name",
    ]

    ordering_fields = [
        "name",
        "price",
        "rating",
        "stock",
        "created_at",
        "updated_at",
        "category__name",
        "farmer__name",
    ]

    ordering = [
        "-created_at"
    ]

    def get_queryset(self):
        return (
            Product.objects
            .select_related(
                "category",
                "farmer",
                "farmer__farmer_profile",
            )
            .filter(
                is_active=True
            )
        )

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [
            IsAuthenticated(),
            IsVerifiedFarmer(),
        ]

    def perform_create(self, serializer):
        serializer.save(
            farmer=self.request.user
        )
        
class FarmerProductListView(ListAPIView):
    """The requesting farmer's own catalogue, drafts included.

    The public list deliberately hides inactive products, so a farmer editing a
    draft would never find it there. This view shows everything they own —
    active, draft and out-of-stock alike.
    """

    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    permission_classes = [IsAuthenticated, IsFarmerRole]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_class = ProductFilter

    search_fields = ["name", "description", "category__name"]

    ordering_fields = ["name", "price", "stock", "created_at", "updated_at"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        return (
            Product.objects
            .select_related("category", "farmer", "farmer__farmer_profile")
            .filter(farmer=self.request.user)
        )


class AdminProductListView(ListAPIView):
    """Every product in the catalogue, including drafts and out-of-stock rows."""

    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    permission_classes = [IsAuthenticated, IsAdmin]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_class = ProductFilter

    search_fields = [
        "name",
        "description",
        "farmer__name",
        "farmer__farmer_profile__farm_name",
        "category__name",
    ]

    ordering_fields = [
        "name",
        "price",
        "stock",
        "created_at",
        "updated_at",
        "farmer__name",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Product.objects
            .select_related("category", "farmer", "farmer__farmer_profile")
        )


class AdminProductDetailView(RetrieveUpdateDestroyAPIView):
    """Read, feature, un-feature, hide or delete one product.

    This is admin-only, so unlike the public detail view it also reaches
    drafts — the console has to manage products the marketplace hides. The
    console only ever patches the curation flags (`is_featured`, `is_active`),
    so a partial update is used to avoid clobbering the farmer's own fields.
    """

    queryset = (
        Product.objects
        .select_related("category", "farmer", "farmer__farmer_profile")
    )

    serializer_class = ProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]


class ProductDetailView(
    RetrieveUpdateDestroyAPIView
):


    queryset = (
        Product.objects
        .select_related(
            "category",
            "farmer",
            "farmer__farmer_profile",
        )
    )

    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [
            IsAuthenticated(),
            IsProductOwnerOrAdmin(),
        ]