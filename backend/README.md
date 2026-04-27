# Backend

Django REST API for the recruitment platform.

## Setup

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Project Layout (to be added)

```
backend/
├── recruitment/        # Django project (settings, URLs, WSGI)
├── apps/
│   ├── users/         # Authentication & user accounts
│   ├── jobs/          # Job posting CRUD
│   ├── candidates/    # Candidate profile management
│   └── recommender/   # Top-N candidate recommendation
├── requirements.txt
└── manage.py
```
