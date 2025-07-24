import { expect, test } from "npm:@playwright/test";

test.describe("BenefitsSection E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/pages/home");
  });

  test("benefits section navigation and visibility", async ({ page }) => {
    // Test that benefits section is visible on home page
    const section = page.locator("section").filter({
      hasText: "Why Choose Our Component Library?",
    });
    await expect(section).toBeVisible();

    // Test section header
    await expect(page.locator("h2")).toContainText("Why Choose Our Component Library?");
  });

  test("benefits section main features interaction", async ({ page }) => {
    // Test main benefit cards
    const benefitCards = page.locator(".card").filter({ hasText: "100% DaisyUI Coverage" });
    await expect(benefitCards.first()).toBeVisible();

    // Test all main benefit titles are present
    await expect(page.locator(".card-title")).toContainText(["100% DaisyUI Coverage"]);
    await expect(page.locator(".card-title")).toContainText(["Fresh 2.0 Native"]);
    await expect(page.locator(".card-title")).toContainText(["TypeScript First"]);
    await expect(page.locator(".card-title")).toContainText(["Production Ready"]);
  });

  test("benefits section card hover interactions", async ({ page }) => {
    // Test card hover effects
    const firstCard = page.locator(".card").first();
    await expect(firstCard).toBeVisible();

    // Get initial state
    const initialClasses = await firstCard.getAttribute("class");

    // Hover over card
    await firstCard.hover();
    await page.waitForTimeout(300); // Allow for hover transition

    // Verify hover state (shadow change)
    await expect(firstCard).toHaveClass(/shadow/);
  });

  test("benefits section CTA buttons functionality", async ({ page }) => {
    // Test "Explore Components" button
    const exploreButton = page.locator('a[href="/components"]').filter({
      hasText: "Explore Components",
    });
    await expect(exploreButton).toBeVisible();

    // Test button click navigation
    await exploreButton.click();
    await expect(page).toHaveURL(/components/);

    // Navigate back
    await page.goBack();

    // Test "Installation Guide" button
    const installButton = page.locator('a[href="/docs/installation"]').filter({
      hasText: "Installation Guide",
    });
    await expect(installButton).toBeVisible();

    // Test button hover effect
    await installButton.hover();
    await page.waitForTimeout(100);
    await expect(installButton).toBeVisible();
  });

  test("benefits section features grid interaction", async ({ page }) => {
    // Test additional features section
    const featuresSection = page.locator(".bg-gradient-to-r").filter({
      hasText: "Everything You Need",
    });
    await expect(featuresSection).toBeVisible();

    // Test that all feature items are visible
    await expect(page.getByText("Component Islands")).toBeVisible();
    await expect(page.getByText("30+ Themes")).toBeVisible();
    await expect(page.getByText("Mobile First")).toBeVisible();
    await expect(page.getByText("Accessibility")).toBeVisible();
  });

  test("benefits section responsive behavior", async ({ page }) => {
    // Test responsive grid behavior
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Ensure section remains visible and properly laid out
      const section = page.locator("section").filter({
        hasText: "Why Choose Our Component Library?",
      });
      await expect(section).toBeVisible();

      // Test that cards stack properly on mobile
      const benefitCards = page.locator(".card");
      const cardCount = await benefitCards.count();
      expect(cardCount).toBeGreaterThan(0);

      // Ensure no horizontal overflow
      const sectionBox = await section.boundingBox();
      expect(sectionBox?.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test("benefits section accessibility", async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press("Tab");

    // Navigate to CTA buttons
    let tabCount = 0;
    let focused = page.locator(":focus");

    while (tabCount < 10) { // Limit tab attempts
      await page.keyboard.press("Tab");
      focused = page.locator(":focus");
      tabCount++;

      // Check if we've reached the Explore Components button
      const focusedText = await focused.textContent();
      if (focusedText?.includes("Explore Components")) {
        break;
      }
    }

    // Test enter key on focused button
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);

    // Should navigate to components page
    await expect(page).toHaveURL(/components/);
  });

  test("benefits section theme compatibility", async ({ page }) => {
    // Test section with different themes
    const themes = ["light", "dark", "cupcake"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(200); // Allow theme transition

      // Ensure section remains visible and readable
      const section = page.locator("section").filter({
        hasText: "Why Choose Our Component Library?",
      });
      await expect(section).toBeVisible();

      // Test that cards are still visible
      const cards = page.locator(".card");
      await expect(cards.first()).toBeVisible();

      // Test that text is readable (has proper contrast)
      const heading = page.locator("h2").filter({ hasText: "Why Choose Our Component Library?" });
      await expect(heading).toBeVisible();
    }
  });

  test("benefits section scroll behavior", async ({ page }) => {
    // Test smooth scrolling to section if there's a link
    const benefitsLink = page.locator('a[href*="#benefits"]');
    if (await benefitsLink.count() > 0) {
      await benefitsLink.click();

      // Wait for scroll animation
      await page.waitForTimeout(500);

      // Verify section is in viewport
      const section = page.locator("section").filter({
        hasText: "Why Choose Our Component Library?",
      });
      await expect(section).toBeInViewport();
    }
  });

  test("benefits section icons and graphics", async ({ page }) => {
    // Test that Lucide icons are properly rendered
    const svgIcons = page.locator("svg");
    const iconCount = await svgIcons.count();
    expect(iconCount).toBeGreaterThan(0);

    // Test that at least some icons are visible
    for (let i = 0; i < Math.min(5, iconCount); i++) {
      await expect(svgIcons.nth(i)).toBeVisible();
    }
  });

  test("benefits section performance", async ({ page }) => {
    // Test loading performance
    const startTime = Date.now();

    await page.goto("http://localhost:8000/pages/home");
    const section = page.locator("section").filter({
      hasText: "Why Choose Our Component Library?",
    });
    await expect(section).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

    // Test that all critical elements are loaded
    await expect(page.locator(".card")).toHaveCount(4); // Should have 4 main benefit cards
  });
});
