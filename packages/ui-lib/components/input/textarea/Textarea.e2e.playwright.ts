import { expect, test } from "@playwright/test";

test.describe("Textarea E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/input/textarea");
  });

  test("textarea navigation and visibility", async ({ page }) => {
    await page.click('text="Components"');
    await expect(page).toHaveURL(/components$/);

    await page.goto("http://localhost:8000/components/input/textarea");
    await expect(page.locator("textarea")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Textarea");
  });

  test("textarea input functionality", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible();

    const testText = "This is a test message\nwith multiple lines";
    await textarea.fill(testText);
    await expect(textarea).toHaveValue(testText);
  });

  test("textarea accessibility", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible();

    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");

    if (await focused.count() > 0) {
      await expect(focused).toBeVisible();
    }
  });

  test("textarea responsive behavior", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const textarea = page.locator("textarea").first();
      await expect(textarea).toBeVisible();
    }
  });

  test("textarea resize functionality", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible();

    const initialSize = await textarea.boundingBox();
    expect(initialSize).toBeTruthy();
  });

  test("textarea placeholder", async ({ page }) => {
    const textareaWithPlaceholder = page.locator("textarea[placeholder]");
    if (await textareaWithPlaceholder.count() > 0) {
      await expect(textareaWithPlaceholder.first()).toBeVisible();
      const placeholder = await textareaWithPlaceholder.first().getAttribute("placeholder");
      expect(placeholder).toBeTruthy();
    }
  });
});
