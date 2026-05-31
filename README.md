# CSIT314 Recruitment Platform

A web-based recruitment platform that connects employers with job candidates. Employers can post jobs, browse candidate profiles, and receive AI-powered candidate recommendations. Candidates can create profiles, browse jobs, and apply to positions.

> **Subject:** CSIT314 — Systems Development Methodologies
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

The platform supports two main user roles.

Employers can:
- Publish job postings with detailed descriptions, required skills, education level, salary range, employment type, and work mode (Remote/On-site/Hybrid)
- Browse candidate profiles with filter and search support (skill, education, experience)
- Receive Top-N candidate recommendations matched to a specific job posting

Candidates can:
- Create and manage profiles, including work experience, skills, preferred working mode, and preferred location
- Upload a resume or fill in the profile form
- Browse and search jobs with keyword, filter, and fuzzy search modes
- Receive Top-K job recommendations based on profile and preferences
- Apply to positions

Both candidates and employers have a membership option. Non-members receive the standard Top-10 recommendation cap; members receive unlimited recommendations.

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
│   ├── workflows/              # GitHub Actions CI/CD pipelines
│   ├── ISSUE_TEMPLATE/         # Issue templates (bug, feature)
│   └── pull_request_template.md
├── backend/                    # Django REST API
│   ├── recruitment/            # Main Django project (settings, urls)
│   ├── core/                   # Application code (models, views, serializers, filters, recommendations)
│   ├── docs/api/               # OpenAPI schema
│   ├── tests/                  # PyTest test suite
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
source .venv/bin/activate          # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data --flush  # Optional: populate sample data
python manage.py runserver
```

The API will run at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## API Documentation

Once the backend is running, the interactive API documentation is available at:

- Swagger UI: `http://localhost:8000/api/docs/`
- Raw OpenAPI schema: `http://localhost:8000/api/schema/`

The schema is also committed to the repository at `backend/docs/api/schema.yml` for offline reference.

---

## Development Workflow

We follow a Scrum-based workflow.

### Branching Strategy

- `main` — production-ready code
- `develop` — integration branch for the current sprint
- `feature/<short-name>` — feature branches
- `bugfix/<short-name>` — bug fixes

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add job posting form
fix: correct candidate search filter logic
docs: update README with setup instructions
test: add unit tests for recommendation engine
refactor: extract auth middleware
```

### Pull Request Process

1. Create a feature branch from `develop`
2. Make changes, commit with clear messages
3. Push branch and open a PR against `develop`
4. At least one teammate must review before merging
5. CI checks must pass (tests, linting)
6. Squash and merge once approved

See [CONTRIBUTING.md](CONTRIBUTING.md) for full details.

---

## Testing

We follow Test-Driven Development (TDD) practices.

### Backend Tests

```bash
cd backend
pytest
pytest --cov=core                  # With coverage report
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

---

## CI/CD

Continuous integration is configured via GitHub Actions (see `.github/workflows/ci.yml`).

On every push or pull request, the pipeline will:

1. Lint backend code (flake8, black)
2. Lint frontend code (ESLint)
3. Run backend tests (pytest)
4. Run frontend tests (Jest)
5. Build frontend production bundle
6. Report code coverage

PRs that fail CI cannot be merged into `main` or `develop`.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

Project guided by the University of Wollongong.
