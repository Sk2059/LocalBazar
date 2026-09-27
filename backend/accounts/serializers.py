from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User

class RegisterSerializers(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "email",
            "phone",
            "password",
            "role",
        )
        read_only_fields = ("id",)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value.lower().strip()

    def validate_role(self, value):
        if value not in [User.Role.FARMER, User.Role.BUYER]:
            raise serializers.ValidationError("Invalid role. Must be 'farmer' or 'buyer'.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self,attrs):
        email = attrs["email"]
        password = attrs["password"]

        user = authenticate(
            email=email,
            password=password
        )

        if user is None:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        attrs["user"] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User

        fields = (
            "id",
            "name",
            "email",
            "phone",
            "profile_picture",
            "role",
            "is_active",
            "created_at",
        )

        read_only_fields = (
            "id",
            "email",
            "role",
            "is_active",
            "created_at",
        )


class AdminUserSerializer(serializers.ModelSerializer):
    """An account as seen by an administrator.

    Mirrors {@link UserSerializer} but drops the self-service restrictions: an
    admin may re-assign a role or suspend an account. The order count is
    annotated on the queryset, not the model, so it stays a read-only view of
    buyer activity.
    """

    order_count = serializers.IntegerField(
        read_only=True,
    )

    class Meta:
        model = User

        fields = (
            "id",
            "name",
            "email",
            "phone",
            "profile_picture",
            "role",
            "is_active",
            "order_count",
            "created_at",
        )

        read_only_fields = (
            "id",
            "email",
            "created_at",
            "order_count",
        )


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """The subset an admin is allowed to change on someone's account."""

    class Meta:
        model = User

        fields = (
            "name",
            "phone",
            "role",
            "is_active",
        )

    def validate_role(self, value):
        if value not in User.Role.values:
            raise serializers.ValidationError("Invalid role.")
        return value

class TokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    access = serializers.CharField()
    user = UserSerializer()
