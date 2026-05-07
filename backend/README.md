# Backend — Intelligent Talent Matching Platform

Django + Django REST Framework + SimpleJWT + SQLite + scikit-learn.

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

## Sample logins (created by seed_data)

All passwords: `DemoPass123!`

| Role | Usernames |
|---|---|
| Candidate | `alice_dev`, `bob_data`, `carol_full`, `david_ml`, `emma_front`, `frank_back`, `grace_devops`, `henry_mob`, `ivy_sec`, `jack_qa`, `kate_pm`, `liam_design`, `maya_data`, `noah_jr`, `olivia_ai` |
| Employer | `acme_corp`, `techstart`, `dataco`, `cloudplus`, `innovate_lab` |

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

### Job Postings

| Method | URL | Description | Auth |
|---|---|---|---|
| POST | `/api/employer/jobs/` | Create job | Employer |
| GET | `/api/employer/jobs/` | List own jobs | Employer |
| PUT | `/api/employer/jobs/<id>/` | Update own job | Employer |
| DELETE | `/api/employer/jobs/<id>/` | Delete own job | Employer |
| GET | `/api/jobs/?search=<keyword>` | Browse all jobs (public) | JWT |
| GET | `/api/jobs/<id>/` | View single job | JWT |

### Candidates (Employer Browse)

| Method | URL | Description | Auth |
|---|---|---|---|
| GET | `/api/candidates/?search=&education=&min_experience=` | List + filter candidates | Employer |
| GET | `/api/candidates/<id>/` | View single candidate | Employer |

### Recommendations

| Method | URL | Description | Auth |
|---|---|---|---|
| GET | `/api/recommendations/jobs/` | Top-10 jobs for candidate | Candidate |
| GET | `/api/recommendations/candidates/<job_id>/` | Top-10 candidates for job | Employer |

### Applications

| Method | URL | Description | Auth |
|---|---|---|---|
| POST | `/api/jobs/<id>/apply/` | Apply to a job | Candidate |
| GET | `/api/candidate/applications/` | View own applications | Candidate |
| GET | `/api/employer/applications/` | View applications to own jobs | Employer |

## Architecture

- **Authentication:** JWT (SimpleJWT) with rotating refresh tokens and blacklist on rotation
- **Permissions:** Custom `IsCandidate` and `IsEmployer` classes enforce role-based access
- **Recommendation engine:** TF-IDF vectorisation + cosine similarity over candidate and job text fields (skills, education, description)
- **Database:** SQLite for development; the schema migrates cleanly to PostgreSQL if needed
- **File uploads:** Django `FileField`, served from `/media/` in DEBUG mode

## Testing

```bash
pytest
```

Coverage spans authentication, role-based access, job CRUD, search, and recommendation ranking.