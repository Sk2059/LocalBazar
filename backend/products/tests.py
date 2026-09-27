from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from products.models import Category, Product
from profiles.models import FarmerProfile

User = get_user_model()


class ProductBase(TestCase):
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

    def verify_farmer(self, farmer):
        profile = farmer.farmer_profile
        profile.farm_name = f"{farmer.name} Farm"
        profile.address = "Biratnagar"
        profile.verification_status = "verified"
        profile.save()
        return profile

    def make_category(self, name="Vegetables"):
        return Category.objects.create(name=name, slug=name.lower())


class SlugAutogenerationTests(ProductBase):
    def test_category_slug_is_derived_from_name(self):
        client = self.client_for(
            self.make_user("admin@example.com", role=User.Role.ADMIN)
        )

        response = client.post(
            "/api/v1/products/categories/",
            {"name": "Leafy Greens", "description": "Salad staples"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["slug"], "leafy-greens")
        self.assertTrue(Category.objects.filter(slug="leafy-greens").exists())

    def test_duplicate_category_names_get_unique_slugs(self):
        # ``name`` is unique, but two distinct names can still slugify alike —
        # the slug has to stay unique even then.
        Category.objects.create(name="herbs", slug="herbs")
        client = self.client_for(
            self.make_user("admin2@example.com", role=User.Role.ADMIN)
        )

        response = client.post(
            "/api/v1/products/categories/",
            {"name": "Herbs"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["slug"], "herbs-2")

    def test_product_slug_generated_when_omitted(self):
        farmer = self.make_user("slug@example.com", role=User.Role.FARMER)
        self.verify_farmer(farmer)
        category = self.make_category()
        client = self.client_for(farmer)

        response = client.post(
            "/api/v1/products/",
            {
                "name": "Organic Tomatoes",
                "description": "Vine-ripened.",
                "category": category.id,
                "price": "120",
                "unit": "kg",
                "stock": 30,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["slug"], "organic-tomatoes")
        self.assertEqual(response.data["farmer"], farmer.id)

    def test_identical_product_names_do_not_collide(self):
        farmer = self.make_user("dupe@example.com", role=User.Role.FARMER)
        self.verify_farmer(farmer)
        category = self.make_category()
        client = self.client_for(farmer)

        payload = {
            "name": "Cauliflower",
            "description": "x",
            "category": category.id,
            "price": "90",
            "stock": 5,
        }
        first = client.post("/api/v1/products/", payload, format="json")
        second = client.post("/api/v1/products/", payload, format="json")

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(first.data["slug"], second.data["slug"])

class FarmerGatingTests(ProductBase):
    def setUp(self):
        self.category = self.make_category()
        self.unverified = self.make_user("pending@example.com", role=User.Role.FARMER)
        self.verified = self.make_user("growing@example.com", role=User.Role.FARMER)
        self.buyer = self.make_user("shopper@example.com")
        self.verify_farmer(self.verified)

    def test_unverified_farmer_cannot_create_products(self):
        """The whole point of the verification workflow: selling is gated."""

        client = self.client_for(self.unverified)
        response = client.post(
            "/api/v1/products/",
            {
                "name": "Tomatoes",
                "description": "x",
                "category": self.category.id,
                "price": "100",
                "stock": 10,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Product.objects.filter(name="Tomatoes").exists())

    def test_buyer_cannot_create_products(self):
        client = self.client_for(self.buyer)
        response = client.post(
            "/api/v1/products/",
            {
                "name": "Tomatoes",
                "description": "x",
                "category": self.category.id,
                "price": "100",
                "stock": 10,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_farmer_owns_their_listing(self):
        product = Product.objects.create(
            farmer=self.verified,
            category=self.category,
            name="Cabbage",
            slug="cabbage",
            description="x",
            price=Decimal("60"),
            stock=12,
        )
        client = self.client_for(self.verified)

        response = client.patch(
            f"/api/v1/products/{product.id}/",
            {"price": "75"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertEqual(product.price, Decimal("75"))

    def test_farmer_cannot_edit_another_farms_product(self):
        other = self.make_user("other@example.com", role=User.Role.FARMER)
        self.verify_farmer(other)

        product = Product.objects.create(
            farmer=other,
            category=self.category,
            name="Radish",
            slug="radish",
            description="x",
            price=Decimal("40"),
            stock=8,
        )
        client = self.client_for(self.verified)

        response = client.patch(
            f"/api/v1/products/{product.id}/",
            {"price": "1"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        product.refresh_from_db()
        self.assertEqual(product.price, Decimal("40"))


class CatalogueScopeTests(ProductBase):
    def setUp(self):
        self.category = self.make_category()
        self.farmer = self.make_user("catalogue@example.com", role=User.Role.FARMER)
        self.verify_farmer(self.farmer)
        self.admin = self.make_user("catadmin@example.com", role=User.Role.ADMIN)

        self.published = Product.objects.create(
            farmer=self.farmer,
            category=self.category,
            name="Published Pumpkin",
            slug="published-pumpkin",
            description="x",
            price=Decimal("60"),
            stock=5,
            is_active=True,
        )
        self.draft = Product.objects.create(
            farmer=self.farmer,
            category=self.category,
            name="Draft Durian",
            slug="draft-durian",
            description="x",
            price=Decimal("200"),
            stock=2,
            is_active=False,
        )

    def test_public_list_hides_drafts(self):
        response = self.client.get("/api/v1/products/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item["name"] for item in response.data["results"]]
        self.assertIn("Published Pumpkin", names)
        self.assertNotIn("Draft Durian", names)

    def test_farmer_catalogue_includes_own_drafts(self):
        client = self.client_for(self.farmer)
        response = client.get("/api/v1/products/farmer/products/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = {item["name"] for item in response.data["results"]}
        self.assertEqual(names, {"Published Pumpkin", "Draft Durian"})

    def test_farmer_catalogue_excludes_other_farms(self):
        rival = self.make_user("rival@example.com", role=User.Role.FARMER)
        self.verify_farmer(rival)
        Product.objects.create(
            farmer=rival,
            category=self.category,
            name="Rival Radish",
            slug="rival-radish",
            description="x",
            price=Decimal("30"),
            stock=9,
        )

        client = self.client_for(self.farmer)
        response = client.get("/api/v1/products/farmer/products/")
        names = {item["name"] for item in response.data["results"]}
        self.assertNotIn("Rival Radish", names)

    def test_admin_catalogue_lists_everything(self):
        client = self.client_for(self.admin)
        response = client.get("/api/v1/products/admin/products/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = {item["name"] for item in response.data["results"]}
        self.assertEqual(names, {"Published Pumpkin", "Draft Durian"})

