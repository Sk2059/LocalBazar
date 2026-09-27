from rest_framework.permissions import BasePermission

from accounts.models import User


class CanPurchase(BasePermission):
    message = (
        "Only buyers and farmers can use the shopping cart."
    )

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in (
                User.Role.BUYER,
                User.Role.FARMER,
            )
        )