import { expect, test } from "@playwright/test";

test.describe("FileInput E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/file-input");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays file input examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("File Input");
    await expect(page.locator('input[type="file"]').first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("File Input");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/file-input$/);
  });

  test("file input examples render correctly", async ({ page }) => {
    const fileInputs = page.locator('input[type="file"]');
    const inputCount = await fileInputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(3);

    await expect(page.locator('.file-input-xs, input[type="file"].file-input-xs').first())
      .toBeVisible();
    await expect(page.locator('.file-input-lg, input[type="file"].file-input-lg').first())
      .toBeVisible();
    await expect(
      page.locator('.file-input-bordered, input[type="file"].file-input-bordered').first(),
    ).toBeVisible();
  });

  test("file input interaction works", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();

    await fileInput.focus();
    await expect(fileInput).toBeFocused();

    // Test clicking opens file dialog (we can't actually select files in tests)
    await fileInput.click();
    await expect(fileInput).toBeFocused();
  });

  test("file input multiple attribute works", async ({ page }) => {
    const multipleInputs = page.locator('input[type="file"][multiple]');
    const hasMultiple = await multipleInputs.count() > 0;

    if (hasMultiple) {
      const multipleInput = multipleInputs.first();
      const isMultiple = await multipleInput.getAttribute("multiple");
      expect(isMultiple).not.toBeNull();
    }
  });

  test("file input accept attribute works", async ({ page }) => {
    const acceptInputs = page.locator('input[type="file"][accept]');
    const hasAccept = await acceptInputs.count() > 0;

    if (hasAccept) {
      const acceptInput = acceptInputs.first();
      const acceptValue = await acceptInput.getAttribute("accept");
      expect(acceptValue).toBeTruthy();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="accept"')).toBeVisible();
    await expect(page.locator('text="multiple"')).toBeVisible();
    await expect(page.locator('text="required"')).toBeVisible();
  });

  test("keyboard navigation works", async ({ page }) => {
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "input") {
      const inputType = await focusedElement.getAttribute("type");
      if (inputType === "file") {
        await page.keyboard.press("Enter");
        await expect(focusedElement).toBeFocused();
      }
    }
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('input[type="file"]').first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/input/file-input");
    await navigationPromise;

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
