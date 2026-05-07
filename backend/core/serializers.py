# backend/core/serializers.py
"""
Serializers convert between Django model instances and JSON.
"""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """
    Used by POST /api/auth/register/

    Accepts:
      - username, email, password (required)
      - role: 'CANDIDATE' or 'EMPLOYER' (required)
    """
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    role = serializers.ChoiceField(
        choices=[("CANDIDATE", "Candidate"), ("EMPLOYER", "Employer")],
        required=True,
    )

    class Meta:
        model = User
        fields = ("username", "email", "password", "role")
        extra_kwargs = {
            "email": {"required": True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Used by GET /api/auth/me/ — returns the current user's basic info.
    Never exposes the password hash.
    """

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "date_joined")
        read_only_fields = ("id", "date_joined")