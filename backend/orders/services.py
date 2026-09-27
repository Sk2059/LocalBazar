from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import ValidationError

from cart.models import Cart
from delivery.models import DeliveryZone
from payments.models import Payment
from products.models import Product

from .models import Order, OrderItem


@transaction.atomic
def create_order_from_cart(
    *,
    user,
    payment_method,
    delivery_address,
    municipality,
    district,
    province,
    delivery_instructions="",
):
    try:
        cart = (
            Cart.objects
            .prefetch_related("items")
            .get(user=user)
        )
    except Cart.DoesNotExist:
        raise ValidationError({
            "cart": "Your cart is empty."
        })

    cart_items = list(cart.items.all())

    if not cart_items:
        raise ValidationError({
            "cart": "Your cart is empty."
        })

    product_ids = [
        item.product_id
        for item in cart_items
    ]

    locked_products = {
        product.id: product
        for product in (
            Product.objects
            .select_for_update()
            # Only inner joins here: PostgreSQL forbids FOR UPDATE
            # on the nullable side of an outer join, so we must not
            # select_related the reverse farmer_profile relation.
            # The service only needs product fields for the snapshot.
            .select_related("farmer")
            .filter(
                id__in=product_ids,
                is_active=True,
            )
        )
    }

    subtotal = Decimal("0")

    order_items = []

    for cart_item in cart_items:

        product = locked_products.get(
            cart_item.product_id
        )

        if product is None:
            raise ValidationError({
                "product": (
                    f"{cart_item.product.name} "
                    "is no longer available."
                )
            })

        if cart_item.quantity > product.stock:
            raise ValidationError({
                "stock": (
                    f"Only {product.stock} units "
                    f"of {product.name} are available."
                )
            })

        item_subtotal = (
            product.price * cart_item.quantity
        )

        subtotal += item_subtotal

        order_items.append({
            "product": product,
            "product_name": product.name,
            "price": product.price,
            "quantity": cart_item.quantity,
            "subtotal": item_subtotal,
            "farmer": product.farmer,
        })

    try:
        delivery_zone = (
            DeliveryZone.objects
            .get(
                province=province,
                district=district,
                municipality=municipality,
                is_active=True,
            )
        )
    except DeliveryZone.DoesNotExist:
        raise ValidationError({
            "delivery_zone": (
                "Delivery is currently unavailable "
                "for this location."
            )
        })

    if subtotal < delivery_zone.minimum_order_amount:
        raise ValidationError({
            "minimum_order": (
                f"Minimum order amount for "
                f"{delivery_zone.name} is "
                f"Rs. {delivery_zone.minimum_order_amount}."
            )
        })

    delivery_fee = delivery_zone.delivery_fee

    total = subtotal + delivery_fee

    order = Order.objects.create(
        customer=user,
        payment_method=payment_method,
        delivery_address=delivery_address,
        municipality=municipality,
        district=district,
        province=province,
        delivery_instructions=delivery_instructions,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
    )

    # Snapshot the payment intent. The provider is chosen at checkout, but
    # nothing is settled yet: Khalti settles on code verification and cash
    # on delivery settles when an admin records the collection.
    Payment.objects.create(
        order=order,
        provider=(
            Payment.Provider.KHALTI
            if payment_method
            == Order.PaymentMethod.KHALTI
            else Payment.Provider.COD
        ),
        status=(
            Payment.Status.PENDING
            if payment_method
            == Order.PaymentMethod.COD
            else Payment.Status.INITIATED
        ),
        amount=total,
        amount_paisa=int(total * Decimal("100")),
    )

    for item in order_items:
        OrderItem.objects.create(
            order=order,
            product=item["product"],
            product_name=item["product_name"],
            price=item["price"],
            quantity=item["quantity"],
            subtotal=item["subtotal"],
            farmer=item["farmer"],
        )

        item["product"].stock -= item["quantity"]

        item["product"].save(
            update_fields=[
                "stock",
                "updated_at",
            ]
        )

    cart.items.all().delete()

    return order
