from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from orders.models import Order, OrderItem
from products.models import Category, Product
from profiles.models import FarmerProfile

User = get_user_model()


class OrderBase(TestCase):
    def make_user(self, email, role=User.Role.BUYER):
        user = User.objects.create_user(
            email=email,
            name=email.split("@")[0].title(),
            password="StrongPass123!",
            role=role,
        )

        # No signal provisions a farmer's profile — the API creates it lazily via
        # get_or_create — so tests that touch it directly need the row up-front.
        if role == User.Role.FARMER:
            FarmerProfile.objects.create(
                user=user,
                farm_name=f"{user.name} Farm",
                address="Biratnagar",
            )

        return user

    def client_for(self, user):
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    def make_category(self, name="Vegetables"):
        return Category.objects.create(name=name, slug=name.lower())

    def make_product(self, farmer, name, category, price="120", stock=20):
        return Product.objects.create(
            farmer=farmer,
            category=category,
            name=name,
            slug=f"{name.lower()}-{farmer.id}",
            description=f"Fresh {name}.",
            price=Decimal(price),
            stock=stock,
            is_active=True,
        )

    def make_order(self, buyer, items):
        """Builds an order directly from (product, quantity) pairs.

        Mirrors what {@link orders.services.create_order_from_cart} produces,
        without making these tests depend on cart and delivery-zone fixtures.
        """

        subtotal = sum(product.price * quantity for product, quantity in items)

        order = Order.objects.create(
            customer=buyer,
            payment_method=Order.PaymentMethod.COD,
            delivery_address="Main Road, Ward 5",
            municipality="Biratnagar",
            district="Morang",
            province="Koshi Province",
            subtotal=subtotal,
            delivery_fee=Decimal("50"),
            total=subtotal + Decimal("50"),
        )

        for product, quantity in items:
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                price=product.price,
                quantity=quantity,
                subtotal=product.price * quantity,
                farmer=product.farmer,
            )

        return order


class FarmerOrderTests(OrderBase):
    def setUp(self):
        self.category = self.make_category()

        self.farmer_a = self.make_user("farmerA@example.com", role=User.Role.FARMER)
        self.farmer_b = self.make_user("farmerB@example.com", role=User.Role.FARMER)
        self.buyer = self.make_user("buyer@example.com")

        self.product_a = self.make_product(self.farmer_a, "Tomatoes", self.category)
        self.product_b = self.make_product(self.farmer_b, "Potatoes", self.category)

        self.order = self.make_order(
            self.buyer,
            [(self.product_a, 2), (self.product_b, 3)],
        )

    def test_farmer_only_sees_own_line_items(self):
        client = self.client_for(self.farmer_a)
        response = client.get("/api/v1/orders/farmer/orders/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        order = response.data[0]
        self.assertEqual(order["id"], self.order.id)
        self.assertEqual(len(order["items"]), 1)
        self.assertEqual(order["items"][0]["product_name"], "Tomatoes")
        self.assertEqual(order["pending_items"], 1)

    def test_farmer_isolated_from_other_farms(self):
        """Farmer B must not learn that tomatoes were part of this order."""

        client = self.client_for(self.farmer_b)
        response = client.get("/api/v1/orders/farmer/orders/")

        self.assertEqual(len(response.data), 1)
        names = [item["product_name"] for item in response.data[0]["items"]]
        self.assertEqual(names, ["Potatoes"])

    def test_farmer_can_fulfil_own_item(self):
        item = self.order.items.get(farmer=self.farmer_a)
        client = self.client_for(self.farmer_a)

        response = client.post(
            f"/api/v1/orders/farmer/items/{item.id}/fulfil/",
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["farmer_fulfilled"])

        item.refresh_from_db()
        self.assertTrue(item.farmer_fulfilled)
        self.assertIsNotNone(item.fulfilled_at)

    def test_farmer_cannot_fulfil_other_farms_item(self):
        item = self.order.items.get(farmer=self.farmer_b)
        client = self.client_for(self.farmer_a)

        response = client.post(
            f"/api/v1/orders/farmer/items/{item.id}/fulfil/",
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        item.refresh_from_db()
        self.assertFalse(item.farmer_fulfilled)

    def test_fulfil_is_idempotent_rejection(self):
        item = self.order.items.get(farmer=self.farmer_a)
        item.farmer_fulfilled = True
        item.save()

        client = self.client_for(self.farmer_a)
        response = client.post(
            f"/api/v1/orders/farmer/items/{item.id}/fulfil/",
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_buyer_cannot_access_farmer_queue(self):
        client = self.client_for(self.buyer)
        response = client.get("/api/v1/orders/farmer/orders/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_pending_items_annotation_reflects_fulfilment(self):
        item = self.order.items.get(farmer=self.farmer_a)
        item.farmer_fulfilled = True
        item.save()

        client = self.client_for(self.farmer_a)
        response = client.get("/api/v1/orders/farmer/orders/")
        self.assertEqual(response.data[0]["pending_items"], 0)

class AdminOrderTests(OrderBase):
    def setUp(self):
        self.admin = self.make_user("admin@example.com", role=User.Role.ADMIN)
        self.buyer = self.make_user("buyer@example.com")
        self.farmer = self.make_user("farmer@example.com", role=User.Role.FARMER)

        self.category = self.make_category()
        self.product = self.make_product(self.farmer, "Carrots", self.category)
        self.order = self.make_order(self.buyer, [(self.product, 1)])

    def test_admin_lists_every_order(self):
        client = self.client_for(self.admin)
        response = client.get("/api/v1/orders/admin/orders/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.order.id)

    def test_admin_advances_order_status(self):
        client = self.client_for(self.admin)

        response = client.patch(
            f"/api/v1/orders/admin/orders/{self.order.id}/status/",
            {"status": "out_for_delivery"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "out_for_delivery")
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.OUT_FOR_DELIVERY)

    def test_rejects_invalid_status(self):
        client = self.client_for(self.admin)

        response = client.patch(
            f"/api/v1/orders/admin/orders/{self.order.id}/status/",
            {"status": "shipped_to_mars"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_farmer_cannot_set_order_status(self):
        """Order-level progress is admin-owned; farmers only pack their rows."""

        client = self.client_for(self.farmer)
        response = client.patch(
            f"/api/v1/orders/admin/orders/{self.order.id}/status/",
            {"status": "delivered"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


