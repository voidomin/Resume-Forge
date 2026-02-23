# SmartResume Builder v1.3 - Improvements & Cleanup Checklist

**Goal**: Code quality, refactoring, technical debt, and SonarQube compliance

---

## 📋 Summary by Category

| Category                     | Count  | Priority | Effort |
| ---------------------------- | ------ | -------- | ------ |
| **Code Quality & SonarQube** | 12     | High     | Medium |
| **Type Safety & TypeScript** | 8      | High     | Medium |
| **Error Handling**           | 6      | High     | Medium |
| **Performance**              | 7      | Medium   | High   |
| **Testing & Coverage**       | 5      | Medium   | Medium |
| **Documentation**            | 4      | Low      | Low    |
| **Security**                 | 5      | High     | Low    |
| **Refactoring**              | 8      | Medium   | High   |
| **Dependencies**             | 3      | Low      | Low    |
| **Git & CI/CD**              | 4      | Low      | Low    |
| **TOTAL**                    | **62** | -        | -      |

---

## 🎯 HIGH PRIORITY (Do First)

### Code Quality & SonarQube Issues

**[SQ-001]** Remove duplicate code in test files

- **Issue**: Multiple test files (`.js` and `.ts` versions both exist)
  - `tests/services/auth.test.js` + `auth.test.ts`
  - `tests/services/profile.test.js` + `profile.test.ts`
  - `tests/services/resume.test.js` + `resume.test.ts`
  - `tests/utils/helpers.test.js` + `helpers.test.ts`
- **Action**: Keep only `.ts` versions, delete `.js`
- **Impact**: ⬇️ Technical debt, 🟢 Easier maintenance
- **Effort**: 30 minutes

**[SQ-002]** Eliminate magic numbers in code

- **Issue**: Hardcoded values like `60`, `70`, `75` (optional section scores)
- **Files**: `gemini.service.ts`, template renderers
- **Action**: Extract to constants file `src/constants/thresholds.ts`
- **Example**:
  ```typescript
  const OPTIONAL_SECTION_THRESHOLDS = {
    coursework: 60,
    leadership: 70,
    awards: 75,
  };
  ```
- **Effort**: 1 hour

**[SQ-003]** Reduce cyclomatic complexity in large functions

- **Issue**: `gemini.service.ts` generateResume() method is too long/complex
- **Action**: Extract into smaller functions:
  - `buildSystemPrompt()`
  - `buildUserPrompt(profile, jd)`
  - `parseGeminiResponse(response)`
  - `calculateOptionalSectionScores(parsed)`
- **Impact**: 🟢 Easier testing, better readability
- **Effort**: 2-3 hours

**[SQ-004]** Remove unused code

- **Issue**: Unused imports, dead code branches
- **Files**: Check all services and components
- **Action**: Run ESLint with `eslint --format unix` and clean up
- **Effort**: 1 hour

**[SQ-005]** Fix cognitive complexity issues

- **Issue**: `pdf.service.ts` calculateOptimalScale() has nested conditionals
- **Action**: Extract into helper functions, use early returns
- **Effort**: 1-2 hours

### Type Safety & TypeScript

**[TS-001]** Remove `any` types in codebase

- **Files**: Search for `any` across backend
- **Action**: Replace with proper interfaces/types
- **Effort**: 1-2 hours

**[TS-002]** Fix implicit `any` parameters

- **Issue**: Found in template renderers: `(course, index) => ...`
- **Action**: Add explicit types: `(course: Coursework, index: number) => ...`
- **Effort**: 1 hour

**[TS-003]** Strict null checks in template components

- **Files**: All 4 resume templates
- **Issue**: Optional properties accessed without null checks
- **Action**: Add proper narrowing and null coalescing
- **Effort**: 1-2 hours

**[TS-004]** Create unified error types

- **Issue**: Error handling scattered across codebase
- **Action**: Create `src/types/errors.ts` with:
  ```typescript
  interface APIError {
    code: string;
    message: string;
    status: number;
  }
  ```
- **Effort**: 1 hour

