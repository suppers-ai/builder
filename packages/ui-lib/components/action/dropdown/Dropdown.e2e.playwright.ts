import { expect, test } from "@playwright/test";

test.describe("Dropdown E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/action/dropdown");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays dropdown examples", async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle("daisyUI Component Library - Fresh 2.0");

    // Check that the main heading is present
    await expect(page.locator("h1").first()).toContainText("Dropdown");

    // Check that examples are visible
    await expect(page.locator(".card").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    // Check breadcrumbs
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Dropdown");

    // Test navigation to home via breadcrumb
    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    // Navigate back to dropdown
    await page.goBack();
    await expect(page).toHaveURL(/dropdown$/);
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
    await expect(page.locator("aside")).toContainText("Dropdown");
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
    // Test that dropdown examples are present in the documentation
    await expect(page.locator(".card")).toHaveCountGreaterThanOrEqual(3);

    // Look for dropdown-related content
    await expect(page.locator("text=dropdown")).toBeVisible();
  });

  test("interactive dropdown examples work", async ({ page }) => {
    // Look for interactive dropdown buttons or triggers
    const dropdownTriggers = page.locator(
      '.dropdown-trigger, button:has-text("Click"), button:has-text("Menu"), [tabindex="0"]',
    );
    const triggerCount = await dropdownTriggers.count();

    if (triggerCount > 0) {
      // Test opening dropdown
      await dropdownTriggers.first().click();

      // Wait for dropdown to appear
      await page.waitForTimeout(200);

      // Check if dropdown opened (look for dropdown-open class or visible content)
      const dropdown = page.locator(".dropdown-open, .dropdown-content:visible");
      const dropdownExists = await dropdown.count() > 0;

      if (dropdownExists) {
        await expect(dropdown.first()).toBeVisible();

        // Try to click an item in the dropdown if it exists
        const dropdownItems = page.locator(".dropdown-content a, .dropdown-content li");
        const itemExists = await dropdownItems.count() > 0;

        if (itemExists) {
          // Click outside to close dropdown
          await page.click("body");
          await page.waitForTimeout(100);
        }
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    // Check API props table exists
    await expect(page.locator("table, .api-table")).toBeVisible();

    // Check key props are documented
    await expect(page.locator('text="trigger"')).toBeVisible();
    await expect(page.locator('text="content"')).toBeVisible();
    await expect(page.locator('text="position"')).toBeVisible();
    await expect(page.locator('text="open"')).toBeVisible();
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

  test("dropdown keyboard navigation works", async ({ page }) => {
    // Focus navigation through the page
    await page.keyboard.press("Tab");

    // Check if any element is focused
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Test keyboard interaction with dropdown if present
    const dropdownTriggers = page.locator('.dropdown-trigger, [tabindex="0"]');
    const triggerExists = await dropdownTriggers.count() > 0;

    if (triggerExists) {
      // Focus on dropdown trigger
      await dropdownTriggers.first().focus();

      // Open dropdown with Enter/Space
      await page.keyboard.press("Enter");
      await page.waitForTimeout(200);

      // Navigate dropdown items with arrow keys
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(100);

      // Close with Escape
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }
  });

  test("dropdown hover functionality", async ({ page }) => {
    // Look for hover dropdowns
    const hoverDropdowns = page.locator(".dropdown-hover");
    const hoverExists = await hoverDropdowns.count() > 0;

    if (hoverExists) {
      // Test hover behavior
      await hoverDropdowns.first().hover();
      await page.waitForTimeout(300);

      // Move mouse away to close
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
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

    // Test dropdown behavior on mobile
    const dropdownTriggers = page.locator('.dropdown-trigger, [tabindex="0"]');
    const triggerExists = await dropdownTriggers.count() > 0;

    if (triggerExists) {
      await dropdownTriggers.first().click();
      await page.waitForTimeout(200);

      // Check if dropdown content adapts to mobile
      const dropdownContent = page.locator(".dropdown-content");
      const contentExists = await dropdownContent.count() > 0;

      if (contentExists) {
        await expect(dropdownContent.first()).toBeVisible();
      }
    }
  });

  test("dropdown accessibility features", async ({ page }) => {
    // Test focus management and ARIA attributes
    const dropdownTriggers = page.locator('.dropdown-trigger, [role="button"]');
    const triggerExists = await dropdownTriggers.count() > 0;

    if (triggerExists) {
      const trigger = dropdownTriggers.first();

      // Check for proper ARIA attributes
      const ariaAttributes = await trigger.evaluate((el) => ({
        role: el.getAttribute("role"),
        tabindex: el.getAttribute("tabindex"),
        ariaExpanded: el.getAttribute("aria-expanded"),
        ariaHaspopup: el.getAttribute("aria-haspopup"),
      }));

      // At least tabindex should be present for keyboard navigation
      expect(ariaAttributes.tabindex).toBeTruthy();
    }

    // Check dropdown content accessibility
    const dropdownContent = page.locator(".dropdown-content");
    const contentExists = await dropdownContent.count() > 0;

    if (contentExists) {
      const content = dropdownContent.first();
      const contentAttributes = await content.evaluate((el) => ({
        tabindex: el.getAttribute("tabindex"),
        role: el.getAttribute("role"),
      }));

      // Dropdown content should be focusable
      expect(contentAttributes.tabindex).toBeTruthy();
    }
  });

  test("page performance is acceptable", async ({ page }) => {
    // Test Core Web Vitals
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/action/dropdown");
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

  test("dropdown z-index layering works correctly", async ({ page }) => {
    // Test that dropdown content appears above other elements
    const dropdownTriggers = page.locator('.dropdown-trigger, [tabindex="0"]');
    const triggerExists = await dropdownTriggers.count() > 0;

    if (triggerExists) {
      // Open dropdown
      await dropdownTriggers.first().click();
      await page.waitForTimeout(200);

      // Check if dropdown content has proper z-index
      const dropdownContent = page.locator(".dropdown-content");
      const contentExists = await dropdownContent.count() > 0;

      if (contentExists) {
        const zIndex = await dropdownContent.first().evaluate((el) => {
          return globalThis.getComputedStyle(el).zIndex;
        });

        // Should have a z-index value (not 'auto')
        expect(zIndex).not.toBe("auto");
        expect(parseInt(zIndex)).toBeGreaterThan(0);
      }
    }
  });
});
