# backend/core/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


# 1. Custom User model — extends Django's AbstractUser to add a role field
class User(AbstractUser):
    """
    Custom user supporting two roles: Candidate and Employer.
    Auth (username, email, password, etc.) is inherited from AbstractUser.
    """

    class Role(models.TextChoices):
        CANDIDATE = "CANDIDATE", "Candidate"
        EMPLOYER = "EMPLOYER", "Employer"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CANDIDATE,
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


# 2. CandidateProfile — fields per progress report §2.3 and §3.6
class CandidateProfile(models.Model):
    """
    Candidate's profile. Required fields per the progress report:
    - Full name
    - Contact information
    - Education
    - Major / field of study
    - Years of experience
    - Resume (file upload)
    """

    class EducationLevel(models.TextChoices):
        HIGH_SCHOOL = "HIGH_SCHOOL", "High School"
        DIPLOMA = "DIPLOMA", "Diploma"
        BACHELOR = "BACHELOR", "Bachelor's Degree"
        MASTER = "MASTER", "Master's Degree"
        PHD = "PHD", "PhD"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="candidate_profile",
        limit_choices_to={"role": User.Role.CANDIDATE},
    )

    full_name = models.CharField(max_length=200)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=30, blank=True)
    education = models.CharField(
        max_length=20,
        choices=EducationLevel.choices,
        default=EducationLevel.BACHELOR,
    )
    major = models.CharField(max_length=200)
    years_experience = models.PositiveIntegerField(default=0)

    # Free-text skills field — used by recommendation engine
    skills = models.TextField(
        blank=True,
        help_text="Comma-separated skills, e.g. 'Python, Django, Machine Learning'",
    )

    # Optional bio for richer recommendation matching
    bio = models.TextField(blank=True)

    # Resume file upload — stored under MEDIA_ROOT/resumes/
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name


# 3. JobPosting
class JobPosting(models.Model):
    """
    Employer's job posting. Required fields per the progress report:
    - Job title
    - Company information
    - Job description
    - Education requirements
    - Skills
    - Years of experience required
    - Work mode (Remote / On-site / Hybrid)
    - Job location
    """

    class WorkMode(models.TextChoices):
        REMOTE = "REMOTE", "Remote"
        ONSITE = "ONSITE", "On-site"
        HYBRID = "HYBRID", "Hybrid"

    class EducationLevel(models.TextChoices):
        HIGH_SCHOOL = "HIGH_SCHOOL", "High School"
        DIPLOMA = "DIPLOMA", "Diploma"
        BACHELOR = "BACHELOR", "Bachelor's Degree"
        MASTER = "MASTER", "Master's Degree"
        PHD = "PHD", "PhD"

    employer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="job_postings",
        limit_choices_to={"role": User.Role.EMPLOYER},
    )

    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    company_info = models.TextField(
        help_text="About the company — used in employer profile display",
    )
    description = models.TextField(help_text="Full job description (JD)")
    required_education = models.CharField(
        max_length=20,
        choices=EducationLevel.choices,
        default=EducationLevel.BACHELOR,
    )
    required_skills = models.TextField(
        help_text="Comma-separated required skills, e.g. 'Python, Django, REST API'",
    )
    required_experience_years = models.PositiveIntegerField(default=0)
    work_mode = models.CharField(
        max_length=10,
        choices=WorkMode.choices,
        default=WorkMode.ONSITE,
    )
    location = models.CharField(max_length=200)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} @ {self.company_name}"


# 4. Application
class Application(models.Model):
    """
    Tracks a candidate's application to a job. Per §3.8, the system must
    'send data to relevant employees' (i.e. record the application so the
    employer can see who applied).
    """

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        REVIEWED = "REVIEWED", "Reviewed"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    job = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name="applications",
    )

    cover_message = models.TextField(blank=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )

    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent duplicate applications to the same job
        unique_together = ("candidate", "job")
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.candidate.full_name} → {self.job.title}"