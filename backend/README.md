# Backend — Intelligent Talent Matching Platform

Django + Django REST Framework + SimpleJWT + SQLite + scikit-learn + rapidfuzz.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

The API runs at `http://localhost:8000/`. Admin panel at `/admin/`.

Interactive API documentation (Swagger UI) is available at `/api/docs/`. The raw OpenAPI schema is at `/api/schema/`.

## Sample logins (created by seed_data)

All passwords: `DemoPass123!`

| Role | Membership | Usernames |
|---|---|---|
| Candidate | Yes | `alice_dev`, `bob_data`, `david_ml`, `grace_devops`, `ivy_sec`, `kate_pm`, `maya_data`, `olivia_ai` |
| Candidate | No | `carol_full`, `emma_front`, `frank_back`, `henry_mob`, `jack_qa`, `liam_design`, `noah_jr` |
| Employer | Yes | `acme_corp`, `dataco`, `cloudplus` |
| Employer | No | `techstart`, `innovate_lab` |

Member accounts receive uncapped recommendation results. Non-member accounts receive at most 10 recommendations per request.

## API Endpoints

### Authentication

| Method | URL | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register/` | Register a candidate or employer | None |
| POST | `/api/auth/login/` | Get JWT access + refresh tokens | None |
| POST | `/api/auth/refresh/` | Get new access token | Refresh token |
| POST | `/api/auth/logout/` | Blacklist refresh token | JWT |
| GET | `/api/auth/me/` | Get current user info | JWT |

### Candidate Profile

| Method | URL | Description | Auth |
|---|---|---|---|
| GET | `/api/candidate/profile/` | View own profile | Candidate |
| POST | `/api/candidate/profile/` | Create profile | Candidate |
| PUT | `/api/candidate/profile/` | Update profile | Candidate |
| POST | `/api/candidate/profile/upload-resume/` | Upload resume (multipart) | Candidate |

**Profile fields:** `full_name`, `contact_email`, `contact_phone`, `education`, `major`, `years_experience`, `skills` (comma-separated, stored lowercase), `work_experience` (free text), `preferred_work_mode` (`REMOTE` / `ONSITE` / `HYBRID`), `preferred_location`.

### Job Postings

| Method | URL | Description | Auth |
|---|---|---|---|
| POST | `/api/employer/jobs/` | Create job | Employer |
| GET | `/api/employer/jobs/` | List own jobs | Employer |
| PUT | `/api/employer/jobs/<id>/` | Update own job | Employer |
| DELETE | `/api/employer/jobs/<id>/` | Delete own job | Employer |
| GET | `/api/jobs/` | Browse all jobs | JWT |
| GET | `/api/jobs/<id>/` | View single job | JWT |

**Job fields:** `title`, `company_name`, `company_info`, `description`, `required_education`, `required_skills`, `required_experience_years`, `work_mode`, `location`, `salary_min`, `salary_max`, `employment_type` (`FULL_TIME` / `PART_TIME` / `CONTRACT` / `INTERNSHIP`).

**Job search and filter parameters:**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Keyword search across title, description, required skills, company name |
| `fuzzy=true` | flag | Re-rank top 100 results with fuzzy matching (use with `search`) |
| `work_mode` | choice | `REMOTE`, `ONSITE`, or `HYBRID` |
| `employment_type` | choice | `FULL_TIME`, `PART_TIME`, `CONTRACT`, or `INTERNSHIP` |
| `required_education` | choice | Education level code (e.g. `BACHELOR`) |
| `location` | string | Case-insensitive substring match on job location |
| `salary_min` | integer | Jobs where `salary_min` is at least this value |
| `salary_max` | integer | Jobs where `salary_max` is at most this value |
| `min_experience` | integer | Jobs requiring at least this many years of experience |

### Candidates (Employer Browse)

| Method | URL | Description | Auth |
|---|---|---|---|
| GET | `/api/candidates/` | List all candidates | Employer |
| GET | `/api/candidates/<id>/` | View single candidate profile | Employer |

**Candidate filter parameters:**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Keyword search across name, major, skills |
| `fuzzy=true` | flag | Re-rank top 100 results with fuzzy matching (use with `search`) |
| `education` | choice | Exact education level (e.g. `MASTER`) |
| `skills` | string | Case-insensitive containment match on the skills field |
| `min_experience` | integer | Candidates with at least this many years of experience |

### Recommendations

| Method | URL | Description | Auth |
|---|---|---|---|
| GET | `/api/recommendations/jobs/` | Top-N jobs for the logged-in candidate | Candidate |
| GET | `/api/recommendations/candidates/<job_id>/` | Top-N candidates for a job | Employer |

The recommendation engine uses TF-IDF cosine similarity over profile and job text fields. A small boost (`+0.1`) is applied when a job's work mode or location matches the candidate's stated preferences. The cap is 10 results for non-members and unlimited for members.

### Applications

| Method | URL | Description | Auth |
|---|---|---|---|
| POST | `/api/jobs/<id>/apply/` | Apply to a job | Candidate |
| GET | `/api/candidate/applications/` | View own applications | Candidate |
| GET | `/api/employer/applications/` | View applications to own jobs | Employer |

## Architecture

- **Authentication:** JWT (SimpleJWT) with rotating refresh tokens and token blacklisting on rotation.
- **Permissions:** Custom `IsCandidate` and `IsEmployer` classes enforce role-based access at the view level.
- **Membership:** `User.membership` flag (togglable via the admin). Lifts the Top-N cap on recommendation endpoints.
- **Recommendation engine:** TF-IDF vectorisation + cosine similarity over candidate and job text fields (skills, education, major, work experience, preferences, job description). Preference boosts applied post-scoring for work mode and location alignment.
- **Search pipeline:** Structured filters applied at the database level via `django-filter`, followed by DRF keyword search. Optional fuzzy re-ranking with `rapidfuzz` when `?fuzzy=true` is passed.
- **API schema:** Auto-generated OpenAPI 3 schema via `drf-spectacular`. Available at `/api/schema/` (YAML) and `/api/docs/` (Swagger UI).
- **Database:** SQLite for development; the schema migrates cleanly to PostgreSQL if needed.
- **File uploads:** Django `FileField`, served from `/media/` in DEBUG mode.

## Testing

```bash
pytest
```

Coverage spans authentication, role-based access, job CRUD, keyword and fuzzy search, recommendation ranking, preference boosts, and membership cap behaviour.
