from django.urls import path

from .views import (
    AdminFarmerApproveView,
    AdminFarmerListView,
    AdminFarmerRejectView,
    BuyerProfileView,
    FarmerProfileView,
    FarmerVerificationSubmitView,
    FarmerVerificationView,
)


urlpatterns = [
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
