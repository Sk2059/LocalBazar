from django.db import models
from django.conf import settings

# Create your models here.

class FarmerProfile(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="farmer_profile"
    )
    farm_name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    municipality = models.CharField(
        max_length=100,
        blank=True,
    )

    district = models.CharField(
        max_length=100,
        blank=True,
    )

    province = models.CharField(
        max_length=100,
        default="Koshi Province",
    )

    description = models.TextField(
        blank=True,
    )
    farm_image = models.ImageField(
        upload_to="farm_images/",
        blank=True,
        null=True,
    )
    verification_document = models.FileField(
        upload_to="verification_documents/",
        blank=True,
    )

    verification_status = models.CharField(
        max_length=10,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )

    verification_note = models.TextField(
        blank=True,
    )
    verified_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.farm_name


class BuyerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="buyer_profile"
    )
    address = models.CharField(max_length=255)
    municipality = models.CharField(
        max_length=100,
        blank=True,
    )

    district = models.CharField(
        max_length=100,
        blank=True,
    )

    province = models.CharField(
        max_length=100,
        default="Koshi Province",
    )
    
    delivery_instructions = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.user.name

        