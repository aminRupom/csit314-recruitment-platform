# Frontend-Backend Integration Notes

## Static data files

The following files referenced in the integration plan do not exist yet - Sofia
and Ayan have not created them. There are no static data imports to remove.

- `src/data/jobs.js` - not created
- `src/data/candidateProfiles.js` - not created
- `src/utils/recommendJobs.js` - not created

Dashboard pages (`/candidate-dashboard`, `/employer-dashboard`) are `<h1>`
placeholder strings in App.jsx, not real files. All dashboard components are
created fresh in this integration.

## Backend serializer fields

### JobPostingSerializer
`id, title, company_name, company_info, description, required_education,
required_skills, required_experience_years, work_mode, location, salary_min,
salary_max, employment_type, employer_username, has_applied, application_count,
created_at, updated_at`

Read-only: `id, employer_username, has_applied, application_count, created_at, updated_at`
Write fields (for POST/PUT): `title, company_name, company_info, description,
required_education, required_skills, required_experience_years, work_mode,
location, salary_min, salary_max, employment_type`

### CandidateProfileSerializer
`id, full_name, contact_email, contact_phone, education, major,
years_experience, skills, work_experience, bio, preferred_work_mode,
preferred_location, resume_url, created_at, updated_at`

`skills` is a comma-separated string on the backend. `education` and
`preferred_work_mode` are choice fields (see choices below). `resume` is
write-only (not in response); `resume_url` is read-only.

### UserSerializer
`id, username, email, role, membership, date_joined`

NOTE: the field is `membership` (boolean), not `has_membership` as described
in the task context. The integration uses the actual serializer field name.

### ApplicationSerializer
`id, job_title, company_name, candidate_id, candidate_name, cover_message,
status, applied_at`

`job` is write-only (supplied via URL, not response body).

## Field mapping: CandidateSignup form -> backend

Transform location: api.js (not in components).

| Form field           | Backend field       | Transform                                   |
|----------------------|---------------------|---------------------------------------------|
| email                | username (auth)     | email used as username for registration     |
| email                | contact_email       | direct                                      |
| fullName             | full_name           | direct                                      |
| phoneNumber          | contact_phone       | direct                                      |
| major                | major               | direct (fallback: "Not specified")          |
| skills (array)       | skills (string)     | array.join(", ")                            |
| workMode             | preferred_work_mode | "Remote"->"REMOTE", "On-Site"->"ONSITE", "Hybrid"->"HYBRID" |
| preferredLocation    | preferred_location  | direct                                      |
| professionalSummary  | bio                 | direct                                      |
| degree               | education           | text match to BACHELOR/MASTER/PHD/DIPLOMA/HIGH_SCHOOL |
| jobTitle+companyName+experienceDate+responsibility | work_experience | formatted text block |
| dateOfBirth          | (none)              | no backend field, ignored                   |
| address1/2/city/state/postcode | (none)   | no backend field, ignored                   |
| readyNow             | (none)              | no backend field, ignored                   |
| achievements         | (none)              | no backend field, appended to bio           |
| profilePhoto         | (none)              | no backend endpoint, ignored                |

## Field mapping: Login form -> backend

| Form field | Backend field | Transform                       |
|------------|---------------|---------------------------------|
| email      | username      | email value sent as username    |
| password   | password      | direct                          |

Django's username validator allows @ so email addresses are valid usernames.

## Choice field values

`preferred_work_mode` / `work_mode` (JobPosting): REMOTE, ONSITE, HYBRID
`education` (CandidateProfile): HIGH_SCHOOL, DIPLOMA, BACHELOR, MASTER, PHD
`employment_type` (JobPosting): FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
`Application.status`: PENDING, REVIEWED, ACCEPTED, REJECTED

## Route guard analysis

App.jsx (as of audit) has no route guards. Dashboard routes render inline `<h1>`
strings, not components. The integration adds:
- A `ProtectedRoute` wrapper that checks `isLoggedIn()` and redirects to `/login`
- All dashboard, job-detail, and profile routes are wrapped with `ProtectedRoute`

## Key backend constraints

- `GET /api/jobs/` requires `IsAuthenticated` - candidates must be logged in
- `POST /api/candidate/profile/` creates; `PUT` updates - two distinct methods
- `upload_resume` requires a profile to exist first
- `register` returns `access` + `refresh` tokens directly - no second login needed
- `logout` requires the refresh token in the request body to blacklist it

## Phase 8 note

No `.github/workflows/deploy-pages.yml` file exists in this repo (only `ci.yml`).
Phase 8 is not applicable.
