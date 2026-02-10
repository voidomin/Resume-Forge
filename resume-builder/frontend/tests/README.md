# E2E Test Suite - Simple & Working

This test suite uses simple, inline tests without complex helpers or fixtures to ensure reliability and maintainability.

## Test Files

### 1. `basic-auth.spec.ts` - Authentication Tests (4 tests)
Basic authentication flow tests:
- ✅ Register a new user successfully
- ✅ Login with existing credentials
- ✅ Show validation error for invalid email
- ✅ Show error for duplicate email registration

**Approach:** Simple inline tests, no helpers. Tests register/login flow and validation.

### 2. `basic-profile.spec.ts` - Profile Management Tests (3 tests)
Basic profile editing and navigation:
- ✅ Update personal info and persist after reload
- ✅ Navigate between profile tabs (Personal Info, Experience, Education, Skills)
- ✅ Display upload/import/export resume buttons

**Approach:** No complex helpers. Tests personal info section only, tab navigation, and UI elements.

### 3. `basic-resume.spec.ts` - Resume Generation Tests (5 tests)
Simple resume generation flow:
- ✅ Navigate to resume generation page
- ✅ Generate resume and show result page
- ✅ Show download buttons after generation
- ✅ Show template selector
- ✅ Handle AI generation fallback gracefully

**Approach:** Tests basic generation flow without validating content. Focuses on page state and UI rendering.

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test basic-auth.spec.ts

# Run in UI mode (interactive)
npm test -- --ui

# Show report from last run
npx playwright show-report
```

## Key Design Decisions

### 1. No Fixtures/Helpers Initially
- Each test is self-contained
- No shared setup complexity
- Easy to debug failures
- Clear test intent

### 2. Inline Test Data
- Test users generated with unique emails per test
- Password validation handled within tests
- No database initialization needed

### 3. Lenient Assertions
- Tests verify presence of page sections, not exact content
- Focus on happy path and basic validation
- Timeouts are generous (10-30 seconds)
- Resume generation tests just verify rendering, not content validation

### 4. Browser Coverage
Playwright runs tests on:
- **Chromium** (primary)
- **Firefox** (secondary)
- **WebKit** (secondary)

## Test Execution Flow

1. **Register Test User**
   - Generate unique email: `test-{timestamp}-{random}@example.com`
   - Password: `TestPassword123!`
   - Confirm password for registration

2. **Navigate & Interact**
   - Direct Playwright selectors (ID, role, locator)
   - Wait for elements to be visible before interacting
   - Network idle state after navigation

3. **Verify State**
   - URL changes (register → profile/dashboard)
   - Element visibility
   - Data persistence after reload

4. **Teardown**
   - Automatic via Playwright (no manual cleanup)

## Common Issues & Fixes

### Issue: "Button not found" timeout
**Solution:** Use `getByRole()` or `getByText()` instead of `has-text()` for more reliable selectors.

### Issue: Multiple elements matched (strict mode)
**Solution:** Use `.first()` to select first matching element.

### Issue: Generate button disabled
**Solution:** Wait 500ms after filling textarea for button state to update, then check `.toBeEnabled()`.

### Issue: Data not persisting
**Solution:** Wait for network idle after reload, then wait additional 2000ms for profile data API fetch.

## Selector Reference

### Registration Form
```typescript
await page.fill('input#email', email);
await page.fill('input#password', password);
await page.fill('input#confirmPassword', password);
await page.click('button[type="submit"]');
```

### Profile Navigation
```typescript
const personalTab = page.getByRole("button", { name: "Personal Info" }).first();
const experienceTab = page.getByRole("button", { name: "Experience" }).first();
const educationTab = page.getByRole("button", { name: "Education" }).first();
const skillsTab = page.getByRole("button", { name: "Skills" }).first();
```

### Resume Generation
```typescript
const jobDescInput = page.locator('textarea').first();
const generateButton = page.locator('button[type="submit"]').first();
```

## Next Steps if Needed

### Add Helper Functions (When Patterns Emerge)
Once you have common patterns, extract them into helper files:
```typescript
// tests/helpers/auth.ts
export async function registerUser(page, email, password) { ... }

