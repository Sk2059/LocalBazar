from django.contrib import admin

from .models import DeliveryZone


@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "province",
        "district",
        "municipality",
        "delivery_fee",
        "estimated_delivery_days",
        "minimum_order_amount",
        "is_active",
    )

    list_filter = (
        "province",
        "district",
        "is_active",
    )

    search_fields = (
        "name",
        "district",
        "municipality",
    )

    ordering = (
        "district",
        "municipality",
    )
