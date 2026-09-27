from django.urls import path

from .views import (
    AdminOrderListView,
    AdminOrderStatusView,
    CheckoutView,
    FarmerOrderItemFulfilView,
    FarmerOrderListView,
    OrderDetailView,
    OrderListView,
)


urlpatterns = [
    path(
        "checkout/",
        CheckoutView.as_view(),
        name="checkout",
    ),

    # Farmer fulfilment queue. These must sit above the `<int:pk>` catch-alls
    # below or "farmer" would be matched as an order id (and 404).
    path(
        "farmer/orders/",
        FarmerOrderListView.as_view(),
        name="farmer-order-list",
    ),

    path(
        "farmer/items/<int:pk>/fulfil/",
        FarmerOrderItemFulfilView.as_view(),
        name="farmer-item-fulfil",
    ),

    # Admin order management.
    path(
        "admin/orders/",
        AdminOrderListView.as_view(),
        name="admin-order-list",
    ),

    path(
        "admin/orders/<int:pk>/status/",
        AdminOrderStatusView.as_view(),
        name="admin-order-status",
    ),

    path(
        "",
        OrderListView.as_view(),
        name="order-list",
    ),

    path(
        "<int:pk>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),
]

