# Frontend

React SPA for the Hustle recruitment platform, built with Vite 8 and React 19.

## Requirements

- Node 18+
- Backend running on port 8000 (see `backend/` for setup)

## Environment

Create a `.env` file in this directory (already gitignored) with:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

A `.env.example` is provided as a template.

## Setup

```bash
npm install
npm run dev   # starts on http://localhost:5173
```

## Running locally

Start the backend first, then the frontend:

**Terminal 1 - backend:**
```bash
cd backend
source .venv/bin/activate
python manage.py migrate
python manage.py seed_data
python manage.py runserver 8000
```

**Terminal 2 - frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in a browser. Default demo credentials are created
by `seed_data` (see `backend/core/management/commands/seed_data.py` for
usernames and passwords).

## Production build

```bash
npm run build    # output goes to dist/
npm run preview  # serve the build locally
```

Note: production deploy is out of scope. The app makes direct calls to
`VITE_API_BASE_URL`, so the backend must be reachable from the browser.

## Project layout

```
frontend/
  src/
    pages/          Route-level components
    services/       API client and auth helpers
      apiClient.js  Core fetch wrapper with JWT handling
      auth.js       Token storage (localStorage)
      api.js        All backend calls, one function per operation
    styles/         CSS files per page / shared
  public/
  .env.example
  INTEGRATION_NOTES.md  Field mapping reference
```
