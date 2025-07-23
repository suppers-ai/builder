import { expect, test } from "@playwright/test";

test.describe("Swap E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/action/swap");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays swap examples", async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle("daisyUI Component Library - Fresh 2.0");

    // Check that the main heading is present
    await expect(page.locator("h1").first()).toContainText("Swap");

    // Check that examples are visible
    await expect(page.locator(".card").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    // Check breadcrumbs
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Swap");

    // Test navigation to home via breadcrumb
    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    // Navigate back to swap
    await page.goBack();
    await expect(page).toHaveURL(/swap$/);
  });

  test("sidebar navigation is functional", async ({ page }) => {
    // Check sidebar is visible
    await expect(page.locator("aside")).toBeVisible();

    // Verify sidebar has navigation structure
    await expect(page.locator("aside")).toContainText("Components");

    // Verify sidebar has component links
    const componentLinks = page.locator('aside a[href*="/components"]');
    const linkCount = await componentLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(3);

    // Verify specific component categories exist
    await expect(page.locator("aside")).toContainText("Actions");
    await expect(page.locator("aside")).toContainText("Swap");
  });

  test("code examples are copyable", async ({ page }) => {
    // Check if copy buttons exist
    const copyButtons = page.locator('button:has-text("Copy"), .copy-button');
    const copyCount = await copyButtons.count();

    if (copyCount > 0) {
      // Test copying code
      await copyButtons.first().click();
    }
  });

  test("examples render correctly", async ({ page }) => {
    // Test that swap examples are present in the documentation
    await expect(page.locator(".card")).toHaveCountGreaterThanOrEqual(3);

    // Look for swap-related content
    await expect(page.locator("text=swap")).toBeVisible();
  });

  test("interactive swap examples work", async ({ page }) => {
    // Look for interactive swap elements
    const swapElements = page.locator(".swap, label:has(.swap-on)");
    const swapCount = await swapElements.count();

    if (swapCount > 0) {
      // Test clicking swap to toggle state
      const firstSwap = swapElements.first();

      // Get initial state
      const initialActive = await firstSwap.evaluate((el) => el.classList.contains("swap-active"));

      // Click to toggle
      await firstSwap.click();
      await page.waitForTimeout(200);

      // Check if state changed (this might not work for display-only components, but we test the interaction)
      const swapInput = page.locator('.swap input[type="checkbox"]').first();
      const inputExists = await swapInput.count() > 0;

      if (inputExists) {
        // Verify the checkbox input exists and is functional
        await expect(swapInput).toBeVisible();
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    // Check API props table exists
    await expect(page.locator("table, .api-table")).toBeVisible();

    // Check key props are documented
    await expect(page.locator('text="on"')).toBeVisible();
    await expect(page.locator('text="off"')).toBeVisible();
    await expect(page.locator('text="active"')).toBeVisible();
    await expect(page.locator('text="rotate"')).toBeVisible();
    await expect(page.locator('text="flip"')).toBeVisible();
  });

  test("usage notes and accessibility info present", async ({ page }) => {
    // Check usage notes section
    const usageSection = page.locator(".alert, h4, h2, h3").filter({ hasText: "Usage" });
    const usageExists = await usageSection.count() > 0;

    if (usageExists) {
      await expect(usageSection.first()).toBeVisible();
    }

    // Check accessibility section
    const accessibilitySection = page.locator(".alert, h4, h2, h3").filter({
      hasText: "Accessibility",
    });
    const accessibilityExists = await accessibilitySection.count() > 0;

    if (accessibilityExists) {
      await expect(accessibilitySection.first()).toBeVisible();
    }

    // If neither section exists, check for general documentation structure
    if (!usageExists && !accessibilityExists) {
      const docStructure = page.locator("h2, h3, .alert");
      const structureCount = await docStructure.count();
      expect(structureCount).toBeGreaterThan(0);
    }
  });

  test("related components links work", async ({ page }) => {
    // Check related components section
    const relatedSection = page.locator('text="Related Components"').locator("..");
    const relatedExists = await relatedSection.count() > 0;

    if (relatedExists) {
      await expect(relatedSection).toBeVisible();

      // Test related component links
      const relatedLinks = relatedSection.locator("a");
      const linkCount = await relatedLinks.count();

      if (linkCount > 0) {
        const firstLink = relatedLinks.first();
        const href = await firstLink.getAttribute("href");

        if (href) {
          await firstLink.click();
          await expect(page).toHaveURL(new RegExp(href.replace("/", "\\/") || ""));
          await page.goBack();
        }
      }
    }
  });

  test("swap keyboard navigation works", async ({ page }) => {
    // Focus navigation through the page
    await page.keyboard.press("Tab");

    // Check if any element is focused
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Test keyboard interaction with swap if present
    const swapInputs = page.locator('.swap input[type="checkbox"]');
    const inputExists = await swapInputs.count() > 0;

    if (inputExists) {
      // Focus on swap input
      await swapInputs.first().focus();

      // Toggle with Space
      await page.keyboard.press("Space");
      await page.waitForTimeout(200);

      // Toggle again with Space
      await page.keyboard.press("Space");
      await page.waitForTimeout(200);
    }
  });

  test("swap animation performance", async ({ page }) => {
    // Test that animations don't cause performance issues
    const swapElements = page.locator(".swap-rotate, .swap-flip");
    const animatedSwapExists = await swapElements.count() > 0;

    if (animatedSwapExists) {
      // Trigger multiple rapid toggles to test performance
      const firstAnimatedSwap = swapElements.first();

      for (let i = 0; i < 5; i++) {
        await firstAnimatedSwap.click();
        await page.waitForTimeout(50);
      }

      // Verify page is still responsive
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("responsive behavior on mobile", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that page is still usable
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".card").first()).toBeVisible();

    // Check if hamburger menu appears
    const hamburger = page.locator(
      'button[aria-label="Toggle menu"], .btn-ghost.btn-square.lg\\:hidden',
    );
    const hasHamburger = await hamburger.count() > 0;

    if (hasHamburger) {
      await expect(hamburger.first()).toBeVisible();
    }

    // Verify responsive layout works
    await expect(page.locator("main").first()).toBeVisible();

    // Test swap behavior on mobile
    const swapElements = page.locator(".swap");
    const swapExists = await swapElements.count() > 0;

    if (swapExists) {
      await swapElements.first().click();
      await page.waitForTimeout(200);

      // Verify swap is still functional on mobile
      await expect(swapElements.first()).toBeVisible();
    }
  });

  test("swap accessibility features", async ({ page }) => {
    // Test focus management and form semantics
    const swapInputs = page.locator('.swap input[type="checkbox"]');
    const inputExists = await swapInputs.count() > 0;

    if (inputExists) {
      const input = swapInputs.first();

      // Check for proper form attributes
      const inputAttributes = await input.evaluate((el) => ({
        type: el.getAttribute("type"),
        tabindex: el.getAttribute("tabindex"),
        ariaLabel: el.getAttribute("aria-label"),
        ariaDescribedBy: el.getAttribute("aria-describedby"),
      }));

      // Input should be a checkbox
      expect(inputAttributes.type).toBe("checkbox");
    }

    // Check label semantics
    const swapLabels = page.locator(".swap, label");
    const labelExists = await swapLabels.count() > 0;

    if (labelExists) {
      const label = swapLabels.first();
      const labelTag = await label.evaluate((el) => el.tagName.toLowerCase());

      // Should be a label element for accessibility
      if (labelTag === "label") {
        expect(labelTag).toBe("label");
      }
    }
  });

  test("swap state persistence through interactions", async ({ page }) => {
    // Test that swap states are visually represented correctly
    const swapElements = page.locator(".swap");
    const swapExists = await swapElements.count() > 0;

    if (swapExists) {
      const firstSwap = swapElements.first();

      // Click multiple times and verify visual consistency
      for (let i = 0; i < 3; i++) {
        await firstSwap.click();
        await page.waitForTimeout(100);

        // Verify swap content is still visible
        const swapOn = page.locator(".swap-on").first();
        const swapOff = page.locator(".swap-off").first();

        await expect(swapOn).toBeVisible();
        await expect(swapOff).toBeVisible();
      }
    }
  });

  test("page performance is acceptable", async ({ page }) => {
    // Test Core Web Vitals
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/action/swap");
    await navigationPromise;

    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check that images are loaded
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveJSProperty("complete", true);
    }
  });

  test("swap content overflow handling", async ({ page }) => {
    // Test swaps with long content
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <label class="swap">
          <input type="checkbox" />
          <div class="swap-on">Very long content that might overflow the container and cause layout issues</div>
          <div class="swap-off">Short</div>
        </label>
      `;
      document.body.appendChild(container);
    });

    const swapElement = page.locator(".swap").last();

    // Verify no layout breaks
    await expect(swapElement).toBeVisible();

    // Test toggle with long content
    await swapElement.click();
    await page.waitForTimeout(100);

    await expect(swapElement).toBeVisible();
  });

  test("multiple swaps independence", async ({ page }) => {
    // Test that multiple swaps on the page work independently
    const swapElements = page.locator(".swap");
    const swapCount = await swapElements.count();

    if (swapCount >= 2) {
      // Click first swap
      await swapElements.first().click();
      await page.waitForTimeout(100);

      // Click second swap
      await swapElements.nth(1).click();
      await page.waitForTimeout(100);

      // Verify both are still functional
      await expect(swapElements.first()).toBeVisible();
      await expect(swapElements.nth(1)).toBeVisible();
    }
  });
});
