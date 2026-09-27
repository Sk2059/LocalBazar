from django.utils.text import slugify
from rest_framework import serializers

from .models import Category, Product


def _unique_slug(model, base: str, exclude_pk: int | None = None) -> str:
    """Builds a unique slug for ``model`` from ``base``.

    Catalogue forms never ask for a slug, so every name needs one derived
    automatically; ``slugify`` alone collides on duplicates and on names that
    slugify to nothing (e.g. "!!!"), so we append a counter until it's free and
    fall back to a UUID-ish suffix for the empty case.
    """

    slug = slugify(base) or "item"

    queryset = model.objects.all()

    if exclude_pk is not None:
        queryset = queryset.exclude(pk=exclude_pk)

    if not queryset.filter(slug=slug).exists():
        return slug

    counter = 2

    while queryset.filter(slug=f"{slug}-{counter}").exists():
        counter += 1

    return f"{slug}-{counter}"


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category

        fields = (
            "id",
            "name",
            "slug",
            "description",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "slug",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Category name is required.")
        return value.strip()


    def create(self, validated_data):
        validated_data["slug"] = _unique_slug(Category, validated_data["name"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Keep the slug in step with a renamed category, but only when the name
        # actually changed — otherwise we'd churn every slug in the catalogue.
        new_name = validated_data.get("name")

        if new_name and new_name != instance.name:
            validated_data["slug"] = _unique_slug(
                Category, new_name, exclude_pk=instance.pk
            )

        return super().update(instance, validated_data)

class AdminCategorySerializer(CategorySerializer):
    """The console's view of a category.

    Extends the public serializer with ``product_count`` — how many products
    are filed under it — so the admin can see which categories are in use
    before deleting one.
    """

    product_count = serializers.IntegerField(read_only=True)

    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields + ("product_count",)


class ProductSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    category_slug = serializers.CharField(
        source="category.slug",
        read_only=True,
    )

    farmer_name = serializers.CharField(
        source="farmer.name",
        read_only=True,
    )

    farm_name = serializers.CharField(
        source="farmer.farmer_profile.farm_name",
        read_only=True,
    )

    farmer_location = serializers.SerializerMethodField()

    farmer_verified = serializers.SerializerMethodField()

    # Catalogue forms never ask for a slug — `validate()` derives a unique one
    # from the name — so the field is optional on input. An explicit slug is
    # still honoured when supplied.
    slug = serializers.SlugField(required=False)

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "slug",
            "description",
            "category",
            "category_name",
            "category_slug",
            "farmer",
            "farmer_name",
            "farm_name",
            "farmer_location",
            "farmer_verified",
            "price",
            "bulk_price",
            "bulk_minimum_quantity",
            "rating",
            "unit",
            "stock",
            "image",
            "farming_method",
            "is_seasonal",
            "is_featured",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "farmer",
            "farmer_name",
            "farm_name",
            "farmer_verified",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        price = attrs.get("price", getattr(self.instance, "price", None))
        bulk_price = attrs.get(
            "bulk_price",
            getattr(self.instance, "bulk_price", None),
        )
        bulk_quantity = attrs.get(
            "bulk_minimum_quantity",
            getattr(self.instance, "bulk_minimum_quantity", None),
        )

        if bulk_quantity is not None and bulk_quantity < 1:
            raise serializers.ValidationError({
                "bulk_minimum_quantity": "Bulk quantity must be at least 1.",
            })

        if price is not None and bulk_price is not None and bulk_price > price:
            raise serializers.ValidationError({
                "bulk_price": "Bulk price cannot be higher than the regular price.",
            })

        # Catalogue forms never collect a slug, so derive one from the name on
        # the way through. An explicit slug is still honoured (and normalised).
        incoming_slug = attrs.get("slug") or ""
        name = attrs.get("name", getattr(self.instance, "name", None))

        if not incoming_slug.strip() and name:
            attrs["slug"] = _unique_slug(
                Product, name, exclude_pk=getattr(self.instance, "pk", None)
            )

        return attrs

    def get_farmer_verified(self, obj):
        profile = getattr(
            obj.farmer,
            "farmer_profile",
            None,
        )

        if profile is None:
            return False

        return (
            profile.verification_status
            == "verified"
        )

    def get_farmer_location(self, obj):
        profile = getattr(
            obj.farmer,
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