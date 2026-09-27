from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User

User = get_user_model()


class AuthBase(TestCase):
    """Shared helpers: create a user of any role and get an authenticated API
    client for them, so each test starts from a realistic session."""

    def make_user(self, email, role=User.Role.BUYER, **extra):
        return User.objects.create_user(
            email=email,
            name=extra.get("name", email.split("@")[0].title()),
            password=extra.get("password", "StrongPass123!"),
            role=role,
            **{k: v for k, v in extra.items() if k not in ("name", "password")},
        )

    def client_for(self, user):
        client = APIClient()
        client.force_authenticate(user=user)
        return client


class RegisterAndLoginTests(AuthBase):
    def test_register_returns_tokens_and_role(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "name": "Gita Sharma",
                "email": "gita@example.com",
                "password": "StrongPass123!",
                "role": "buyer",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["role"], "buyer")
        self.assertEqual(response.data["user"]["email"], "gita@example.com")

    def test_register_rejects_admin_role(self):
        """Self-registration must never hand out admin privileges."""

        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "name": "Sneaky",
                "email": "sneaky@example.com",
                "password": "StrongPass123!",
                "role": "admin",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email="sneaky@example.com").exists())

    def test_register_rejects_duplicate_email(self):
        self.make_user("dupe@example.com")

        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "name": "Other",
                "email": "dupe@example.com",
                "password": "StrongPass123!",
                "role": "buyer",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_issues_tokens(self):
        self.make_user("login@example.com", password="StrongPass123!")

        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "login@example.com", "password": "StrongPass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_me_requires_authentication(self):
        response = self.client.get("/api/v1/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_updates_name_and_phone(self):
        user = self.make_user("me@example.com")
        client = self.client_for(user)

        response = client.patch(
            "/api/v1/auth/me/",
            {"name": "Renamed User", "phone": "9800000000"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.name, "Renamed User")
        self.assertEqual(user.phone, "9800000000")

    def test_me_cannot_change_own_role(self):
        """Role escalation must go through an admin, not self-service."""

        user = self.make_user("role@example.com")
        client = self.client_for(user)

        response = client.patch(
            "/api/v1/auth/me/",
            {"role": "admin"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.role, User.Role.BUYER)

class AdminAccessTests(AuthBase):
    def setUp(self):
        self.admin = self.make_user("admin@example.com", role=User.Role.ADMIN)
        self.buyer = self.make_user("buyer@example.com", role=User.Role.BUYER)

    def test_buyer_cannot_read_admin_stats(self):
        client = self.client_for(self.buyer)
        response = client.get("/api/v1/auth/admin/stats/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_stats_shape(self):
        client = self.client_for(self.admin)
        response = client.get("/api/v1/auth/admin/stats/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["users"]["total"], 2)
        self.assertEqual(response.data["users"]["buyers"], 1)
        self.assertEqual(response.data["users"]["admins"], 1)
        self.assertIn("revenue", response.data["orders"])
        self.assertIn("pending", response.data["verification"])
        self.assertEqual(response.data["recent_orders"], [])

    def test_admin_user_list_and_role_filter(self):
        self.make_user("buyer2@example.com", role=User.Role.BUYER)
        client = self.client_for(self.admin)

        response = client.get("/api/v1/auth/admin/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        farmers_only = client.get("/api/v1/auth/admin/users/?role=farmer")
        self.assertEqual(len(farmers_only.data), 0)

    def test_admin_can_suspend_and_rerole(self):
        client = self.client_for(self.admin)

        response = client.patch(
            f"/api/v1/auth/admin/users/{self.buyer.id}/",
            {"is_active": False, "role": "farmer"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.buyer.refresh_from_db()
        self.assertFalse(self.buyer.is_active)
        self.assertEqual(self.buyer.role, User.Role.FARMER)

    def test_buyer_cannot_list_users(self):
        client = self.client_for(self.buyer)
        response = client.get("/api/v1/auth/admin/users/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


