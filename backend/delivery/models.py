from django.db import models


class DeliveryZone(models.Model):
    name = models.CharField(
        max_length=150,
        unique=True,
    )

    province = models.CharField(
        max_length=100,
        default="Koshi Province",
    )

    district = models.CharField(
        max_length=100,
    )

    municipality = models.CharField(
        max_length=100,
    )

    delivery_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    estimated_delivery_days = models.PositiveIntegerField(
        default=2,
    )

    minimum_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["district", "municipality"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "province",
                    "district",
                    "municipality",
                ],
                name="unique_delivery_location",
            ),
        ]

    def __str__(self):
        return self.name