### Error Handling

**[ERR-001]** Standardize error responses across API

- **Issue**: Inconsistent error format from different endpoints
- **Action**: Create `src/utils/errors.ts` with standard error handler
- **Effort**: 1-2 hours

**[ERR-002]** Add proper error logging throughout

- **Issue**: Many silent failures, missing error context
- **Files**: Services, routes
- **Action**: Add logger calls with context info
- **Effort**: 2 hours

**[ERR-003]** Handle edge cases in AI response parsing

- **Issue**: What if Gemini returns invalid JSON? Malformed response?
- **Action**: Add try-catch with fallback logic
- **Files**: `gemini.service.ts`
- **Effort**: 1 hour

**[ERR-004]** Database transaction error handling

- **Issue**: No rollback handling for multi-step operations
- **Action**: Implement proper transaction error handling in Prisma
- **Effort**: 1-2 hours

**[ERR-005]** Frontend error boundaries

- **Issue**: No React Error Boundaries
- **Action**: Add ErrorBoundary component
- **Effort**: 1 hour

**[ERR-006]** Handle network timeouts gracefully

- **Issue**: Long requests might timeout (resume generation)
- **Action**: Add timeout handling and retries
- **Effort**: 1-2 hours

---

## 🟡 MEDIUM PRIORITY (Important but can wait)

### Performance Optimizations

**[PERF-001]** Optimize PDF generation - caching

- **Issue**: Each PDF generation re-measures content (20-40ms overhead)
- **Action**: Cache measurement results for identical content
- **Effort**: 2-3 hours

**[PERF-002]** Database query optimization

- **Issue**: N+1 queries possible in profile fetch
- **Action**: Review all Prisma queries, add `include` optimization
- **Files**: `profile.routes.ts`, `resume.routes.ts`
- **Effort**: 1-2 hours

**[PERF-003]** Frontend code splitting - lazy load components

- **Issue**: All templates loaded upfront
- **Action**: Implement lazy loading for template previews
- **Effort**: 2 hours

**[PERF-004]** Debounce expensive operations

- **Issue**: Resume preview might re-render on every keystroke
- **Action**: Add debouncing to ResumeView updates
- **Effort**: 1 hour

**[PERF-005]** Implement API response caching

- **Issue**: Same profile fetched multiple times
- **Action**: Add Redis caching layer or HTTP caching headers
- **Effort**: 2-3 hours

**[PERF-006]** Optimize Gemini API calls

- **Issue**: Long prompts = higher latency
- **Action**: Trim whitespace, make prompts more concise
- **Effort**: 1 hour

**[PERF-007]** Bundle size analysis

- **Issue**: Frontend bundle size not actively monitored
- **Action**: Add bundle analyzer to build process
- **Effort**: 1 hour

### Testing & Coverage

**[TEST-001]** Increase backend test coverage

- **Issue**: Current coverage is 100% but only for `atsChecker.service.ts`
- **Action**: Add tests for other services:
  - `gemini.service.ts` (scoring, prompt generation)
  - `pdf.service.ts` (scaling algorithm)
  - `docx.service.ts` (export formatting)
- **Effort**: 3-4 hours

**[TEST-002]** Add integration tests

- **Issue**: Each unit test is isolated, no integration testing
- **Action**: Create integration test suite for full workflows
- **Effort**: 3-4 hours

**[TEST-003]** Frontend component testing

- **Issue**: Only E2E tests, no unit tests for React components
- **Action**: Add Jest tests for critical components
- **Effort**: 2-3 hours

**[TEST-004]** API contract testing

- **Issue**: No validation that backend matches frontend expectations
- **Action**: Add contract tests with Pact or similar
- **Effort**: 2 hours

**[TEST-005]** Performance testing

- **Issue**: No performance benchmarks
- **Action**: Implement performance tests (PDF generation time, API response time)
- **Effort**: 2 hours

### Documentation

**[DOC-001]** Add JSDoc comments to public functions

