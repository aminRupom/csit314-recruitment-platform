# backend/core/tests/test_recommendations.py
"""
Tests for the recommendation engine.

Covers:
  - Empty database returns empty list
  - Returns at most top_k results
  - Ranks relevant jobs higher than irrelevant ones
"""
import pytest
from core.models import User, CandidateProfile, JobPosting
from core.recommendations import (
    recommend_jobs_for_candidate,
    recommend_candidates_for_job,
)


@pytest.fixture
def candidate_profile(db):
    user = User.objects.create_user(
        username="cand", password="x", role="CANDIDATE"
    )
    return CandidateProfile.objects.create(
        user=user,
        full_name="Test",
        contact_email="t@t.com",
        major="Computer Science",
        skills="Python, Django, REST",
        years_experience=3,
        education="BACHELOR",
    )


@pytest.fixture
def employer(db):
    return User.objects.create_user(
        username="emp", password="x", role="EMPLOYER"
    )


@pytest.mark.django_db
def test_empty_db_returns_empty_list(candidate_profile):
    results = recommend_jobs_for_candidate(candidate_profile, top_k=10)
    assert results == []


@pytest.mark.django_db
def test_returns_at_most_top_k(candidate_profile, employer):
    for i in range(15):
        JobPosting.objects.create(
            title=f"Job {i}",
            company_name="Co",
            description="Python Django backend",
            required_skills="Python, Django",
            required_experience_years=2,
            required_education="BACHELOR",
            work_mode="REMOTE",
            location="Sydney",
            employer=employer,
        )
    results = recommend_jobs_for_candidate(candidate_profile, top_k=10)
    assert len(results) <= 10


@pytest.mark.django_db
def test_relevant_jobs_rank_higher(candidate_profile, employer):
    relevant = JobPosting.objects.create(
        title="Python Backend Engineer",
        company_name="Tech Co",
        description="Build Django REST APIs",
        required_skills="Python, Django, REST",
        required_experience_years=3,
        required_education="BACHELOR",
        work_mode="REMOTE",
        location="Sydney",
        employer=employer,
    )
    irrelevant = JobPosting.objects.create(
        title="Marketing Manager",
        company_name="Brand Co",
        description="SEO, branding, campaigns",
        required_skills="marketing, SEO",
        required_experience_years=3,
        required_education="BACHELOR",
        work_mode="REMOTE",
        location="Sydney",
        employer=employer,
    )

    results = recommend_jobs_for_candidate(candidate_profile, top_k=10)

    # The Python job MUST rank higher than the marketing job.
    # Both may appear (TF-IDF can give small non-zero scores to weak matches),
    # but the relative order is what matters for the recommendation engine.
    assert results.index(relevant) < results.index(irrelevant)

@pytest.mark.django_db
def test_recommend_candidates_for_job(candidate_profile, employer):
    job = JobPosting.objects.create(
        title="Python Developer",
        company_name="Acme",
        description="Django backend developer",
        required_skills="Python, Django",
        required_experience_years=2,
        required_education="BACHELOR",
        work_mode="REMOTE",
        location="Sydney",
        employer=employer,
    )
    results = recommend_candidates_for_job(job, top_n=10)
    assert candidate_profile in results