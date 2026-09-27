from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import DeliveryZone
from .permissions import IsAdmin
from .serializers import DeliveryZoneSerializer


class DeliveryZoneListCreateView(ListCreateAPIView):
    serializer_class = DeliveryZoneSerializer

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
    ]

    filterset_fields = [
        "province",
        "district",
        "municipality",
    ]

    search_fields = [
        "name",
        "district",
        "municipality",
    ]

    def get_queryset(self):
        return DeliveryZone.objects.filter(is_active=True)

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [IsAdmin()]


class DeliveryZoneDetailView(RetrieveUpdateDestroyAPIView):
    queryset = DeliveryZone.objects.all()

    serializer_class = DeliveryZoneSerializer

    permission_classes = [
        IsAdmin,
    ]


class AdminDeliveryZoneListCreateView(ListCreateAPIView):
    """Every delivery location for the console, paused ones included.

    The public list only serves ``is_active=True`` zones so buyers never see a
    place we can't deliver to; the console needs the full set to manage fees,
    ETAs and minimums — including the zones currently switched off.
    """

    serializer_class = DeliveryZoneSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
    ]

    filterset_fields = [
        "province",
        "district",
        "municipality",
        "is_active",
    ]

    search_fields = [
        "name",
        "district",
        "municipality",
    ]

    def get_queryset(self):
        return DeliveryZone.objects.all()


class AdminDeliveryZoneDetailView(RetrieveUpdateDestroyAPIView):
    """Read, adjust fees/ETAs, pause or remove one delivery location."""

    queryset = DeliveryZone.objects.all()

    serializer_class = DeliveryZoneSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

