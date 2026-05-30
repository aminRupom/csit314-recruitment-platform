# backend/core/tests/test_search.py
"""
Tests for the structured filter + keyword + fuzzy search pipeline.

Covers:
  - Structured filter combined with keyword search on job listings
  - Fuzzy search returns a job when the query contains a common typo
"""
import pytest
from rest_framework.test import APIClient
from core.models import User, CandidateProfile, JobPosting


@pytest.fixture
def employer(db):
    return User.objects.create_user(
        username="search_emp", password="x", role="EMPLOYER"
    )


@pytest.fixture
def candidate_client(db):
    user = User.objects.create_user(
        username="search_cand", password="x", role="CANDIDATE"
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def employer_client(db):
    user = User.objects.create_user(
        username="search_emp2", password="x", role="EMPLOYER"
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client, user


def _job(employer, title, description, required_skills, employment_type="FULL_TIME", work_mode="REMOTE"):
    return JobPosting.objects.create(
        title=title,
        company_name="Acme",
        company_info="Acme Corp",
        description=description,
        required_skills=required_skills,
        required_experience_years=2,
        required_education="BACHELOR",
        work_mode=work_mode,
        location="Sydney",
        employment_type=employment_type,
        employer=employer,
    )


@pytest.mark.django_db
def test_filter_and_keyword_combined(candidate_client, employer):
    python_full = _job(employer, "Python Developer", "Build Django REST APIs", "Python, Django", employment_type="FULL_TIME")
    python_contract = _job(employer, "Python Contractor", "Build Django REST APIs", "Python, Django", employment_type="CONTRACT")
    _job(employer, "Java Developer", "Build Spring Boot services", "Java, Spring", employment_type="FULL_TIME")

    response = candidate_client.get("/api/jobs/?search=Django&employment_type=FULL_TIME")
    assert response.status_code == 200
    ids = [j["id"] for j in response.data]

    assert python_full.id in ids
    assert python_contract.id not in ids


@pytest.mark.django_db
def test_fuzzy_search_tolerates_typos(candidate_client, employer):
    python_job = _job(employer, "Python Developer", "Build Django REST APIs with Python", "Python, Django")
    _job(employer, "Java Developer", "Build Java Spring Boot services", "Java, Spring")

    # Regular search with the typo finds nothing (icontains doesn't match)
    response_exact = candidate_client.get("/api/jobs/?search=Pyhton")
    exact_ids = [j["id"] for j in response_exact.data]
    assert python_job.id not in exact_ids

    # Fuzzy search with the same typo finds the Python job
    response_fuzzy = candidate_client.get("/api/jobs/?search=Pyhton&fuzzy=true")
    assert response_fuzzy.status_code == 200
    fuzzy_ids = [j["id"] for j in response_fuzzy.data]
    assert python_job.id in fuzzy_ids


@pytest.mark.django_db
def test_candidate_skill_filter(employer_client, db):
    client, emp_user = employer_client

    py_user = User.objects.create_user(username="py_cand", password="x", role="CANDIDATE")
    CandidateProfile.objects.create(
        user=py_user, full_name="Alice", contact_email="a@test.com",
        major="CS", skills="Python, Django", years_experience=2, education="BACHELOR",
    )
    java_user = User.objects.create_user(username="java_cand", password="x", role="CANDIDATE")
    java_profile = CandidateProfile.objects.create(
        user=java_user, full_name="Bob", contact_email="b@test.com",
        major="CS", skills="Java, Spring", years_experience=2, education="BACHELOR",
    )

    response = client.get("/api/candidates/?skills=python")
    assert response.status_code == 200
    ids = [c["id"] for c in response.data]
    # Skills are normalised to lowercase on save, so icontains on "python" matches
    assert java_profile.id not in ids
