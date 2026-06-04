import os
import json
import logging
import re
import zipfile
import xml.etree.ElementTree as ET

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

SECTION_HEADERS = {
    "summary",
    "profile",
    "objective",
    "experience",
    "work experience",
    "employment",
    "education",
    "skills",
    "technical skills",
    "projects",
    "certifications",
    "awards",
    "references",
}

KNOWN_SKILLS = [
    "python",
    "django",
    "flask",
    "fastapi",
    "javascript",
    "typescript",
    "react",
    "node",
    "node.js",
    "java",
    "c#",
    "c++",
    "html",
    "css",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "aws",
    "azure",
    "docker",
    "kubernetes",
    "git",
    "figma",
    "machine learning",
    "artificial intelligence",
    "data analysis",
]


def _extract_text_from_pdf(path: str) -> str:
    if fitz is None:
        raise RuntimeError("PyMuPDF (fitz) is not installed")
    doc = fitz.open(path)
    parts = []
    for page in doc:
        parts.append(page.get_text())
    return "\n".join(parts)


def _extract_text_from_docx(path: str) -> str:
    parts = []
    with zipfile.ZipFile(path) as docx:
        xml = docx.read("word/document.xml")

    root = ET.fromstring(xml)
    namespace = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    for paragraph in root.findall(".//w:p", namespace):
        text = "".join(
            node.text or "" for node in paragraph.findall(".//w:t", namespace)
        ).strip()
        if text:
            parts.append(text)

    return "\n".join(parts)


def _extract_text_from_resume(path: str) -> str:
    extension = os.path.splitext(path)[1].lower()
    if extension == ".pdf":
        return _extract_text_from_pdf(path)
    if extension == ".docx":
        return _extract_text_from_docx(path)
    raise RuntimeError(f"Unsupported resume type '{extension}'")


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


def _clean_line(line: str) -> str:
    return re.sub(r"\s+", " ", line).strip(" -|•\t")


def _extract_section(text: str, header_names: set[str]) -> str:
    lines = [_clean_line(line) for line in text.splitlines()]
    captured = []
    in_section = False

    for line in lines:
        if not line:
            if in_section and captured:
                captured.append("")
            continue

        normalized = line.lower().rstrip(":")
        is_header = normalized in SECTION_HEADERS or (
            len(normalized.split()) <= 3 and normalized in SECTION_HEADERS
        )

        if normalized in header_names:
            in_section = True
            continue

        if in_section and is_header:
            break

        if in_section:
            captured.append(line)

    return "\n".join(captured).strip()


def _extract_name(text: str) -> str:
    for line in (_clean_line(line) for line in text.splitlines()):
        if not line:
            continue
        lower = line.lower()
        if "@" in line or re.search(r"\d", line):
            continue
        if any(word in lower for word in ["resume", "curriculum vitae", "cv"]):
            continue
        if len(line.split()) <= 5:
            return line
    return ""


def _extract_phone(text: str) -> str:
    match = re.search(
        r"(?:(?:\+?\d{1,3})[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}",
        text,
    )
    return match.group(0).strip() if match else ""


def _extract_years_experience(text: str) -> int:
    patterns = [
        r"(\d+)\+?\s*(?:years|yrs)\s+(?:of\s+)?(?:relevant\s+)?experience",
        r"experience\s*(?:of|:)?\s*(\d+)\+?\s*(?:years|yrs)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return int(match.group(1))
    return 0


def _extract_major(text: str) -> str:
    degree_pattern = (
        r"(?:bachelor(?:'s)?|master(?:'s)?|phd|doctorate|diploma)"
        r"(?:\s+(?:of|in|degree in|science in|arts in))?\s+([A-Za-z][A-Za-z &/-]{2,80})"
    )
    match = re.search(degree_pattern, text, re.I)
    if match:
        major = re.split(r"\n|,|\|| at | from ", match.group(1), flags=re.I)[0]
        return _clean_line(major)
    return ""


def _extract_skills(text: str) -> str:
    skills_section = _extract_section(text, {"skills", "technical skills"})
    found = []

    if skills_section:
        candidates = re.split(r"[,;|•\n]", skills_section)
        found.extend(_clean_line(candidate).lower() for candidate in candidates)

    lower_text = text.lower()
    found.extend(skill for skill in KNOWN_SKILLS if skill in lower_text)

    unique = []
    for skill in found:
        if skill and len(skill) <= 40 and skill not in unique:
            unique.append(skill)

    return ", ".join(unique)


def _heuristic_parse_resume(text: str) -> dict:
    email_match = re.search(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+", text)
    summary = _extract_section(text, {"summary", "profile", "objective"})
    experience = _extract_section(text, {"experience", "work experience", "employment"})

    return {
        "full_name": _extract_name(text),
        "contact_email": email_match.group(0) if email_match else "",
        "contact_phone": _extract_phone(text),
        "education": _map_education(text),
        "major": _extract_major(text),
        "years_experience": _extract_years_experience(text),
        "skills": _extract_skills(text),
        "work_experience": experience,
        "preferred_work_mode": "Remote" if re.search(r"\bremote\b", text, re.I) else "",
        "preferred_location": "",
        "bio": summary,
    }


def _merge_parsed_data(primary: dict, fallback: dict) -> dict:
    merged = dict(primary or {})
    for key, fallback_value in fallback.items():
        primary_value = merged.get(key)
        if primary_value in (None, "", []):
            merged[key] = fallback_value
    return merged


def _call_openai_parse(text: str) -> dict:
    if openai is None:
        raise RuntimeError("openai package is not installed")

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in environment")
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

    system = (
        "You are a resume parsing assistant. Extract the candidate information and "
        "return strictly a single JSON object with keys: full_name, contact_email, contact_phone, "
        "education, major, years_experience (int), skills (array or comma string), work_experience, "
        "preferred_work_mode (Remote/On-site/Hybrid), preferred_location, bio. If a field is missing, "
        "return an empty string or empty array for skills. Do not include any extra text."
    )

    prompt = f"Here is the resume text:\n---\n{text[:6000]}\n---\nReturn only JSON."

    client = openai.OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
        temperature=0.0,
        max_tokens=1500,
    )
    assistant = resp.choices[0].message.content
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
        text = _extract_text_from_resume(path)
    except Exception as e:
        logger.exception("Failed to extract text from resume: %s", e)
        return profile

    fallback_parsed = _heuristic_parse_resume(text)

    try:
        parsed = _merge_parsed_data(_call_openai_parse(text), fallback_parsed)
    except Exception as e:
        logger.exception("OpenAI parsing failed: %s", e)
        parsed = fallback_parsed

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
