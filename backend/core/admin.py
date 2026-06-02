# backend/core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CandidateProfile, JobPosting, Application


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "membership", "is_staff", "date_joined")
    list_filter = ("role", "membership", "is_staff", "is_active")
    search_fields = ("username", "email")
    fieldsets = UserAdmin.fieldsets + (
        ("Role & Membership", {"fields": ("role", "membership")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Role & Membership", {"fields": ("role", "membership")}),
    )


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "education", "major", "years_experience", "preferred_work_mode", "updated_at")
    list_filter = ("education", "preferred_work_mode")
    search_fields = ("full_name", "user__username", "skills", "major")
    readonly_fields = ("created_at", "updated_at")


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ("title", "company_name", "employer", "work_mode", "employment_type", "location", "is_active", "created_at")
    list_filter = ("work_mode", "employment_type", "required_education", "is_active")
    search_fields = ("title", "company_name", "required_skills", "description")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("candidate", "job", "status", "applied_at")
    list_filter = ("status",)
    search_fields = ("candidate__full_name", "job__title", "job__company_name")
    readonly_fields = ("applied_at",)
