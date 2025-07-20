import { expect, test } from "@playwright/test";

test.describe("Toggle E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/toggle");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays toggle examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Toggle/);
    await expect(page.locator("h1")).toContainText("Toggle");
    await expect(page.locator(".toggle").first()).toBeVisible();
  });

  test("toggle functionality works", async ({ page }) => {
    const toggle = page.locator(".toggle").first();

    // Check initial state
    const initialChecked = await toggle.isChecked();

    // Click toggle
    await toggle.click();

    // Verify state changed
    const newChecked = await toggle.isChecked();
    expect(newChecked).toBe(!initialChecked);
  });

  test("toggle keyboard interaction", async ({ page }) => {
    const toggle = page.locator(".toggle").first();

    // Focus toggle
    await toggle.focus();
    await expect(toggle).toBeFocused();

    // Toggle with spacebar
    const initialState = await toggle.isChecked();
    await page.keyboard.press("Space");

    const newState = await toggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test("disabled toggle is not interactive", async ({ page }) => {
    const disabledToggle = page.locator(".toggle[disabled]").first();

    if (await disabledToggle.count() > 0) {
      await expect(disabledToggle).toBeDisabled();

      // Try to click - should not change state
      const initialState = await disabledToggle.isChecked();
      await disabledToggle.click({ force: true });

      const newState = await disabledToggle.isChecked();
      expect(newState).toBe(initialState);
    }
  });

  test("toggle accessibility attributes", async ({ page }) => {
    const toggles = page.locator(".toggle");
    const toggleCount = await toggles.count();

    for (let i = 0; i < Math.min(toggleCount, 3); i++) {
      const toggle = toggles.nth(i);

      // Check role
      const role = await toggle.getAttribute("role");
      expect(role).toBe("switch");

      // Check aria-checked
      const ariaChecked = await toggle.getAttribute("aria-checked");
      expect(["true", "false"]).toContain(ariaChecked);
    }
  });

  test("toggle labels are associated correctly", async ({ page }) => {
    const labeledToggles = page.locator(".form-control .toggle");
    const labelCount = await labeledToggles.count();

    if (labelCount > 0) {
      const toggle = labeledToggles.first();
      const label = page.locator("label").first();

      // Click label should toggle the input
      const initialState = await toggle.isChecked();
      await label.click();

      const newState = await toggle.isChecked();
      expect(newState).toBe(!initialState);
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="checked"')).toBeVisible();
    await expect(page.locator('text="disabled"')).toBeVisible();
    await expect(page.locator('text="size"')).toBeVisible();
    await expect(page.locator('text="color"')).toBeVisible();
  });
});
