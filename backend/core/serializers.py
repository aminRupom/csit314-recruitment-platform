# backend/core/serializers.py
"""
Serializers convert between Django model instances and JSON.
"""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User
from .models import CandidateProfile
from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    """
    Used by all application endpoints.
    Includes nested job + candidate info so the frontend doesn't need extra calls.
    """
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.company_name", read_only=True)
    candidate_name = serializers.CharField(source="candidate.full_name", read_only=True)
    candidate_id = serializers.IntegerField(source="candidate.id", read_only=True)

    class Meta:
        model = Application
        fields = (
            "id",
            "job",
            "job_title",
            "company_name",
            "candidate_id",
            "candidate_name",
            "cover_message",
            "status",
            "applied_at",
        )
        read_only_fields = ("id", "status", "applied_at", "job_title", "company_name", "candidate_id", "candidate_name")
        extra_kwargs = {
            "job": {"write_only": True},  # job is supplied via URL, not body
        }
class CandidateProfileSerializer(serializers.ModelSerializer):
    """
    Used by GET / POST / PUT /api/candidate/profile/

    Returns:
      - all profile fields
      - resume file URL (if uploaded)
    """
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = CandidateProfile
        fields = (
            "id",
            "full_name",
            "contact_email",
            "contact_phone",
            "education",
            "major",
            "years_experience",
            "skills",
            "resume",
            "resume_url",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "resume_url")
        # `resume` is write-only on POST/PUT but the URL comes back via resume_url
        extra_kwargs = {
            "resume": {"required": False, "write_only": True},
        }

    def get_resume_url(self, obj):
        """Return absolute URL to the resume file, or None if not uploaded."""
        request = self.context.get("request")
        if obj.resume and request:
            return request.build_absolute_uri(obj.resume.url)
        return None

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

from .models import JobPosting


class JobPostingSerializer(serializers.ModelSerializer):
    """
    Used by all job posting endpoints.
    Returns the employer's company name for display purposes.
    """
    employer_username = serializers.CharField(source="employer.username", read_only=True)

    class Meta:
        model = JobPosting
        fields = (
            "id",
            "title",
            "company_name",
            "company_info",
            "description",
            "required_education",
            "required_skills",
            "required_experience_years",
            "work_mode",
            "location",
            "employer_username",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "employer_username", "created_at", "updated_at")