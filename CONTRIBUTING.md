# Contributing to the CSIT314 Recruitment Platform

Welcome team! This guide explains how we work together on this codebase.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branching Strategy](#branching-strategy)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Testing Requirements](#testing-requirements)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

- Be respectful and constructive in code reviews
- Communicate early if you are blocked or falling behind
- Attend weekly stand-ups (or post async updates)
- Keep all team discussions in the team Discord/Slack/Teams channel

---

## Getting Started

1. Clone the repo: `git clone https://github.com/<org>/csit314-recruitment-platform.git`
2. Follow the setup instructions in [README.md](README.md)
3. Get added to the GitHub organisation and Project board
4. Pick up an issue from the **To Do** column on the Project board

---

## Branching Strategy

We use a simplified **Git Flow**:

```
main          ──●──────────●──────────●─►   (production-ready, tagged releases)
                 \          \          \
develop      ──●──●──●──●──●──●──●──●──●─►   (integration branch)
                  \  /     \ /     \ /
feature       ────●        ●        ●        (short-lived feature branches)
```

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<descriptive-name>` | `feature/job-posting-form` |
| Bug fix | `bugfix/<descriptive-name>` | `bugfix/login-validation` |
| Hotfix | `hotfix/<descriptive-name>` | `hotfix/security-patch` |
| Documentation | `docs/<descriptive-name>` | `docs/api-reference` |
| Refactor | `refactor/<descriptive-name>` | `refactor/auth-middleware` |

### Rules

- **Never commit directly to `main` or `develop`** — always go through a PR
- Keep feature branches **small and focused** (ideally < 400 lines changed)
- Pull `develop` regularly into your feature branch to avoid merge conflicts
- Delete feature branches after merging

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only
- `style` — formatting, no code change
- `refactor` — code change that neither fixes a bug nor adds a feature
- `test` — adding or updating tests
- `chore` — build/tooling changes

### Examples

```
feat(jobs): add job posting creation endpoint

Implements POST /api/jobs with validation for required fields
(title, description, skills, work mode).

Closes #12
```

```
fix(auth): prevent login with empty password

Frontend was submitting empty strings as valid passwords.
```

```
docs: update setup instructions for Windows users
```

---

## Pull Request Process

### Before opening a PR

- [ ] Pull latest `develop` and rebase your branch
- [ ] Run all tests locally — they must pass
- [ ] Run linters and fix any warnings
- [ ] Self-review your diff (look for debug prints, commented code, etc.)

### Opening the PR

1. Push your branch: `git push origin feature/your-branch`
2. Open a PR against `develop` (not `main`)
3. Fill out the PR template completely
4. Link the related issue (e.g., "Closes #15")
5. Add at least **one reviewer**
6. Move the corresponding card to **In Review** on the Project board

### Merging

- A PR requires **at least one approval** before merging
- All CI checks must pass
- Use **Squash and merge** to keep `develop` history clean
- Delete the branch after merging

---

## Code Review Guidelines

### As an author

- Respond to all comments (even just with "done" or "thanks")
- Don't take feedback personally — it's about the code
- If you disagree, explain your reasoning rather than just rejecting

### As a reviewer

- Review within **24 hours** if possible
- Be specific and constructive ("Could we extract this into a helper function?" vs "This is bad")
- Approve when the code is good enough — perfect is the enemy of done
- Use **Request changes** only for blocking issues

---

## Testing Requirements

Per the subject's emphasis on **Test-Driven Development (Week 5)**:

- Every new feature must include tests
- Bug fixes should include a regression test
- Aim for **>70% code coverage** on new code
- Tests must pass in CI before merging

### What to test

- All public API endpoints (happy path + error cases)
- Business logic in service/utility functions
- Critical UI components (forms, recommendation display)

---

## Reporting Issues

Use the GitHub Issues tab with the appropriate template:

- 🐛 **Bug Report** — something broken
- ✨ **Feature Request** — new functionality
- 📝 **Documentation** — docs unclear or missing
- ❓ **Question** — need clarification

Add labels (`backend`, `frontend`, `priority-high`, etc.) and assign to the right milestone.

---

## Questions?

Ask in the team chat or tag the group leader in your issue/PR.
