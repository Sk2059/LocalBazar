from rest_framework import serializers

from payments.models import Payment
from .models import Order, OrderItem


class CheckoutSerializer(serializers.Serializer):

    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices,
    )

    delivery_address = serializers.CharField(
        max_length=255,
    )

    municipality = serializers.CharField(
        max_length=100,
    )

    district = serializers.CharField(
        max_length=100,
    )

    province = serializers.CharField(
        max_length=100,
        default="Koshi Province",
    )

    delivery_instructions = serializers.CharField(
        required=False,
        allow_blank=True,
    )


class OrderItemSerializer(serializers.ModelSerializer):

    product_image = serializers.ImageField(
        source="product.image",
        read_only=True,
    )

    farmer_name = serializers.CharField(
        source="product.farmer.name",
        read_only=True,
    )

    farm_name = serializers.CharField(
        source="product.farmer.farmer_profile.farm_name",
        read_only=True,
    )

    class Meta:
        model = OrderItem

        fields = (
            "id",
            "product",
            "product_name",
            "product_image",
            "farmer_name",
            "farm_name",
            "price",
            "quantity",
            "subtotal",
            "created_at",
        )

        read_only_fields = fields


class FarmerOrderItemSerializer(serializers.ModelSerializer):
    """A line item as seen by the farmer who has to pack it.

    Grouped under its order, this is the farmer's fulfilment queue: what the
    customer ordered from *this* farm, how many, and whether it is packed.
    """

    class Meta:
        model = OrderItem

        fields = (
            "id",
            "product",
            "product_name",
            "price",
            "quantity",
            "subtotal",
            "unit",
            "farmer_fulfilled",
            "fulfilled_at",
            "created_at",
        )

        read_only_fields = (
            "id",
            "product",
            "product_name",
            "price",
            "quantity",
            "subtotal",
            "unit",
            "farmer_fulfilled",
            "fulfilled_at",
            "created_at",
        )

    unit = serializers.CharField(
        source="product.unit",
        read_only=True,
    )


class AdminOrderStatusSerializer(serializers.Serializer):
    """An admin's manual status override on an order.

    Farmers pack their own line items; the order-level progress (confirmed →
    delivered) is owned by the admin, who is the only one who can see the whole
    order across every farm involved.
    """

    status = serializers.ChoiceField(
        choices=Order.Status.choices,
    )

    payment_status = serializers.ChoiceField(
        choices=Order.PaymentStatus.choices,
        required=False,
    )


class FarmerOrderSerializer(serializers.ModelSerializer):
    """An order, scoped to the requesting farmer's line items.

    A single buyer order can span several farms; each farmer only ever sees the
    rows that belong to them, while the order-level totals and address stay
    visible so they can label the delivery.
    """

    items = serializers.SerializerMethodField()

    customer_name = serializers.CharField(
        source="customer.name",
        read_only=True,
    )

    pending_items = serializers.IntegerField(
        read_only=True,
    )

    class Meta:
        model = Order

        fields = (
            "id",
            "customer_name",
            "status",
            "payment_method",
            "payment_status",
            "delivery_address",
            "municipality",
            "district",
            "province",
            "delivery_instructions",
            "created_at",
            "items",
            "pending_items",
        )

        read_only_fields = fields

    def get_items(self, obj):
        farmer_id = self.context["farmer_id"]
        items = [item for item in obj.items.all() if item.farmer_id == farmer_id]
        return FarmerOrderItemSerializer(items, many=True).data


class OrderPaymentSerializer(serializers.ModelSerializer):
    """The payment recorded for an order, exposed read-only on the order.

    Every order gets a :class:`payments.models.Payment` row at checkout time
    (cash-on-delivery orders start as ``pending``), so the buyer's own order
    views can render the transaction id and "paid at" timestamp in one request
    instead of having to discover the payment primary key separately.
    """

    class Meta:
        model = Payment

        fields = (
            "id",
            "provider",
            "status",
            "amount",
            "transaction_id",
            "pidx",
            "phone",
            "created_at",
            "paid_at",
        )

        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    customer_name = serializers.CharField(
        source="customer.name",
        read_only=True,
    )

    # A missing payment renders as ``null`` (DRF maps the absent reverse
    # relation to None), so legacy rows without a payment still serialize.
    payment = OrderPaymentSerializer(
        read_only=True,
    )

    class Meta:
        model = Order

        fields = (
            "id",
            "customer",
            "customer_name",
            "status",
            "payment_method",
            "payment_status",
            "delivery_address",
            "municipality",
            "district",
            "province",
            "delivery_instructions",
            "subtotal",
            "delivery_fee",
            "total",
            "payment",
            "items",
            "created_at",
            "updated_at",
        )

        read_only_fields = fields
