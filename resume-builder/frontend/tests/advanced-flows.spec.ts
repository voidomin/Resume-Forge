import { test, expect } from "@playwright/test";

test.describe("Advanced Application Flows", () => {
  test.beforeEach(async ({ page }) => {
    const randomId = Math.random().toString(36).substring(7);
    const email = `advanced-${randomId}@example.com`;
    const password = "Password123!";

    // Register
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

    // Fill profile
    await page.waitForSelector('input[placeholder="John"]', { state: "visible" });
    await page.getByPlaceholder("John", { exact: true }).fill("Advanced");
    await page.getByPlaceholder("Doe", { exact: true }).fill("User");
    await page.getByPlaceholder("john.doe@email.com", { exact: true }).fill(email);
    
    await page.click('button:has-text("Save Personal Info")');
    await page.waitForSelector('text="Profile saved!"', { state: "visible", timeout: 10000 });
  });

  test("should manage experiences in profile", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    // Navigate to Experience tab
    await page.click('button:has-text("Experience")');
    await page.waitForTimeout(1000); // Give UI time to render
    
    // Add one experience as a simple test
    const addBtn = page.locator('button:has-text("Add Experience")');
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();

    // Wait for form to appear
    await page.waitForSelector('input[placeholder="Tech Company"]', { state: "visible" });
    
    // Fill in experience details
    await page.getByPlaceholder("Tech Company").first().fill("Test Company");
    await page.getByPlaceholder("Software Engineer").first().fill("Senior Developer");

    // Save experiences
    const saveExpBtn = page.locator('button:has-text("Save All Experiences")');
    await saveExpBtn.click();
    
    // Wait for success message
    await page.waitForSelector('text="Experiences saved!"', { state: "visible", timeout: 10000 });
  });

  test("should generate resume with job description", async ({ page }) => {
    await page.goto("/resume/new");
    await page.waitForLoadState("networkidle");
    
    await page.waitForSelector('textarea[placeholder*="Paste the full job description"]', {
      state: "visible"
    });
    
    await page.getByPlaceholder(/Paste the full job description/).fill(
      "Software Engineer needed for fullstack development with React and Node.js."
    );
    
    await page.click('button:has-text("Generate Resume with AI")');

    // Wait for resume to be generated
    await expect(page.getByText("Education", { exact: false })).toBeVisible({
      timeout: 180000,
    });
  });

  test("should navigate to dashboard and view resumes", async ({ page }) => {
    // First create a resume
    await page.goto("/resume/new");
    await page.waitForLoadState("networkidle");
    
    await page.waitForSelector('textarea[placeholder*="Paste the full job description"]', {
      state: "visible"
    });
    
    await page.getByPlaceholder(/Paste the full job description/).fill(
      "Full Stack Developer role"
    );
    
    await page.click('button:has-text("Generate Resume with AI")');
    
    // Wait for generation
    await expect(page.getByText("Education", { exact: false })).toBeVisible({
      timeout: 180000,
    });

    // Navigate to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    
    // Should see resume in dashboard
    await expect(page.getByText("Advanced User Resume")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should support resume import flow visibility", async ({ page }) => {
    await page.goto("/dashboard");
    await page.click('button:has-text("Import")');
    // Look for the heading in the modal specifically
    await expect(
      page.getByRole("heading", { name: /Import Resume/i }),
    ).toBeVisible();
  });
});
