# backend/core/permissions.py
"""
Custom permission classes for role-based access.
"""
from rest_framework.permissions import BasePermission


class IsCandidate(BasePermission):
    """Allows access only to authenticated users with role='CANDIDATE'."""
    message = "Only candidates can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "CANDIDATE"
        )


class IsEmployer(BasePermission):
    """Allows access only to authenticated users with role='EMPLOYER'."""
    message = "Only employers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "EMPLOYER"
        )