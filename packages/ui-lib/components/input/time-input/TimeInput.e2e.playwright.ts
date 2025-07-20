import { expect, test } from "@playwright/test";

test.describe("TimeInput E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/input/time-input");
  });

  test("time input navigation and visibility", async ({ page }) => {
    await page.click('text="Components"');
    await expect(page).toHaveURL(/components$/);

    await page.goto("http://localhost:8000/components/input/time-input");
    await expect(page.locator("input[type='time']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Time Input");
  });

  test("time input functionality", async ({ page }) => {
    const timeInput = page.locator("input[type='time']").first();
    await expect(timeInput).toBeVisible();

    await timeInput.fill("14:30");
    await expect(timeInput).toHaveValue("14:30");
  });

  test("time input accessibility", async ({ page }) => {
    const timeInput = page.locator("input[type='time']").first();
    await expect(timeInput).toBeVisible();

    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");

    if (await focused.count() > 0) {
      await expect(focused).toBeVisible();
    }
  });

  test("time input responsive behavior", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const timeInput = page.locator("input[type='time']").first();
      await expect(timeInput).toBeVisible();
    }
  });

  test("time input validation", async ({ page }) => {
    const timeInput = page.locator("input[type='time']").first();
    await expect(timeInput).toBeVisible();

    await timeInput.fill("invalid");
    const value = await timeInput.inputValue();
    expect(value).toBe("");
  });
});
