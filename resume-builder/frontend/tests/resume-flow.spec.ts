import { test, expect } from "@playwright/test";

test.describe("Resume Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    const randomId = Math.random().toString(36).substring(7);
    const email = `test-${randomId}@example.com`;
    const password = "Password123!";

    await page.goto("/register");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.fill("#confirmPassword", password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*profile/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder("John", { exact: true }).fill("Test");
    await page.getByPlaceholder("Doe", { exact: true }).fill("User");
    await page
      .getByPlaceholder("john.doe@email.com", { exact: true })
      .fill(email);

    await page.click('button:has-text("Save Personal Info")');
    await expect(page.getByText("Profile saved!")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should create a new resume", async ({ page }) => {
    // Standardizing entry point to avoid dashboard loading flakiness
    await page.goto("/resume/new");
    await page.waitForSelector(
      'textarea[placeholder*="Paste the full job description"]',
    );

    await page
      .getByPlaceholder(/Paste the full job description/)
      .fill("Software Engineer with React experience.");
    await page.click('button:has-text("Generate Resume with AI")');

    await expect(page.getByText("Education", { exact: false })).toBeVisible({
      timeout: 180000,
    });
    await expect(page.getByText("Experience", { exact: false })).toBeVisible();
  });

  test("should allow downloading PDF", async ({ page }) => {
    await page.goto("/resume/new");
    await page.waitForSelector(
      'textarea[placeholder*="Paste the full job description"]',
    );
    await page
      .getByPlaceholder(/Paste the full job description/)
      .fill("Test Job");
    await page.click('button:has-text("Generate Resume with AI")');

    await expect(page.getByText("Education", { exact: false })).toBeVisible({
      timeout: 180000,
    });

    const downloadPromise = page.waitForEvent("download");
    await page.click('button:has-text("Download PDF")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(".pdf");
  });
});
