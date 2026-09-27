from django.urls import path

from .views import (
    AdminDeliveryZoneDetailView,
    AdminDeliveryZoneListCreateView,
    DeliveryZoneDetailView,
    DeliveryZoneListCreateView,
)


urlpatterns = [
    path(
        "zones/",
        DeliveryZoneListCreateView.as_view(),
        name="delivery-zone-list-create",
    ),

    path(
        "zones/<int:pk>/",
        DeliveryZoneDetailView.as_view(),
        name="delivery-zone-detail",
    ),

    # Admin delivery-location management; returns paused zones too.
    path(
        "admin/zones/",
        AdminDeliveryZoneListCreateView.as_view(),
        name="admin-delivery-zone-list-create",
    ),

    path(
        "admin/zones/<int:pk>/",
        AdminDeliveryZoneDetailView.as_view(),
        name="admin-delivery-zone-detail",
    ),
]
