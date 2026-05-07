# backend/core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CandidateProfile, JobPosting, Application


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "is_staff")
    list_filter = ("role", "is_staff", "is_active")
    fieldsets = UserAdmin.fieldsets + (
        ("Role", {"fields": ("role",)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Role", {"fields": ("role",)}),
    )


admin.site.register(CandidateProfile)
admin.site.register(JobPosting)
admin.site.register(Application)