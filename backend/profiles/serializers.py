from rest_framework import serializers

from .models import BuyerProfile, FarmerProfile


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
