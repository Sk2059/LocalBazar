from django.db.models import Count, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import (
    GenericAPIView,
    ListAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdminRole, IsFarmerRole

from .models import BuyerProfile, FarmerProfile
from .permissions import IsBuyer, IsFarmer
from .serializers import (
    AdminFarmerProfileSerializer,
    BuyerProfileSerializer,
    FarmerProfileSerializer,
    FarmerVerificationSerializer,
    FarmerVerificationSubmitSerializer,
)


class FarmerProfileView(RetrieveUpdateAPIView):
    serializer_class = FarmerProfileSerializer

    permission_classes = [
        IsAuthenticated,
        IsFarmer,
    ]

    def get_object(self):
        profile, _ = FarmerProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"farm_name": self.request.user.name, "address": ""},
        )
        return profile


class BuyerProfileView(RetrieveUpdateAPIView):
    serializer_class = BuyerProfileSerializer

    permission_classes = [
        IsAuthenticated,
        IsBuyer,
    ]

    def get_object(self):
        profile, _ = BuyerProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"address": ""},
        )
        return profile


class FarmerVerificationSubmitView(RetrieveUpdateAPIView):
    """A farmer submits (or re-submits) their farm for admin review.

    On a valid submission the profile fields are stored and the workflow is
    reset to ``pending`` so a rejected farmer can re-apply after fixing the
    flagged problem.
    """

    serializer_class = FarmerVerificationSubmitSerializer

    permission_classes = [
        IsAuthenticated,
        IsFarmerRole,
    ]

    def get_object(self):
        profile, _ = FarmerProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"farm_name": self.request.user.name, "address": ""},
        )
        return profile

    def perform_update(self, serializer):
        serializer.save(
            verification_status=FarmerProfile.VerificationStatus.PENDING,
            verification_note="",
            verified_at=None,
        )


class FarmerVerificationView(RetrieveUpdateAPIView):
    """The legacy admin verification endpoint, kept for backwards compat.

    New UI calls the approve/reject actions below instead, but anything already
    PATCHing ``verification_status`` here keeps working.
    """

    queryset = FarmerProfile.objects.all()
    serializer_class = FarmerVerificationSerializer
    permission_classes = [
        IsAuthenticated,
        IsAdminRole,
    ]

    def perform_update(self, serializer):
        profile = serializer.save()

        if profile.verification_status == FarmerProfile.VerificationStatus.VERIFIED:
            profile.verified_at = timezone.now()
        else:
            profile.verified_at = None

        profile.save(
            update_fields=["verification_status", "verification_note", "verified_at"]
        )


class AdminFarmerListView(ListAPIView):
    """The admin verification queue and full farmer directory in one list.

    ``verification_status`` filters the queue (``pending`` is the default tab in
    the UI), free-text search covers farm name, farmer name and district, and
    each row carries its live product count.
    """

    serializer_class = AdminFarmerProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    search_fields = [
        "farm_name",
        "user__name",
        "user__email",
        "district",
        "municipality",
    ]

    ordering_fields = ["created_at", "farm_name", "verified_at"]
    ordering = ["-created_at"]

    filterset_fields = ["verification_status"]

    def get_queryset(self):
        return (
            FarmerProfile.objects
            .select_related("user")
            .annotate(
                product_count=Count(
                    "user__products",
                    filter=Q(user__products__is_active=True),
                ),
            )
        )


class _FarmerDecisionView(GenericAPIView):
    """Shared shape for the approve/reject actions."""

    queryset = FarmerProfile.objects.all()
    permission_classes = [IsAuthenticated, IsAdminRole]

    new_status: str
    requires_note: bool = False

    def post(self, request, *args, **kwargs):
        profile = self.get_object()
        note = (request.data.get("verification_note") or "").strip()

        if self.requires_note and not note:
            return Response(
                {
                    "verification_note": (
                        "A reason is required when rejecting a farmer."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.verification_status = self.new_status
        profile.verification_note = note
        profile.verified_at = (
            timezone.now()
            if self.new_status == FarmerProfile.VerificationStatus.VERIFIED
            else None
        )
        profile.save(
            update_fields=[
                "verification_status",
                "verification_note",
                "verified_at",
                "updated_at",
            ]
        )

        serializer = AdminFarmerProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminFarmerApproveView(_FarmerDecisionView):
    """Approve a farmer: selling privileges switch on immediately."""

    new_status = FarmerProfile.VerificationStatus.VERIFIED


class AdminFarmerRejectView(_FarmerDecisionView):
    """Reject a farmer: a reason is mandatory so they know what to fix."""

    new_status = FarmerProfile.VerificationStatus.REJECTED
    requires_note = True
