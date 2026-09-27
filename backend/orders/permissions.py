from rest_framework.permissions import BasePermission

from accounts.models import User


class CanPurchase(BasePermission):
    message = (
        "Only buyers and farmers can place orders."
    )

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in (
                User.Role.BUYER,
                User.Role.FARMER,
            )
        )


class IsOrderOwner(BasePermission):
    message = "You can only access your own orders."

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        return obj.customer_id == request.user.id
