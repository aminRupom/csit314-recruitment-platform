from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import JobPosting, CandidateProfile
from .serializers import JobPostingSerializer, CandidateProfileSerializer
from .recommendations import (
    recommend_jobs_for_candidate,
    recommend_candidates_for_job,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommended_jobs(request):
    """GET /api/recommendations/jobs/  — for logged-in candidate"""
    try:
        candidate = request.user.candidate_profile
    except CandidateProfile.DoesNotExist:
        return Response(
            {"error": "Candidate profile not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    jobs = recommend_jobs_for_candidate(candidate, top_k=10)
    return Response(JobPostingSerializer(jobs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommended_candidates(request, job_id):
    """GET /api/recommendations/candidates/<job_id>/  — for employer"""
    try:
        job = JobPosting.objects.get(id=job_id, employer=request.user)
    except JobPosting.DoesNotExist:
        return Response(
            {"error": "Job not found or not yours"},
            status=status.HTTP_404_NOT_FOUND,
        )

    candidates = recommend_candidates_for_job(job, top_n=10)
    return Response(CandidateProfileSerializer(candidates, many=True).data)