# backend/core/views.py
"""
API view functions for authentication.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/auth/register/

    Body: { "username": "...", "email": "...", "password": "...", "role": "CANDIDATE" | "EMPLOYER" }
    Returns: 201 with user info + JWT tokens
    """
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    POST /api/auth/logout/

    Body: { "refresh": "<refresh_token>" }
    Blacklists the refresh token so it can't be used again.
    """
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_205_RESET_CONTENT,
        )
    except KeyError:
        return Response(
            {"detail": "Refresh token is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception:
        return Response(
            {"detail": "Invalid or expired token."},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """
    GET /api/auth/me/

    Returns the currently authenticated user's info.
    Useful for the frontend to verify a token is valid and get role info.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)