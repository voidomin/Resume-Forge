import { test, expect } from "@playwright/test";
import {
  generateTestUser,
  registerUser,
  loginUser,
} from "./fixtures/auth.fixtures";

/**
 * Authentication Flow Tests
 *
 * Tests user registration, login, error handling, and session management.
 * Uses fixtures and helpers for clean, maintainable test code.
 */

test.describe("Authentication Flow", () => {
  test("should allow user to register with valid credentials", async ({
    page,
  }) => {
    const testUser = generateTestUser("register");

    await registerUser(page, testUser);

    // Verify successful registration - should be on profile page
    await expect(page).toHaveURL(/.*\/profile/);
    expect(page.url()).toContain("/profile");

    // Verify user is authenticated (check if logout button exists)
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible({ timeout: 5000 });
  });

  test("should show validation error for duplicate email", async ({ page }) => {
    const testUser = generateTestUser("duplicate");

    // Register first time
    await registerUser(page, testUser);

    // Try to register again with same email
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.locator("#email").fill(testUser.email);
    await page.locator("#password").fill(testUser.password);
    await page.locator("#confirmPassword").fill(testUser.password);
    await page.locator('button[type="submit"]').click();

    // Should show error message
    const errorMessage = page.locator(".bg-red-50, .text-red-600");
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
    await expect(errorMessage.first()).toContainText(
      /already exists|duplicate|registered/i,
    );
  });

  test("should show error for invalid login credentials", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#email")).toBeVisible({ timeout: 10000 });

    // Try to login with invalid credentials
    await page.locator("#email").fill("nonexistent@example.com");
    await page.locator("#password").fill("WrongPassword123!");
    await page.locator('button[type="submit"]').click();

    // Wait for error message
    const errorMessage = page.locator(".bg-red-50");
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    await expect(errorMessage).toContainText(/Invalid|failed|incorrect/i);
  });

  test("should allow registered user to login", async ({ page }) => {
    const testUser = generateTestUser("login");

    // Register first
    await registerUser(page, testUser);

    // Logout
    const logoutButton = page.locator('button:has-text("Logout")');
    await logoutButton.click();
    await page.waitForURL(/.*\/(login|$)/, { timeout: 10000 });

    // Login again
    await loginUser(page, testUser);

    // Verify successful login - should be on dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test("should show validation error for weak password", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    const email = `weak-${Math.random().toString(36).substring(7)}@example.com`;

    await page.locator("#email").fill(email);
    await page.locator("#password").fill("weak"); // Too weak
    await page.locator("#confirmPassword").fill("weak");
    await page.locator('button[type="submit"]').click();

    // Should show validation error
    const errorMessage = page.locator(".text-red-600, .bg-red-50");
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test("should show error when passwords don't match", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    const email = `mismatch-${Math.random().toString(36).substring(7)}@example.com`;

    await page.locator("#email").fill(email);
    await page.locator("#password").fill("Password123!");
    await page.locator("#confirmPassword").fill("DifferentPassword123!");
    await page.locator('button[type="submit"]').click();

    // Should show mismatch error
    const errorMessage = page.locator(".text-red-600");
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    await expect(errorMessage.first()).toContainText(/match|same/i);
  });

  test("should redirect to login from protected route when not authenticated", async ({
    page,
  }) => {
    // Try to access dashboard without authentication
    await page.goto("/dashboard");

    // Should redirect to login
    await page.waitForURL(/.*\/(login|$)/, { timeout: 10000 });
    expect(page.url()).toMatch(/login/);
  });
});
