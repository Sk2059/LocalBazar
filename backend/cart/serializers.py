from rest_framework import serializers

from products.models import Product

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    product_slug = serializers.CharField(
        source="product.slug",
        read_only=True,
    )

    product_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    product_bulk_price = serializers.DecimalField(
        source="product.bulk_price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    product_bulk_minimum_quantity = serializers.IntegerField(
        source="product.bulk_minimum_quantity",
        read_only=True,
    )

    product_category_name = serializers.CharField(
        source="product.category.name",
        read_only=True,
    )

    product_category_slug = serializers.CharField(
        source="product.category.slug",
        read_only=True,
    )

    product_rating = serializers.DecimalField(
        source="product.rating",
        max_digits=3,
        decimal_places=2,
        read_only=True,
    )

    product_unit = serializers.CharField(
        source="product.unit",
        read_only=True,
    )

    product_image = serializers.ImageField(
        source="product.image",
        read_only=True,
    )

    product_farming_method = serializers.CharField(
        source="product.farming_method",
        read_only=True,
    )

    product_is_seasonal = serializers.BooleanField(
        source="product.is_seasonal",
        read_only=True,
    )

    product_is_featured = serializers.BooleanField(
        source="product.is_featured",
        read_only=True,
    )

    available_stock = serializers.IntegerField(
        source="product.stock",
        read_only=True,
    )

    farmer_name = serializers.CharField(
        source="product.farmer.name",
        read_only=True,
    )

    farmer_id = serializers.IntegerField(
        source="product.farmer.id",
        read_only=True,
    )

    farm_name = serializers.CharField(
        source="product.farmer.farmer_profile.farm_name",
        read_only=True,
    )

    farmer_location = serializers.SerializerMethodField()

    farmer_verified = serializers.SerializerMethodField()

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem

        fields = (
            "id",
            "product",
            "product_name",
            "product_slug",
            "product_price",
            "product_bulk_price",
            "product_bulk_minimum_quantity",
            "product_category_name",
            "product_category_slug",
            "product_rating",
            "product_unit",
            "product_image",
            "product_farming_method",
            "product_is_seasonal",
            "product_is_featured",
            "available_stock",
            "farmer_id",
            "farmer_name",
            "farm_name",
            "farmer_location",
            "farmer_verified",
            "quantity",
            "subtotal",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "product_name",
            "product_slug",
            "product_price",
            "product_bulk_price",
            "product_bulk_minimum_quantity",
            "product_category_name",
            "product_category_slug",
            "product_rating",
            "product_unit",
            "product_image",
            "product_farming_method",
            "product_is_seasonal",
            "product_is_featured",
            "available_stock",
            "farmer_id",
            "farmer_name",
            "farm_name",
            "farmer_location",
            "farmer_verified",
            "subtotal",
            "created_at",
            "updated_at",
        )

    def validate_product(self, product):
        if not product.is_active:
            raise serializers.ValidationError(
                "This product is no longer available."
            )

        if product.stock <= 0:
            raise serializers.ValidationError(
                "This product is currently out of stock."
            )

        return product

    def validate_quantity(self, quantity):
        if quantity < 1:
            raise serializers.ValidationError(
                "Quantity must be at least 1."
            )

        return quantity

    def validate(self, attrs):
        product = attrs.get("product")

        if product is None:
            return attrs

        quantity = attrs.get(
            "quantity",
            self.instance.quantity if self.instance else 1,
        )

        if quantity > product.stock:
            raise serializers.ValidationError({
                "quantity": (
                    f"Only {product.stock} units are available."
                )
            })

        return attrs

    def get_subtotal(self, obj):
        return obj.product.price * obj.quantity

    def get_farmer_location(self, obj):
        profile = getattr(
            obj.product.farmer,
            "farmer_profile",
            None,
        )

        if profile is None:
            return ""

        return ", ".join(
            value
            for value in (
                profile.municipality,
                profile.district,
            )
            if value
        )

    def get_farmer_verified(self, obj):
        profile = getattr(
            obj.product.farmer,
            "farmer_profile",
            None,
        )

        if profile is None:
            return False

        return profile.verification_status == "verified"


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    total_items = serializers.SerializerMethodField()

    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Cart

        fields = (
            "id",
            "items",
            "total_items",
            "total_amount",
            "created_at",
            "updated_at",
        )

        read_only_fields = fields

    def get_total_items(self, obj):
        return sum(
            item.quantity
            for item in obj.items.all()
        )

    def get_total_amount(self, obj):
        return sum(
            item.product.price * item.quantity
            for item in obj.items.all()
        )