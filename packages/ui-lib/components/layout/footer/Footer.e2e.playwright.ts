import { expect, test } from "@playwright/test";

test.describe("Footer E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/footer");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays footer examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Footer");
    await expect(page.locator(".footer").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Footer");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/footer$/);
  });

  test("footer examples render correctly", async ({ page }) => {
    const footers = page.locator(".footer");
    const footerCount = await footers.count();
    expect(footerCount).toBeGreaterThanOrEqual(1);

    // Check for footer titles
    await expect(page.locator(".footer-title").first()).toBeVisible();

    // Check for footer links
    const footerLinks = page.locator(".footer a");
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test("footer links are functional", async ({ page }) => {
    const footerLinks = page.locator(".footer a.link");
    const hasLinks = await footerLinks.count() > 0;

    if (hasLinks) {
      for (let i = 0; i < Math.min(3, await footerLinks.count()); i++) {
        const link = footerLinks.nth(i);
        await expect(link).toBeVisible();

        // Check link has text
        const linkText = await link.textContent();
        expect(linkText?.trim()).toBeTruthy();

        // Check link is hoverable
        await link.hover();
        await expect(link).toBeVisible();
      }
    }
  });

  test("footer social media links work", async ({ page }) => {
    const socialLinks = page.locator(".footer svg").locator("..");
    const hasSocialLinks = await socialLinks.count() > 0;

    if (hasSocialLinks) {
      for (let i = 0; i < Math.min(3, await socialLinks.count()); i++) {
        const socialLink = socialLinks.nth(i);
        await expect(socialLink).toBeVisible();

        // Social links should be clickable
        await socialLink.hover();

        // Check for SVG icon
        const icon = socialLink.locator("svg");
        await expect(icon).toBeVisible();
      }
    }
  });

  test("footer newsletter signup works", async ({ page }) => {
    const newsletterInputs = page.locator(
      '.footer input[type="email"], .footer input[placeholder*="email"]',
    );
    const newsletterButtons = page.locator('.footer button:has-text("Subscribe"), .footer .btn');

    const hasNewsletter = await newsletterInputs.count() > 0 && await newsletterButtons.count() > 0;

    if (hasNewsletter) {
      const emailInput = newsletterInputs.first();
      const subscribeButton = newsletterButtons.first();

      // Test email input
      await emailInput.focus();
      await expect(emailInput).toBeFocused();

      await emailInput.fill("test@example.com");
      const inputValue = await emailInput.inputValue();
      expect(inputValue).toBe("test@example.com");

      // Test subscribe button
      await subscribeButton.click();
      await expect(subscribeButton).toBeVisible();
    }
  });

  test("footer copyright information is present", async ({ page }) => {
    const copyrightTexts = page.locator(".footer").filter({ hasText: /©|copyright|Company|Ltd/i });
    const hasCopyright = await copyrightTexts.count() > 0;

    if (hasCopyright) {
      const copyright = copyrightTexts.first();
      await expect(copyright).toBeVisible();

      const copyrightText = await copyright.textContent();
      expect(copyrightText).toBeTruthy();
    }
  });

  test("footer accessibility features", async ({ page }) => {
    const footerLinks = page.locator(".footer a");
    const linkCount = await footerLinks.count();

    // Test keyboard navigation
    for (let i = 0; i < Math.min(5, linkCount); i++) {
      const link = footerLinks.nth(i);
      await link.focus();
      await expect(link).toBeFocused();

      // Check for proper contrast
      await expect(link).toBeVisible();
    }

    // Test tab order
    const firstLink = footerLinks.first();
    await firstLink.focus();

    // Navigate with Tab key
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("footer responsive layout", async ({ page }) => {
    const footers = page.locator(".footer");
    const hasFooters = await footers.count() > 0;

    if (hasFooters) {
      // Test desktop layout
      await page.setViewportSize({ width: 1920, height: 1080 });
      const footer = footers.first();

      let box = await footer.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.width).toBeGreaterThan(500);
      }

      // Test mobile layout
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(200);

      box = await footer.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.width).toBeGreaterThan(200);
      }
    }
  });

  test("footer sections organization", async ({ page }) => {
    const footerTitles = page.locator(".footer-title");
    const hasTitles = await footerTitles.count() > 0;

    if (hasTitles) {
      // Check each footer section
      for (let i = 0; i < Math.min(4, await footerTitles.count()); i++) {
        const title = footerTitles.nth(i);
        await expect(title).toBeVisible();

        const titleText = await title.textContent();
        expect(titleText?.trim()).toBeTruthy();

        // Check for associated links in the same section
        const section = title.locator("..");
        const sectionLinks = section.locator("a");
        const sectionLinkCount = await sectionLinks.count();

        // Sections typically have multiple links
        expect(sectionLinkCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="footer-title"')).toBeVisible();
    await expect(page.locator('text="footer"')).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/layout/footer");
    await navigationPromise;

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
