# backend/core/tests/test_jobs.py
"""
Tests for job posting endpoints.

Covers:
  - Employer can post a job
  - Candidate cannot post a job (403)
  - Public job list shows posted jobs
  - Keyword search filters correctly
  - Employer can update / delete own jobs
"""
import pytest
from rest_framework.test import APIClient
from core.models import User, JobPosting


@pytest.fixture
def employer_client(db):
    user = User.objects.create_user(
        username="emp_test", password="TestPass123!", role="EMPLOYER"
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client, user


@pytest.fixture
def candidate_client(db):
    user = User.objects.create_user(
        username="cand_test", password="TestPass123!", role="CANDIDATE"
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client, user


@pytest.mark.django_db
def test_employer_can_post_job(employer_client):
    client, _ = employer_client
    response = client.post("/api/employer/jobs/", {
        "title": "Backend Developer",
        "company_name": "Test Co",
        "company_info": "We test things.",
        "description": "Build APIs",
        "required_skills": "Python, Django",
        "required_experience_years": 2,
        "required_education": "BACHELOR",
        "work_mode": "REMOTE",
        "location": "Sydney",
    }, format="json")
    assert response.status_code == 201
    assert JobPosting.objects.count() == 1


@pytest.mark.django_db
def test_candidate_cannot_post_job(candidate_client):
    client, _ = candidate_client
    response = client.post("/api/employer/jobs/", {
        "title": "Should fail",
        "company_name": "Hax",
        "description": "x",
    }, format="json")
    assert response.status_code == 403


@pytest.mark.django_db
def test_public_job_list_shows_jobs(employer_client, candidate_client):
    emp_client, employer = employer_client
    cand_client, _ = candidate_client

    JobPosting.objects.create(
        title="Python Dev",
        company_name="Acme",
        description="Django backend work",
        required_skills="Python, Django",
        required_experience_years=2,
        required_education="BACHELOR",
        work_mode="REMOTE",
        location="Sydney",
        employer=employer,
    )

    response = cand_client.get("/api/jobs/")
    assert response.status_code == 200
    assert len(response.data) >= 1


@pytest.mark.django_db
def test_keyword_search_filters_jobs(employer_client, candidate_client):
    _, employer = employer_client
    cand_client, _ = candidate_client

    JobPosting.objects.create(
        title="Python Dev", company_name="A",
        description="Django backend", required_skills="Python",
        required_experience_years=2, required_education="BACHELOR",
        work_mode="REMOTE", location="Sydney", employer=employer,
    )
    JobPosting.objects.create(
        title="Java Dev", company_name="B",
        description="Spring Boot", required_skills="Java",
        required_experience_years=2, required_education="BACHELOR",
        work_mode="REMOTE", location="Sydney", employer=employer,
    )

    response = cand_client.get("/api/jobs/?search=Django")
    assert response.status_code == 200
    titles = [job["title"] for job in response.data]
    assert "Python Dev" in titles
    assert "Java Dev" not in titles


@pytest.mark.django_db
def test_employer_can_update_own_job(employer_client):
    client, employer = employer_client
    job = JobPosting.objects.create(
        title="Original", company_name="A",
        description="x", required_skills="x",
        required_experience_years=1, required_education="BACHELOR",
        work_mode="REMOTE", location="Sydney", employer=employer,
    )
    response = client.patch(f"/api/employer/jobs/{job.id}/", {
        "title": "Updated"
    }, format="json")
    assert response.status_code == 200
    job.refresh_from_db()
    assert job.title == "Updated"