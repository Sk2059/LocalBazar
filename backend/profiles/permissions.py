from rest_framework.permissions import BasePermission

from .models import FarmerProfile


class IsFarmer(BasePermission):
    message = "Only farmer accounts can access this resource."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "farmer"
        )


class IsBuyer(BasePermission):
    message = "Only buyer accounts can access this resource."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "buyer"
        )


class IsVerifiedFarmer(BasePermission):
    message = "Only verified farmers can perform this action."

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        if request.user.role != "farmer":
            return False

        try:
            profile = request.user.farmer_profile
        except FarmerProfile.DoesNotExist:
            return False

        return (
            profile.verification_status
            == FarmerProfile.VerificationStatus.VERIFIED
        )