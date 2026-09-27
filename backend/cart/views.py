from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.response import Response

from .models import Cart, CartItem
from .permissions import CanPurchase
from .serializers import (
    CartItemSerializer,
    CartSerializer,
)


class CartView(ListCreateAPIView):
    serializer_class = CartSerializer
    permission_classes = [CanPurchase]

    def get_queryset(self):
        return (
            Cart.objects
            .filter(user=self.request.user)
            .prefetch_related(
                "items__product__farmer__farmer_profile",
            )
        )

    def list(self, request, *args, **kwargs):
        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart = (
            Cart.objects
            .prefetch_related(
                "items__product__farmer__farmer_profile",
            )
            .get(pk=cart.pk)
        )

        serializer = self.get_serializer(cart)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def create(self, request, *args, **kwargs):
        return Response(
            {
                "detail": (
                    "Use /cart/items/ to add products "
                    "to your cart."
                )
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


class CartItemListCreateView(ListCreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [CanPurchase]

    def get_queryset(self):
        return (
            CartItem.objects
            .filter(cart__user=self.request.user)
            .select_related(
                "product",
                "product__farmer",
                "product__farmer__farmer_profile",
            )
        )

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(
            user=self.request.user
        )

        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        existing_item = (
            CartItem.objects
            .filter(
                cart=cart,
                product=product,
            )
            .first()
        )

        if existing_item:
            new_quantity = (
                existing_item.quantity + quantity
            )

            if new_quantity > product.stock:
                from rest_framework.exceptions import (
                    ValidationError,
                )

                raise ValidationError({
                    "quantity": (
                        f"Cart already contains "
                        f"{existing_item.quantity} units. "
                        f"Only {product.stock} units "
                        f"are available."
                    )
                })

            existing_item.quantity = new_quantity
            existing_item.save(
                update_fields=[
                    "quantity",
                    "updated_at",
                ]
            )

            self._updated_existing_item = True
            self._cart_item = existing_item

            return

        self._updated_existing_item = False

        self._cart_item = serializer.save(
            cart=cart
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        self.perform_create(serializer)

        response_serializer = self.get_serializer(
            self._cart_item
        )

        if self._updated_existing_item:
            return Response(
                response_serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class CartItemDetailView(
    RetrieveUpdateDestroyAPIView
):
    serializer_class = CartItemSerializer
    permission_classes = [CanPurchase]

    def get_queryset(self):
        return (
            CartItem.objects
            .filter(cart__user=self.request.user)
            .select_related(
                "product",
                "product__farmer",
                "product__farmer__farmer_profile",
            )
        )