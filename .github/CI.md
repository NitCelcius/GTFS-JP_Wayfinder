# CI/CD Configuration

## Overview

This repository uses GitHub Actions for Continuous Integration. The CI workflow has been optimized to avoid duplicate runs and improve efficiency.

## CI Trigger Behavior

### When CI Runs

CI will run automatically when:

- ✅ A pull request is **opened** against any branch
- ✅ New commits are **pushed** to an existing pull request (`synchronize`)
- ✅ A pull request is **reopened**
- ✅ A draft pull request is marked as **ready for review**

### When CI is Skipped

CI will be skipped for:

- ❌ **Branches starting with "wip"** (e.g., `wip`, `wip-feature`, `wiptest`)
- ❌ **Direct pushes to main/master** (PRs are required)

## Caching Strategy

The CI workflow includes several caching mechanisms for improved performance:

- **pnpm dependencies**: Cached using `~/.pnpm-store` and lockfile hash
- **Turbo build cache**: Cached in `.turbo` directory for faster subsequent builds
- **Python dependencies**: uv cache with dependency glob matching
- **Node.js modules**: Automatic caching via setup-node action

## Branch Naming Guidelines

To ensure proper CI behavior:

- ✅ Use descriptive branch names like `feature/add-caching`, `fix/bug-123`
- ❌ Avoid starting branch names with `wip` if you want CI to run
- 💡 Use draft PRs for work-in-progress instead of `wip` branch names

## Examples

### Branches that trigger CI:

- `feature/new-component`
- `fix/critical-bug`
- `hotfix/security-patch`
- `docs/update-readme`
- `main` (when opened as PR)

### Branches that skip CI:

- `wip`
- `wip-experimental`
- `wipfeature`
- `wip/new-api`

### Draft PR behavior:

- Draft PR created → ✅ CI runs
- Draft PR updated → ✅ CI runs
- Draft marked ready → ✅ CI runs
