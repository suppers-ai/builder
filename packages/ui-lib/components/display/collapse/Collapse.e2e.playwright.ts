import { expect, test } from "@playwright/test";

test.describe("Collapse E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/collapse");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays collapse examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Collapse/);
    await expect(page.locator("h1")).toContainText("Collapse");
    await expect(page.locator(".collapse").first()).toBeVisible();
  });

  test("collapse basic structure is correct", async ({ page }) => {
    const collapses = page.locator(".collapse");
    const collapseCount = await collapses.count();

    expect(collapseCount).toBeGreaterThan(0);

    // Check first collapse
    const firstCollapse = collapses.first();
    await expect(firstCollapse).toBeVisible();

    // Should have title
    const title = firstCollapse.locator(".collapse-title");
    await expect(title).toBeVisible();

    const titleText = await title.textContent();
    expect(titleText?.trim()).toBeTruthy();

    // Should have content
    const content = firstCollapse.locator(".collapse-content");
    await expect(content).toBeVisible();
  });

  test("collapse toggle functionality works", async ({ page }) => {
    const collapse = page.locator(".collapse").first();
    const input = collapse.locator("input[type='checkbox'], input[type='radio']");
    const content = collapse.locator(".collapse-content");

    if (await input.count() > 0) {
      // Get initial state
      const initialChecked = await input.isChecked();

      // Click to toggle
      await input.click();
      await page.waitForTimeout(200);

      // State should have changed
      const newChecked = await input.isChecked();
      expect(newChecked).toBe(!initialChecked);

      // Content should still be present
      await expect(content).toBeVisible();
    }
  });

  test("collapse title click toggles content", async ({ page }) => {
    const collapse = page.locator(".collapse").first();
    const title = collapse.locator(".collapse-title");
    const input = collapse.locator("input[type='checkbox'], input[type='radio']");

    if (await input.count() > 0) {
      // Get initial state
      const initialChecked = await input.isChecked();

      // Click title to toggle
      await title.click();
      await page.waitForTimeout(200);

      // State should have changed
      const newChecked = await input.isChecked();
      expect(newChecked).toBe(!initialChecked);
    }
  });

  test("collapse accordion behavior", async ({ page }) => {
    // Look for radio-based collapses (accordion)
    const radioCollapses = page.locator('.collapse input[type="radio"]');
    const radioCount = await radioCollapses.count();

    if (radioCount > 1) {
      // Get radio inputs with same name
      const firstName = await radioCollapses.first().getAttribute("name");
      if (firstName) {
        const accordionRadios = page.locator(`input[type="radio"][name="${firstName}"]`);
        const accordionCount = await accordionRadios.count();

        if (accordionCount > 1) {
          // Click first radio
          await accordionRadios.first().click();
          await page.waitForTimeout(200);

          const firstChecked = await accordionRadios.first().isChecked();
          expect(firstChecked).toBe(true);

          // Click second radio
          await accordionRadios.nth(1).click();
          await page.waitForTimeout(200);

          // First should be unchecked, second should be checked
          const firstNowChecked = await accordionRadios.first().isChecked();
          const secondChecked = await accordionRadios.nth(1).isChecked();

          expect(firstNowChecked).toBe(false);
          expect(secondChecked).toBe(true);
        }
      }
    }
  });

  test("collapse icon variations work", async ({ page }) => {
    const iconVariants = [
      "collapse-arrow",
      "collapse-plus",
    ];

    for (const variant of iconVariants) {
      const variantCollapses = page.locator(`.${variant}`);
      const variantCount = await variantCollapses.count();

      if (variantCount > 0) {
        const variantCollapse = variantCollapses.first();
        await expect(variantCollapse).toBeVisible();

        // Should have the variant class
        const hasClass = await variantCollapse.evaluate(
          (el, className) => el.classList.contains(className),
          variant,
        );
        expect(hasClass).toBe(true);
      }
    }
  });

  test("collapse content is accessible when open", async ({ page }) => {
    const collapse = page.locator(".collapse").first();
    const input = collapse.locator("input[type='checkbox'], input[type='radio']");
    const content = collapse.locator(".collapse-content");

    if (await input.count() > 0) {
      // Ensure collapse is open
      if (!(await input.isChecked())) {
        await input.click();
        await page.waitForTimeout(200);
      }

      // Content should be visible and accessible
      await expect(content).toBeVisible();

      // Check for interactive elements in content
      const interactiveElements = content.locator("button, a, input, textarea, select");
      const interactiveCount = await interactiveElements.count();

      if (interactiveCount > 0) {
        const firstInteractive = interactiveElements.first();
        await expect(firstInteractive).toBeVisible();
        await expect(firstInteractive).toBeEnabled();
      }
    }
  });

  test("collapse keyboard navigation", async ({ page }) => {
    // Focus first collapse input
    const firstInput = page.locator(".collapse input").first();

    if (await firstInput.count() > 0) {
      await firstInput.focus();
      await expect(firstInput).toBeFocused();

      // Get initial state
      const initialChecked = await firstInput.isChecked();

      // Toggle with Space or Enter
      await page.keyboard.press("Space");
      await page.waitForTimeout(200);

      // State should have changed
      const newChecked = await firstInput.isChecked();
      expect(newChecked).toBe(!initialChecked);

      // Test Tab navigation to next collapse
      await page.keyboard.press("Tab");

      const focusedElement = page.locator(":focus");
      const focusedCount = await focusedElement.count();

      if (focusedCount > 0) {
        // Should be able to navigate away from collapse
        const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
        expect(["input", "button", "a"]).toContain(tagName);
      }
    }
  });

  test("collapse accessibility attributes", async ({ page }) => {
    const collapses = page.locator(".collapse");
    const collapseCount = await collapses.count();

    for (let i = 0; i < Math.min(collapseCount, 3); i++) {
      const collapse = collapses.nth(i);
      const title = collapse.locator(".collapse-title");
      const content = collapse.locator(".collapse-content");

      // Title should be visible
      await expect(title).toBeVisible();

      // Title should have meaningful text
      const titleText = await title.textContent();
      expect(titleText?.trim().length).toBeGreaterThan(0);

      // Content should be present
      await expect(content).toBeVisible();

      // Check for input association
      const input = collapse.locator("input");
      if (await input.count() > 0) {
        const inputType = await input.getAttribute("type");
        expect(["checkbox", "radio"]).toContain(inputType);
      }
    }
  });

  test("collapse responsive behavior", async ({ page }) => {
    const collapse = page.locator(".collapse").first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(collapse).toBeVisible();

    const desktopSize = await collapse.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(collapse).toBeVisible();

    const mobileSize = await collapse.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Collapse should adapt to mobile
    expect(mobileSize.width).toBeLessThanOrEqual(desktopSize.width);
    expect(mobileSize.height).toBeGreaterThan(0);
  });

  test("collapse content types display correctly", async ({ page }) => {
    const collapseContents = page.locator(".collapse-content");
    const contentCount = await collapseContents.count();

    for (let i = 0; i < Math.min(contentCount, 3); i++) {
      const content = collapseContents.nth(i);

      // Content should be visible
      await expect(content).toBeVisible();

      // Check for different content types
      const textContent = await content.textContent();
      const hasText = textContent?.trim().length > 0;

      const hasElements = await content.locator("*").count() > 0;

      // Content should have either text or child elements
      expect(hasText || hasElements).toBe(true);
    }
  });

  test("multiple independent collapses work", async ({ page }) => {
    const checkboxCollapses = page.locator('.collapse input[type="checkbox"]');
    const checkboxCount = await checkboxCollapses.count();

    if (checkboxCount > 1) {
      // Toggle first collapse
      const firstCollapse = checkboxCollapses.first();
      const initialFirst = await firstCollapse.isChecked();
      await firstCollapse.click();
      await page.waitForTimeout(100);

      // Toggle second collapse
      const secondCollapse = checkboxCollapses.nth(1);
      const initialSecond = await secondCollapse.isChecked();
      await secondCollapse.click();
      await page.waitForTimeout(100);

      // Both should be in their new states (independent)
      const newFirst = await firstCollapse.isChecked();
      const newSecond = await secondCollapse.isChecked();

      expect(newFirst).toBe(!initialFirst);
      expect(newSecond).toBe(!initialSecond);
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="title"')).toBeVisible();
    await expect(page.locator('text="content"')).toBeVisible();
    await expect(page.locator('text="open"')).toBeVisible();
    await expect(page.locator('text="icon"')).toBeVisible();
  });
});
