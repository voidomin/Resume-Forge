import { test, expect } from "@playwright/test";

test.describe("Advanced Application Flows", () => {
  test.beforeEach(async ({ page }) => {
    const randomId = Math.random().toString(36).substring(7);
    const email = `advanced-${randomId}@example.com`;
    const password = "Password123!";

    await page.goto("/register");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.fill("#confirmPassword", password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*profile/, { timeout: 15000 });

    await page.getByPlaceholder("John", { exact: true }).fill("Advanced");
    await page.getByPlaceholder("Doe", { exact: true }).fill("User");
    await page
      .getByPlaceholder("john.doe@email.com", { exact: true })
      .fill(email);
    await page.click('button:has-text("Save Personal Info")');
    await expect(page.getByText("Profile saved!")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should manage experiences and skills in profile", async ({ page }) => {
    await page.goto("/profile");

    // 1. Add Experience
    await page.click('button:has-text("Experience")');
    for (let i = 0; i < 3; i++) {
      const addBtn = page.locator('button:has-text("Add Experience")');
      await addBtn.scrollIntoViewIfNeeded();
      await addBtn.click();

      // Wait for the count to increase - specifically in the experience section
      const cards = page
        .locator(".space-y-6")
        .first()
        .locator(".border.border-gray-200.rounded-lg");
      await expect(cards).toHaveCount(i + 1, { timeout: 15000 });

      const card = cards.nth(i);
      await expect(card).toBeVisible();

      await card.getByPlaceholder("Tech Company").fill(`Company ${i}`);
      await card.getByPlaceholder("Software Engineer").fill(`Role ${i}`);

      // Collapse after filling to keep DOM manageable and button visible
      await card.locator("h3").first().click();
    }
    const saveExpBtn = page.locator('button:has-text("Save All Experiences")');
    await saveExpBtn.click();
    await expect(saveExpBtn).toBeEnabled({ timeout: 15000 });
    await expect(page.getByText("Experiences saved!")).toBeVisible();

    // 2. Add Skill
    await page.click('button:has-text("Skills")');
    await page.getByPlaceholder(/Enter a skill/).fill("Playwright");
    // Targeted click on the plus button specifically in the skills tab
    await page.locator("button:has(.lucide-plus)").first().click();

    const saveSkillsBtn = page.locator('button:has-text("Save Skills")');
    await saveSkillsBtn.click();
    await expect(saveSkillsBtn).toBeEnabled({ timeout: 15000 });
    await expect(page.getByText("Skills saved!")).toBeVisible();

    // 3. Verify persistence
    await page.reload();
    await page.click('button:has-text("Experience")');
    await expect(page.getByText("Senior Engineer")).toBeVisible();
    await expect(page.getByText("Test Corp")).toBeVisible();
  });

  test("should verify ATS score and analysis report", async ({ page }) => {
    await page.goto("/resume/new");
    await page
      .getByPlaceholder(/Paste the full job description/)
      .fill("Software Engineer needed for fullstack development.");
    await page.click('button:has-text("Generate Resume with AI")');

    // Use toContainText for regex matching on body
    await expect(page.locator("body")).toContainText(/(\d+%)|(\d+\/100)/, {
      timeout: 30000,
    });

    await expect(page.getByText("Standard Section Headings")).toBeVisible();
  });

  test("should allow deleting a resume from dashboard", async ({ page }) => {
    await page.goto("/resume/new");
    await page
      .getByPlaceholder(/Paste the full job description/)
      .fill("Resume To Delete");
    await page.click('button:has-text("Generate Resume with AI")');
    await expect(
      page.getByRole("heading", { name: /Resume Generated/i }),
    ).toBeVisible({
      timeout: 180000,
    });

    await page.goto("/dashboard");
    // Resume title defaults to "[User Name] Resume" when created via the mock without a target role
    await expect(page.getByText("Advanced User Resume")).toBeVisible({
      timeout: 15000,
    });

    // Use locator that targets the specific delete button in the card
    const card = page.locator(".bg-gray-50.rounded-lg", {
      hasText: "Advanced User Resume",
    });
    await card.locator('button[title="Delete"]').click();

    page.on("dialog", (dialog) => dialog.accept());

    await expect(page.getByText("Resume deleted")).toBeVisible();
    await expect(page.getByText("Advanced User Resume")).not.toBeVisible();
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
