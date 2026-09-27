from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product",
        "product_name",
        "price",
        "quantity",
        "subtotal",
        "created_at",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "customer",
        "status",
        "payment_method",
        "payment_status",
        "subtotal",
        "delivery_fee",
        "total",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_method",
        "payment_status",
    )

    search_fields = (
        "customer__email",
        "customer__name",
        "delivery_address",
        "municipality",
        "district",
    )

    readonly_fields = (
        "customer",
        "subtotal",
        "delivery_fee",
        "total",
        "created_at",
        "updated_at",
    )

    inlines = [
        OrderItemInline,
    ]
