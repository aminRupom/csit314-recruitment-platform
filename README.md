# CSIT314 Recruitment Platform

Web-based recruitment platform that connects employers with job candidates. Employers post jobs, browse candidate profiles, and get AI-powered candidate recommendations. Candidates create profiles, browse jobs, and apply to positions.

> **Subject:** CSIT314, Systems Development Methodologies
> **Institution:** University of Wollongong
> **Semester:** Autumn 2026
> **Group name:** Bring Back Seconds

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Team Members](#team-members)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [CI/CD](#cicd)
- [License](#license)

---

## Project Overview

Two user roles.

Employers can:
- Publish job postings with description, required skills, education level, salary range, employment type, and work mode (Remote/On-site/Hybrid)
- Browse candidate profiles with filter and search (skill, education, experience)
- Get Top-N candidate recommendations for a specific job

Candidates can:
- Create profiles with work experience, skills, preferred working mode, and preferred location
- Upload a resume or fill in the profile form
- Browse and search jobs with keyword, filter, and fuzzy search
- Get Top-K job recommendations based on profile and preferences
- Apply to positions

Both roles support a membership flag. Non-members get the standard Top-10 cap on recommendations. Members get the full ranked list.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12+, Django 6.x, Django REST Framework, SimpleJWT |
| Recommendation | scikit-learn (TF-IDF, cosine similarity), rapidfuzz (fuzzy search) |
| API Documentation | drf-spectacular (OpenAPI 3 / Swagger UI) |
| Frontend | Node.js 20+, React, Vite |
| Database | PostgreSQL (production), SQLite (local dev) |
| Testing | PyTest (backend), Jest + React Testing Library (frontend) |
| CI/CD | GitHub Actions |
| Project Management | Jira (Scrum board) |

---

## Team Members

| Name | Student ID | Role | Functional Area |
|------|-----------|------|-----------------|
| Shobita Sutharshan | 8868165 | Team Lead (Scrum Master) | Project coordination, sprint management |
| Sofia Isabelle Ong Flores | 7765745 | System Designer | System architecture, risk analysis and mitigation |
| Masaki Inoue | 8445424 | Requirement Analyst | Creating user stories, gathering requirements |
| Ayan Deb Nath | 8907067 | Frontend Developer | UX/UI design and implementation |
| Md Aminul Islam Rupom | 8782957 | AI/ML & Backend Developer | AI/ML and backend development |

---

## Project Structure

```
csit314-recruitment-platform/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD pipelines
├── backend/                    # Django REST API
│   ├── recruitment/            # Django project (settings, urls)
│   ├── core/                   # Models, views, serializers, filters, recommendations
│   ├── docs/api/               # OpenAPI schema
│   ├── tests/                  # PyTest suite
│   ├── requirements.txt
│   └── manage.py
├── frontend/                   # React app
│   ├── src/
│   ├── public/
│   └── package.json
├── database/                   # SQL schemas
├── tests/                      # Integration & E2E tests
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- Git
- PostgreSQL 15+ (production only)

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data --flush  # optional: sample data
python manage.py runserver
```

API runs at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## API Documentation

With the backend running:

- Swagger UI: `http://localhost:8000/api/docs/`
- Raw OpenAPI schema: `http://localhost:8000/api/schema/`

Schema is also committed at `backend/docs/api/schema.yml`.

---

## Development Workflow

Scrum-based workflow.

### Branching Strategy

- `main`, production-ready code
- `develop`, integration branch for the current sprint
- `feature/<short-name>`, feature branches
- `bugfix/<short-name>`, bug fixes

### Commit Message Convention

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add job posting form
fix: correct candidate search filter logic
docs: update README with setup instructions
test: add unit tests for recommendation engine
refactor: extract auth middleware
```

### Pull Request Process

1. Branch from `develop`
2. Make changes, commit with clear messages
3. Push and open a PR against `develop`
4. At least one teammate reviews before merging
5. CI must pass (tests, linting)
6. Squash and merge once approved

See [CONTRIBUTING.md](CONTRIBUTING.md) for full details.

---

## Testing

TDD where practical.

### Backend Tests

```bash
cd backend
pytest
pytest --cov=core                  # with coverage report
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

---

## CI/CD

GitHub Actions, configured in `.github/workflows/ci.yml`.

On push and PR:

1. Lint backend (flake8, black)
2. Lint frontend (ESLint)
3. Run backend tests (pytest)
4. Run frontend tests (Jest)
5. Build frontend production bundle
6. Report code coverage

PRs failing CI can't merge to `main` or `develop`.

---

## License

MIT, see [LICENSE](LICENSE).

---

## Acknowledgements

Project guided by the University of Wollongong.
