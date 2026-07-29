# Project TODO List & Roadmap

Based on the `app-improvements.md` roadmap, the recent completion of the AI schema backend (DOCX/PDF) audit, and the current state of the repository, here is the prioritized list of outstanding tasks to achieve the V1.2.0 performance and polish goals.

## Priority 1: Performance Optimization (Target: < 1.5s Load, < 150ms API)

### Frontend Performance

- [x] **Implement Component Lazy Loading**: Dynamically import heavy React components (like the PDF previewer and specific template renderers) to reduce the initial JavaScript payload.
- [x] **Bundle Size Reduction**: Analyze and optimize dependencies.
- [ ] **Lighthouse Audit**: Run a baseline Lighthouse test and ensure the performance score passes > 90.

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
- [ ] **Pre-commit Hooks (Husky)**: Set up Husky and lint-staged to automatically run formatters (Prettier) and linters before allowing a git commit.
- [x] **CI/CD Pipeline**: Created GitHub Actions workflow (`.github/workflows/test-and-deploy.yml`) to automatically build and run tests (Jest & Playwright).
- [x] **Frontend Linting Setup**: Installed ESLint 9 flat config (`eslint.config.js`) with typescript-eslint + react-hooks/react-refresh plugins; backend's `.eslintrc.json` was also missing entirely (lint script was broken) and has been added.
- [ ] **Lighthouse Baseline Audit**: Run the final Lighthouse test to ensure the performance score passes > 90 (carried over from Performance Optimization).
