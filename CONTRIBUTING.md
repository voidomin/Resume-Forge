# Contributing to SmartResume Builder

Thank you for your interest in contributing to SmartResume Builder! This document outlines the process and guidelines for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming Convention](#branch-naming-convention)
- [Bug Fix Process](#bug-fix-process)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Code Style Guidelines](#code-style-guidelines)

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- PostgreSQL (or Supabase account)
- Docker (optional, for containerized development)

### Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/Resume-Forge.git
   cd Resume-Forge
   ```

3. Add upstream remote:

   ```bash
   git remote add upstream https://github.com/voidomin/Resume-Forge.git
   ```

4. Install dependencies:

   ```bash
   # Backend
   cd resume-builder/backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

5. Set up environment variables (see documentation)

6. Run the development servers:

   ```bash
   # Backend
   npm run dev

   # Frontend (in another terminal)
   npm run dev
   ```

---

## Development Workflow

### Main Branch Protection

The `main` branch is **protected** and represents production-ready code:

- ✅ All code must go through Pull Requests
- ✅ At least 1 review required before merging
- ✅ All tests must pass
- ❌ No direct commits to `main`
- ❌ No force pushes

### Development Branch

All development work happens on the `develop` branch:

1. Ensure your develop branch is up to date:

   ```bash
   git checkout develop
   git pull upstream develop
   ```

2. Create a feature/bugfix branch from `develop`:

   ```bash
   git checkout -b bugfix/fix-pdf-export
   ```

3. Make your changes and commit:

   ```bash
   git add .
   git commit -m "fix: resolve PDF export issue with long names"
   ```

4. Push to your fork:

   ```bash
   git push origin bugfix/fix-pdf-export
   ```

5. Open a Pull Request to `develop` (not `main`)

---

## Branch Naming Convention

Use descriptive branch names following these patterns:

### Bug Fixes

```
bugfix/issue-description
bugfix/pdf-export-overflow
bugfix/#123-login-redirect
```

### New Features

```
feature/feature-description
feature/email-notifications
feature/dark-mode
```

### Hotfixes (Critical production bugs)

```
hotfix/critical-issue
hotfix/security-jwt-validation
hotfix/#456-data-loss
```

### Documentation

```
docs/what-is-updated
docs/api-endpoints
docs/user-guide-expansion
```

### Refactoring

```
refactor/component-structure
refactor/api-routes
```

---

## Bug Fix Process

### 1. Report the Bug

- Check [KNOWN_ISSUES.md](KNOWN_ISSUES.md) first
- Open a GitHub Issue with:
  - Clear description
  - Steps to reproduce
  - Expected vs. actual behavior
  - Environment details (browser, OS, device)
  - Screenshots or error messages

### 2. Claim the Bug

- Comment on the issue: "I'd like to work on this"
- Wait for assignment or approval

### 3. Fix the Bug

- Create a branch from `develop`: `bugfix/#123-issue-description`
- Write tests that reproduce the bug (if applicable)
- Fix the issue
- Verify tests pass
- Update documentation if needed

### 4. Submit Pull Request

- Follow the PR template (see below)
- Reference the issue: "Fixes #123"
- Include before/after screenshots for UI changes

---

## Pull Request Process

### PR Title Format

```
<type>: <short description>

Examples:
fix: resolve PDF export overflow with long names
feat: add email notification system
docs: update API endpoint documentation
refactor: simplify resume generation logic
test: add unit tests for ATS scoring
```

### PR Description Template

```markdown
## Description

[Brief description of changes]

## Related Issue

Fixes #[issue number]

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Testing

### How Has This Been Tested?

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

### Test Configuration

- Browser(s): [e.g., Chrome 98, Firefox 96]
- OS: [e.g., Windows 11, macOS 13]
- Node version: [e.g., 18.19.0]

## Checklist

- [ ] My code follows the code style of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)

### Before

[Screenshot or description of old behavior]

### After

[Screenshot or description of new behavior]

## Additional Notes

[Any additional information that reviewers should know]
```

---

## Testing Requirements

### Before Submitting a PR

1. **Run all tests:**

   ```bash
   # Backend tests
   cd resume-builder/backend
   npm test

   # Frontend E2E tests
   cd resume-builder/frontend
   npm test
   ```

2. **Ensure no errors:**
   - All tests must pass
   - No TypeScript errors
   - No linting errors

3. **Test manually:**
   - Test the specific bug fix or feature
   - Test related functionality
   - Test on multiple browsers (if UI change)

### Writing Tests

- **Bug fixes:** Add a test that reproduces the bug and verifies the fix
- **New features:** Add unit tests and E2E tests as appropriate
- **Maintain coverage:** Don't decrease test coverage

---

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Use enums for constants

### Code Formatting

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Max line length: 100 characters

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use meaningful component and variable names
- Extract reusable logic into custom hooks

### Backend Code

- Use async/await (avoid callbacks)
- Handle errors properly
- Add appropriate logging
- Validate all inputs
- Use Prisma for database queries

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Updating build tasks, package manager configs, etc.

**Examples:**

```
fix(pdf): resolve overflow with long names

The PDF export was cutting off long names due to
insufficient width allocation.

Fixes #123
```

```
feat(ai): add support for Gemini 1.5 Pro model

Added Gemini 1.5 Pro as a new AI model option with
enhanced context window for better resume generation.

Closes #234
```

---

## Review Process

### What Reviewers Look For

- **Correctness:** Does it solve the problem?
- **Testing:** Are there appropriate tests?
- **Code Quality:** Is it readable and maintainable?
- **Performance:** Does it introduce performance issues?
- **Security:** Are there security concerns?
- **Documentation:** Is it properly documented?

### Responding to Feedback

- Be respectful and professional
- Address all comments
- Ask for clarification if needed
- Make requested changes or explain why you disagree
- Re-request review after making changes

---

## Release Process

### Version Numbering (Semantic Versioning)

- **Major (v2.0.0):** Breaking changes
- **Minor (v1.1.0):** New features, backward compatible
- **Patch (v1.0.1):** Bug fixes, backward compatible

### Release Cycle

1. **Bug fixes accumulate in `develop`**
2. **When ready for release:**
   - PR from `develop` to `main`
   - Tag the release (e.g., `v1.1.0`)
   - Update CHANGELOG.md
   - Deploy to production

3. **Hotfixes (critical bugs in production):**
   - Branch from `main` with `hotfix/` prefix
   - Fix and test
   - PR to both `main` and `develop`
   - Tag as patch version (e.g., `v1.0.1`)

---

## Documentation

### Update Documentation When:

- Adding new features
- Changing API endpoints
- Modifying environment variables
- Changing deployment process
- Fixing bugs that affect usage

### Documentation Files to Update:

- [README.md](README.md) - Overview and quick start
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [KNOWN_ISSUES.md](KNOWN_ISSUES.md) - Known bugs
- [docs/USER_GUIDE.md](docs/USER_GUIDE.md) - End-user documentation
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Common problems

---

## Questions?

- Check the [User Guide](docs/USER_GUIDE.md)
- Check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- Search [GitHub Issues](https://github.com/voidomin/Resume-Forge/issues)
- Open a new issue with the `question` label

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to SmartResume Builder!** 🎯

Every bug fix and improvement helps job seekers create better resumes. Your work matters! 🚀
