"""Role-based permissions shared across the marketplace apps.

The account model owns the three roles (`buyer`, `farmer`, `admin`), so this is
the canonical place to ask "is this request allowed for this role?". Feature
apps keep their own object-level permissions (product ownership, order
ownership) and compose them with the role checks defined here.
"""

from rest_framework.permissions import BasePermission

from profiles.models import FarmerProfile

from .models import User


class IsAdminRole(BasePermission):
    message = "Only administrators can access this resource."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )


class IsFarmerRole(BasePermission):
    message = "Only farmer accounts can access this resource."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.FARMER
        )


class IsBuyerRole(BasePermission):
    message = "Only buyer accounts can access this resource."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.BUYER
        )


class IsVerifiedFarmerRole(BasePermission):
    """A farmer whose selling privileges are active.

    Selling is gated on the verification workflow: the account must be a farmer
    *and* carry an approved ``FarmerProfile``. Buyers (and farmers who are still
    pending/rejected) can browse and buy, but not list products.
    """

    message = "Only verified farmers can perform this action."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role != User.Role.FARMER:
            return False

        profile = getattr(request.user, "farmer_profile", None)

        if profile is None:
            return False

        return (
            profile.verification_status
            == FarmerProfile.VerificationStatus.VERIFIED
        )
