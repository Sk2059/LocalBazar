from django.urls import path

from .views import (
    AdminFarmerApproveView,
    AdminFarmerListView,
    AdminFarmerRejectView,
    BuyerProfileView,
    FarmerProfileView,
    FarmerVerificationSubmitView,
    FarmerVerificationView,
    PublicFarmerDetailView,
    PublicFarmerListView,
)


urlpatterns = [
    # --- Public (no auth) -----------------------------------------------------
    # The marketplace's "Meet the farmers" directory and farm profiles.
    path(
        "farmers/",
        PublicFarmerListView.as_view(),
        name="public-farmer-list",
    ),

    path(
        "farmers/<int:pk>/",
        PublicFarmerDetailView.as_view(),
        name="public-farmer-detail",
    ),

    # --- Farmer (own profile) -------------------------------------------------
    path(
        "farmer/",
        FarmerProfileView.as_view(),
        name="farmer-profile",
    ),

    path(
        "farmer/verification/",
        FarmerVerificationSubmitView.as_view(),
        name="farmer-verification-submit",
    ),

    path(
        "buyer/",
        BuyerProfileView.as_view(),
        name="buyer-profile",
    ),

    path(
        "admin/farmers/",
        AdminFarmerListView.as_view(),
        name="admin-farmer-list",
    ),

    path(
        "admin/farmers/<int:pk>/verify/",
        FarmerVerificationView.as_view(),
        name="farmer-verification",
    ),

    path(
        "admin/farmers/<int:pk>/approve/",
        AdminFarmerApproveView.as_view(),
        name="admin-farmer-approve",
    ),

    path(
        "admin/farmers/<int:pk>/reject/",
        AdminFarmerRejectView.as_view(),
        name="admin-farmer-reject",
    ),
]
