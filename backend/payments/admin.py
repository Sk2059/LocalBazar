from django.contrib import admin

from .models import Payment
from .services import mark_payment_completed


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "provider",
        "status",
        "amount",
        "transaction_id",
        "created_at",
        "paid_at",
    )

    list_filter = (
        "provider",
        "status",
    )

    search_fields = (
        "order__customer__email",
        "order__customer__name",
        "pidx",
        "transaction_id",
    )

    readonly_fields = (
        "order",
        "provider",
        "amount",
        "amount_paisa",
        "pidx",
        "transaction_id",
        "provider_response",
        "phone",
        "verification_code",
        "failed_attempts",
        "created_at",
        "updated_at",
        "paid_at",
    )

    actions = [
        "mark_as_paid",
    ]

    @admin.action(
        description=(
            "Mark selected payments as paid "
            "(cash on delivery collected)"
        )
    )
    def mark_as_paid(self, request, queryset):
        """
        Cash on delivery stays pending until the cash is collected. This
        records that collection: the payment completes and the order is
        confirmed. Never use it for an uncollected Khalti order.
        """
        settled = 0

        for payment in queryset.filter(
            status__in=[
                Payment.Status.INITIATED,
                Payment.Status.PENDING,
            ]
        ):
            mark_payment_completed(payment)
            settled += 1

        self.message_user(
            request,
            f"{settled} payment(s) marked as paid.",
        )
