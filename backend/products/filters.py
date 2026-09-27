import django_filters

from .models import Product


class ProductFilter(django_filters.FilterSet):

    category = django_filters.CharFilter(
        field_name="category__slug",
        lookup_expr="iexact",
    )

    farming_method = django_filters.ChoiceFilter(
        choices=Product.FarmingMethod.choices,
    )

    min_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="gte",
    )

    max_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="lte",
    )

    min_stock = django_filters.NumberFilter(
        field_name="stock",
        lookup_expr="gte",
    )

    max_stock = django_filters.NumberFilter(
        field_name="stock",
        lookup_expr="lte",
    )

    min_rating = django_filters.NumberFilter(
        field_name="rating",
        lookup_expr="gte",
    )

    # Drafts are invisible on the public list but the farmer/admin catalogues
    # need to see them, so activity is an explicit opt-in filter.
    is_active = django_filters.BooleanFilter(
        field_name="is_active",
    )

    farmer = django_filters.NumberFilter(
        field_name="farmer_id",
    )

    class Meta:
        model = Product

        fields = [
            "category",
            "farming_method",
            "is_seasonal",
            "is_featured",
            "is_active",
            "farmer",
            "min_price",
            "max_price",
            "min_stock",
            "max_stock",
            "min_rating",
        ]