import os
import json
import logging

try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None

try:
    import openai
except Exception:
    openai = None

from django.conf import settings

logger = logging.getLogger(__name__)


EDUCATION_MAP = {
    "high school": "HIGH_SCHOOL",
    "highschool": "HIGH_SCHOOL",
    "diploma": "DIPLOMA",
    "bachelor": "BACHELOR",
    "bachelor's": "BACHELOR",
    "bachelors": "BACHELOR",
    "master": "MASTER",
    "master's": "MASTER",
    "phd": "PHD",
}


def _extract_text_from_pdf(path: str) -> str:
    if fitz is None:
        raise RuntimeError("PyMuPDF (fitz) is not installed")
    doc = fitz.open(path)
    parts = []
    for page in doc:
        parts.append(page.get_text())
    return "\n".join(parts)


def _map_education(value: str) -> str:
    if not value:
        return ""
    v = value.strip().lower()
    for key, mapped in EDUCATION_MAP.items():
        if key in v:
            return mapped
    return "BACHELOR"


def _normalize_skills(skills) -> str:
    if not skills:
        return ""
    if isinstance(skills, list):
        return ", ".join(s.strip().lower() for s in skills if s)
    if isinstance(skills, str):
        # try to split on common separators
        for sep in ["\n", ";", "|", ","]:
            if sep in skills:
                parts = [p.strip().lower() for p in skills.split(sep) if p.strip()]
                return ", ".join(parts)
        return skills.strip().lower()
    return str(skills)


def _call_openai_parse(text: str) -> dict:
    if openai is None:
        raise RuntimeError("openai package is not installed")

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in environment")
    openai.api_key = api_key
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

    # Prompt instructing model to output strict JSON with only the fields we need
    system = (
        "You are a resume parsing assistant. Extract the candidate information and "
        "return strictly a single JSON object with keys: full_name, contact_email, contact_phone, "
        "education, major, years_experience (int), skills (array or comma string), work_experience, "
        "preferred_work_mode (Remote/On-site/Hybrid), preferred_location, bio. If a field is missing, "
        "return an empty string or empty array for skills. Do not include any extra text."
    )

    user = f"Here is the resume text:\n---\n{text[:6000]}\n---\nReturn only JSON."

    resp = openai.ChatCompletion.create(
        model=model,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0.0,
        max_tokens=1500,
    )
    # Get assistant content
    assistant = resp["choices"][0]["message"]["content"]
    # Attempt to parse JSON from the assistant output
    try:
        parsed = json.loads(assistant)
    except Exception:
        # try to extract JSON snippet
        import re

        m = re.search(r"\{.*\}", assistant, re.S)
        if not m:
            raise
        parsed = json.loads(m.group(0))
    return parsed


def parse_resume_and_fill_profile(profile):
    """
    Given a CandidateProfile instance with a `resume` FileField set, extract text,
    call OpenAI to parse relevant fields, and update the profile in-place.
    Returns the updated profile.
    """
    if not profile.resume:
        return profile

    path = profile.resume.path
    try:
        text = _extract_text_from_pdf(path)
    except Exception as e:
        logger.exception("Failed to extract text from PDF: %s", e)
        return profile

    try:
        parsed = _call_openai_parse(text)
    except Exception as e:
        logger.exception("OpenAI parsing failed: %s", e)
        return profile

    # Map parsed fields to model fields
    try:
        full_name = parsed.get("full_name") or parsed.get("name") or ""
        contact_email = parsed.get("contact_email") or parsed.get("email") or ""
        contact_phone = parsed.get("contact_phone") or parsed.get("phone") or ""
        education = _map_education(parsed.get("education", ""))
        major = parsed.get("major", "") or parsed.get("field_of_study", "")
        years = parsed.get("years_experience", parsed.get("experience_years", ""))
        try:
            years = int(years) if years not in (None, "") else 0
        except Exception:
            years = 0
        skills = _normalize_skills(parsed.get("skills", ""))
        work_experience = parsed.get("work_experience", "") or parsed.get("experience", "")
        preferred_work_mode = parsed.get("preferred_work_mode", "")
        preferred_location = parsed.get("preferred_location", "")
        bio = parsed.get("bio", "")

        if full_name:
            profile.full_name = full_name
        if contact_email:
            profile.contact_email = contact_email
        if contact_phone:
            profile.contact_phone = contact_phone
        if education:
            profile.education = education
        if major:
            profile.major = major
        profile.years_experience = years
        if skills:
            profile.skills = skills
        if work_experience:
            profile.work_experience = work_experience
        if preferred_work_mode:
            # Normalize to our model choices
            pm = preferred_work_mode.strip().lower()
            if "remote" in pm:
                profile.preferred_work_mode = "REMOTE"
            elif "hybrid" in pm:
                profile.preferred_work_mode = "HYBRID"
            elif "on" in pm or "site" in pm or "onsite" in pm:
                profile.preferred_work_mode = "ONSITE"
        if preferred_location:
            profile.preferred_location = preferred_location
        if bio:
            profile.bio = bio

        profile.save()
    except Exception as e:
        logger.exception("Failed to map parsed resume to profile: %s", e)

    return profile
