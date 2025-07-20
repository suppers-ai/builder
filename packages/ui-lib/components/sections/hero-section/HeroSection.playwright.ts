import { expect, test } from "npm:@playwright/test";

test.describe("HeroSection Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/pages/home"); // Assuming this is where HeroSection is used
  });

  test("hero section full view", async ({ page }) => {
    const section = page.locator("section").filter({ hasText: "Professional DaisyUI Components" });
    await expect(section).toHaveScreenshot("hero-section-full.png");
  });

  test("hero section main heading", async ({ page }) => {
    const heading = page.locator("h1").filter({ hasText: "Professional DaisyUI Components" });
    await expect(heading).toHaveScreenshot("hero-section-heading.png");
  });

  test("hero section stats", async ({ page }) => {
    const statsSection = page.locator(".flex").filter({ hasText: "65+" });
    await expect(statsSection).toHaveScreenshot("hero-section-stats.png");
  });

  test("hero section CTA buttons", async ({ page }) => {
    const ctaSection = page.locator(".flex").filter({ hasText: "Browse Components" });
    await expect(ctaSection).toHaveScreenshot("hero-section-cta.png");
  });

  test("hero section badge", async ({ page }) => {
    const badge = page.locator(".inline-flex").filter({ hasText: "New: Fresh 2.0 Support" });
    await expect(badge).toHaveScreenshot("hero-section-badge.png");
  });

  test("hero section social proof", async ({ page }) => {
    const socialProof = page.locator(".flex").filter({ hasText: "Trusted by developers" });
    await expect(socialProof).toHaveScreenshot("hero-section-social-proof.png");
  });

  test("hero section themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100); // Allow theme transition
      const section = page.locator("section").filter({
        hasText: "Professional DaisyUI Components",
      });
      await expect(section).toHaveScreenshot(`hero-section-theme-${theme}.png`);
    }
  });

  test("hero section responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const section = page.locator("section").filter({
        hasText: "Professional DaisyUI Components",
      });
      await expect(section).toHaveScreenshot(`hero-section-${viewport.name}.png`);
    }
  });

  test("hero section button interactions", async ({ page }) => {
    const browseButton = page.locator('a[href="/components"]').filter({
      hasText: "Browse Components",
    });
    const getStartedButton = page.locator('a[href="/docs/getting-started"]').filter({
      hasText: "Get Started",
    });
    const githubButton = page.locator('a[href="https://github.com"]').filter({ hasText: "GitHub" });

    // Normal states
    await expect(browseButton).toHaveScreenshot("hero-browse-button-normal.png");
    await expect(getStartedButton).toHaveScreenshot("hero-get-started-button-normal.png");
    await expect(githubButton).toHaveScreenshot("hero-github-button-normal.png");

    // Hover states
    await browseButton.hover();
    await expect(browseButton).toHaveScreenshot("hero-browse-button-hover.png");

    await getStartedButton.hover();
    await expect(getStartedButton).toHaveScreenshot("hero-get-started-button-hover.png");

    await githubButton.hover();
    await expect(githubButton).toHaveScreenshot("hero-github-button-hover.png");
  });

  test("hero section gradient background", async ({ page }) => {
    const gradientSection = page.locator(".bg-gradient-to-br");
    await expect(gradientSection).toHaveScreenshot("hero-section-gradient-bg.png");
  });

  test("hero section wave svg", async ({ page }) => {
    const waveElement = page.locator("svg").filter({ hasText: "" }); // SVG might not have text
    if (await waveElement.count() > 0) {
      await expect(waveElement).toHaveScreenshot("hero-section-wave.png");
    }
  });
});
