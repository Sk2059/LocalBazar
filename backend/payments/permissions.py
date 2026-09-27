from rest_framework.permissions import BasePermission


class IsPaymentOwner(BasePermission):
    message = (
        "You can only access your own payments."
    )

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        return (
            obj.order.customer_id
            == request.user.id
        )
