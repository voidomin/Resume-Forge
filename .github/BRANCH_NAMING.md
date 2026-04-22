# Branch Naming Convention

This document outlines the standardized naming conventions for all branches in the Resume-Forge repository.

## Overview

All branches should follow the pattern: `<type>/<description>`

## Branch Types

| Type        | Purpose                  | Example                     |
| ----------- | ------------------------ | --------------------------- |
| `feat/`     | New features             | `feat/google-oauth`         |
| `fix/`      | Bug fixes                | `fix/auth-callback-state`   |
| `perf/`     | Performance improvements | `perf/lazy-load-templates`  |
| `docs/`     | Documentation updates    | `docs/setup-guide`          |
| `test/`     | Test improvements        | `test/add-e2e-tests`        |
| `refactor/` | Code refactoring         | `refactor/extract-utils`    |
| `chore/`    | Maintenance tasks        | `chore/update-dependencies` |
| `ci/`       | CI/CD configuration      | `ci/github-actions`         |

## Naming Rules

### ✅ DO's

1. **Use lowercase** - Branch names should be lowercase only

   ```
   ✅ feat/user-authentication
   ❌ feat/User-Authentication
   ```

2. **Use hyphens for spaces** - Separate words with hyphens, not underscores

   ```
   ✅ feat/google-oauth-integration
   ❌ feat/google_oauth_integration
   ❌ feat/googleOAuthIntegration
   ```

3. **Be descriptive but concise** - Clear intention without being verbose

   ```
   ✅ fix/password-validation-regex
   ❌ fix/password
   ❌ fix/implement-correct-regex-pattern-for-password-validation-with-uppercase-lowercase-numbers-and-special-chars
   ```

4. **Reference issues when applicable** - Include the issue number if applicable

   ```
   ✅ fix/auth-callback-issue-#123
   ✅ feat/oauth-support
   ```

5. **Use complete words** - Avoid abbreviations unless universally understood
   ```
   ✅ feat/backend-optimization
   ❌ feat/bcknd-opt
   ```

### ❌ DON'Ts

1. **Don't use multiple types**

   ```
   ❌ feat/fix/auth-issue (confusing)
   ```

2. **Don't use special characters** (except hyphens)

   ```
   ❌ feat/auth@new!
   ❌ feat/auth_oauth
   ```

3. **Don't create branches directly from main**

   ```
   ✅ branch from develop, then PR to main
   ❌ branch from main for feature work
   ```

4. **Don't leave branches stale** - Delete after merging
   ```
   ✅ Merge PR → Delete branch → Keep repo clean
   ❌ Leave merged branches in repository
   ```

## Examples

### Good Branch Names

```
feat/dynamic-resume-scaling
feat/password-reset-flow
fix/google-auth-callback
fix/duplicate-password-rules
perf/lazy-load-templates
docs/api-documentation
test/add-playwright-tests
refactor/extract-auth-utils
ci/setup-sonarcloud
chore/update-prisma
```

### Bad Branch Names

```
feature/oauth                     ❌ Use 'feat/' not 'feature/'
my-feature                        ❌ Missing type prefix
fix_auth_issue                    ❌ Use hyphens, not underscores
f/auth                            ❌ Don't abbreviate type
fix/auth/oauth/callback           ❌ Too many slashes
```

## Branch Lifecycle

### Creating a Branch

1. Ensure you're on the latest `develop` branch

   ```bash
   git checkout develop
   git pull origin develop
   ```

2. Create your feature branch
   ```bash
   git checkout -b feat/your-feature-name
   ```

### Before Merging

1. Ensure branch name follows conventions
2. Rebase on latest develop if needed
   ```bash
   git fetch origin
   git rebase origin/develop
   ```

### After Merging

1. Delete the local branch

   ```bash
   git branch -d feat/your-feature-name
   ```

2. Delete the remote branch (GitHub auto-deletes after PR merge with setting enabled)
   ```bash
   git push origin --delete feat/your-feature-name
   ```

## Current Standard

- **Main Development Branch:** `develop`
- **Production Branch:** `main` (protected)
- **Release Pattern:** Tag releases as `v{MAJOR}.{MINOR}.{PATCH}` on main branch

## Questions?

Refer to the [BRANCHING_STRATEGY.md](./.github/BRANCHING_STRATEGY.md) for more details on the overall Git workflow.
