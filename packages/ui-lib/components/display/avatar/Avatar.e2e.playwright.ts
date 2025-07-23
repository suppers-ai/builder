import { expect, test } from "@playwright/test";

test.describe("Avatar E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/avatar");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays avatar examples", async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle("daisyUI Component Library - Fresh 2.0");

    // Check that the main heading is present
    await expect(page.locator("h1").first()).toContainText("Avatar");

    // Check that examples are visible
    await expect(page.locator(".card").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    // Check breadcrumbs
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Avatar");

    // Test navigation to home via breadcrumb
    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    // Navigate back to avatar
    await page.goBack();
    await expect(page).toHaveURL(/avatar$/);
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
    await expect(page.locator("aside")).toContainText("Avatar");
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
    // Test that avatar examples are present in the documentation
    await expect(page.locator(".card")).toHaveCountGreaterThanOrEqual(3);

    // Look for avatar-related content
    await expect(page.locator("text=avatar")).toBeVisible();
  });

  test("avatar images load correctly", async ({ page }) => {
    // Check that avatar images are present and loaded
    const avatarImages = page.locator(".avatar img");
    const imageCount = await avatarImages.count();

    if (imageCount > 0) {
      // Test first few images
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = avatarImages.nth(i);
        await expect(img).toBeVisible();

        // Check if image has loaded
        const isComplete = await img.evaluate((img: HTMLImageElement) => img.complete);
        expect(isComplete).toBeTruthy();
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    // Check API props table exists
    await expect(page.locator("table, .api-table")).toBeVisible();

    // Check key props are documented
    await expect(page.locator('text="src"')).toBeVisible();
    await expect(page.locator('text="alt"')).toBeVisible();
    await expect(page.locator('text="size"')).toBeVisible();
    await expect(page.locator('text="ring"')).toBeVisible();
    await expect(page.locator('text="online"')).toBeVisible();
    await expect(page.locator('text="offline"')).toBeVisible();
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

  test("avatar accessibility features", async ({ page }) => {
    // Test that avatar images have proper alt text
    const avatarImages = page.locator(".avatar img");
    const imageCount = await avatarImages.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = avatarImages.nth(i);
        const altText = await img.getAttribute("alt");

        // Alt text should exist (can be empty for decorative images)
        expect(altText).not.toBeNull();
      }
    }

    // Check placeholder avatars have appropriate text
    const placeholders = page.locator(".avatar .placeholder");
    const placeholderCount = await placeholders.count();

    if (placeholderCount > 0) {
      const firstPlaceholder = placeholders.first();
      await expect(firstPlaceholder).toBeVisible();

      // Should contain text content
      const textContent = await firstPlaceholder.textContent();
      expect(textContent?.trim().length).toBeGreaterThan(0);
    }
  });

  test("avatar size variations display correctly", async ({ page }) => {
    // Test different avatar sizes if present in examples
    const avatars = page.locator(".avatar");
    const avatarCount = await avatars.count();

    if (avatarCount >= 3) {
      // Check various avatars are visible
      for (let i = 0; i < Math.min(avatarCount, 5); i++) {
        const avatar = avatars.nth(i);
        await expect(avatar).toBeVisible();

        // Check if avatar has expected structure
        const hasImage = await avatar.locator("img").count() > 0;
        const hasPlaceholder = await avatar.locator(".placeholder").count() > 0;

        // Should have either image or placeholder
        expect(hasImage || hasPlaceholder).toBeTruthy();
      }
    }
  });

  test("avatar status indicators work", async ({ page }) => {
    // Look for online/offline status indicators
    const onlineAvatars = page.locator(".avatar.online");
    const offlineAvatars = page.locator(".avatar.offline");

    const onlineCount = await onlineAvatars.count();
    const offlineCount = await offlineAvatars.count();

    if (onlineCount > 0) {
      await expect(onlineAvatars.first()).toBeVisible();
      // Online indicator should be present (usually a green dot)
      await expect(onlineAvatars.first()).toHaveClass(/online/);
    }

    if (offlineCount > 0) {
      await expect(offlineAvatars.first()).toBeVisible();
      // Offline indicator should be present (usually a gray dot)
      await expect(offlineAvatars.first()).toHaveClass(/offline/);
    }
  });

  test("avatar rings display correctly", async ({ page }) => {
    // Look for avatars with rings
    const ringAvatars = page.locator(".avatar img.ring, .avatar .ring");
    const ringCount = await ringAvatars.count();

    if (ringCount > 0) {
      const firstRingAvatar = ringAvatars.first();
      await expect(firstRingAvatar).toBeVisible();

      // Should have ring classes
      const hasRing = await firstRingAvatar.evaluate((el) => el.classList.contains("ring"));
      expect(hasRing).toBeTruthy();
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

    // Test avatars still display correctly on mobile
    const avatars = page.locator(".avatar");
    const avatarCount = await avatars.count();

    if (avatarCount > 0) {
      await expect(avatars.first()).toBeVisible();

      // Avatar should maintain proper aspect ratio on mobile
      const avatarDimensions = await avatars.first().boundingBox();
      if (avatarDimensions) {
        expect(avatarDimensions.width).toBeGreaterThan(0);
        expect(avatarDimensions.height).toBeGreaterThan(0);
      }
    }
  });

  test("avatar groups stack correctly", async ({ page }) => {
    // Look for avatar groups if present
    const avatarGroups = page.locator(".avatar-group");
    const groupCount = await avatarGroups.count();

    if (groupCount > 0) {
      const firstGroup = avatarGroups.first();
      await expect(firstGroup).toBeVisible();

      // Check that group contains multiple avatars
      const groupAvatars = firstGroup.locator(".avatar");
      const groupAvatarCount = await groupAvatars.count();
      expect(groupAvatarCount).toBeGreaterThanOrEqual(2);

      // Check each avatar in group is visible
      for (let i = 0; i < Math.min(groupAvatarCount, 5); i++) {
        await expect(groupAvatars.nth(i)).toBeVisible();
      }
    }
  });

  test("avatar placeholder fallbacks work", async ({ page }) => {
    // Test that placeholders display when images fail
    const placeholderAvatars = page.locator(".avatar .placeholder");
    const placeholderCount = await placeholderAvatars.count();

    if (placeholderCount > 0) {
      for (let i = 0; i < Math.min(placeholderCount, 3); i++) {
        const placeholder = placeholderAvatars.nth(i);
        await expect(placeholder).toBeVisible();

        // Should have background and text content
        const hasBackground = await placeholder.evaluate((el) => {
          const styles = globalThis.getComputedStyle(el);
          return styles.backgroundColor !== "rgba(0, 0, 0, 0)";
        });
        expect(hasBackground).toBeTruthy();

        const textContent = await placeholder.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("page performance is acceptable", async ({ page }) => {
    // Test Core Web Vitals
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/display/avatar");
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

  test("avatar hover effects work", async ({ page }) => {
    // Test hover effects if any avatars have them
    const avatars = page.locator(".avatar");
    const avatarCount = await avatars.count();

    if (avatarCount > 0) {
      const firstAvatar = avatars.first();

      // Take initial state
      const initialState = await firstAvatar.boundingBox();

      // Hover over avatar
      await firstAvatar.hover();
      await page.waitForTimeout(100);

      // Check if hover state is applied (avatar should still be visible)
      await expect(firstAvatar).toBeVisible();

      // Move mouse away
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
    }
  });

  test("avatar keyboard navigation", async ({ page }) => {
    // Test keyboard navigation if avatars are focusable
    await page.keyboard.press("Tab");

    // Check if any avatar or related element gets focus
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

  test("avatar semantic structure", async ({ page }) => {
    // Test that avatars have proper semantic structure
    const avatars = page.locator(".avatar");
    const avatarCount = await avatars.count();

    if (avatarCount > 0) {
      const firstAvatar = avatars.first();

      // Check if avatar contains img or placeholder
      const hasImg = await firstAvatar.locator("img").count() > 0;
      const hasPlaceholder = await firstAvatar.locator(".placeholder").count() > 0;

      expect(hasImg || hasPlaceholder).toBeTruthy();

      if (hasImg) {
        const img = firstAvatar.locator("img").first();
        const altAttribute = await img.getAttribute("alt");
        // Alt attribute should exist (even if empty for decorative images)
        expect(altAttribute).not.toBeNull();
      }
    }
  });
});
