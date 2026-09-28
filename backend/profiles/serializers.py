from rest_framework import serializers

from .models import BuyerProfile, FarmerProfile


class PublicFarmerSerializer(serializers.ModelSerializer):
    """A farm as shoppers see it in the marketplace's "Meet the farmers" pages.

    The profile model itself is thin — a farm's public presence is mostly the
    catalogue it sells — so the catalogue is denormalised here: the product
    count, the average rating across active listings, the distinct categories
    and farming methods, and how many orders ever carried a line from this
    farm. Everything is annotated/prefetched by the view so the list renders
    in a couple of queries instead of one per card.
    """

    # Farmers are identified by their account id everywhere else in the API —
    # `product.farmer`, `order_item.farmer` — so the public endpoints are keyed
    # on it too. That keeps `/farmers/<id>/` links consistent whether they come
    # from a product card or the directory.
    id = serializers.IntegerField(
        source="user_id",
        read_only=True,
    )

    farmer_name = serializers.CharField(
        source="user.name",
        read_only=True,
    )

    profile_picture = serializers.ImageField(
        source="user.profile_picture",
        read_only=True,
        allow_null=True,
    )

    location = serializers.SerializerMethodField()

    verified = serializers.SerializerMethodField()

    joined = serializers.SerializerMethodField()

    product_count = serializers.IntegerField(
        read_only=True,
    )

    avg_rating = serializers.FloatField(
        read_only=True,
    )

    orders_count = serializers.IntegerField(
        read_only=True,
    )

    categories = serializers.SerializerMethodField()

    farming_methods = serializers.SerializerMethodField()

    class Meta:
        model = FarmerProfile

        fields = (
            "id",
            "farmer_name",
            "farm_name",
            "description",
            "municipality",
            "district",
            "province",
            "location",
            "farm_image",
            "profile_picture",
            "verified",
            "joined",
            "product_count",
            "avg_rating",
            "orders_count",
            "categories",
            "farming_methods",
            "created_at",
        )

        read_only_fields = fields

    def get_location(self, obj):
        """`municipality, district` — the same string the product cards show."""
        return ", ".join(
            value
            for value in (obj.municipality, obj.district)
            if value
        )

    def get_verified(self, obj):
        return obj.verification_status == FarmerProfile.VerificationStatus.VERIFIED

    def get_joined(self, obj):
        """The year the farm joined, shown as "Member since" on the detail page."""
        return str(obj.created_at.year)

    def _active_products(self, obj):
        """The view prefetches active listings onto the user as `active_products`."""
        return getattr(obj.user, "active_products", None) or []

    def get_categories(self, obj):
        categories = []

        for product in self._active_products(obj):
            name = getattr(product.category, "name", None)

            if name and name not in categories:
                categories.append(name)

        return categories

    def get_farming_methods(self, obj):
        methods = []

        for product in self._active_products(obj):
            if product.farming_method and product.farming_method not in methods:
                methods.append(product.farming_method)

        return methods


class FarmerProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = FarmerProfile

        fields = (
            "id",
            "user",
            "farm_name",
            "address",
            "municipality",
            "district",
            "province",
            "description",
            "farm_image",
            "verification_document",
            "verification_status",
            "verification_note",
            "verified_at",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "user",
            "verification_status",
            "verification_note",
            "verified_at",
            "created_at",
            "updated_at",
        )


class BuyerProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = BuyerProfile

        fields = (
            "id",
            "user",
            "address",
            "municipality",
            "district",
            "province",
            "delivery_instructions",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "user",
            "created_at",
            "updated_at",
        )
        
class FarmerVerificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = FarmerProfile

        fields = (
            "id",
            "farm_name",
            "verification_status",
            "verification_note",
            "verified_at",
        )

        read_only_fields = (
            "id",
            "farm_name",
            "verified_at",
        )

    def validate_verification_status(self, value):
        allowed_statuses = {
            FarmerProfile.VerificationStatus.VERIFIED,
            FarmerProfile.VerificationStatus.REJECTED,
            FarmerProfile.VerificationStatus.PENDING,
        }

        if value not in allowed_statuses:
            raise serializers.ValidationError(
                "Invalid verification status."
            )

        return value


class FarmerVerificationSubmitSerializer(serializers.ModelSerializer):
    """Payload a farmer sends to (re)submit their farm for verification.

    Everything an admin needs to decide is captured up-front: the farm's name,
    a physical address and a document. Submitting always resets the workflow to
    ``pending`` so a rejected farmer can re-apply after fixing the flagged
    problem.
    """

    # The model field is blank=True (a farmer can save a draft profile without
    # one), but an application is meaningless without proof, so make it
    # mandatory on this endpoint only.
    verification_document = serializers.FileField(required=True)

    class Meta:
        model = FarmerProfile

        fields = (
            "id",
            "farm_name",
            "address",
            "municipality",
            "district",
            "province",
            "description",
            "farm_image",
            "verification_document",
            "verification_status",
            "verification_note",
            "verified_at",
        )

        read_only_fields = (
            "id",
            "verification_status",
            "verification_note",
            "verified_at",
        )

    def validate_farm_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError(
                "A farm name is required to apply for verification."
            )
        return value.strip()

    def validate_address(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError(
                "A farm address is required to apply for verification."
            )
        return value.strip()

    def validate_verification_document(self, value):
        if not value:
            raise serializers.ValidationError(
                "Please upload a document to support your application."
            )
        return value


class AdminFarmerProfileSerializer(serializers.ModelSerializer):
    """A farmer's profile as seen by an administrator in the review queue.

    Denormalises the account fields the queue displays (name, email, avatar)
    and annotates the catalogue size so the admin table renders in one request.
    """

    farmer_name = serializers.CharField(
        source="user.name",
        read_only=True,
    )

    farmer_email = serializers.CharField(
        source="user.email",
        read_only=True,
    )

    farmer_phone = serializers.CharField(
        source="user.phone",
        read_only=True,
        allow_null=True,
    )

    profile_picture = serializers.ImageField(
        source="user.profile_picture",
        read_only=True,
        allow_null=True,
    )

    product_count = serializers.IntegerField(
        read_only=True,
    )

    class Meta:
        model = FarmerProfile

        fields = (
            "id",
            "farmer_name",
            "farmer_email",
            "farmer_phone",
            "profile_picture",
            "farm_name",
            "address",
            "municipality",
            "district",
            "province",
            "description",
            "farm_image",
            "verification_document",
            "verification_status",
            "verification_note",
            "verified_at",
            "product_count",
            "created_at",
        )

        read_only_fields = fields
