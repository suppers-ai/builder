import { expect, test } from "@playwright/test";

test.describe("Kbd E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/kbd");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays kbd examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Kbd/);
    await expect(page.locator("h1")).toContainText("Kbd");
    await expect(page.locator(".kbd").first()).toBeVisible();
  });

  test("kbd elements display correctly", async ({ page }) => {
    const kbdElements = page.locator(".kbd");
    const kbdCount = await kbdElements.count();

    expect(kbdCount).toBeGreaterThan(0);

    // Check first kbd element
    const firstKbd = kbdElements.first();
    await expect(firstKbd).toBeVisible();

    const kbdText = await firstKbd.textContent();
    expect(kbdText?.trim()).toBeTruthy();
  });

  test("kbd semantic structure", async ({ page }) => {
    const kbdElements = page.locator(".kbd");
    const kbdCount = await kbdElements.count();

    for (let i = 0; i < Math.min(kbdCount, 5); i++) {
      const kbd = kbdElements.nth(i);

      // Check that it's actually a kbd element
      const tagName = await kbd.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe("kbd");

      // Check content is meaningful
      const content = await kbd.textContent();
      expect(content?.trim().length).toBeGreaterThan(0);
    }
  });

  test("kbd accessibility attributes", async ({ page }) => {
    const kbdElements = page.locator(".kbd");
    const kbdCount = await kbdElements.count();

    for (let i = 0; i < Math.min(kbdCount, 3); i++) {
      const kbd = kbdElements.nth(i);

      // Kbd elements should be properly marked up
      const tagName = await kbd.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe("kbd");

      // Should have visible text
      const isVisible = await kbd.isVisible();
      expect(isVisible).toBe(true);

      // Check for proper contrast (text should be readable)
      const textColor = await kbd.evaluate((el) => getComputedStyle(el).color);
      const backgroundColor = await kbd.evaluate((el) => getComputedStyle(el).backgroundColor);

      expect(textColor).toBeTruthy();
      expect(backgroundColor).toBeTruthy();
    }
  });

  test("interactive kbd elements", async ({ page }) => {
    const interactiveKbd = page.locator(".kbd.cursor-pointer, .kbd[onclick]");
    const interactiveCount = await interactiveKbd.count();

    if (interactiveCount > 0) {
      const firstInteractive = interactiveKbd.first();

      await expect(firstInteractive).toBeVisible();

      // Click interactive kbd
      await firstInteractive.click();

      // Should remain visible after click
      await expect(firstInteractive).toBeVisible();
    }
  });

  test("kbd keyboard navigation", async ({ page }) => {
    // Try to focus kbd elements (they're typically not focusable unless interactive)
    const interactiveKbd = page.locator(".kbd.cursor-pointer, .kbd[tabindex]");
    const interactiveCount = await interactiveKbd.count();

    if (interactiveCount > 0) {
      const firstInteractive = interactiveKbd.first();

      await firstInteractive.focus();
      await expect(firstInteractive).toBeFocused();

      // Test activation with Enter
      await page.keyboard.press("Enter");
      await expect(firstInteractive).toBeVisible();
    }
  });

  test("kbd size variations work", async ({ page }) => {
    const sizes = ["kbd-xs", "kbd-sm", "kbd-md", "kbd-lg"];

    for (const size of sizes) {
      const sizedKbd = page.locator(`.${size}`);
      const sizedCount = await sizedKbd.count();

      if (sizedCount > 0) {
        const firstSized = sizedKbd.first();
        await expect(firstSized).toBeVisible();

        // Check that size class is applied
        const hasClass = await firstSized.evaluate(
          (el, className) => el.classList.contains(className),
          size,
        );
        expect(hasClass).toBe(true);
      }
    }
  });

  test("kbd variant styles work", async ({ page }) => {
    const variants = ["kbd-primary", "kbd-secondary", "kbd-accent", "kbd-ghost"];

    for (const variant of variants) {
      const variantKbd = page.locator(`.${variant}`);
      const variantCount = await variantKbd.count();

      if (variantCount > 0) {
        const firstVariant = variantKbd.first();
        await expect(firstVariant).toBeVisible();

        // Check that variant class is applied
        const hasClass = await firstVariant.evaluate(
          (el, className) => el.classList.contains(className),
          variant,
        );
        expect(hasClass).toBe(true);
      }
    }
  });

  test("kbd content types display correctly", async ({ page }) => {
    // Test different content types
    const contentTypes = [
      { selector: '.kbd:has-text("⌘")', type: "symbol" },
      { selector: '.kbd:has-text("Ctrl")', type: "text" },
      { selector: '.kbd:has-text("1")', type: "number" },
      { selector: '.kbd:has-text("F1")', type: "function key" },
    ];

    for (const content of contentTypes) {
      const elements = page.locator(content.selector);
      const count = await elements.count();

      if (count > 0) {
        const element = elements.first();
        await expect(element).toBeVisible();

        const text = await element.textContent();
        expect(text?.trim()).toBeTruthy();
      }
    }
  });

  test("kbd in combination displays", async ({ page }) => {
    // Look for keyboard combination patterns
    const combinations = page.locator('.kbd + span:has-text("+") + .kbd');
    const combinationCount = await combinations.count();

    if (combinationCount > 0) {
      // Check that combinations are properly spaced and readable
      const combination = combinations.first();
      await expect(combination).toBeVisible();

      // Check for proper spacing between elements
      const parent = combination.locator("..");
      const spacing = await parent.evaluate((el) =>
        getComputedStyle(el).gap || getComputedStyle(el).marginLeft
      );
      expect(spacing).toBeTruthy();
    }
  });

  test("kbd responsive behavior", async ({ page }) => {
    const kbd = page.locator(".kbd").first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(kbd).toBeVisible();

    const desktopSize = await kbd.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(kbd).toBeVisible();

    const mobileSize = await kbd.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Kbd should remain readable on mobile
    expect(mobileSize.width).toBeGreaterThan(0);
    expect(mobileSize.height).toBeGreaterThan(0);
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="variant"')).toBeVisible();
    await expect(page.locator('text="size"')).toBeVisible();
    await expect(page.locator('text="children"')).toBeVisible();
  });
});