- **Issue**: Many functions lack documentation
- **Files**: All services in `src/services/`
- **Action**: Add JSDoc for all public methods
- **Effort**: 2-3 hours

**[DOC-002]** Create API endpoint reference

- **Issue**: Manual Swagger docs might be incomplete
- **Action**: Auto-generate from code using Swagger decorators
- **Effort**: 2 hours

**[DOC-003]** Add architecture diagrams

- **Issue**: High-level architecture not documented
- **Action**: Create diagrams showing:
  - Data flow frontend → backend → AI → PDF
  - Database schema with relationships
- **Effort**: 2 hours

**[DOC-004]** Create troubleshooting guide for developers

- **Issue**: Only user-facing docs exist
- **Action**: Add developer troubleshooting (setup issues, common problems)
- **Effort**: 1 hour

---

## 🟢 MEDIUM PRIORITY (Refactoring)

### Code Refactoring & Structure

**[REF-001]** Extract design system values to config

- **Issue**: Design values hardcoded in multiple places
- **Location**: `design-system.ts`, template files
- **Action**: Centralize all design tokens in one place
- **Effort**: 1-2 hours

**[REF-002]** Create service layer for API calls

- **Issue**: API calls mixed in components
- **Files**: Frontend pages
- **Action**: Extract into `src/api/service.ts`
- **Effort**: 1-2 hours

**[REF-003]** Consolidate duplicate template logic

- **Issue**: 4 templates have similar patterns
- **Action**: Extract common logic to `BaseTemplate` mixin
- **Effort**: 2-3 hours

**[REF-004]** Remove promise callback hell in async code

- **Issue**: Some functions use `.then().catch()` chains
- **Action**: Convert to async/await everywhere
- **Effort**: 1 hour

**[REF-005]** Standardize data transformation utilities

- **Issue**: Similar data transformations scattered across code
- **Action**: Create `src/utils/transformers.ts` with helpers
- **Effort**: 1-2 hours

**[REF-006]** Separate concerns in middleware

- **Issue**: `requestId.ts` middleware could be enhanced
- **Action**: Add more middleware: logging, error handling, validation
- **Effort**: 2 hours

**[REF-007]** Extract Gemini prompt building to separate file

- **Issue**: Gemini prompt is huge (~500+ lines)
- **Location**: `gemini.service.ts`
- **Action**: Move to `src/ai/prompts.ts`
- **Effort**: 1 hour

**[REF-008]** Create shared utilities between services

- **Issue**: Similar utilities in multiple files
- **Action**: Create `src/utils/helpers.ts` library
- **Effort**: 1-2 hours

---

## 🟢 LOW PRIORITY (Can do in future)

### Security

**[SEC-001]** Add helmet security headers

- **Status**: Already done ✅
- **Review**: Ensure all headers are optimal

**[SEC-002]** Implement CSRF protection

- **Issue**: POST/PUT endpoints might need CSRF tokens
- **Action**: Add CSRF middleware if not using SameSite cookies properly
- **Effort**: 1-2 hours

**[SEC-003]** Rate limiting per user

- **Issue**: Current rate limit might be global
- **Action**: Implement per-user rate limiting for API
- **Effort**: 1-2 hours

**[SEC-004]** Database encryption

- **Issue**: Database password protection in place, but data not encrypted
- **Action**: Evaluate need for field-level encryption
- **Effort**: Research + 2-3 hours if needed

**[SEC-005]** Audit logging

- **Issue**: No record of who did what
- **Action**: Add audit trail for data modifications
- **Effort**: 2-3 hours

### Dependencies

**[DEP-001]** Audit and update dependencies

- **Issue**: Some packages might be outdated
- **Action**: `npm audit`, update security patches
- **Effort**: 1 hour

**[DEP-002]** Remove unused dependencies

- **Issue**: Unused packages bloat bundle
- **Action**: Review `package.json`, remove unused
- **Effort**: 30 minutes

**[DEP-003]** Consolidate duplicate dependencies

- **Issue**: Similar packages might be duplicated
- **Action**: Check for `npm ls | grep duplicate`
- **Effort**: 30 minutes

