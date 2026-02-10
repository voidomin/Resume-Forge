import { test, expect } from "@playwright/test";

/**
 * Basic Authentication Tests
 * Simple, inline tests without helpers or fixtures
 */

test.describe("Basic Authentication", () => {
  // Generate unique test user for each test
  const generateTestEmail = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `test-${timestamp}-${random}@example.com`;
  };

  test("should register a new user successfully", async ({ page }) => {
    // Generate test user credentials
    const email = generateTestEmail();
    const password = "TestPassword123!";

    // Navigate to register page
    await page.goto("http://localhost:5173/register");
    await page.waitForLoadState("networkidle");

    // Fill registration form (email, password, confirm password)
    await page.fill("input#email", email);
    await page.fill("input#password", password);
    await page.fill("input#confirmPassword", password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect after register (dashboard or profile)
    await expect(page).toHaveURL(/\/(dashboard|profile)/, { timeout: 30000 });

    // Verify user email is visible in navigation
    await expect(page.getByText(email)).toBeVisible({ timeout: 10000 });
  });

  test("should login with existing user", async ({ page }) => {
    // Generate test user credentials
    const email = generateTestEmail();
    const password = "TestPassword123!";

    // Step 1: Register user first
    await page.goto("http://localhost:5173/register");
    await page.waitForLoadState("networkidle");

    await page.fill("input#email", email);
    await page.fill("input#password", password);
    await page.fill("input#confirmPassword", password);
    await page.click('button[type="submit"]');

    // Wait for post-register redirect (dashboard or profile)
    await expect(page).toHaveURL(/\/(dashboard|profile)/, { timeout: 30000 });

    // Step 2: Logout
    const logoutButton = page.getByRole("button", { name: "Logout" });
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
    await logoutButton.click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Step 3: Login with same credentials
    await page.fill("input#email", email);
    await page.fill("input#password", password);
    await page.click('button[type="submit"]');

    // Verify successful login (dashboard or profile)
    await expect(page).toHaveURL(/\/(dashboard|profile)/, { timeout: 30000 });
    await expect(page.getByText(email)).toBeVisible({ timeout: 10000 });
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await page.goto("http://localhost:5173/register");
    await page.waitForLoadState("networkidle");

    // Fill form with invalid email
    await page.fill("input#email", "invalid-email");
    await page.fill("input#password", "TestPassword123!");
    await page.fill("input#confirmPassword", "TestPassword123!");

    // Try to submit
    await page.click('button[type="submit"]');

    // Should remain on register page (not redirect)
    await page.waitForTimeout(2000); // Wait a bit to see if redirect happens
    await expect(page).toHaveURL(/\/register/);
  });

  test("should show error for duplicate email registration", async ({
    page,
  }) => {
    const email = generateTestEmail();
    const password = "TestPassword123!";

    // Register first time
    await page.goto("http://localhost:5173/register");
    await page.waitForLoadState("networkidle");

    await page.fill("input#email", email);
    await page.fill("input#password", password);
    await page.fill("input#confirmPassword", password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(dashboard|profile)/, { timeout: 30000 });

    // Logout
    const logoutButton = page.getByRole("button", { name: "Logout" });
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
    await logoutButton.click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Try to register again with same email
    await page.goto("http://localhost:5173/register");
    await page.waitForLoadState("networkidle");

    await page.fill("input#email", email);
    await page.fill("input#password", password);
    await page.fill("input#confirmPassword", password);
    await page.click('button[type="submit"]');

    // Should show error or remain on register page
    await page.waitForTimeout(2000);
    // Either stays on register or shows error message
    const isOnRegister = page.url().includes("/register");
    const hasError = await page
      .getByText(/already exists|duplicate/i)
      .isVisible()
      .catch(() => false);

    expect(isOnRegister || hasError).toBeTruthy();
  });
});
