from django.urls import path

from .views import (
    CartItemDetailView,
    CartItemListCreateView,
    CartView,
)


urlpatterns = [
    path(
        "",
        CartView.as_view(),
        name="cart",
    ),

    path(
        "items/",
        CartItemListCreateView.as_view(),
        name="cart-item-list-create",
    ),

    path(
        "items/<int:pk>/",
        CartItemDetailView.as_view(),
        name="cart-item-detail",
    ),
]