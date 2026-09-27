from rest_framework import serializers

from .models import DeliveryZone


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone

        fields = (
            "id",
            "name",
            "province",
            "district",
            "municipality",
            "delivery_fee",
            "estimated_delivery_days",
            "minimum_order_amount",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )
