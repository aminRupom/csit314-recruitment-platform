# backend/core/tests/test_features.py
"""
Tests for membership, bio, resume validation, application status, job serializer
convenience fields, and the membership upgrade endpoint.
"""
import io
import pytest
from rest_framework.test import APIClient
from core.models import User, CandidateProfile, JobPosting, Application


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_employer(username="emp_feat"):
    return User.objects.create_user(username=username, password="x", role="EMPLOYER")


def _make_candidate(username="cand_feat"):
    return User.objects.create_user(username=username, password="x", role="CANDIDATE")


def _make_profile(user, **kwargs):
    defaults = dict(
        full_name="Test User",
        contact_email="test@test.com",
        major="CS",
        skills="python",
        years_experience=1,
        education="BACHELOR",
    )
    defaults.update(kwargs)
    return CandidateProfile.objects.create(user=user, **defaults)


def _make_job(employer, title="Software Engineer"):
    return JobPosting.objects.create(
        title=title,
        company_name="Acme",
        company_info="Acme Corp",
        description="Build systems",
        required_skills="Python",
        required_experience_years=1,
        required_education="BACHELOR",
        work_mode="REMOTE",
        location="Sydney",
        employer=employer,
    )


def _auth_client(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


# ---------------------------------------------------------------------------
# /me/ returns membership
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_me_returns_membership_false():
    user = _make_candidate("me_cand_nm")
    client = _auth_client(user)
    resp = client.get("/api/auth/me/")
    assert resp.status_code == 200
    assert "membership" in resp.data
    assert resp.data["membership"] is False


@pytest.mark.django_db
def test_me_returns_membership_true():
    user = _make_candidate("me_cand_m")
    user.membership = True
    user.save()
    client = _auth_client(user)
    resp = client.get("/api/auth/me/")
    assert resp.status_code == 200
    assert resp.data["membership"] is True


# ---------------------------------------------------------------------------
# bio round-trips via PUT
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_bio_roundtrip_via_put():
    user = _make_candidate("bio_cand")
    _make_profile(user)
    client = _auth_client(user)

    resp = client.put("/api/candidate/profile/", {
        "full_name": "Bio Tester",
        "contact_email": "bio@test.com",
        "major": "CS",
        "skills": "python",
        "years_experience": 1,
        "education": "BACHELOR",
        "bio": "I love building things with Python.",
    }, format="json")
    assert resp.status_code == 200
    assert resp.data["bio"] == "I love building things with Python."

    # Confirm persisted
    get_resp = client.get("/api/candidate/profile/")
    assert get_resp.data["bio"] == "I love building things with Python."


# ---------------------------------------------------------------------------
# resume upload validation
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_resume_upload_rejects_txt():
    user = _make_candidate("res_txt_cand")
    _make_profile(user)
    client = _auth_client(user)

    fake_txt = io.BytesIO(b"not a real resume")
    fake_txt.name = "resume.txt"
    resp = client.post("/api/candidate/profile/upload-resume/", {"resume": fake_txt}, format="multipart")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_resume_upload_rejects_oversized_file():
    user = _make_candidate("res_big_cand")
    _make_profile(user)
    client = _auth_client(user)

    big_pdf = io.BytesIO(b"A" * (5 * 1024 * 1024 + 1))
    big_pdf.name = "resume.pdf"
    resp = client.post("/api/candidate/profile/upload-resume/", {"resume": big_pdf}, format="multipart")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_resume_upload_accepts_pdf():
    user = _make_candidate("res_pdf_cand")
    _make_profile(user)
    client = _auth_client(user)

    small_pdf = io.BytesIO(b"%PDF-1.4 fake content")
    small_pdf.name = "resume.pdf"
    resp = client.post("/api/candidate/profile/upload-resume/", {"resume": small_pdf}, format="multipart")
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# application status PATCH
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_employer_can_update_application_status():
    emp = _make_employer("emp_status")
    cand = _make_candidate("cand_status")
    profile = _make_profile(cand)
    job = _make_job(emp)
    app = Application.objects.create(candidate=profile, job=job)

    client = _auth_client(emp)
    resp = client.patch(f"/api/employer/applications/{app.id}/", {"status": "REVIEWED"}, format="json")
    assert resp.status_code == 200
    assert resp.data["status"] == "REVIEWED"
    app.refresh_from_db()
    assert app.status == "REVIEWED"


@pytest.mark.django_db
def test_other_employer_gets_404_on_application_update():
    emp = _make_employer("emp_own")
    other_emp = _make_employer("emp_other")
    cand = _make_candidate("cand_other")
    profile = _make_profile(cand)
    job = _make_job(emp)
    app = Application.objects.create(candidate=profile, job=job)

    client = _auth_client(other_emp)
    resp = client.patch(f"/api/employer/applications/{app.id}/", {"status": "ACCEPTED"}, format="json")
    assert resp.status_code == 404


@pytest.mark.django_db
def test_invalid_status_returns_400():
    emp = _make_employer("emp_invalid")
    cand = _make_candidate("cand_invalid")
    profile = _make_profile(cand)
    job = _make_job(emp)
    app = Application.objects.create(candidate=profile, job=job)

    client = _auth_client(emp)
    resp = client.patch(f"/api/employer/applications/{app.id}/", {"status": "BOGUS"}, format="json")
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# has_applied and application_count on JobPostingSerializer
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_has_applied_false_before_applying():
    emp = _make_employer("emp_ha1")
    cand = _make_candidate("cand_ha1")
    _make_profile(cand)
    job = _make_job(emp)

    client = _auth_client(cand)
    resp = client.get(f"/api/jobs/{job.id}/")
    assert resp.status_code == 200
    assert resp.data["has_applied"] is False


@pytest.mark.django_db
def test_has_applied_true_after_applying():
    emp = _make_employer("emp_ha2")
    cand = _make_candidate("cand_ha2")
    profile = _make_profile(cand)
    job = _make_job(emp)
    Application.objects.create(candidate=profile, job=job)

    client = _auth_client(cand)
    resp = client.get(f"/api/jobs/{job.id}/")
    assert resp.status_code == 200
    assert resp.data["has_applied"] is True


@pytest.mark.django_db
def test_application_count_reflects_applications():
    emp = _make_employer("emp_ac1")
    cand1 = _make_candidate("cand_ac1")
    cand2 = _make_candidate("cand_ac2")
    p1 = _make_profile(cand1)
    p2 = _make_profile(cand2)
    job = _make_job(emp)

    client = _auth_client(cand1)
    resp = client.get(f"/api/jobs/{job.id}/")
    assert resp.data["application_count"] == 0

    Application.objects.create(candidate=p1, job=job)
    Application.objects.create(candidate=p2, job=job)

    resp2 = client.get(f"/api/jobs/{job.id}/")
    assert resp2.data["application_count"] == 2


@pytest.mark.django_db
def test_has_applied_null_for_employer():
    emp = _make_employer("emp_ha3")
    job = _make_job(emp)
    client = _auth_client(emp)
    resp = client.get(f"/api/jobs/{job.id}/")
    assert resp.status_code == 200
    assert resp.data["has_applied"] is None


# ---------------------------------------------------------------------------
# membership upgrade endpoint
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_upgrade_membership_sets_membership_true():
    user = _make_candidate("upgrade_cand")
    assert user.membership is False
    client = _auth_client(user)
    resp = client.post("/api/auth/upgrade-membership/")
    assert resp.status_code == 200
    assert resp.data["membership"] is True
    user.refresh_from_db()
    assert user.membership is True


@pytest.mark.django_db
def test_upgrade_membership_uncaps_recommendations():
    emp = _make_employer("emp_upgrade")
    cand_user = _make_candidate("upgrade_rec_cand")
    _make_profile(cand_user)
    for i in range(15):
        _make_job(emp, title=f"Job {i}")

    client = _auth_client(cand_user)
    # Before upgrade: capped at 10
    resp_before = client.get("/api/recommendations/jobs/")
    assert len(resp_before.data) <= 10

    client.post("/api/auth/upgrade-membership/")

    # After upgrade: uncapped
    resp_after = client.get("/api/recommendations/jobs/")
    assert len(resp_after.data) > 10
