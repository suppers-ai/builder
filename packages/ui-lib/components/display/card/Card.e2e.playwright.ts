import { expect, test } from "@playwright/test";

test.describe("Card E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/card");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays card examples", async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");

    // Check that the main heading is present
    await expect(page.locator("h1").first()).toContainText("Card");

    // Check that examples are visible
    await expect(page.locator(".card").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    // Check breadcrumbs
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Card");

    // Test navigation to home via breadcrumb
    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    // Navigate back to card
    await page.goBack();
    await expect(page).toHaveURL(/card$/);
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
    await expect(page.locator("aside")).toContainText("Card");
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
    // Test that card examples are present in the documentation
    await expect(page.locator(".card")).toHaveCountGreaterThanOrEqual(3);

    // Look for card-related content
    await expect(page.locator("text=card")).toBeVisible();
  });

  test("card structure is correct", async ({ page }) => {
    // Check that cards have proper structure
    const cards = page.locator(".card");
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // Check first few cards
      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        const card = cards.nth(i);
        await expect(card).toBeVisible();

        // Check if card has card-body
        const cardBody = card.locator(".card-body");
        const hasCardBody = await cardBody.count() > 0;

        if (hasCardBody) {
          await expect(cardBody.first()).toBeVisible();
        }
      }
    }
  });

  test("card images load correctly", async ({ page }) => {
    // Check that card images are present and loaded
    const cardImages = page.locator(".card img");
    const imageCount = await cardImages.count();

    if (imageCount > 0) {
      // Test first few images
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = cardImages.nth(i);
        await expect(img).toBeVisible();

        // Check if image has loaded
        const isComplete = await img.evaluate((img: HTMLImageElement) => img.complete);
        expect(isComplete).toBeTruthy();
      }
    }
  });

  test("card actions are functional", async ({ page }) => {
    // Look for card action buttons
    const cardActions = page.locator(".card-actions button");
    const actionCount = await cardActions.count();

    if (actionCount > 0) {
      // Test clicking card actions
      const firstAction = cardActions.first();
      await expect(firstAction).toBeVisible();

      // Check if button is clickable
      const isEnabled = await firstAction.evaluate((button) => !button.disabled);
      expect(isEnabled).toBeTruthy();

      // Test click interaction
      await firstAction.click();
      await page.waitForTimeout(100);

      // Button should still be visible after click
      await expect(firstAction).toBeVisible();
    }
  });

  test("API documentation is present", async ({ page }) => {
    // Check API props table exists
    await expect(page.locator("table, .api-table")).toBeVisible();

    // Check key props are documented
    await expect(page.locator('text="title"')).toBeVisible();
    await expect(page.locator('text="image"')).toBeVisible();
    await expect(page.locator('text="compact"')).toBeVisible();
    await expect(page.locator('text="side"')).toBeVisible();
    await expect(page.locator('text="glass"')).toBeVisible();
    await expect(page.locator('text="bordered"')).toBeVisible();
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

  test("card accessibility features", async ({ page }) => {
    // Test that card titles have proper heading structure
    const cardTitles = page.locator(".card-title");
    const titleCount = await cardTitles.count();

    if (titleCount > 0) {
      for (let i = 0; i < Math.min(titleCount, 3); i++) {
        const title = cardTitles.nth(i);
        await expect(title).toBeVisible();

        // Title should have text content
        const textContent = await title.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(0);
      }
    }

    // Test card images have alt text
    const cardImages = page.locator(".card img");
    const imageCount = await cardImages.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = cardImages.nth(i);
        const altText = await img.getAttribute("alt");

        // Alt text should exist (can be empty for decorative images)
        expect(altText).not.toBeNull();
      }
    }
  });

  test("card hover interactions", async ({ page }) => {
    // Test card hover effects
    const cards = page.locator(".card");
    const cardCount = await cards.count();

    if (cardCount > 0) {
      const firstCard = cards.first();

      // Test hover behavior
      await firstCard.hover();
      await page.waitForTimeout(100);

      // Card should still be visible after hover
      await expect(firstCard).toBeVisible();

      // Move mouse away
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
    }
  });

  test("card content readability", async ({ page }) => {
    // Test that card content is readable
    const cardBodies = page.locator(".card-body");
    const bodyCount = await cardBodies.count();

    if (bodyCount > 0) {
      for (let i = 0; i < Math.min(bodyCount, 3); i++) {
        const cardBody = cardBodies.nth(i);
        await expect(cardBody).toBeVisible();

        // Check text content exists
        const textContent = await cardBody.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("card layout variations", async ({ page }) => {
    // Test different card layouts
    const compactCards = page.locator(".card-compact");
    const sideCards = page.locator(".card-side");
    const borderedCards = page.locator(".card-bordered");

    const compactCount = await compactCards.count();
    const sideCount = await sideCards.count();
    const borderedCount = await borderedCards.count();

    if (compactCount > 0) {
      await expect(compactCards.first()).toBeVisible();
    }

    if (sideCount > 0) {
      await expect(sideCards.first()).toBeVisible();
    }

    if (borderedCount > 0) {
      await expect(borderedCards.first()).toBeVisible();
    }
  });

  test("card action button interactions", async ({ page }) => {
    // Test card action buttons
    const actionButtons = page.locator(".card-actions button");
    const buttonCount = await actionButtons.count();

    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = actionButtons.nth(i);
        await expect(button).toBeVisible();

        // Check button is clickable
        const isEnabled = await button.evaluate((btn) => !btn.disabled);
        expect(isEnabled).toBeTruthy();

        // Test button text
        const buttonText = await button.textContent();
        expect(buttonText?.trim().length).toBeGreaterThan(0);
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

    // Test cards adapt to mobile
    const cards = page.locator(".card");
    const cardCount = await cards.count();

    if (cardCount > 0) {
      await expect(cards.first()).toBeVisible();

      // Card should maintain proper layout on mobile
      const cardDimensions = await cards.first().boundingBox();
      if (cardDimensions) {
        expect(cardDimensions.width).toBeGreaterThan(0);
        expect(cardDimensions.height).toBeGreaterThan(0);
        // Card should not exceed viewport width
        expect(cardDimensions.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test("card side layout behavior", async ({ page }) => {
    // Test side cards specifically
    const sideCards = page.locator(".card-side");
    const sideCount = await sideCards.count();

    if (sideCount > 0) {
      const firstSideCard = sideCards.first();
      await expect(firstSideCard).toBeVisible();

      // Check if side card has figure and body
      const figure = firstSideCard.locator("figure");
      const cardBody = firstSideCard.locator(".card-body");

      const hasFigure = await figure.count() > 0;
      const hasBody = await cardBody.count() > 0;

      if (hasFigure) {
        await expect(figure.first()).toBeVisible();
      }

      if (hasBody) {
        await expect(cardBody.first()).toBeVisible();
      }
    }
  });

  test("card keyboard navigation", async ({ page }) => {
    // Test keyboard navigation with cards
    await page.keyboard.press("Tab");

    // Check if any card element gets focus
    const focusedElement = page.locator(":focus");
    const hasFocus = await focusedElement.count() > 0;

    if (hasFocus) {
      await expect(focusedElement).toBeVisible();
    }

    // Continue tabbing through card elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(50);
    }

    // Should still be on the page
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("card shadow and elevation", async ({ page }) => {
    // Test card shadow effects
    const cards = page.locator(".card");
    const cardCount = await cards.count();

    if (cardCount > 0) {
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const card = cards.nth(i);
        await expect(card).toBeVisible();

        // Check if card has shadow styling
        const hasShadow = await card.evaluate((el) => {
          const styles = globalThis.getComputedStyle(el);
          return styles.boxShadow !== "none";
        });

        // Most cards should have shadow
        expect(hasShadow).toBeTruthy();
      }
    }
  });

  test("card content overflow handling", async ({ page }) => {
    // Test cards with long content
    const cardBodies = page.locator(".card-body");
    const bodyCount = await cardBodies.count();

    if (bodyCount > 0) {
      for (let i = 0; i < Math.min(bodyCount, 3); i++) {
        const cardBody = cardBodies.nth(i);
        await expect(cardBody).toBeVisible();

        // Check that content doesn't overflow
        const textContent = await cardBody.textContent();
        if (textContent && textContent.length > 100) {
          // For longer content, check that card handles it gracefully
          const bbox = await cardBody.boundingBox();
          expect(bbox?.width).toBeGreaterThan(0);
          expect(bbox?.height).toBeGreaterThan(0);
        }
      }
    }
  });

  test("card semantic structure", async ({ page }) => {
    // Test that cards have proper semantic structure
    const cards = page.locator(".card");
    const cardCount = await cards.count();

    if (cardCount > 0) {
      const firstCard = cards.first();

      // Check card has proper structure
      const cardTitle = firstCard.locator(".card-title");
      const cardBody = firstCard.locator(".card-body");

      const hasTitle = await cardTitle.count() > 0;
      const hasBody = await cardBody.count() > 0;

      if (hasTitle) {
        await expect(cardTitle.first()).toBeVisible();

        // Title should be a heading element
        const titleTag = await cardTitle.first().evaluate((el) => el.tagName.toLowerCase());
        expect(["h1", "h2", "h3", "h4", "h5", "h6"].includes(titleTag)).toBeTruthy();
      }

      if (hasBody) {
        await expect(cardBody.first()).toBeVisible();
      }
    }
  });

  test("page performance is acceptable", async ({ page }) => {
    // Test Core Web Vitals
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/display/card");
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

  test("card background and theming", async ({ page }) => {
    // Test card background and theming
    const cards = page.locator(".card");
    const cardCount = await cards.count();

    if (cardCount > 0) {
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const card = cards.nth(i);
        await expect(card).toBeVisible();

        // Check that card has background
        const hasBackground = await card.evaluate((el) => {
          const styles = globalThis.getComputedStyle(el);
          return styles.backgroundColor !== "rgba(0, 0, 0, 0)";
        });
        expect(hasBackground).toBeTruthy();
      }
    }
  });

  test("card interaction states", async ({ page }) => {
    // Test card interaction states
    const cards = page.locator(".card");
    const cardCount = await cards.count();

    if (cardCount > 0) {
      const firstCard = cards.first();

      // Test hover state
      await firstCard.hover();
      await page.waitForTimeout(100);

      // Test focus state if card is focusable
      const isFocusable = await firstCard.evaluate((el) => {
        return el.tabIndex >= 0 || el.hasAttribute("tabindex");
      });

      if (isFocusable) {
        await firstCard.focus();
        await page.waitForTimeout(100);
      }

      // Card should remain visible
      await expect(firstCard).toBeVisible();
    }
  });
});
