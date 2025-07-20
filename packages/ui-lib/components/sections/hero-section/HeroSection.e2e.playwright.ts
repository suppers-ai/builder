import { expect, test } from "npm:@playwright/test";

test.describe("HeroSection E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/pages/home");
  });

  test("hero section navigation and visibility", async ({ page }) => {
    // Test that hero section is visible on home page
    const section = page.locator("section").filter({ hasText: "Professional DaisyUI Components" });
    await expect(section).toBeVisible();

    // Test main heading
    await expect(page.locator("h1")).toContainText("Professional DaisyUI Components for Fresh");
  });

  test("hero section CTA button navigation", async ({ page }) => {
    // Test "Browse Components" button
    const browseButton = page.locator('a[href="/components"]').filter({
      hasText: "Browse Components",
    });
    await expect(browseButton).toBeVisible();

    await browseButton.click();
    await expect(page).toHaveURL(/components/);

    // Navigate back
    await page.goBack();

    // Test "Get Started" button
    const getStartedButton = page.locator('a[href="/docs/getting-started"]').filter({
      hasText: "Get Started",
    });
    await expect(getStartedButton).toBeVisible();

    await getStartedButton.click();
    await expect(page).toHaveURL(/docs\/getting-started/);

    // Navigate back
    await page.goBack();

    // Test GitHub button (opens in new tab)
    const githubButton = page.locator('a[href="https://github.com"]').filter({ hasText: "GitHub" });
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toHaveAttribute("target", "_blank");
  });

  test("hero section badge interaction", async ({ page }) => {
    // Test Fresh 2.0 support badge
    const badge = page.locator(".inline-flex").filter({ hasText: "New: Fresh 2.0 Support" });
    await expect(badge).toBeVisible();

    // Test badge has pulse animation
    await expect(badge.locator(".animate-pulse")).toBeVisible();
  });

  test("hero section stats display", async ({ page }) => {
    // Test statistics section
    const statsSection = page.locator(".flex").filter({ hasText: "65+" });
    await expect(statsSection).toBeVisible();

    // Test individual stats
    await expect(page.getByText("65+")).toBeVisible();
    await expect(page.getByText("Components")).toBeVisible();
    await expect(page.getByText("100%")).toBeVisible();
    await expect(page.getByText("DaisyUI Coverage")).toBeVisible();
    await expect(page.getByText("29")).toBeVisible();
    await expect(page.getByText("Themes")).toBeVisible();
    await expect(page.getByText("TypeScript")).toBeVisible();
    await expect(page.getByText("Full Support")).toBeVisible();
  });

  test("hero section social proof", async ({ page }) => {
    // Test social proof elements
    await expect(page.getByText("Trusted by developers")).toBeVisible();
    await expect(page.getByText("Production ready")).toBeVisible();
    await expect(page.getByText("Lightning fast")).toBeVisible();
    await expect(page.getByText("Fully themeable")).toBeVisible();

    // Test icons are present with social proof
    const socialProofIcons = page.locator(".flex").filter({ hasText: "Trusted by developers" })
      .locator("svg");
    const iconCount = await socialProofIcons.count();
    expect(iconCount).toBeGreaterThan(0);
  });

  test("hero section button hover effects", async ({ page }) => {
    // Test primary button hover
    const browseButton = page.locator('a[href="/components"]').filter({
      hasText: "Browse Components",
    });
    await expect(browseButton).toBeVisible();

    // Hover and test arrow animation
    await browseButton.hover();
    await page.waitForTimeout(200);

    const arrow = browseButton.locator("svg");
    if (await arrow.count() > 0) {
      await expect(arrow.first()).toBeVisible();
    }

    // Test outline button hover
    const getStartedButton = page.locator('a[href="/docs/getting-started"]').filter({
      hasText: "Get Started",
    });
    await getStartedButton.hover();
    await page.waitForTimeout(100);
    await expect(getStartedButton).toBeVisible();
  });

  test("hero section responsive design", async ({ page }) => {
    // Test responsive behavior
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Ensure hero section remains visible and properly laid out
      const section = page.locator("section").filter({
        hasText: "Professional DaisyUI Components",
      });
      await expect(section).toBeVisible();

      // Test heading visibility and scaling
      const heading = page.locator("h1").filter({ hasText: "Professional DaisyUI Components" });
      await expect(heading).toBeVisible();

      // Test CTA buttons remain accessible
      const browseButton = page.locator('a[href="/components"]').filter({
        hasText: "Browse Components",
      });
      await expect(browseButton).toBeVisible();

      // Ensure no horizontal overflow
      const sectionBox = await section.boundingBox();
      expect(sectionBox?.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test("hero section accessibility", async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press("Tab");

    let tabCount = 0;
    let reachedCTA = false;

    while (tabCount < 15) { // Limit tab attempts
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      tabCount++;

      // Check if we've reached a CTA button
      const focusedText = await focused.textContent();
      if (focusedText?.includes("Browse Components") || focusedText?.includes("Get Started")) {
        reachedCTA = true;

        // Test enter key activation
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);

        // Should navigate away from home page
        const currentUrl = page.url();
        expect(currentUrl).not.toMatch(/\/pages\/home$/);
        break;
      }
    }

    expect(reachedCTA).toBe(true);
  });

  test("hero section theme compatibility", async ({ page }) => {
    // Test hero section with different themes
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(300); // Allow theme transition

      // Ensure hero section remains visible and readable
      const section = page.locator("section").filter({
        hasText: "Professional DaisyUI Components",
      });
      await expect(section).toBeVisible();

      // Test gradient text remains visible
      const gradientText = page.locator(".text-transparent.bg-clip-text");
      if (await gradientText.count() > 0) {
        await expect(gradientText.first()).toBeVisible();
      }

      // Test buttons remain visible and styled
      const buttons = page.locator(".btn");
      for (let i = 0; i < Math.min(3, await buttons.count()); i++) {
        await expect(buttons.nth(i)).toBeVisible();
      }
    }
  });

  test("hero section background effects", async ({ page }) => {
    // Test background decorative elements
    const gradientSection = page.locator(".bg-gradient-to-br");
    await expect(gradientSection).toBeVisible();

    // Test background blur elements
    const blurElements = page.locator(".blur-3xl");
    if (await blurElements.count() > 0) {
      for (let i = 0; i < await blurElements.count(); i++) {
        await expect(blurElements.nth(i)).toBeVisible();
      }
    }
  });

  test("hero section wave SVG", async ({ page }) => {
    // Test bottom wave SVG
    const waveSvg = page.locator("svg").filter({ hasText: "" }); // SVG might not have visible text
    if (await waveSvg.count() > 0) {
      await expect(waveSvg.first()).toBeVisible();

      // Test SVG has proper viewBox
      const viewBox = await waveSvg.first().getAttribute("viewBox");
      expect(viewBox).toBeTruthy();
    }
  });

  test("hero section performance", async ({ page }) => {
    // Test loading performance
    const startTime = Date.now();

    await page.goto("http://localhost:8000/pages/home");

    // Wait for hero section to be visible
    const section = page.locator("section").filter({ hasText: "Professional DaisyUI Components" });
    await expect(section).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

    // Test that all critical elements are loaded
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".btn")).toHaveCount(3); // Should have 3 CTA buttons
  });

  test("hero section content structure", async ({ page }) => {
    // Test semantic HTML structure
    const section = page.locator("section").filter({ hasText: "Professional DaisyUI Components" });
    await expect(section).toBeVisible();

    // Test proper heading hierarchy
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1); // Should have exactly one h1

    // Test paragraph content
    const subtitle = page.locator("p").filter({
      hasText: "The most comprehensive DaisyUI component library",
    });
    await expect(subtitle).toBeVisible();
  });
});
