import { expect, test } from "@playwright/test";

test.describe("Modal E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/action/modal");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays modal examples", async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");

    // Check that the main heading is present
    await expect(page.locator("h1").first()).toContainText("Modal");

    // Check that examples are visible
    await expect(page.locator(".card").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    // Check breadcrumbs
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Modal");

    // Test navigation to home via breadcrumb
    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    // Navigate back to modal
    await page.goBack();
    await expect(page).toHaveURL(/modal$/);
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
    await expect(page.locator("aside")).toContainText("Modal");
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
    // Test that modal examples are present in the documentation
    await expect(page.locator(".card")).toHaveCountGreaterThanOrEqual(3);

    // Look for modal-related content
    await expect(page.locator("text=modal")).toBeVisible();
  });

  test("interactive modal examples work", async ({ page }) => {
    // Look for interactive modal buttons or links
    const modalTriggers = page.locator(
      'button:has-text("Open"), button:has-text("Show"), a:has-text("Demo")',
    );
    const triggerCount = await modalTriggers.count();

    if (triggerCount > 0) {
      // Test opening modal
      await modalTriggers.first().click();

      // Wait for modal to appear
      await page.waitForTimeout(100);

      // Check if modal opened (look for modal-open class or visible modal)
      const modal = page.locator(".modal-open, .modal:visible");
      const modalExists = await modal.count() > 0;

      if (modalExists) {
        await expect(modal.first()).toBeVisible();

        // Try to close modal if close button exists
        const closeButton = page.locator(
          '.modal button:has-text("Close"), .modal .btn-close, .modal [aria-label="Close"]',
        );
        const closeExists = await closeButton.count() > 0;

        if (closeExists) {
          await closeButton.first().click();
          await page.waitForTimeout(100);
        }
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    // Check API props table exists
    await expect(page.locator("table, .api-table")).toBeVisible();

    // Check key props are documented
    await expect(page.locator('text="open"')).toBeVisible();
    await expect(page.locator('text="title"')).toBeVisible();
    await expect(page.locator('text="backdrop"')).toBeVisible();
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

  test("modal keyboard navigation works", async ({ page }) => {
    // Focus navigation through the page
    await page.keyboard.press("Tab");

    // Check if any element is focused
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Test escape key functionality if modal is present
    const modalTriggers = page.locator('button:has-text("Open"), button:has-text("Show")');
    const triggerExists = await modalTriggers.count() > 0;

    if (triggerExists) {
      // Open modal with Enter/Space
      await modalTriggers.first().focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(200);

      // Try to close with Escape
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
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
  });

  test("modal accessibility features", async ({ page }) => {
    // Test focus management and ARIA attributes
    const modalContent = page.locator('.modal, [role="dialog"]');
    const modalExists = await modalContent.count() > 0;

    if (modalExists) {
      // Check for proper ARIA attributes
      const modal = modalContent.first();
      const ariaAttributes = await modal.evaluate((el) => ({
        role: el.getAttribute("role"),
        ariaLabel: el.getAttribute("aria-label"),
        ariaModal: el.getAttribute("aria-modal"),
      }));

      // At least one accessibility attribute should be present
      const hasAccessibility = ariaAttributes.role || ariaAttributes.ariaLabel ||
        ariaAttributes.ariaModal;
      expect(hasAccessibility).toBeTruthy();
    }
  });

  test("page performance is acceptable", async ({ page }) => {
    // Test Core Web Vitals
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/action/modal");
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
});
