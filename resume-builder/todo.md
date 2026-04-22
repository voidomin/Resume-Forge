# Project TODO List & Roadmap

Based on the `app-improvements.md` roadmap, the recent completion of the AI schema backend (DOCX/PDF) audit, and the current state of the repository, here is the prioritized list of outstanding tasks to achieve the V1.2.0 performance and polish goals.

## Current Status Snapshot

- **Implemented and verified:** lazy loading, bundle reduction, API caching, database query optimization, skeleton loading states, error boundaries, feedback loops, mobile layout fixes, root documentation, env templates, and CI/CD.
- **Implemented in this pass:** frontend ESLint setup and Husky/lint-staged pre-commit automation.
- **Validation completed in this pass:** frontend build (`tsc && vite build`), backend build (`tsc`), backend tests (`jest --coverage`), and targeted static-analysis warning fixes in ATS checker, resume generation/view, and shared preview components.
- **Still pending:** improve Lighthouse performance score to > 90 (baseline run completed at 72).
- **Product-quality follow-up:** the resume generation workflow is functional, but the default output should remain conservative and recruiter-first, with stronger emphasis on quantified achievements and clearer section ordering.

## Suggested Execution Order

1. Lighthouse baseline audit
2. Frontend ESLint setup
3. Husky and lint-staged pre-commit hooks
4. Resume workflow quality refinements

This order keeps the highest-impact validation work first, then moves into repository hygiene, then into product-quality refinements that can be completed after the tooling baseline is stable.

## Priority 1: Performance Optimization (Target: < 1.5s Load, < 150ms API)

### Frontend Performance

- [x] **Implement Component Lazy Loading**: Dynamically import heavy React components (like the PDF previewer and specific template renderers) to reduce the initial JavaScript payload.
- [x] **Bundle Size Reduction**: Analyze and optimize dependencies.
- [x] **Lighthouse Audit (Baseline Run)**: Baseline audit executed and saved to `resume-builder/lighthouse-baseline.json` (Performance: 72, Accessibility: 81, Best Practices: 100, SEO: 91).
- [ ] **Lighthouse Performance Target**: Improve performance score from 72 to > 90.

### Backend & Database Optimization

- [x] **API Caching**: Implement caching logic on heavily accessed backend endpoints (e.g., fetching templates or user profiles) to drop response times below 150ms.
- [x] **Database Query Optimization**: Review Prisma queries in `backend/src/routes` and `backend/src/services` to ensure efficient indexing and retrieval.

## Priority 2: UX Polish & Reliability (Visual Upgrades)

- [x] **Graceful Loading States**: Implement widespread use of the `SkeletonLoader.tsx` across the app so users don't see empty screens while data fetches.
- [x] **Hero Section Visceral Appeal**: Upgrade the landing page/Hero section with subtle gradients, modern micro-animations, or glassmorphism effects for a premium feel.
- [x] **Error Boundaries**: Wrap major feature components in React Error Boundaries to prevent full white-screen crashes on isolated component errors.
- [x] **Feedback Loops**: Ensure every user action (saving, generating, downloading) has a clear success toast or spinner mechanism.

## Priority 3: Mobile Responsiveness

- [x] **Audit Mobile Layouts**: Check the Resume Builder and Landing Page on mobile viewport sizes to fix any horizontal overflow issues or layout shifts.
- [x] **Touch Targets**: Ensure all buttons and interactive elements meet modern mobile UI standards (minimum 44x44px touch targets).

---

## Pre-Launch / Pre-Merge Checklist

While the UX and Performance tasks are nearly complete, the repository is missing several structural elements critical for a stable `main` branch:

- [x] **Root Documentation**: Create a comprehensive `README.md` in the root directory detailing the tech stack, architecture, and local development setup instructions.
- [x] **Environment Templates**: Create `.env.example` files in both the frontend and backend to document required secrets (e.g., Gemini API keys, Database URLs, JWT secrets) without leaking actual keys.
- [x] **Frontend Linting Setup**: Installed and configured ESLint in frontend with `lint` and `lint:fix` scripts.
- [x] **Pre-commit Hooks (Husky)**: Husky + lint-staged + Prettier configured in frontend; pre-commit hook runs `npx lint-staged`.
- [x] **CI/CD Pipeline**: Created GitHub Actions workflow (`.github/workflows/test-and-deploy.yml`) to automatically build and run tests (Jest & Playwright).
- [ ] **Lighthouse Final Gate (>90)**: Re-run Lighthouse after performance fixes and verify score > 90.

## Resume Workflow Quality Improvements

These items are not new features. They are refinements to make the current resume builder feel more professional and closer to common industry expectations.

- [x] **Keep the default output conservative**: Default template switched to **Standard** in generation, preview, and view flows.
- [x] **Strengthen quantified achievements**: Existing Gemini generation prompt already enforces XYZ-style bullets, metric emphasis, and concrete outcomes.
- [ ] **Make section order role-aware**: Adjust resume section priority by role type when it improves readability and relevance.
- [x] **Clarify ATS scoring language**: Docs updated to position ATS score as guidance rather than guarantee.
- [x] **Add import review safeguards**: Import flow includes parsed-data review state, explicit confirmation step, and overwrite warning.
- [ ] **Align docs with behavior**: Keep the user guide and README synchronized with the actual app flow and supported features.
