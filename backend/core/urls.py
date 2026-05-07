# backend/core/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from . import views

urlpatterns = [
    # Auth
    path("auth/register/", views.register, name="auth-register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/logout/", views.logout, name="auth-logout"),
    path("auth/me/", views.me, name="auth-me"),

    # Candidate profile
    path("candidate/profile/", views.candidate_profile, name="candidate-profile"),
    path("candidate/profile/upload-resume/", views.upload_resume, name="candidate-resume"),

    # Employer-only: own jobs
    path("employer/jobs/", views.EmployerJobListCreate.as_view(), name="employer-jobs"),
    path("employer/jobs/<int:pk>/", views.EmployerJobDetail.as_view(), name="employer-job-detail"),

    # Public: browse all jobs (used by candidate homepage)
    path("jobs/", views.PublicJobList.as_view(), name="public-jobs"),
    path("jobs/<int:pk>/", views.PublicJobDetail.as_view(), name="public-job-detail"),

    # Employer browse candidates
    path("candidates/", views.EmployerCandidateList.as_view(), name="employer-candidates"),
    path("candidates/<int:pk>/", views.EmployerCandidateDetail.as_view(), name="employer-candidate-detail"),

    # Recommendations
    path("recommendations/jobs/", views.recommendations_for_candidate, name="recommend-jobs"),
    path("recommendations/candidates/<int:job_id>/", views.recommendations_for_employer, name="recommend-candidates"),

    # Applications
    path("jobs/<int:job_id>/apply/", views.apply_to_job, name="apply-to-job"),
    path("candidate/applications/", views.my_applications, name="my-applications"),
    path("employer/applications/", views.applications_to_my_jobs, name="employer-applications"),
]