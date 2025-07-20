import { expect, test } from "@playwright/test";

test.describe("Hero E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/hero");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays hero examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Hero/);
    await expect(page.locator("h1")).toContainText("Hero");
    await expect(page.locator(".hero").first()).toBeVisible();
  });

  test("hero CTA buttons are functional", async ({ page }) => {
    const ctaButtons = page.locator(".hero .btn");
    const buttonCount = await ctaButtons.count();

    if (buttonCount > 0) {
      const primaryButton = ctaButtons.first();

      // Button should be visible and clickable
      await expect(primaryButton).toBeVisible();
      await expect(primaryButton).toBeEnabled();

      // Click button (check for any interaction)
      await primaryButton.click();

      // Check if button is still visible after click
      await expect(primaryButton).toBeVisible();
    }
  });

  test("hero secondary CTA buttons work", async ({ page }) => {
    const secondaryButtons = page.locator(".hero .btn-outline, .hero .btn-secondary");
    const buttonCount = await secondaryButtons.count();

    if (buttonCount > 0) {
      const secondaryButton = secondaryButtons.first();

      await expect(secondaryButton).toBeVisible();
      await secondaryButton.click();

      // Should remain functional after click
      await expect(secondaryButton).toBeVisible();
    }
  });

  test("hero content is properly structured", async ({ page }) => {
    const heroes = page.locator(".hero");
    const heroCount = await heroes.count();

    if (heroCount > 0) {
      const firstHero = heroes.first();

      // Should have hero-content
      const heroContent = firstHero.locator(".hero-content");
      await expect(heroContent).toBeVisible();

      // Should have heading
      const heading = firstHero.locator("h1, h2");
      await expect(heading.first()).toBeVisible();

      // Should have some text content
      const textContent = await firstHero.textContent();
      expect(textContent?.trim().length).toBeGreaterThan(10);
    }
  });

  test("hero images load correctly", async ({ page }) => {
    const heroImages = page.locator(".hero img");
    const imageCount = await heroImages.count();

    for (let i = 0; i < imageCount; i++) {
      const img = heroImages.nth(i);

      // Check if image is loaded
      await expect(img).toBeVisible();

      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test("hero background videos work (if present)", async ({ page }) => {
    const heroVideos = page.locator(".hero video");
    const videoCount = await heroVideos.count();

    if (videoCount > 0) {
      const video = heroVideos.first();

      await expect(video).toBeVisible();

      // Check video attributes
      const autoplay = await video.getAttribute("autoplay");
      const muted = await video.getAttribute("muted");
      const loop = await video.getAttribute("loop");

      // Background videos should typically be autoplay, muted, and loop
      expect(autoplay).toBeTruthy();
      expect(muted).toBeTruthy();
      expect(loop).toBeTruthy();
    }
  });

  test("hero responsive layout works", async ({ page }) => {
    const hero = page.locator(".hero").first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(hero).toBeVisible();

    // Check if content is properly laid out on desktop
    const heroContent = hero.locator(".hero-content");
    await expect(heroContent).toBeVisible();

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(hero).toBeVisible();

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(hero).toBeVisible();

    // Content should still be readable on mobile
    const heading = hero.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("hero keyboard navigation works", async ({ page }) => {
    // Focus first interactive element in hero
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    const focusedCount = await focusedElement.count();

    if (focusedCount > 0) {
      // Should be able to focus elements within hero
      const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
      expect(["button", "a", "input"]).toContain(tagName);

      // Should be able to activate with Enter/Space
      if (tagName === "button" || tagName === "a") {
        await page.keyboard.press("Enter");

        // Element should still be focusable after activation
        await expect(focusedElement).toBeVisible();
      }
    }
  });

  test("hero accessibility attributes", async ({ page }) => {
    const heroes = page.locator(".hero");
    const heroCount = await heroes.count();

    for (let i = 0; i < Math.min(heroCount, 3); i++) {
      const hero = heroes.nth(i);

      // Check for proper heading hierarchy
      const headings = hero.locator("h1, h2, h3, h4, h5, h6");
      const headingCount = await headings.count();

      if (headingCount > 0) {
        const firstHeading = headings.first();
        const headingText = await firstHeading.textContent();
        expect(headingText?.trim()).toBeTruthy();
      }

      // Check for alt text on images
      const images = hero.locator("img");
      const imageCount = await images.count();

      for (let j = 0; j < imageCount; j++) {
        const img = images.nth(j);
        const alt = await img.getAttribute("alt");
        const src = await img.getAttribute("src");

        // Alt text should be present unless it's decorative
        if (src && !src.includes("placeholder")) {
          expect(alt).toBeTruthy();
        }
      }
    }
  });

  test("hero CTA links navigation", async ({ page }) => {
    const ctaLinks = page.locator(".hero a.btn");
    const linkCount = await ctaLinks.count();

    if (linkCount > 0) {
      const link = ctaLinks.first();
      const href = await link.getAttribute("href");

      if (href && href !== "#" && !href.startsWith("javascript:")) {
        // Click link and verify navigation
        await link.click();

        await page.waitForLoadState("networkidle");
        const currentUrl = page.url();

        // Should have navigated or stayed on same page
        expect(currentUrl).toBeTruthy();
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="title"')).toBeVisible();
    await expect(page.locator('text="subtitle"')).toBeVisible();
    await expect(page.locator('text="primaryCTA"')).toBeVisible();
    await expect(page.locator('text="secondaryCTA"')).toBeVisible();
  });

  test("hero performance is acceptable", async ({ page }) => {
    // Test loading performance
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/layout/hero");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Hero sections should load quickly
    expect(loadTime).toBeLessThan(5000);

    // Check for layout shift by verifying hero dimensions are stable
    const hero = page.locator(".hero").first();
    await page.waitForTimeout(500);

    const dimensions1 = await hero.boundingBox();
    await page.waitForTimeout(500);
    const dimensions2 = await hero.boundingBox();

    // Hero should maintain stable dimensions (no layout shift)
    expect(dimensions1?.height).toBe(dimensions2?.height);
  });
});
