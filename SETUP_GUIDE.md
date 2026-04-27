# GitHub Repo Setup Guide — Step by Step

Follow these steps to create the repo and push the starter files.

---

## Step 1: Create the GitHub Repo (Web)

1. Go to https://github.com/new
2. **Repository name:** `csit314-recruitment-platform` (or whatever your team agrees on)
3. **Description:** `CSIT314 group project — recruitment platform connecting employers and candidates`
4. **Visibility:** Public ✅
5. **Do NOT** tick "Add README", "Add .gitignore", or "Choose a license" (we have these already)
6. Click **Create repository**

GitHub will show you a URL like:
`https://github.com/<your-username>/csit314-recruitment-platform.git`

---

## Step 2: Push the Starter Files

Open a terminal in the folder where you've extracted the starter files, then:

```bash
# Initialise git
git init
git branch -M main

# Configure your name/email (one-time, if not done before)
git config user.name "Your Name"
git config user.email "your-email@uowmail.edu.au"

# Stage and commit everything
git add .
git commit -m "chore: initial repo setup with CI, docs, and project structure"

# Connect to GitHub
git remote add origin https://github.com/<your-username>/csit314-recruitment-platform.git

# Push to GitHub
git push -u origin main
```

---

## Step 3: Create the `develop` Branch

```bash
git checkout -b develop
git push -u origin develop
```

---

## Step 4: Add Your Teammates as Collaborators

1. Go to your repo on GitHub → **Settings** → **Collaborators**
2. Click **Add people** and invite each teammate by their GitHub username
3. Give them **Write** access (so they can push branches and open PRs)

---

## Step 5: Set Up Branch Protection (Recommended)

This prevents anyone from accidentally pushing broken code straight to `main`.

1. **Settings** → **Branches** → **Add branch ruleset** (or **Add rule** on older UI)
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (set to **1**)
   - ✅ Require status checks to pass (select the CI workflow once it has run once)
   - ✅ Require branches to be up to date before merging
4. Save
5. **Repeat for `develop`**

---

## Step 6: Create the GitHub Project Board (Scrum/Kanban)

This directly supports the **Development Progress** and **Development Plan** sections of your Week 7 progress report.

1. Go to your repo → **Projects** tab → **New project**
2. Choose **Board** template
3. Default columns: **Todo**, **In Progress**, **Done**
4. Add a couple more: **Backlog** (left of Todo) and **In Review** (between In Progress and Done)
5. Link the project to your repo so issues auto-appear

### Suggested First Issues to Create

- `[FEATURE] Set up Django project skeleton`
- `[FEATURE] Set up React + Vite project skeleton`
- `[FEATURE] Design ER diagram for users, jobs, candidates`
- `[FEATURE] Implement user registration & login (employer + candidate)`
- `[FEATURE] Job posting CRUD endpoints`
- `[FEATURE] Candidate profile CRUD endpoints`
- `[FEATURE] Top-10 candidate recommendation algorithm`
- `[FEATURE] Filter & search candidates`
- `[DOCS] Draft Week 7 progress report`

---

## Step 7: First Test of CI

After your first push to `main`, go to the **Actions** tab on GitHub. You should see the CI workflow running. It will fail initially because there's no actual code yet — that's expected. The pipeline is in place and ready for when you start adding code.

---

## Step 8: Share the Repo Link

Send the GitHub URL to your team and the subject coordinator. Make sure everyone can clone and that the README displays nicely on the repo homepage.

---

## Common Gotchas

- **Permission denied (publickey)** when pushing → Use HTTPS URL or set up an SSH key on GitHub
- **`main` vs `master`** → GitHub defaults to `main` now; the commands above use `main`
- **Large files** → Don't commit `node_modules/`, `venv/`, or build artifacts (the `.gitignore` handles this)
- **Secrets** → NEVER commit `.env` files or API keys. They're in `.gitignore` for a reason

---

## Next Steps After Repo Is Up

1. Each team member clones the repo
2. Group leader assigns issues on the Project board
3. Team starts working on issues using the branch + PR workflow
4. Begin drafting the Week 7 progress report in `docs/progress-report/`
