import pytest
from django.core.files import File
from rest_framework.test import APIClient
from core.models import User, CandidateProfile
from core import resume_parser


@pytest.mark.django_db
def test_parse_resume_and_fill_profile_maps_fields(tmp_path, monkeypatch):
    # Create a candidate and a dummy resume file
    user = User.objects.create_user(username="ruser", password="x", role="CANDIDATE")
    profile = CandidateProfile.objects.create(
        user=user,
        full_name="Old Name",
        contact_email="old@example.com",
        major="",
        skills="",
        years_experience=0,
        education="BACHELOR",
    )

    # create dummy file and attach to profile
    dummy = tmp_path / "dummy.pdf"
    dummy.write_bytes(b"%PDF-1.4 dummy")
    with open(dummy, "rb") as fh:
        profile.resume.save("dummy.pdf", File(fh), save=True)

    # Mock the internal functions to avoid external dependencies
    monkeypatch.setattr(resume_parser, "_extract_text_from_pdf", lambda p: "dummy text")
    parsed = {
        "full_name": "Alice Example",
        "contact_email": "alice@example.com",
        "contact_phone": "0123456789",
        "education": "Master of Science",
        "major": "Computer Science",
        "years_experience": 5,
        "skills": ["Python", "Django"],
        "work_experience": "Worked at X for 5 years",
        "preferred_work_mode": "Remote",
        "preferred_location": "Sydney",
        "bio": "Experienced backend engineer",
    }
    monkeypatch.setattr(resume_parser, "_call_openai_parse", lambda t: parsed)

    updated = resume_parser.parse_resume_and_fill_profile(profile)

    assert updated.full_name == "Alice Example"
    assert updated.contact_email == "alice@example.com"
    assert updated.contact_phone == "0123456789"
    assert updated.major == "Computer Science"
    assert updated.years_experience == 5
    assert "python" in updated.skills
    assert updated.preferred_work_mode == "REMOTE"
    assert updated.preferred_location == "Sydney"


@pytest.mark.django_db
def test_parse_resume_falls_back_to_local_extraction(tmp_path, monkeypatch):
    user = User.objects.create_user(username="fallback", password="x", role="CANDIDATE")
    profile = CandidateProfile.objects.create(
        user=user,
        full_name="",
        contact_email="",
        major="",
        skills="",
        years_experience=0,
        education="BACHELOR",
    )

    dummy = tmp_path / "fallback.pdf"
    dummy.write_bytes(b"%PDF-1.4 fallback")
    with open(dummy, "rb") as fh:
        profile.resume.save("fallback.pdf", File(fh), save=True)

    resume_text = """
    Jordan Smith
    jordan.smith@example.com | +61 400 123 456

    Summary
    Backend developer who enjoys reliable APIs.

    Skills
    Python, Django, React, SQL

    Experience
    5 years experience building recruitment platforms.

    Education
    Bachelor of Computer Science
    """

    monkeypatch.setattr(resume_parser, "_extract_text_from_pdf", lambda p: resume_text)
    monkeypatch.setattr(
        resume_parser,
        "_call_openai_parse",
        lambda t: (_ for _ in ()).throw(RuntimeError("no api key")),
    )

    updated = resume_parser.parse_resume_and_fill_profile(profile)

    assert updated.full_name == "Jordan Smith"
    assert updated.contact_email == "jordan.smith@example.com"
    assert updated.contact_phone == "+61 400 123 456"
    assert updated.education == "BACHELOR"
    assert "computer science" in updated.major.lower()
    assert updated.years_experience == 5
    assert "python" in updated.skills
    assert "django" in updated.skills
    assert "5 years experience" in updated.work_experience.lower()
    assert "reliable APIs" in updated.bio


@pytest.mark.django_db
def test_upload_resume_endpoint_calls_parser(tmp_path, monkeypatch):
    # Create user and profile
    user = User.objects.create_user(username="u2", password="x", role="CANDIDATE")
    profile = CandidateProfile.objects.create(
        user=user,
        full_name="Starter",
        contact_email="s@x.com",
        major="",
        skills="",
        years_experience=0,
        education="BACHELOR",
    )

    # create dummy file
    dummy = tmp_path / "upload.pdf"
    dummy.write_bytes(b"%PDF-1.4 upload")

    # Stub the parser used by views (imported in the views module)
    def fake_parser(p):
        p.full_name = "Parsed Name"
        p.contact_email = "parsed@example.com"
        p.save()
        return p

    import core.views as views_mod
    monkeypatch.setattr(views_mod, "parse_resume_and_fill_profile", fake_parser)

    client = APIClient()
    client.force_authenticate(user=user)

    with open(dummy, "rb") as fh:
        resp = client.post("/api/candidate/profile/upload-resume/", {"resume": fh}, format="multipart")

    assert resp.status_code == 200
    data = resp.data
    assert data.get("full_name") == "Parsed Name"
    assert data.get("contact_email") == "parsed@example.com"
