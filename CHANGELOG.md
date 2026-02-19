# Changelog

All notable changes to the SmartResume Builder project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Tracking for user feedback and bug reports from v1.0.0 deployment
- Comprehensive testing guides (TESTING_GUIDE.md, TESTING_SUMMARY.md)
- Unified design system (`resume-builder/shared/design-system.ts`)
- Unit conversion utilities (`resume-builder/shared/unit-converters.ts`)

### Changed

- Updated all 4 PDF renderers to use UnifiedDesignSystem
- Updated DOCX service to use UnifiedDesignSystem
- Updated all 4 frontend templates to use UnifiedDesignSystem (Standard, Executive, Minimalist, Modern)
- Improved spacing calculations in PDF generation
- Achieved 100% visual consistency across preview, PDF, and DOCX for all templates

### Fixed

- **[CRITICAL]** Fixed regenerate button using wrong job description (#REGENERATE-JD-BUG-001)
  - Backend now preserves original job description instead of overwriting it
  - Frontend properly resets state when navigating between resumes
  - Added state validation guards to prevent mismatches
  - Prevents data corruption and ensures regeneration uses correct job posting
- **[CRITICAL]** Fixed visual inconsistencies between preview, PDF, and DOCX formats (#TEMPLATE-CONSISTENCY-001)
  - All templates now render identically across all three output formats
  - Fonts now consistent (Helvetica/Arial) across all formats
  - Spacing calculations now accurate using proper point-to-line-height conversion
  - Applied fix to all 4 templates: Modern, Standard, Executive, Minimalist

### Security

---

## [1.0.0] - 2026-02-14

### Added

#### Core Features

- User authentication system (register, login, logout) with JWT
- Master profile management (experiences, education, skills)
- AI-powered resume generation using Gemini 3 Flash with multi-tier fallback system
- 4 professional resume templates (Modern, Standard, Executive, Minimalist)
- PDF export via browser print-to-PDF functionality
- DOCX export with structured document generation
- ATS scoring and validation engine
- Keyword extraction and analysis
- One-page A4 constraint with real-time scaling
- AI model transparency (displays which model was used)
- Profile import/export functionality
- Resume versioning and management
- Responsive design (mobile, tablet, desktop)
- Real-time resume preview
- Toast notifications and loading states

#### Testing & Quality

- Backend unit tests (37/37 passing)
  - Authentication tests (12 tests)
  - Profile management tests (13 tests)
  - Resume generation tests (8 tests)
  - Utility function tests (4 tests)
- End-to-end tests with Playwright
  - Authentication flows
  - Resume generation workflow
  - PDF/DOCX download verification
  - Profile management
  - Advanced workflows
- Jest testing framework with TypeScript support
- Test fixtures and setup configurations
- Code coverage reporting

#### Infrastructure & DevOps

- Docker multi-stage build setup
- Docker Compose orchestration with PostgreSQL
- Health checks for all services
- Deployment automation scripts (PowerShell and Bash)
- Comprehensive deployment documentation
- Production-ready environment configuration

#### Security

- Password hashing with bcrypt
- JWT authentication with token expiration
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection (React)
- API rate limiting
- HTTPS enforcement (production)
- Security headers (CSP, X-Frame-Options)

#### Performance

- Frontend build optimization with Vite
- Bundle size optimization (378 kB gzipped)
- Lazy loading implementation
- Database query optimization
- Image optimization

#### Documentation

- Product Requirements Document (PRD)
- Technical Design Document
- Tech Stack documentation
- User Guide
- Deployment Guide
- Troubleshooting Guide
- Test Report v1.0
- Release Checklist v1.0

### Changed

- N/A (Initial release)

### Deprecated

- N/A (Initial release)

### Removed

- N/A (Initial release)

### Fixed

- N/A (Initial release)

### Security

- N/A (Initial release)

---

## [1.1.0] - TBD (Planned)

### Planned

- Bug fixes from user feedback
- Performance improvements based on production metrics
- Documentation updates based on user questions

---

[Unreleased]: https://github.com/voidomin/Resume-Forge/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/voidomin/Resume-Forge/releases/tag/v1.0.0
[1.1.0]: https://github.com/voidomin/Resume-Forge/compare/v1.0.0...develop