// tests/helpers/profile.ts
export async function updatePersonalInfo(page, data) { ... }
```

### Add Database Fixtures (If Needed)
For more complex testing:
- Create test users in database
- Setup profile data programmatically
- Reset database between tests

### Add Visual Regression Testing
- Snapshot tests for UI changes
- Template rendering validation
- Resume PDF content verification

## Test Statistics

- **Total Tests:** 12
- **Total Test Files:** 3
- **Browsers:** Chromium, Firefox, WebKit
- **Estimated Runtime:** 10-15 minutes
- **Pass Rate Goal:** 100%

## Environment

- **Playwright Version:** 1.58.2
- **Browser:** Headless (Chrome, Firefox, Safari)
- **Base URL:** http://localhost:5173
- **Timeout:** 180 seconds per test
- **State:** With `--headed` flag shows browser UI

```typescript
import { test, expect } from "./fixtures/auth.fixtures";

test("my test", async ({ authenticatedPage, testUser }) => {
  // `authenticatedPage` is already logged in with a registered user
  // `testUser` contains the user credentials
});
```

#### **profile.helpers.ts** - Profile Management

Functions for managing user profiles:

```typescript
// Navigate to profile tabs
await navigateToProfileTab(page, "experience");
await navigateToProfileTab(page, "education");
await navigateToProfileTab(page, "skills");

// Add work experience
await addExperience(page, {
  company: "Tech Corp",
  position: "Senior Engineer",
  startDate: "2020-01",
  endDate: "2024-01",
  currentlyWorking: false,
  bullets: ["Led team of 5 developers", "Built React applications"]
});

// Save experiences
await saveExperiences(page);

// Add education
await addEducation(page, {
  institution: "MIT",
  degree: "BS Computer Science",
  fieldOfStudy: "Computer Science",
  startDate: "2016-09",
  endDate: "2020-05",
  grade: "4.0 GPA"
});
await saveEducation(page);

// Add skills
await addSkills(page, [
  { name: "React", category: "Frontend" },
  { name: "Node.js", category: "Backend" }
]);
await saveSkills(page);

// Create complete profile in one call
await createCompleteProfile(page, {
  experiences: [...],
  education: [...],
  skills: [...]
});
```

#### **resume.helpers.ts** - Resume Operations

Resume generation and management utilities:

```typescript
// Generate AI-optimized resume
await generateResume(page, {
  jobDescription: "Full Stack Developer with React and Node.js...",
  targetRole: "Full Stack Developer",
  timeout: 120000, // 2 minutes
});

// Verify resume content
await verifyResumeContent(page, {
  hasEducation: true,
  hasExperience: true,
  hasSkills: true,
  hasProjects: false,
});

// Download resume files
const pdfFilename = await downloadResumePDF(page);
const docxFilename = await downloadResumeDOCX(page);

// Check AI generation status
const aiStatus = await checkAIStatus(page);
console.log(aiStatus.isAIGenerated); // true or false
console.log(aiStatus.failureReason); // "quota_exceeded" or "all_models_failed"

// Select template
await selectTemplate(page, "modern"); // or "executive", "minimalist"

// Verify resume in dashboard
await verifyResumeInDashboard(page, "My Resume");
```

## Prerequisites

Before running E2E tests, ensure you have:

1. **Backend API running** on `http://localhost:3000`
2. **Frontend dev server running** on `http://localhost:5173`
3. **Playwright browsers installed**
4. **Gemini API key** set in backend `.env` (for AI resume generation)

## Setup

### 1. Install Playwright Browsers (First Time Only)

```bash
cd resume-builder/frontend
npx playwright install
```

This will download Chrome, Firefox, and Safari browsers for testing.

### 2. Start Backend API

**Terminal 1:**

```bash
cd resume-builder/backend
npm install
npm run dev
# Backend should be running on http://localhost:3000
```

Or using Docker:

```bash
cd "cv maker"
docker-compose up
# Backend API on http://localhost:3000
# PostgreSQL on http://localhost:5432
```

### 3. Start Frontend Dev Server

**Terminal 2:**

```bash
cd resume-builder/frontend
npm install
npm run dev
# Frontend should be running on http://localhost:5173
```

## Running Tests

### Run All Tests (Headless)

```bash
npm test
```

