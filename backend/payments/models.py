from django.db import models

from orders.models import Order


class Payment(models.Model):

    class Status(models.TextChoices):
        INITIATED = "initiated", "Initiated"
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    class Provider(models.TextChoices):
        KHALTI = "khalti", "Khalti"
        COD = "cod", "Cash on Delivery"

    order = models.OneToOneField(
        Order,
        on_delete=models.PROTECT,
        related_name="payment",
    )

    provider = models.CharField(
        max_length=20,
        choices=Provider.choices,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.INITIATED,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    amount_paisa = models.PositiveBigIntegerField(
        default=0,
    )

    # Khalti payment index. The real gateway returns this on initiation;
    # in demo mode we generate our own unique value.
    pidx = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
    )

    transaction_id = models.CharField(
        max_length=150,
        blank=True,
    )

    # Demo-only Khalti OTP flow. The real gateway never exposes these to us:
    # it hosts its own checkout page and only tells us the result. Here the
    # buyer "pays from" a mobile number and confirms with a one-time code.
    phone = models.CharField(
        max_length=20,
        blank=True,
    )

    verification_code = models.CharField(
        max_length=10,
        blank=True,
    )

    failed_attempts = models.PositiveIntegerField(
        default=0,
    )

    provider_response = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"Payment #{self.id} "
            f"- Order #{self.order_id}"
        )
