from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import (
    GenericAPIView,
    RetrieveAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from orders.models import Order

from .models import Payment
from .permissions import IsPaymentOwner
from .serializers import (
    InitiateKhaltiPaymentSerializer,
    PaymentSerializer,
    VerifyKhaltiPaymentSerializer,
)
from .services import KhaltiService


class InitiateKhaltiPaymentView(GenericAPIView):
    """
    Step 1 of the demo Khalti flow.

    The buyer provides the order id and the mobile number they want to
    "pay from". We issue a one-time code and hand back a pidx plus the
    frontend screen where the code is entered.
    """

    serializer_class = InitiateKhaltiPaymentSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        order_id = serializer.validated_data["order_id"]
        phone = serializer.validated_data["phone"]

        try:
            order = Order.objects.get(
                id=order_id,
                customer=request.user,
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if (
            order.payment_method
            != Order.PaymentMethod.KHALTI
        ):
            return Response(
                {
                    "detail": (
                        "This order does not use "
                        "Khalti payment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            order.payment_status
            == Order.PaymentStatus.PAID
        ):
            return Response(
                {
                    "detail": (
                        "This order has already "
                        "been paid."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment, _ = Payment.objects.get_or_create(
            order=order,
            defaults={
                "provider": Payment.Provider.KHALTI,
                "amount": order.total,
                "amount_paisa": int(order.total * 100),
            },
        )

        if payment.provider != Payment.Provider.KHALTI:
            return Response(
                {"detail": "Invalid payment provider."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = KhaltiService.initiate(payment, phone)

        return Response(
            data,
            status=status.HTTP_200_OK,
        )


class VerifyKhaltiPaymentView(GenericAPIView):
    """
    Step 2 of the demo Khalti flow.

    The buyer submits the code that was issued for ``pidx``. Only after the
    code matches (and the amount still agrees with the order) do we mark the
    payment completed and the order paid.
    """

    serializer_class = VerifyKhaltiPaymentSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        pidx = serializer.validated_data["pidx"]
        code = serializer.validated_data["code"]

        # A buyer may only settle their own payment.
        get_object_or_404(
            Payment,
            pidx=pidx,
            order__customer=request.user,
        )

        try:
            payment = KhaltiService.verify(pidx, code)
        except ValidationError as exc:
            return Response(
                exc.detail,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_200_OK,
        )


class PaymentDetailView(RetrieveAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [
        IsAuthenticated,
        IsPaymentOwner,
    ]

    queryset = (
        Payment.objects
        .select_related(
            "order",
            "order__customer",
        )
    )
