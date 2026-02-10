import { test, expect } from "@playwright/test";

test.describe("Resume Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    const randomId = Math.random().toString(36).substring(7);
    const email = `test-${randomId}@example.com`;
    const password = "Password123!";

    // Register new user
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    
    await page.waitForSelector("#email", { state: "visible" });
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.fill("#confirmPassword", password);
    
    await Promise.all([
      page.waitForURL(/.*profile/, { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForLoadState("networkidle");

    // Fill in profile
    await page.waitForSelector('input[placeholder="John"]', { state: "visible" });
    await page.getByPlaceholder("John", { exact: true }).fill("Test");
    await page.getByPlaceholder("Doe", { exact: true }).fill("User");
    await page.getByPlaceholder("john.doe@email.com", { exact: true }).fill(email);

    // Save profile
    await page.click('button:has-text("Save Personal Info")');
    
    // Wait for save confirmation - check for toast notification
    await page.waitForSelector('text="Profile saved!"', { state: "visible", timeout: 10000 });
  });

  test("should create a new resume", async ({ page }) => {
    // Go to resume creation page
    await page.goto("/resume/new");
    await page.waitForLoadState("networkidle");
    
    // Wait for textarea to be visible
    await page.waitForSelector('textarea[placeholder*="Paste the full job description"]', { 
      state: "visible",
      timeout: 10000 
    });

    // Fill in job description
    await page.getByPlaceholder(/Paste the full job description/).fill(
      "Software Engineer with React and TypeScript experience. Must have 3+ years of frontend development."
    );
    
    // Generate resume
    await page.click('button:has-text("Generate Resume with AI")');

    // Wait for resume to be generated (can take a while with AI)
    await expect(page.getByText("Education", { exact: false })).toBeVisible({
      timeout: 180000,
    });
    await expect(page.getByText("Experience", { exact: false })).toBeVisible();
  });

  test("should allow downloading PDF", async ({ page }) => {
    await page.goto("/resume/new");
    await page.waitForLoadState("networkidle");
    
    await page.waitForSelector('textarea[placeholder*="Paste the full job description"]', {
      state: "visible"
    });
    
    await page.getByPlaceholder(/Paste the full job description/).fill(
      "Backend Developer with Python and Django experience."
    );
    
    await page.click('button:has-text("Generate Resume with AI")');

    // Wait for resume to be generated
    await expect(page.getByText("Education", { exact: false })).toBeVisible({
      timeout: 180000,
    });

    // Download PDF
    const downloadPromise = page.waitForEvent("download");
    await page.click('button:has-text("Download PDF")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});