### Run Tests with UI Mode (Recommended for Debugging)

```bash
npm run test:ui
```

This opens an interactive UI where you can:

- See tests run in real-time
- Inspect each step
- Time travel through test execution
- View screenshots and traces

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:headed
```

### Debug Tests

```bash
npm run test:debug
```

This opens Playwright Inspector for step-by-step debugging.

### Run Specific Test File

```bash
npx playwright test auth.spec.ts
npx playwright test resume-flow.spec.ts
npx playwright test advanced-flows.spec.ts
```

## Test Suites

### 1. Authentication Tests (`auth.spec.ts`) - 7 Tests

Tests user registration and login flows:

- ✅ Register with valid credentials
- ✅ Show validation error for duplicate email
- ✅ Show error for invalid login credentials
- ✅ Allow registered user to login (register → logout → login)
- ✅ Show validation error for weak password
- ✅ Show error when passwords don't match
- ✅ Redirect to login from protected route when not authenticated

**Estimated time:** ~45 seconds

**Key Features:**

- Uses `generateTestUser()` for unique test data
- Tests edge cases and validation
- Verifies protected route behavior

### 2. Resume Flow Tests (`resume-flow.spec.ts`) - 8 Tests

Tests core resume creation functionality:

- ✅ Generate AI-optimized resume from job description
- ✅ Allow downloading resume as PDF
- ✅ Allow downloading resume as DOCX
- ✅ Save generated resume to dashboard
- ✅ Generate multiple resumes for different roles
- ✅ Handle AI quota exhaustion gracefully
- ✅ Display ATS score and keyword analysis
- ✅ Allow editing resume after generation

**Estimated time:** ~10-15 minutes (AI generation takes time)

**Key Features:**

- Uses `authenticatedPage` fixture to skip manual registration
- Tests AI vs fallback mode handling
- Comprehensive file download verification
- Multi-resume workflows

### 3. Advanced Flow Tests (`advanced-flows.spec.ts`) - 9 Tests

Tests complex application workflows:

- ✅ Create complete profile with all sections
- ✅ Manage multiple experiences with add/edit/save flow
- ✅ Generate tailored resumes for different job roles
- ✅ Support full dashboard workflow (create, view, navigate)
- ✅ Allow adding education and skills to profile
- ✅ Display resume import modal
- ✅ Handle concurrent profile updates across tabs
- ✅ Generate resume and check AI status indicators
- ✅ Verify resume content persists after navigation

**Estimated time:** ~15-20 minutes

**Key Features:**

- Uses `createCompleteProfile()` for comprehensive profile setup
- Tests multi-step workflows
- Verifies data persistence
- AI status detection and verification

## Troubleshooting

### Error: "page.goto: net::ERR_CONNECTION_REFUSED"

**Problem:** Frontend dev server is not running.

**Solution:**

```bash
cd resume-builder/frontend
npm run dev
```

### Error: "Request failed with status code 404"

**Problem:** Backend API is not running.

**Solution:**

```bash
cd resume-builder/backend
npm run dev
```

Or:

```bash
docker-compose up
```

### Error: "Timeout 180000ms exceeded"

**Problem:** AI resume generation is taking too long or Gemini API key is missing.

**Solution:**

1. Check that `GEMINI_API_KEY` is set in backend `.env`
2. Wait for AI generation (can take up to 2 minutes)
3. Check backend logs for Gemini API errors:
   ```bash
   docker logs cv-maker-backend-1
   ```
4. Verify AI status with fallback detection
5. Free tier quota: 15 requests per minute, 1,500 per day

### Tests are flaky or failing randomly

**Solutions:**

1. Ensure both frontend and backend are running
2. Clear browser cache:
   ```bash
   npx playwright clean
   ```
3. Run tests one at a time:
   ```bash
   npx playwright test auth.spec.ts
   ```
4. Check backend database is accessible
5. Increase timeout for slow AI operations

### "chromium/firefox/webkit" not found

**Problem:** Playwright browsers not installed.

**Solution:**

```bash
npx playwright install
```

### AI Quota Exceeded Errors

**Problem:** Free tier Gemini API quota exhausted (15 RPM / 1,500 RPD).

**Solution:**

1. Tests should still pass (uses fallback mode)
2. Check AI status in test output:
   ```
   AI Status: ⚠️ Fallback Mode
   Failure Reason: quota_exceeded
   ```
3. Wait for quota reset (resets at midnight PT)
4. Consider upgrading to paid API key for production

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

This shows:

- ✅ Test results with pass/fail status
- 📸 Screenshots of failures
- 🎬 Video recordings (if enabled)
- 📊 Traces for step-by-step debugging
- ⏱️ Execution time for each test

## CI/CD Integration

Tests are configured to run in CI with:

- Retries: 2 attempts on failure
- Single worker (sequential execution)
- HTML reporter for artifacts
- Automatic screenshot capture on failure

See `.github/workflows/test-and-deploy.yml` for CI configuration.

## Writing New Tests

### Using the Fixture System

```typescript
import { test, expect } from "./fixtures/auth.fixtures";
import { generateResume } from "./helpers/resume.helpers";

