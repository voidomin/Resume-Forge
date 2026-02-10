# E2E Testing Guide

## Prerequisites

Before running E2E tests, ensure you have:

1. **Backend API running** on `http://localhost:3000`
2. **Frontend dev server running** on `http://localhost:5173`
3. **Playwright browsers installed**

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
cd cv\ maker/
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

## Test Suites

### 1. Authentication Tests (`auth.spec.ts`)

Tests user registration and login flows:
- ✅ User sign-up
- ✅ Login error handling

**Estimated time:** ~30 seconds

### 2. Resume Flow Tests (`resume-flow.spec.ts`)

Tests core resume creation functionality:
- ✅ User registration → profile creation
- ✅ Resume generation from job description
- ✅ PDF download

**Estimated time:** ~3-5 minutes (AI generation takes time)

### 3. Advanced Flow Tests (`advanced-flows.spec.ts`)

Tests complex application workflows:
- ✅ Managing experiences in profile
- ✅ Creating and viewing resumes
- ✅ Dashboard navigation

**Estimated time:** ~3-5 minutes

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
2. Increase timeout in `playwright.config.ts` if needed
3. Check backend logs for errors

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

### "chromium/firefox/webkit" not found

**Problem:** Playwright browsers not installed.

**Solution:**
```bash
npx playwright install
```

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

This shows:
- ✅ Test results
- 📸 Screenshots of failures
- 🎬 Video recordings (if enabled)
- 📊 Traces for debugging

## CI/CD Integration

Tests are configured to run in CI with:
- Retries: 2 attempts on failure
- Single worker (sequential execution)
- HTML reporter for artifacts

See `.github/workflows/test-and-deploy.yml` for CI configuration.

## Writing New Tests

### Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Register user, login, etc.
  });

  test("should do something", async ({ page }) => {
    // 1. Navigate
    await page.goto("/path");
    
    // 2. Interact
    await page.click('button:has-text("Click Me")');
    
    // 3. Assert
    await expect(page).toHaveURL(/expected-url/);
  });
});
```

### Best Practices

1. **Always wait for load states:**
   ```typescript
   await page.waitForLoadState("networkidle");
   ```

2. **Use explicit waits:**
   ```typescript
   await page.waitForSelector("#element", { state: "visible" });
   ```

3. **Use Promise.all for navigation:**
   ```typescript
   await Promise.all([
     page.waitForURL(/expected-url/),
     page.click('button'),
   ]);
   ```

4. **Prefer user-facing selectors:**
   ```typescript
   // Good
   await page.getByPlaceholder("Email");
   await page.getByRole("button", { name: "Submit" });
   
   // Avoid
   await page.click(".btn-submit");
   ```

5. **Clean up test data:**
   Each test uses unique email addresses with random IDs to avoid conflicts.

## Performance Tips

- Run tests in parallel when possible (configured in `playwright.config.ts`)
- Use `test.only()` to run specific tests during development
- Skip slow tests with `test.skip()` if not needed

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
