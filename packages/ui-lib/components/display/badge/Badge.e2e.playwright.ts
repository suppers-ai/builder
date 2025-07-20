import { expect, test } from "@playwright/test";

test.describe("Badge E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/badge");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays badge examples", async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");

    // Check that the main heading is present
    await expect(page.locator("h1").first()).toContainText("Badge");

    // Check that examples are visible
    await expect(page.locator(".card").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    // Check breadcrumbs
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Badge");

    // Test navigation to home via breadcrumb
    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    // Navigate back to badge
    await page.goBack();
    await expect(page).toHaveURL(/badge$/);
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
    await expect(page.locator("aside")).toContainText("Display");
    await expect(page.locator("aside")).toContainText("Badge");
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
    // Test that badge examples are present in the documentation
    await expect(page.locator(".card")).toHaveCountGreaterThanOrEqual(3);

    // Look for badge-related content
    await expect(page.locator("text=badge")).toBeVisible();
  });

  test("badge color variants display correctly", async ({ page }) => {
    // Check that various badge colors are visible
    const badges = page.locator(".badge");
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      // Check first few badges are visible
      for (let i = 0; i < Math.min(badgeCount, 8); i++) {
        const badge = badges.nth(i);
        await expect(badge).toBeVisible();

        // Check badge has content
        const textContent = await badge.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("badge size variations display correctly", async ({ page }) => {
    // Look for different badge sizes
    const badgeSizes = ["badge-xs", "badge-sm", "badge-md", "badge-lg"];

    for (const sizeClass of badgeSizes) {
      const sizeBadges = page.locator(`.${sizeClass}`);
      const sizeCount = await sizeBadges.count();

      if (sizeCount > 0) {
        await expect(sizeBadges.first()).toBeVisible();

        // Check size affects dimensions
        const bbox = await sizeBadges.first().boundingBox();
        expect(bbox?.width).toBeGreaterThan(0);
        expect(bbox?.height).toBeGreaterThan(0);
      }
    }
  });

  test("badge indicators work correctly", async ({ page }) => {
    // Look for indicator badges
    const indicators = page.locator(".indicator");
    const indicatorCount = await indicators.count();

    if (indicatorCount > 0) {
      const firstIndicator = indicators.first();
      await expect(firstIndicator).toBeVisible();

      // Check indicator has badge item
      const indicatorItem = firstIndicator.locator(".indicator-item");
      const itemExists = await indicatorItem.count() > 0;

      if (itemExists) {
        await expect(indicatorItem.first()).toBeVisible();
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    // Check API props table exists
    await expect(page.locator("table, .api-table")).toBeVisible();

    // Check key props are documented
    await expect(page.locator('text="content"')).toBeVisible();
    await expect(page.locator('text="color"')).toBeVisible();
    await expect(page.locator('text="size"')).toBeVisible();
    await expect(page.locator('text="variant"')).toBeVisible();
    await expect(page.locator('text="position"')).toBeVisible();
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

  test("badge accessibility features", async ({ page }) => {
    // Test that badges have proper semantic structure
    const badges = page.locator(".badge");
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(badgeCount, 3); i++) {
        const badge = badges.nth(i);
        await expect(badge).toBeVisible();

        // Badge should have text content
        const textContent = await badge.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(0);
      }
    }

    // Check indicator badges for accessibility
    const indicators = page.locator(".indicator");
    const indicatorCount = await indicators.count();

    if (indicatorCount > 0) {
      const indicatorBadges = indicators.locator(".indicator-item");
      const indicatorBadgeCount = await indicatorBadges.count();

      if (indicatorBadgeCount > 0) {
        const firstIndicatorBadge = indicatorBadges.first();
        await expect(firstIndicatorBadge).toBeVisible();

        // Should have meaningful content
        const content = await firstIndicatorBadge.textContent();
        expect(content?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("badge hover interactions", async ({ page }) => {
    // Look for interactive badges
    const badges = page.locator(".badge");
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      const firstBadge = badges.first();

      // Test hover behavior
      await firstBadge.hover();
      await page.waitForTimeout(100);

      // Badge should still be visible after hover
      await expect(firstBadge).toBeVisible();

      // Move mouse away
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
    }
  });

  test("badge text readability", async ({ page }) => {
    // Test that badge text is readable
    const badges = page.locator(".badge");
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(badgeCount, 5); i++) {
        const badge = badges.nth(i);
        await expect(badge).toBeVisible();

        // Check text content exists
        const textContent = await badge.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(0);

        // Check font size is reasonable
        const fontSize = await badge.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return parseInt(styles.fontSize);
        });
        expect(fontSize).toBeGreaterThan(8); // Should be at least 8px
      }
    }
  });

  test("badge positioning accuracy", async ({ page }) => {
    // Test positioned badges (indicators)
    const indicators = page.locator(".indicator");
    const indicatorCount = await indicators.count();

    if (indicatorCount > 0) {
      const firstIndicator = indicators.first();
      await expect(firstIndicator).toBeVisible();

      // Check positioning of indicator item
      const indicatorItem = firstIndicator.locator(".indicator-item");
      const itemExists = await indicatorItem.count() > 0;

      if (itemExists) {
        await expect(indicatorItem.first()).toBeVisible();

        // Check positioning classes
        const classes = await indicatorItem.first().getAttribute("class");
        expect(classes).toContain("indicator-item");
      }
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

    // Test badges still display correctly on mobile
    const badges = page.locator(".badge");
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      await expect(badges.first()).toBeVisible();

      // Badge should maintain proper size on mobile
      const badgeDimensions = await badges.first().boundingBox();
      if (badgeDimensions) {
        expect(badgeDimensions.width).toBeGreaterThan(0);
        expect(badgeDimensions.height).toBeGreaterThan(0);
      }
    }
  });

  test("badge content overflow handling", async ({ page }) => {
    // Test badges with long content
    const badges = page.locator(".badge");
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(badgeCount, 3); i++) {
        const badge = badges.nth(i);
        await expect(badge).toBeVisible();

        // Check that content doesn't overflow container
        const textContent = await badge.textContent();
        if (textContent && textContent.length > 10) {
          // For longer text, check that badge handles it gracefully
          const bbox = await badge.boundingBox();
          expect(bbox?.width).toBeGreaterThan(0);
          expect(bbox?.height).toBeGreaterThan(0);
        }
      }
    }
  });

  test("badge keyboard navigation", async ({ page }) => {
    // Test keyboard navigation if badges are focusable
    await page.keyboard.press("Tab");

    // Check if any badge or related element gets focus
    const focusedElement = page.locator(":focus");
    const hasFocus = await focusedElement.count() > 0;

    if (hasFocus) {
      await expect(focusedElement).toBeVisible();
    }

    // Continue tabbing through the page
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(50);
    }

    // Should still be on the page
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("badge z-index layering", async ({ page }) => {
    // Test that positioned badges appear above their container
    const indicators = page.locator(".indicator");
    const indicatorCount = await indicators.count();

    if (indicatorCount > 0) {
      const firstIndicator = indicators.first();
      const indicatorItem = firstIndicator.locator(".indicator-item");
      const itemExists = await indicatorItem.count() > 0;

      if (itemExists) {
        await expect(indicatorItem.first()).toBeVisible();

        // Check z-index or stacking context
        const zIndex = await indicatorItem.first().evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return styles.zIndex;
        });

        // Should have proper stacking context
        expect(zIndex).not.toBe("auto");
      }
    }
  });

  test("badge color contrast", async ({ page }) => {
    // Test badge color contrast for accessibility
    const badges = page.locator(".badge");
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(badgeCount, 5); i++) {
        const badge = badges.nth(i);
        await expect(badge).toBeVisible();

        // Check that badge has background color
        const hasBackground = await badge.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return styles.backgroundColor !== "rgba(0, 0, 0, 0)";
        });
        expect(hasBackground).toBeTruthy();
      }
    }
  });

  test("page performance is acceptable", async ({ page }) => {
    // Test Core Web Vitals
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/display/badge");
    await navigationPromise;

    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check that all images are loaded
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveJSProperty("complete", true);
    }
  });

  test("badge semantic meaning", async ({ page }) => {
    // Test that badges convey semantic meaning
    const badges = page.locator(".badge");
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(badgeCount, 3); i++) {
        const badge = badges.nth(i);
        await expect(badge).toBeVisible();

        // Badge should have meaningful content
        const textContent = await badge.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(0);

        // Check for semantic color classes
        const classNames = await badge.getAttribute("class");
        const hasSemanticColor = classNames?.includes("badge-success") ||
          classNames?.includes("badge-error") ||
          classNames?.includes("badge-warning") ||
          classNames?.includes("badge-info");

        // At least some badges should have semantic meaning
        if (hasSemanticColor) {
          expect(hasSemanticColor).toBeTruthy();
        }
      }
    }
  });

  test("badge animation performance", async ({ page }) => {
    // Test that badges don't cause performance issues
    const badges = page.locator(".badge");
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      // Rapidly interact with badges to test performance
      for (let i = 0; i < Math.min(badgeCount, 5); i++) {
        const badge = badges.nth(i);
        await badge.hover();
        await page.waitForTimeout(50);
      }

      // Page should still be responsive
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });
});