test.describe("My Feature Tests", () => {
  test("should test authenticated feature", async ({
    authenticatedPage,
    testUser,
  }) => {
    // Already authenticated, no need for manual login
    const page = authenticatedPage;

    // Use helpers for common operations
    await generateResume(page, {
      jobDescription: "Software Engineer role...",
      timeout: 120000,
    });

    // Add your assertions
    await expect(page.locator("text=Resume")).toBeVisible();
  });
});
```

### Writing Tests Without Fixtures

```typescript
import { test, expect } from "@playwright/test";
import {
  generateTestUser,
  registerUser,
  loginUser,
} from "./fixtures/auth.fixtures";

test("manual auth flow", async ({ page }) => {
  const testUser = generateTestUser("manual");
  await registerUser(page, testUser);

  // Test your feature
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/dashboard/);
});
```

### Best Practices

1. **Use fixtures for authenticated tests:**

   ```typescript
   test("...", async ({ authenticatedPage }) => {
     // Pre-authenticated context
   });
   ```

2. **Use helpers for common operations:**

   ```typescript
   // Good - reusable and maintainable
   await addExperience(page, experienceData);

   // Avoid - repetitive and verbose
   await page.click('button:has-text("Add Experience")');
   await page.fill('input[placeholder="Company"]', "Tech Corp");
   // ... 10 more lines
   ```

3. **Wait for load states:**

   ```typescript
   await page.waitForLoadState("networkidle");
   ```

4. **Use explicit waits:**

   ```typescript
   await page.waitForSelector("#element", { state: "visible", timeout: 10000 });
   ```

5. **Generate unique test data:**

   ```typescript
   const testUser = generateTestUser("prefix"); // Includes timestamp
   ```

6. **Handle async AI operations:**

   ```typescript
   await generateResume(page, {
     jobDescription: "...",
     timeout: 120000, // 2 minutes for AI
   });
   ```

7. **Check AI status:**

   ```typescript
   const aiStatus = await checkAIStatus(page);
   if (!aiStatus.isAIGenerated) {
     console.log(`Fallback used: ${aiStatus.failureReason}`);
   }
   ```

8. **Prefer user-facing selectors:**

   ```typescript
   // Good
   await page.getByPlaceholder("Email");
   await page.getByRole("button", { name: "Submit" });

   // Avoid
   await page.click(".btn-submit");
   ```

## Performance Tips

- **Run tests in parallel** when possible (configured in `playwright.config.ts`)
- **Use `test.only()`** to run specific tests during development:
  ```typescript
  test.only("my test", async ({ page }) => {
    /* ... */
  });
  ```
- **Skip slow tests** with `test.skip()` if not needed:
  ```typescript
  test.skip("expensive AI test", async ({ page }) => {
    /* ... */
  });
  ```
- **Group related tests** in describe blocks for better organization
- **Use authenticatedPage fixture** to skip repetitive registration/login

## Debugging Failed Tests

### 1. Run in UI Mode

```bash
npm run test:ui
```

Provides interactive debugging with step-by-step execution.

### 2. Run in Debug Mode

```bash
npm run test:debug
```

Opens Playwright Inspector for detailed inspection.

### 3. Check Console Logs

Helper functions include console.log statements for tracking:

- "Registering user with email: ..."
- "AI Status: ✅ AI Generated" or "⚠️ Fallback Mode"
- "Resume content verified successfully ✅"

### 4. Use Traces

```bash
npx playwright show-trace trace.zip
```

Provides timeline, network activity, console logs, and DOM snapshots.

## Helper Function Reference

### Authentication (auth.fixtures.ts)

| Function                                  | Parameters              | Returns                                    | Description                       |
| ----------------------------------------- | ----------------------- | ------------------------------------------ | --------------------------------- |
| `generateTestUser(prefix)`                | `prefix: string`        | `{ email, password, firstName, lastName }` | Generates unique test credentials |
| `registerUser(page, credentials)`         | `page, credentials`     | `Promise<void>`                            | Registers a new user              |
| `loginUser(page, credentials)`            | `page, credentials`     | `Promise<void>`                            | Logs in existing user             |
| `setupBasicProfile(page, email, options)` | `page, email, options?` | `Promise<void>`                            | Sets up basic profile info        |

### Profile Management (profile.helpers.ts)

| Function                            | Parameters                                                                       | Returns         | Description                      |
| ----------------------------------- | -------------------------------------------------------------------------------- | --------------- | -------------------------------- |
| `navigateToProfileTab(page, tab)`   | `page, tab: "personal" \| "experience" \| "education" \| "skills" \| "projects"` | `Promise<void>` | Navigate to specific profile tab |
| `addExperience(page, experience)`   | `page, ExperienceData`                                                           | `Promise<void>` | Add work experience              |
| `saveExperiences(page)`             | `page`                                                                           | `Promise<void>` | Save all experiences             |
| `addEducation(page, education)`     | `page, EducationData`                                                            | `Promise<void>` | Add education entry              |
| `saveEducation(page)`               | `page`                                                                           | `Promise<void>` | Save all education               |
| `addSkills(page, skills)`           | `page, SkillData[]`                                                              | `Promise<void>` | Add multiple skills              |
| `saveSkills(page)`                  | `page`                                                                           | `Promise<void>` | Save skills                      |
| `createCompleteProfile(page, data)` | `page, { experiences, education, skills }`                                       | `Promise<void>` | Create full profile in one call  |

### Resume Operations (resume.helpers.ts)

| Function                                    | Parameters                                                          | Returns                                                       | Description                        |
| ------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------- |
| `generateResume(page, options)`             | `page, { jobDescription, targetRole?, timeout? }`                   | `Promise<void>`                                               | Generate AI resume                 |
| `verifyResumeContent(page, options?)`       | `page, { hasEducation?, hasExperience?, hasSkills?, hasProjects? }` | `Promise<void>`                                               | Verify resume sections             |
| `downloadResumePDF(page)`                   | `page`                                                              | `Promise<string>`                                             | Download PDF, returns filename     |
| `downloadResumeDOCX(page)`                  | `page`                                                              | `Promise<string>`                                             | Download DOCX, returns filename    |
| `checkAIStatus(page)`                       | `page`                                                              | `Promise<{ isAIGenerated: boolean, failureReason?: string }>` | Check if AI or fallback was used   |
| `selectTemplate(page, template)`            | `page, "modern" \| "executive" \| "minimalist"`                     | `Promise<void>`                                               | Select resume template             |
| `verifyResumeInDashboard(page, resumeName)` | `page, resumeName: string`                                          | `Promise<void>`                                               | Verify resume appears in dashboard |

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Fixtures Guide](https://playwright.dev/docs/test-fixtures)
- [Test Reporters](https://playwright.dev/docs/test-reporters)

## Contributing

When adding new tests:

1. Use existing fixtures and helpers when possible
2. Add new helpers to appropriate files if reusable
3. Follow the established naming conventions
4. Add JSDoc comments for new helper functions
5. Update this README with new helpers or test suites
6. Ensure tests are idempotent and don't depend on execution order

## Test Coverage Summary

- **Total Tests:** 24 tests
- **Test Files:** 3 files
- **Helper Modules:** 3 modules
- **Fixtures:** Authentication fixture with `authenticatedPage` and `testUser`
- **Estimated Total Runtime:** ~25-35 minutes (includes AI generation delays)

✅ **All tests use modern fixtures and helper patterns for maintainability and reusability.**
