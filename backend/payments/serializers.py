from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(
        source="order.id",
        read_only=True,
    )

    class Meta:
        model = Payment

        fields = (
            "id",
            "order_id",
            "provider",
            "status",
            "amount",
            "amount_paisa",
            "pidx",
            "transaction_id",
            "phone",
            "created_at",
            "updated_at",
            "paid_at",
        )

        read_only_fields = fields


class InitiateKhaltiPaymentSerializer(serializers.Serializer):
    # The client only tells us which order to pay for and the mobile number
    # to "pay from". The amount always comes from the order itself.
    order_id = serializers.IntegerField()

    phone = serializers.CharField(
        max_length=20,
    )


class VerifyKhaltiPaymentSerializer(serializers.Serializer):
    pidx = serializers.CharField(
        max_length=100,
    )

    code = serializers.CharField(
        max_length=10,
    )
