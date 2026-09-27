from django.urls import path

from .views import (
    InitiateKhaltiPaymentView,
    PaymentDetailView,
    VerifyKhaltiPaymentView,
)


urlpatterns = [
    path(
        "khalti/initiate/",
        InitiateKhaltiPaymentView.as_view(),
        name="khalti-initiate",
    ),

    path(
        "khalti/verify/",
        VerifyKhaltiPaymentView.as_view(),
        name="khalti-verify",
    ),

    path(
        "<int:pk>/",
        PaymentDetailView.as_view(),
        name="payment-detail",
    ),
]
