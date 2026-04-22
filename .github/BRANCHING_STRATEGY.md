# Git Branching Strategy

## Overview

Resume-Forge uses a **Git Flow** branching model with the following structure:

```
main (Production) ◄──── PR Merge (Release Ready)
 ▲
 │
 └──── develop (Integration) ◄──── PR Merge (Feature Complete)
          ▲
          │
          └──── feature/ (Feature Branches)
          ├──── fix/ (Bug Fix Branches)
          ├──── perf/ (Performance Branches)
          └──── chore/ (Maintenance Branches)
```

## Branches

### `main` (Production Branch)

- **Purpose:** Stable, production-ready code only
- **Protection:** Yes (requires PR review and passing checks)
- **Deploy:** Automatic deployment to production (Netlify + Render)
- **Who can merge:** Only via approved PR
- **Tag:** Version tags (v1.2.0) created on main

**When to merge to main:**

- Feature is complete and tested
- PR approved by at least 1 reviewer
- All status checks pass (SonarCloud, Tests, Build)
- Code duplication ≤ 3%
- No failing tests

### `develop` (Integration Branch)

- **Purpose:** Integration point for all features before production
- **Protection:** Recommended (but less strict than main)
- **Deploy:** None (staging/preview only)
- **Who can merge:** Via approved PR
- **Lifecycle:** Features merge here first, then batched to main

**When to merge to develop:**

- Feature complete and self-tested
- Code follows naming/style conventions
- No merge conflicts with current develop

### Feature Branches

- **Naming:** `feat/`, `fix/`, `perf/`, `docs/`, `test/`, `refactor/`, `chore/`, `ci/`
- **Source:** Branch from `develop`
- **Target:** Merge back to `develop` via PR
- **Lifetime:** Deleted after merge
- **Protection:** None (local work only)

## Workflow: Creating a Feature

### 1. Create Feature Branch

```bash
# Update develop to latest
git checkout develop
git pull origin develop

# Create feature branch from develop
git checkout -b feat/my-new-feature

# Or for bug fixes
git checkout -b fix/auth-bug
```

### 2. Development Work

```bash
# Make your commits with clear messages
git add .
git commit -m "feat: implement new authentication flow"

# Keep commits atomic and meaningful
git commit -m "test: add unit tests for auth service"
git commit -m "docs: update auth documentation"

# Push regularly to avoid loss
git push origin feat/my-new-feature
```

### 3. Create Pull Request (to develop)

```bash
# After pushing, create PR on GitHub
# Base: develop
# Compare: feat/my-new-feature

# PR description should include:
# - What was changed and why
# - Testing performed
# - Any breaking changes
# - Screenshots (if UI change)
```

### 4. Code Review

- Address review comments
- Push fixes to the same branch
- Request re-review after changes

### 5. Merge to Develop

```bash
# After approval and all checks pass
# Use "Squash and merge" for clean history

# GitHub will auto-delete the branch (if enabled)
# Otherwise, manually delete:
git branch -d feat/my-new-feature
git push origin --delete feat/my-new-feature
```

### 6. Merge to Main (Release)

```bash
# When ready for production (usually weekly)
# Create PR: develop → main
# More rigorous review (production code)
# All checks must pass

# After merge, create release tag:
git tag -a v1.2.0 -m "Release v1.2.0: [features]"
git push origin v1.2.0
```

## Commit Message Convention

Follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat:` - New feature
- `fix:` - Bug fix
- `perf:` - Performance improvement
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `chore:` - Build, dependencies, etc.
- `ci:` - CI/CD changes

### Examples

```
feat(auth): implement google oauth callback
fix(password): correct validation regex pattern
perf(frontend): implement lazy loading for templates
docs(api): add authentication endpoints documentation
test(e2e): add playwright tests for login flow
refactor(utils): extract password validation logic
chore: update dependencies
ci: add sonarcloud configuration
```

## Status Checks (Must Pass Before Merge)

### On develop → main PR

- ✅ Test & Deploy
- ✅ SonarCloud Code Analysis (Quality Gate: ≤3% duplication)
- ✅ Netlify Deploy Preview
- ✅ Branch protection rules

### On feature → develop PR

- ✅ SonarCloud Code Analysis (soft check)
- ✅ 1 Approval required

## Release Schedule

### Weekly Release Process

1. **Monday:** Batch completed features from develop
2. **Create PR:** develop → main
3. **Review:** Ensure quality gate passes
4. **Merge:** Squash merge to main
5. **Tag:** Create version tag (v1.2.0)
6. **Deploy:** Automatic to production

## Common Scenarios

### Scenario 1: Update Feature Branch from develop

```bash
git fetch origin
git rebase origin/develop
git push origin feat/my-feature --force-with-lease
```

### Scenario 2: Accidentally Committed to develop

```bash
git log --oneline -5  # Find your commit
git reset --soft HEAD~1  # Undo commit, keep changes
git checkout -b fix/my-fix  # Create proper branch
git commit -m "fix: my fix"
git push origin fix/my-fix
```

### Scenario 3: Need to Merge Latest Main into Feature

```bash
git fetch origin
git merge origin/main
# Resolve conflicts if any
git push origin feat/my-feature
```

### Scenario 4: Delete Old Stale Branches

```bash
# Locally
git branch -d old-branch

# From remote
git push origin --delete old-branch
```

## Best Practices

### ✅ DO

- Keep branches focused on single feature/fix
- Push frequently to avoid loss
- Write clear, descriptive commit messages
- Review own code before requesting review
- Delete branches after merge
- Keep commits atomic (one logical change per commit)
- Rebase before merging to keep history clean

### ❌ DON'T

- Push directly to main or develop
- Leave branches stale/unmaintained
- Create huge PRs with multiple features
- Commit sensitive data (API keys, passwords)
- Force push to shared branches
- Merge without tests
- Leave merge conflicts unresolved

## GitHub Settings (Recommended)

### Protection Rules for `main`

- ✅ Require pull request reviews before merging (1 approval)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Allow squash and merge (preferred)
- ✅ Delete head branch on merge (auto-cleanup)

### Protection Rules for `develop`

- ✅ Require pull request reviews before merging (1 approval)
- ✅ Allow squash and merge
- ✅ Delete head branch on merge (auto-cleanup)

## Tools

### Useful Git Commands

```bash
# Show branches with last commit
git branch -vv

# Delete all local branches except develop and main
git branch --merged | grep -v "develop\|main" | xargs git branch -d

# Show commits not in main
git log origin/main..develop --oneline

# Create backup before major operation
git branch backup-branch-name
```

## Related Documentation

- [BRANCH_NAMING.md](./BRANCH_NAMING.md) - Naming conventions
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [README.md](../README.md) - Project overview

## Questions?

Create an issue with the `documentation` label or contact the maintainers.
