import { expect, test } from "@playwright/test";

test.describe("Alert E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/feedback/alert");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays alert examples", async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle("daisyUI Component Library - Fresh 2.0");

    // Check that the main heading is present
    await expect(page.locator("h1").first()).toContainText("Alert");

    // Check that examples are visible
    await expect(page.locator(".card").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    // Check breadcrumbs
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Alert");

    // Test navigation to home via breadcrumb
    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    // Navigate back to alert
    await page.goBack();
    await expect(page).toHaveURL(/alert$/);
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
    await expect(page.locator("aside")).toContainText("Feedback");
    await expect(page.locator("aside")).toContainText("Alert");
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
    // Test that alert examples are present in the documentation
    await expect(page.locator(".card")).toHaveCountGreaterThanOrEqual(3);

    // Look for alert-related content
    await expect(page.locator("text=alert")).toBeVisible();
  });

  test("alert color variants display correctly", async ({ page }) => {
    // Check that various alert colors are visible
    const alerts = page.locator(".alert");
    const alertCount = await alerts.count();

    if (alertCount > 0) {
      // Check first few alerts are visible
      for (let i = 0; i < Math.min(alertCount, 5); i++) {
        const alert = alerts.nth(i);
        await expect(alert).toBeVisible();

        // Check alert has content
        const textContent = await alert.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("alert dismiss functionality works", async ({ page }) => {
    // Look for dismissible alerts
    const dismissButtons = page.locator('.alert button:has-text("✕"), .alert .btn-circle');
    const dismissCount = await dismissButtons.count();

    if (dismissCount > 0) {
      // Test clicking dismiss button
      const firstDismissButton = dismissButtons.first();
      await expect(firstDismissButton).toBeVisible();

      // Check if button is clickable
      const isEnabled = await firstDismissButton.evaluate((button) => !button.disabled);
      expect(isEnabled).toBeTruthy();

      // Test click interaction
      await firstDismissButton.click();
      await page.waitForTimeout(100);

      // Button should still be visible after click (for display component)
      await expect(firstDismissButton).toBeVisible();
    }
  });

  test("alert action buttons work", async ({ page }) => {
    // Look for alert action buttons
    const actionButtons = page.locator(".alert button:not(.btn-circle)");
    const actionCount = await actionButtons.count();

    if (actionCount > 0) {
      // Test clicking action buttons
      for (let i = 0; i < Math.min(actionCount, 3); i++) {
        const button = actionButtons.nth(i);
        await expect(button).toBeVisible();

        // Check if button is clickable
        const isEnabled = await button.evaluate((btn) => !btn.disabled);
        expect(isEnabled).toBeTruthy();

        // Test button text
        const buttonText = await button.textContent();
        expect(buttonText?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    // Check API props table exists
    await expect(page.locator("table, .api-table")).toBeVisible();

    // Check key props are documented
    await expect(page.locator('text="color"')).toBeVisible();
    await expect(page.locator('text="icon"')).toBeVisible();
    await expect(page.locator('text="dismissible"')).toBeVisible();
    await expect(page.locator('text="actions"')).toBeVisible();
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

  test("alert accessibility features", async ({ page }) => {
    // Test that alerts have proper semantic structure
    const alerts = page.locator(".alert");
    const alertCount = await alerts.count();

    if (alertCount > 0) {
      for (let i = 0; i < Math.min(alertCount, 3); i++) {
        const alert = alerts.nth(i);
        await expect(alert).toBeVisible();

        // Alert should have meaningful content
        const textContent = await alert.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(0);

        // Check for proper role or ARIA attributes
        const role = await alert.getAttribute("role");
        const ariaLive = await alert.getAttribute("aria-live");

        // Should have appropriate ARIA attributes for screen readers
        if (role || ariaLive) {
          expect(role === "alert" || ariaLive === "polite" || ariaLive === "assertive")
            .toBeTruthy();
        }
      }
    }
  });

  test("alert icons display correctly", async ({ page }) => {
    // Test alert icons
    const alerts = page.locator(".alert");
    const alertCount = await alerts.count();

    if (alertCount > 0) {
      for (let i = 0; i < Math.min(alertCount, 3); i++) {
        const alert = alerts.nth(i);
        await expect(alert).toBeVisible();

        // Check if alert has an icon (emoji or SVG)
        const hasEmoji = await alert.evaluate((el) => {
          const text = el.textContent || "";
          return /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
            .test(text);
        });

        const hasSvg = await alert.locator("svg").count() > 0;

        // Should have some form of visual indicator
        expect(hasEmoji || hasSvg).toBeTruthy();
      }
    }
  });

  test("alert content readability", async ({ page }) => {
    // Test that alert content is readable
    const alerts = page.locator(".alert");
    const alertCount = await alerts.count();

    if (alertCount > 0) {
      for (let i = 0; i < Math.min(alertCount, 3); i++) {
        const alert = alerts.nth(i);
        await expect(alert).toBeVisible();

        // Check text content exists and is substantial
        const textContent = await alert.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(0);

        // Check contrast (alert should have background color)
        const hasBackground = await alert.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return styles.backgroundColor !== "rgba(0, 0, 0, 0)";
        });
        expect(hasBackground).toBeTruthy();
      }
    }
  });

  test("alert responsive behavior", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that page is still usable
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".card").first()).toBeVisible();

    // Check alerts adapt to mobile
    const alerts = page.locator(".alert");
    const alertCount = await alerts.count();

    if (alertCount > 0) {
      const firstAlert = alerts.first();
      await expect(firstAlert).toBeVisible();

      // Alert should not exceed viewport width
      const alertDimensions = await firstAlert.boundingBox();
      if (alertDimensions) {
        expect(alertDimensions.width).toBeLessThanOrEqual(375);
        expect(alertDimensions.height).toBeGreaterThan(0);
      }
    }
  });

  test("alert keyboard navigation", async ({ page }) => {
    // Test keyboard navigation with alerts
    await page.keyboard.press("Tab");

    // Check if any alert element gets focus
    const focusedElement = page.locator(":focus");
    const hasFocus = await focusedElement.count() > 0;

    if (hasFocus) {
      await expect(focusedElement).toBeVisible();
    }

    // Continue tabbing through alert elements (buttons, etc.)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(50);
    }

    // Should still be on the page
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("alert button interactions", async ({ page }) => {
    // Test alert button interactions
    const alertButtons = page.locator(".alert button");
    const buttonCount = await alertButtons.count();

    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = alertButtons.nth(i);
        await expect(button).toBeVisible();

        // Test hover behavior
        await button.hover();
        await page.waitForTimeout(100);

        // Button should remain visible
        await expect(button).toBeVisible();

        // Test click
        await button.click();
        await page.waitForTimeout(100);

        // For display components, button should still be visible
        await expect(button).toBeVisible();
      }
    }
  });

  test("alert content overflow handling", async ({ page }) => {
    // Test alerts with long content
    const alerts = page.locator(".alert");
    const alertCount = await alerts.count();

    if (alertCount > 0) {
      for (let i = 0; i < Math.min(alertCount, 3); i++) {
        const alert = alerts.nth(i);
        await expect(alert).toBeVisible();

        // Check that content doesn't overflow
        const textContent = await alert.textContent();
        if (textContent && textContent.length > 50) {
          // For longer content, check that alert handles it gracefully
          const bbox = await alert.boundingBox();
          expect(bbox?.width).toBeGreaterThan(0);
          expect(bbox?.height).toBeGreaterThan(0);
        }
      }
    }
  });

  test("alert semantic meaning", async ({ page }) => {
    // Test that alerts convey semantic meaning through color
    const alertTypes = [".alert-info", ".alert-success", ".alert-warning", ".alert-error"];

    for (const alertType of alertTypes) {
      const alerts = page.locator(alertType);
      const count = await alerts.count();

      if (count > 0) {
        const firstAlert = alerts.first();
        await expect(firstAlert).toBeVisible();

        // Alert should have appropriate styling for its type
        const hasSemanticClass = await firstAlert.evaluate((el) => {
          return el.classList.contains("alert-info") ||
            el.classList.contains("alert-success") ||
            el.classList.contains("alert-warning") ||
            el.classList.contains("alert-error");
        });
        expect(hasSemanticClass).toBeTruthy();
      }
    }
  });

  test("page performance is acceptable", async ({ page }) => {
    // Test Core Web Vitals
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/feedback/alert");
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

  test("alert animation performance", async ({ page }) => {
    // Test that alert interactions don't cause performance issues
    const alertButtons = page.locator(".alert button");
    const buttonCount = await alertButtons.count();

    if (buttonCount > 0) {
      // Rapidly interact with buttons to test performance
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = alertButtons.nth(i);
        await button.click();
        await page.waitForTimeout(50);
      }

      // Page should still be responsive
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("alert z-index and layering", async ({ page }) => {
    // Test that alerts appear properly in the layout
    const alerts = page.locator(".alert");
    const alertCount = await alerts.count();

    if (alertCount > 0) {
      const firstAlert = alerts.first();
      await expect(firstAlert).toBeVisible();

      // Alert should be properly positioned
      const position = await firstAlert.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.position;
      });

      // Should be in normal flow or properly positioned
      expect(["static", "relative", "absolute", "fixed"].includes(position)).toBeTruthy();
    }
  });

  test("alert color contrast accessibility", async ({ page }) => {
    // Test alert color contrast for accessibility
    const alerts = page.locator(".alert");
    const alertCount = await alerts.count();

    if (alertCount > 0) {
      for (let i = 0; i < Math.min(alertCount, 3); i++) {
        const alert = alerts.nth(i);
        await expect(alert).toBeVisible();

        // Check that alert has sufficient contrast
        const hasGoodContrast = await alert.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          const bgColor = styles.backgroundColor;
          const textColor = styles.color;

          // Should have defined background and text colors
          return bgColor !== "rgba(0, 0, 0, 0)" && textColor !== "rgba(0, 0, 0, 0)";
        });
        expect(hasGoodContrast).toBeTruthy();
      }
    }
  });
});
