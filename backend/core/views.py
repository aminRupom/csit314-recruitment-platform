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
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import ListAPIView, RetrieveAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .permissions import IsEmployer
from .models import JobPosting, CandidateProfile
from .serializers import JobPostingSerializer, CandidateProfileSerializer

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

from rest_framework.parsers import MultiPartParser, FormParser
from .models import CandidateProfile
from .serializers import CandidateProfileSerializer
from .permissions import IsCandidate


@api_view(["GET", "POST", "PUT"])
@permission_classes([IsCandidate])
def candidate_profile(request):
    """
    GET   /api/candidate/profile/   →  retrieve own profile
    POST  /api/candidate/profile/   →  create (first time only)
    PUT   /api/candidate/profile/   →  update existing
    """
    user = request.user

    if request.method == "GET":
        try:
            profile = CandidateProfile.objects.get(user=user)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"detail": "Profile not yet created."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = CandidateProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    if request.method == "POST":
        if CandidateProfile.objects.filter(user=user).exists():
            return Response(
                {"detail": "Profile already exists. Use PUT to update."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = CandidateProfileSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # PUT
    try:
        profile = CandidateProfile.objects.get(user=user)
    except CandidateProfile.DoesNotExist:
        return Response(
            {"detail": "No profile to update. POST first to create one."},
            status=status.HTTP_404_NOT_FOUND,
        )
    serializer = CandidateProfileSerializer(
        profile, data=request.data, partial=True, context={"request": request}
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsCandidate])
def upload_resume(request):
    """
    POST /api/candidate/profile/upload-resume/

    Body: multipart form with 'resume' file field.
    Returns: updated profile with resume_url.
    """
    user = request.user
    try:
        profile = CandidateProfile.objects.get(user=user)
    except CandidateProfile.DoesNotExist:
        return Response(
            {"detail": "Create your profile before uploading a resume."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if "resume" not in request.FILES:
        return Response(
            {"detail": "No resume file provided. Use form field name 'resume'."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    profile.resume = request.FILES["resume"]
    profile.save()

    serializer = CandidateProfileSerializer(profile, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

# ---------------------------------------------------------------------------
# Job postings — employer side (CRUD on own jobs)
# ---------------------------------------------------------------------------

class EmployerJobListCreate(ListCreateAPIView):
    """
    GET   /api/employer/jobs/   →  list own jobs
    POST  /api/employer/jobs/   →  create new job
    """
    serializer_class = JobPostingSerializer
    permission_classes = [IsEmployer]

    def get_queryset(self):
        return JobPosting.objects.filter(employer=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(employer=self.request.user)


class EmployerJobDetail(RetrieveUpdateDestroyAPIView):
    """
    GET    /api/employer/jobs/<id>/   →  view own job
    PUT    /api/employer/jobs/<id>/   →  update own job
    DELETE /api/employer/jobs/<id>/   →  delete own job
    """
    serializer_class = JobPostingSerializer
    permission_classes = [IsEmployer]

    def get_queryset(self):
        # Employers only see/edit their own postings
        return JobPosting.objects.filter(employer=self.request.user)


# ---------------------------------------------------------------------------
# Job postings — public/candidate side (browse + search)
# ---------------------------------------------------------------------------

class PublicJobList(ListAPIView):
    """
    GET /api/jobs/                  →  list all jobs
    GET /api/jobs/?search=python    →  keyword search across title / description / skills
    """
    serializer_class = JobPostingSerializer
    permission_classes = [IsAuthenticated]
    queryset = JobPosting.objects.all().order_by("-created_at")
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["title", "description", "required_skills", "company_name"]
    filterset_fields = ["work_mode", "required_education"]


class PublicJobDetail(RetrieveAPIView):
    """GET /api/jobs/<id>/  →  view a single job"""
    serializer_class = JobPostingSerializer
    permission_classes = [IsAuthenticated]
    queryset = JobPosting.objects.all()


# Candidate browsing from employer side

class EmployerCandidateList(ListAPIView):
    """
    GET /api/candidates/                                        →  list all candidates
    GET /api/candidates/?search=python                          →  keyword search
    GET /api/candidates/?education=BACHELOR&min_experience=2    →  filter
    """
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsEmployer]
    queryset = CandidateProfile.objects.all().order_by("-updated_at")
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["full_name", "major", "skills"]
    filterset_fields = ["education"]

    def get_queryset(self):
        qs = super().get_queryset()
        min_exp = self.request.query_params.get("min_experience")
        if min_exp is not None:
            try:
                qs = qs.filter(years_experience__gte=int(min_exp))
            except ValueError:
                pass
        return qs


class EmployerCandidateDetail(RetrieveAPIView):
    """GET /api/candidates/<id>/  →  view a single candidate profile"""
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsEmployer]
    queryset = CandidateProfile.objects.all()

# Recommendations

from .recommendations import (
    recommend_jobs_for_candidate,
    recommend_candidates_for_job,
)


@api_view(["GET"])
@permission_classes([IsCandidate])
def recommendations_for_candidate(request):
    """
    GET /api/recommendations/jobs/

    Returns the Top-10 jobs ranked for the logged-in candidate.
    """
    try:
        profile = CandidateProfile.objects.get(user=request.user)
    except CandidateProfile.DoesNotExist:
        return Response(
            {"detail": "Create your profile before requesting recommendations."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    jobs = recommend_jobs_for_candidate(profile, top_k=10)
    serializer = JobPostingSerializer(jobs, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsEmployer])
def recommendations_for_employer(request, job_id):
    """
    GET /api/recommendations/candidates/<job_id>/

    Returns the Top-10 candidates ranked for the given job posting.
    Only the employer who owns the job can request this.
    """
    try:
        job = JobPosting.objects.get(id=job_id, employer=request.user)
    except JobPosting.DoesNotExist:
        return Response(
            {"detail": "Job not found or you do not own this posting."},
            status=status.HTTP_404_NOT_FOUND,
        )

    candidates = recommend_candidates_for_job(job, top_n=10)
    serializer = CandidateProfileSerializer(candidates, many=True, context={"request": request})
    return Response(serializer.data)

# Applications
from .models import Application
from .serializers import ApplicationSerializer


@api_view(["POST"])
@permission_classes([IsCandidate])
def apply_to_job(request, job_id):
    """
    POST /api/jobs/<job_id>/apply/

    Body: { "cover_message": "..." }   (optional)
    Records an application linking the logged-in candidate to the job.
    """
    try:
        job = JobPosting.objects.get(id=job_id)
    except JobPosting.DoesNotExist:
        return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        candidate = CandidateProfile.objects.get(user=request.user)
    except CandidateProfile.DoesNotExist:
        return Response(
            {"detail": "Create your profile before applying."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if Application.objects.filter(candidate=candidate, job=job).exists():
        return Response(
            {"detail": "You have already applied to this job."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    application = Application.objects.create(
        candidate=candidate,
        job=job,
        cover_message=request.data.get("cover_message", ""),
    )
    serializer = ApplicationSerializer(application)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsCandidate])
def my_applications(request):
    """
    GET /api/candidate/applications/

    Returns all applications submitted by the logged-in candidate.
    """
    try:
        candidate = CandidateProfile.objects.get(user=request.user)
    except CandidateProfile.DoesNotExist:
        return Response([])

    applications = Application.objects.filter(candidate=candidate).order_by("-applied_at")
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsEmployer])
def applications_to_my_jobs(request):
    """
    GET /api/employer/applications/

    Returns all applications to jobs posted by the logged-in employer.
    """
    applications = Application.objects.filter(
        job__employer=request.user
    ).order_by("-applied_at")
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)