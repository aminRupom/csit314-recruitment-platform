# backend/core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CandidateProfile, JobPosting, Application


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "membership", "is_staff")
    list_filter = ("role", "membership", "is_staff", "is_active")
    fieldsets = UserAdmin.fieldsets + (
        ("Role & Membership", {"fields": ("role", "membership")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Role & Membership", {"fields": ("role", "membership")}),
    )


admin.site.register(CandidateProfile)
admin.site.register(JobPosting)
admin.site.register(Application)