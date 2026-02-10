import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should allow user to sign up", async ({ page }) => {
    const randomId = Math.random().toString(36).substring(7);
    const email = `test-${randomId}@example.com`;
    const password = "Password123!";

    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    
    // Wait for form to be ready
    await page.waitForSelector("#email", { state: "visible" });
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.fill("#confirmPassword", password);
    
    // Click submit and wait for navigation
    await Promise.all([
      page.waitForURL(/.*profile/, { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);

    // Verify we're on the profile page
    await expect(page).toHaveURL(/.*profile/);
  });

  test("should show error on invalid login", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    
    await page.waitForSelector("#email", { state: "visible" });
    await page.fill("#email", "invalid@example.com");
    await page.fill("#password", "WrongPass");
    await page.click('button[type="submit"]');

    // Wait for error message to appear
    await page.waitForSelector(".bg-red-50", { state: "visible", timeout: 10000 });
    const errorMsg = page.locator(".bg-red-50");
    await expect(errorMsg).toContainText(/Invalid|failed/);
  });
});
