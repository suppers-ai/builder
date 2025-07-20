import { expect, test } from "npm:@playwright/test";

test.describe("BenefitsSection Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/pages/home"); // Assuming this is where BenefitsSection is used
  });

  test("benefits section full view", async ({ page }) => {
    const section = page.locator("section").filter({
      hasText: "Why Choose Our Component Library?",
    });
    await expect(section).toHaveScreenshot("benefits-section-full.png");
  });

  test("benefits section main benefits grid", async ({ page }) => {
    const benefitsGrid = page.locator(".grid").filter({ hasText: "100% DaisyUI Coverage" });
    await expect(benefitsGrid).toHaveScreenshot("benefits-section-main-grid.png");
  });

  test("benefits section additional features", async ({ page }) => {
    const featuresSection = page.locator(".bg-gradient-to-r").filter({
      hasText: "Everything You Need",
    });
    await expect(featuresSection).toHaveScreenshot("benefits-section-features.png");
  });

  test("benefits section CTA", async ({ page }) => {
    const ctaSection = page.locator(".text-center").filter({ hasText: "Ready to Get Started?" });
    await expect(ctaSection).toHaveScreenshot("benefits-section-cta.png");
  });

  test("benefits section themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100); // Allow theme transition
      const section = page.locator("section").filter({
        hasText: "Why Choose Our Component Library?",
      });
      await expect(section).toHaveScreenshot(`benefits-section-theme-${theme}.png`);
    }
  });

  test("benefits section responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const section = page.locator("section").filter({
        hasText: "Why Choose Our Component Library?",
      });
      await expect(section).toHaveScreenshot(`benefits-section-${viewport.name}.png`);
    }
  });

  test("benefits section card hover states", async ({ page }) => {
    const firstCard = page.locator(".card").first();

    // Normal state
    await expect(firstCard).toHaveScreenshot("benefits-card-normal.png");

    // Hover state
    await firstCard.hover();
    await page.waitForTimeout(200); // Allow for hover transition
    await expect(firstCard).toHaveScreenshot("benefits-card-hover.png");
  });

  test("benefits section button interactions", async ({ page }) => {
    const exploreButton = page.locator('a[href="/components"]').filter({
      hasText: "Explore Components",
    });
    const installButton = page.locator('a[href="/docs/installation"]').filter({
      hasText: "Installation Guide",
    });

    // Normal states
    await expect(exploreButton).toHaveScreenshot("benefits-explore-button-normal.png");
    await expect(installButton).toHaveScreenshot("benefits-install-button-normal.png");

    // Hover states
    await exploreButton.hover();
    await expect(exploreButton).toHaveScreenshot("benefits-explore-button-hover.png");

    await installButton.hover();
    await expect(installButton).toHaveScreenshot("benefits-install-button-hover.png");
  });
});