### CI/CD & Git

**[CI-001]** Add pre-commit hooks

- **Issue**: No enforcement of code quality before commit
- **Action**: Add husky + lint-staged
- **Effort**: 1 hour

**[CI-002]** Require code review for main

- **Status**: Already done ✅

**[CI-003]** Add branch protection rules documentation

- **Status**: Already done ✅

**[CI-004]** Automated changelog generation

- **Issue**: CHANGELOG.md updated manually
- **Action**: Use git-cliff or similar to auto-generate
- **Effort**: 1-2 hours

---

## 🚀 Implementation Plan by Sprint

### Sprint 1 (v1.3.0 Foundation) - Week 1

Priority: Unblock other work

1. **[SQ-001]** Remove duplicate test files (30 min)
2. **[TS-001]** Remove `any` types (2 hours)
3. **[SQ-002]** Extract magic numbers to constants (1 hour)
4. **[ERR-001]** Standardize error responses (2 hours)
5. **[REF-001]** Centralize design system config (1.5 hours)

**Total**: 7 hours

### Sprint 2 (Code Quality Pass) - Week 2

Priority: Reduce SonarQube issues

1. **[SQ-003]** Reduce cyclomatic complexity in gemini.service.ts (3 hours)
2. **[SQ-005]** Fix cognitive complexity in pdf.service.ts (2 hours)
3. **[TS-002]** Fix implicit any parameters (1 hour)
4. **[SQ-004]** Remove unused code (1 hour)
5. **[REF-002]** Create API service layer (2 hours)

**Total**: 9 hours

### Sprint 3 (Error Handling & Types) - Week 3

Priority: Robustness

1. **[TS-003]** Add strict null checks (2 hours)
2. **[TS-004]** Create unified error types (1 hour)
3. **[ERR-002]** Add logging throughout (2 hours)
4. **[ERR-003]** Handle AI response parsing edge cases (1 hour)
5. **[ERR-004]** Database transaction error handling (2 hours)

**Total**: 8 hours

### Sprint 4 (Performance & Testing) - Week 4

Priority: User experience

1. **[PERF-001]** Optimize PDF generation caching (3 hours)
2. **[PERF-002]** Database query optimization (2 hours)
3. **[TEST-001]** Increase backend test coverage (3 hours)
4. **[PERF-003]** Frontend code splitting (2 hours)

**Total**: 10 hours

### Sprint 5 (Testing & Docs) - Week 5

Priority: Documentation & coverage

1. **[TEST-002]** Add integration tests (4 hours)
2. **[DOC-001]** Add JSDoc comments (2-3 hours)
3. **[DOC-002]** Create API reference (2 hours)
4. **[ERR-005]** Add React Error Boundaries (1 hour)

**Total**: 9-10 hours

---

## 📊 Effort Estimation Summary

| Priority   | Count  | Est. Hours | Timeline    |
| ---------- | ------ | ---------- | ----------- |
| **HIGH**   | 26     | 35-40      | Week 1-2    |
| **MEDIUM** | 25     | 35-40      | Week 2-4    |
| **LOW**    | 11     | 15-20      | Week 5+     |
| **TOTAL**  | **62** | **85-100** | **5 weeks** |

---

## ✅ Success Criteria for v1.3

- [ ] SonarQube issues reduced by 50%
- [ ] No `any` types in codebase
- [ ] All functions have JSDoc comments
- [ ] Error handling standardized across app
- [ ] Backend test coverage > 80%
- [ ] Zero critical security issues
- [ ] Performance tests added
- [ ] Documentation complete

---

## 🎯 Next Actions

1. **Create v1.3 milestone** on GitHub
2. **Prioritize by impact**: Start with SQ-001, SQ-002, TS-001
3. **Assign tasks**: Pick one from each category
4. **Create branches**: `refactor/sq-001-remove-duplicate-tests`
5. **Review & merge**: After each task, create PR for review

---

**Version**: 1.0  
**Created**: February 21, 2026  
**Status**: Ready for implementation
