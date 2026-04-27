# CSIT314 Recruitment Platform
#Group name: Bring Back Seconds

A web-based recruitment platform that connects employers with job candidates. Employers can post jobs, browse candidate profiles, and receive AI-powered candidate recommendations. Candidates can create profiles, browse jobs, and apply to positions.

> **Subject:** CSIT314 — Systems Development Methodologies
> **Institution:** University of Wollongong
> **Semester:** Autumn 2026

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Team Members](#team-members)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Documentation](#documentation)
- [License](#license)

---

## Project Overview

The platform supports two main user roles:

Employers can:
- Publish job postings with detailed descriptions, required skills, education level, and work mode (Remote/On-site/Hybrid)
- Browse candidate profiles (filtered by skill, education, experience)
- Search candidates by specific criteria
- Receive Top-10 candidate recommendations based on job requirements

Candidates can:
- Create and manage profiles
- Browse and search job postings
- Apply for positions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, Django 5.x, Django REST Framework |
| Frontend | Node.js 20+, React 18, Vite |
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
│   ├── recruitment/            # Main Django project
│   ├── apps/                   # Django apps (users, jobs, candidates, etc.)
│   ├── requirements.txt
│   └── manage.py
├── frontend/                   # React app
│   ├── src/
│   ├── public/
│   └── package.json
├── database/                   # SQL schemas & migration scripts
├── tests/                      # Integration & E2E tests
├── docs/                       # UML diagrams, reports, meeting minutes
│   ├── progress-report/
│   ├── uml/
│   └── meetings/
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- Git
- PostgreSQL 15+
- SQLite

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
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

## Development Workflow

We follow a Scrum-based workflow

### Branching Strategy

- `main` — production-ready code 
- `develop` — integration branch for the current sprint
- `feature/<short-name>` — feature branches (e.g., `feature/job-posting-form`)
- `bugfix/<short-name>` — bug fixes
- `docs/<short-name>` — documentation-only changes

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

We follow **Test-Driven Development (TDD)** practices as covered in Week 5.

### Backend Tests

```bash
cd backend
pytest
pytest --cov=apps                 # With coverage report
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

## Documentation

- [Progress Report](docs/progress-report/) — Week 7 deliverable
- [UML Diagrams](docs/uml/) — Use case, class, sequence diagrams
- [Meeting Minutes](docs/meetings/) — Fortnightly team standups
- [Development Model](docs/development-model.md) — Methodology details

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

Project guided by the CSIT314/ISIT950 subject team at the University of Wollongong.
