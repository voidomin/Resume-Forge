import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should allow user to sign up", async ({ page }) => {
    const randomId = Math.random().toString(36).substring(7);
    const email = `test-${randomId}@example.com`;
    const password = "Password123!";

    await page.goto("/register");
    await page.waitForSelector("#email");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.fill("#confirmPassword", password);
    await page.click('button[type="submit"]');

    // Should redirect to profile page for new users
    await expect(page).toHaveURL(/.*profile/, { timeout: 10000 });
  });

  test("should allow user to login", async ({ page }) => {
    await page.goto("/login");
    await page.waitForSelector("#email");
    await page.fill("#email", "invalid@example.com");
    await page.fill("#password", "WrongPass");
    await page.click('button[type="submit"]');

    // Wait for the error div specifically
    const errorMsg = page.locator(".bg-red-50");
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
    await expect(errorMsg).toContainText("Invalid email or password");

    await page.screenshot({ path: "login-success-error-shown.png" });
  });
});
