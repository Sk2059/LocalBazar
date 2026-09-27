import random
import uuid

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from orders.models import Order

from .models import Payment

# Demo knobs for the stand-in one-time-code flow.
MAX_VERIFICATION_ATTEMPTS = 5


class KhaltiService:
    """
    Demo stand-in for the Khalti KPG-2 web checkout.

    It keeps the *shape* of the real gateway:

        initiate(payment) -> {"pidx": ..., "payment_url": ...}
        verify(pidx, code) -> settled Payment

    but it never calls Khalti. Instead the buyer enters a mobile number, we
    issue a one-time code, and confirming that code settles the payment.

    Amounts are still expressed in paisa and re-checked against the order on
    settlement, so swapping these two methods for the real
    ``/epayment/initiate/`` and ``/epayment/lookup/`` requests (plus the
    ``Authorization: Key <secret>`` header) is the only change needed to go
    live. Nothing here trusts the client.
    """

    @staticmethod
    def _validate_phone(phone):
        if not phone:
            raise ValidationError({
                "phone": "Mobile number is required.",
            })

        digits = "".join(ch for ch in phone if ch.isdigit())

        # Nepali mobile numbers are 10 digits and start with 9.
        if len(digits) != 10 or not digits.startswith("9"):
            raise ValidationError({
                "phone": "Enter a valid 10-digit mobile number.",
            })

        return digits

    @staticmethod
    def _generate_pidx():
        return f"DEMO-{uuid.uuid4().hex[:16].upper()}"

    @staticmethod
    @transaction.atomic
    def initiate(payment, phone):
        order = payment.order

        if payment.status == Payment.Status.COMPLETED:
            raise ValidationError({
                "payment": "This payment has already been completed.",
            })

        phone = KhaltiService._validate_phone(phone)

        amount_paisa = int(order.total * 100)
        code = f"{random.randint(0, 999999):06d}"

        payment.pidx = KhaltiService._generate_pidx()
        payment.phone = phone
        payment.verification_code = code
        payment.amount = order.total
        payment.amount_paisa = amount_paisa
        payment.status = Payment.Status.INITIATED
        payment.failed_attempts = 0
        payment.provider_response = {
            "mode": "demo",
            "mobile": phone,
            "purchase_order_id": f"ORDER-{order.id}",
            "purchase_order_name": (
                f"Farmers Marketplace Order #{order.id}"
            ),
            "amount_paisa": amount_paisa,
            "message": (
                "Demo mode: no request was sent to Khalti."
            ),
        }

        payment.save(
            update_fields=[
                "pidx",
                "phone",
                "verification_code",
                "amount",
                "amount_paisa",
                "status",
                "failed_attempts",
                "provider_response",
                "updated_at",
            ]
        )

        return {
            "payment_id": payment.id,
            "pidx": payment.pidx,
            # The real gateway hands back a hosted checkout page. In demo
            # mode we point at the frontend's code-entry screen instead.
            "payment_url": (
                f"{settings.FRONTEND_URL}"
                f"/payment-verify?pidx={payment.pidx}"
            ),
            # Only returned because this is a demo. The real gateway would
            # text this code to ``phone`` and never expose it to the caller.
            "demo_code": code,
            "expires_in": 1800,
        }


    @staticmethod
    @transaction.atomic
    def verify(pidx, code):
        try:
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("order")
                .get(pidx=pidx)
            )
        except Payment.DoesNotExist:
            raise ValidationError({
                "payment": "Payment not found.",
            })

        if payment.status == Payment.Status.COMPLETED:
            raise ValidationError({
                "payment": "This payment has already been completed.",
            })

        if payment.failed_attempts >= MAX_VERIFICATION_ATTEMPTS:
            payment.status = Payment.Status.FAILED
            payment.save(
                update_fields=["status", "updated_at"]
            )
            raise ValidationError({
                "code": (
                    "Too many wrong attempts. "
                    "Please initiate the payment again."
                ),
            })

        # Server-side integrity check, kept from the real flow: the amount
        # we settle must still match the order total. A client cannot
        # inflate or deflate the payment by tampering with the request.
        expected_amount_paisa = int(payment.order.total * 100)

        if payment.amount_paisa != expected_amount_paisa:
            payment.status = Payment.Status.FAILED
            payment.save(
                update_fields=["status", "updated_at"]
            )
            raise ValidationError({
                "payment": (
                    "Payment amount does not match the order amount."
                ),
            })

        if not code or code != payment.verification_code:
            payment.failed_attempts += 1
            payment.save(
                update_fields=[
                    "failed_attempts",
                    "updated_at",
                ]
            )
            remaining = (
                MAX_VERIFICATION_ATTEMPTS - payment.failed_attempts
            )
            raise ValidationError({
                "code": (
                    f"Invalid verification code. "
                    f"{remaining} attempt(s) left."
                ),
            })

        mark_payment_completed(payment)

        return payment


@transaction.atomic
def mark_payment_completed(payment):
    """
    Settle a payment and release its order.

    Used by the demo Khalti ``verify`` step and by the admin action that
    records a cash-on-delivery collection.
    """
    payment.status = Payment.Status.COMPLETED
    payment.transaction_id = (
        payment.transaction_id
        or f"DEMO-TXN-{uuid.uuid4().hex[:12].upper()}"
    )
    payment.paid_at = timezone.now()
    payment.provider_response = {
        **payment.provider_response,
        "settled_at": timezone.now().isoformat(),
    }

    payment.save(
        update_fields=[
            "status",
            "transaction_id",
            "paid_at",
            "provider_response",
            "updated_at",
        ]
    )

    order = payment.order

    order.payment_status = Order.PaymentStatus.PAID
    order.status = Order.Status.CONFIRMED

    order.save(
        update_fields=[
            "payment_status",
            "status",
            "updated_at",
        ]
    )
