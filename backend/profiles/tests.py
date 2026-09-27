from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from profiles.models import FarmerProfile

User = get_user_model()


def _document():
    """A plausible verification document: a small text file beats a real image
    for test speed and keeps Pillow out of the hot path."""

    return SimpleUploadedFile(
        "registration.pdf",
        b"%PDF-1.4 demo farmer registration document",
        content_type="application/pdf",
    )


class VerificationBase(TestCase):
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


class FarmerVerificationSubmitTests(VerificationBase):
    def setUp(self):
        self.farmer = self.make_user("farmer@example.com", role=User.Role.FARMER)
        self.buyer = self.make_user("buyer@example.com", role=User.Role.BUYER)

    def test_submit_marks_application_pending(self):
        client = self.client_for(self.farmer)

        response = client.put(
            "/api/v1/profiles/farmer/verification/",
            {
                "farm_name": "Hari Organic Farm",
                "address": "Biratnagar-5, Morang",
                "municipality": "Biratnagar",
                "district": "Morang",
                "province": "Koshi Province",
                "description": "Third-generation vegetable grower.",
                "verification_document": _document(),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["verification_status"], "pending")

        self.farmer.farmer_profile.refresh_from_db()
        self.assertEqual(
            self.farmer.farmer_profile.verification_status,
            FarmerProfile.VerificationStatus.PENDING,
        )
        self.assertEqual(
            self.farmer.farmer_profile.farm_name, "Hari Organic Farm"
        )

    def test_submit_requires_document(self):
        client = self.client_for(self.farmer)

        response = client.put(
            "/api/v1/profiles/farmer/verification/",
            {
                "farm_name": "No Docs Farm",
                "address": "Itahari, Sunsari",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("verification_document", response.data)

    def test_submit_requires_farm_name_and_address(self):
        client = self.client_for(self.farmer)

        response = client.put(
            "/api/v1/profiles/farmer/verification/",
            {"verification_document": _document()},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("farm_name", response.data)
        self.assertIn("address", response.data)

    def test_buyer_cannot_submit_farmer_application(self):
        client = self.client_for(self.buyer)

        response = client.put(
            "/api/v1/profiles/farmer/verification/",
            {
                "farm_name": "Not A Farmer",
                "address": "Biratnagar",
                "verification_document": _document(),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_resubmission_after_rejection_resets_to_pending(self):
        profile = self.farmer.farmer_profile
        profile.farm_name = "Green Valley"
        profile.address = "Damak"
        profile.verification_status = FarmerProfile.VerificationStatus.REJECTED
        profile.verification_note = "Document unreadable"
        profile.save()

        client = self.client_for(self.farmer)
        response = client.put(
            "/api/v1/profiles/farmer/verification/",
            {
                "farm_name": "Green Valley",
                "address": "Damak",
                "verification_document": _document(),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        profile.refresh_from_db()
        self.assertEqual(
            profile.verification_status, FarmerProfile.VerificationStatus.PENDING
        )
        self.assertEqual(profile.verification_note, "")

class AdminVerificationReviewTests(VerificationBase):
    def setUp(self):
        self.admin = self.make_user("admin@example.com", role=User.Role.ADMIN)
        self.buyer = self.make_user("buyer@example.com", role=User.Role.BUYER)

        self.farmer = self.make_user("ram@example.com", role=User.Role.FARMER)
        self.profile = self.farmer.farmer_profile
        self.profile.farm_name = "Koshi Green Farm"
        self.profile.address = "Itahari, Sunsari"
        self.profile.verification_document = _document()
        self.profile.verification_status = FarmerProfile.VerificationStatus.PENDING
        self.profile.save()

    def test_approve_flips_status_and_stamps_timestamp(self):
        client = self.client_for(self.admin)

        response = client.post(
            f"/api/v1/profiles/admin/farmers/{self.profile.id}/approve/",
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["verification_status"], "verified")

        self.profile.refresh_from_db()
        self.assertEqual(
            self.profile.verification_status,
            FarmerProfile.VerificationStatus.VERIFIED,
        )
        self.assertIsNotNone(self.profile.verified_at)

    def test_reject_requires_a_reason(self):
        client = self.client_for(self.admin)

        response = client.post(
            f"/api/v1/profiles/admin/farmers/{self.profile.id}/reject/",
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("verification_note", response.data)
        self.profile.refresh_from_db()
        self.assertEqual(
            self.profile.verification_status,
            FarmerProfile.VerificationStatus.PENDING,
        )

    def test_reject_with_reason_clears_verified_at(self):
        self.profile.verification_status = FarmerProfile.VerificationStatus.VERIFIED
        self.profile.save()

        client = self.client_for(self.admin)
        response = client.post(
            f"/api/v1/profiles/admin/farmers/{self.profile.id}/reject/",
            {"verification_note": "Farm photos are stock images."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(
            self.profile.verification_status,
            FarmerProfile.VerificationStatus.REJECTED,
        )
        self.assertEqual(
            self.profile.verification_note, "Farm photos are stock images."
        )
        self.assertIsNone(self.profile.verified_at)

    def test_buyer_cannot_approve(self):
        client = self.client_for(self.buyer)

        response = client.post(
            f"/api/v1/profiles/admin/farmers/{self.profile.id}/approve/",
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_list_filters_by_status(self):
        client = self.client_for(self.admin)

        all_farmers = client.get("/api/v1/profiles/admin/farmers/")
        self.assertEqual(all_farmers.status_code, status.HTTP_200_OK)
        self.assertEqual(len(all_farmers.data), 1)
        self.assertEqual(all_farmers.data[0]["farm_name"], "Koshi Green Farm")
        self.assertEqual(all_farmers.data[0]["product_count"], 0)

        pending = client.get(
            "/api/v1/profiles/admin/farmers/?verification_status=pending"
        )
        self.assertEqual(len(pending.data), 1)

        verified = client.get(
            "/api/v1/profiles/admin/farmers/?verification_status=verified"
        )
        self.assertEqual(len(verified.data), 0)


