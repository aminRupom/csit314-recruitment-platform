# Contributing to the CSIT314 Recruitment Platform

How we work together on this codebase.

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
- Speak up early if you're blocked or falling behind
- Attend weekly stand-ups, or post an async update
- Keep team discussions in the team channel

---

## Getting Started

1. Clone the repo: `git clone https://github.com/<org>/csit314-recruitment-platform.git`
2. Follow the setup in [README.md](README.md)
3. Get added to the GitHub organisation and Project board
4. Pick up an issue from the "To Do" column

---

## Branching Strategy

Simplified Git Flow:

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

- Never commit directly to `main` or `develop`, always go through a PR
- Keep feature branches small and focused (ideally under 400 lines changed)
- Pull `develop` into your branch often to avoid conflicts
- Delete feature branches after merging

---

## Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

- `feat`, new feature
- `fix`, bug fix
- `docs`, documentation only
- `style`, formatting, no code change
- `refactor`, no bug fix or new feature
- `test`, adding or updating tests
- `chore`, build or tooling changes

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
- [ ] All tests pass locally
- [ ] Linters clean
- [ ] Self-review the diff (debug prints, commented code, stray files)

### Opening the PR

1. Push your branch: `git push origin feature/your-branch`
2. Open a PR against `develop`, not `main`
3. Fill out the PR template
4. Link the issue (e.g., "Closes #15")
5. Add at least one reviewer
6. Move the card to "In Review" on the Project board

### Merging

- At least one approval before merging
- All CI checks must pass
- Use "Squash and merge" to keep `develop` history clean
- Delete the branch after merging

---

## Code Review Guidelines

### As an author

- Respond to every comment (even just "done")
- If you disagree, explain why rather than just closing the comment

### As a reviewer

- Review within 24 hours if possible
- Be specific ("Could we extract this into a helper function?" beats "This is bad")
- Approve when the code is good enough to ship
- Use "Request changes" only for blocking issues

---

## Testing Requirements

Per the subject's TDD emphasis (Week 5):

- Every new feature ships with tests
- Bug fixes include a regression test
- Aim for over 70% coverage on new code
- Tests must pass in CI before merging

### What to test

- All public API endpoints (happy path + error cases)
- Business logic in service or utility functions
- Critical UI components (forms, recommendation display)

---

## Reporting Issues

Use the GitHub Issues tab with the right template:

- Bug Report, something broken
- Feature Request, new functionality
- Documentation, docs unclear or missing
- Question, need clarification

Add labels (`backend`, `frontend`, `priority-high`) and assign to the right milestone.

---

## Questions

Ask in the team chat or tag the group leader in your issue or PR.
