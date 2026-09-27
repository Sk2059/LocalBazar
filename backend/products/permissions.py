from rest_framework.permissions import BasePermission

from accounts.models import User
from profiles.models import FarmerProfile


class IsAdmin(BasePermission):
    message = "Only administrators can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )


class IsVerifiedFarmer(BasePermission):
    message = "Only verified farmers can sell products."

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        if request.user.role != User.Role.FARMER:
            return False

        profile = getattr(
            request.user,
            "farmer_profile",
            None,
        )

        if profile is None:
            return False

        return (
            profile.verification_status
            == FarmerProfile.VerificationStatus.VERIFIED
        )


class IsProductOwnerOrAdmin(BasePermission):
    message = "You can only modify your own products."

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        if not request.user.is_authenticated:
            return False

        if request.user.role == User.Role.ADMIN:
            return True

        return obj.farmer_id == request.user.id