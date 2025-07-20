import { expect, test } from "@playwright/test";

test.describe("Stat E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/stat");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays stat examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Stat/);
    await expect(page.locator("h1")).toContainText("Stat");
    await expect(page.locator(".stat").first()).toBeVisible();
  });

  test("stat basic structure is correct", async ({ page }) => {
    const stats = page.locator(".stat");
    const statCount = await stats.count();

    expect(statCount).toBeGreaterThan(0);

    // Check first stat has required elements
    const firstStat = stats.first();
    const statValue = firstStat.locator(".stat-value");
    await expect(statValue).toBeVisible();

    const valueText = await statValue.textContent();
    expect(valueText?.trim()).toBeTruthy();
  });

  test("stat with title and description", async ({ page }) => {
    const statsWithTitle = page.locator(".stat:has(.stat-title)");
    const titleCount = await statsWithTitle.count();

    if (titleCount > 0) {
      const statWithTitle = statsWithTitle.first();

      const title = statWithTitle.locator(".stat-title");
      const value = statWithTitle.locator(".stat-value");

      await expect(title).toBeVisible();
      await expect(value).toBeVisible();

      const titleText = await title.textContent();
      const valueText = await value.textContent();

      expect(titleText?.trim()).toBeTruthy();
      expect(valueText?.trim()).toBeTruthy();
    }
  });

  test("stat figures are displayed correctly", async ({ page }) => {
    const statsWithFigure = page.locator(".stat:has(.stat-figure)");
    const figureCount = await statsWithFigure.count();

    if (figureCount > 0) {
      const statWithFigure = statsWithFigure.first();
      const figure = statWithFigure.locator(".stat-figure");

      await expect(figure).toBeVisible();

      // Check if figure contains icon or image
      const icon = figure.locator("svg, img, .avatar");
      if (await icon.count() > 0) {
        await expect(icon.first()).toBeVisible();
      }
    }
  });

  test("stat actions are interactive", async ({ page }) => {
    const statsWithActions = page.locator(".stat:has(.stat-actions)");
    const actionCount = await statsWithActions.count();

    if (actionCount > 0) {
      const statWithActions = statsWithActions.first();
      const actions = statWithActions.locator(".stat-actions");

      await expect(actions).toBeVisible();

      // Check for interactive elements
      const buttons = actions.locator("button, a");
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        const firstButton = buttons.first();
        await expect(firstButton).toBeVisible();
        await expect(firstButton).toBeEnabled();

        // Click button
        await firstButton.click();

        // Button should still be visible after click
        await expect(firstButton).toBeVisible();
      }
    }
  });

  test("clickable stat functionality", async ({ page }) => {
    const clickableStats = page.locator(".stat.cursor-pointer, .stat[onclick]");
    const clickableCount = await clickableStats.count();

    if (clickableCount > 0) {
      const clickableStat = clickableStats.first();

      await expect(clickableStat).toBeVisible();

      // Click stat
      await clickableStat.click();

      // Stat should still be visible after click
      await expect(clickableStat).toBeVisible();
    }
  });

  test("stat accessibility attributes", async ({ page }) => {
    const stats = page.locator(".stat");
    const statCount = await stats.count();

    for (let i = 0; i < Math.min(statCount, 3); i++) {
      const stat = stats.nth(i);

      // Check for proper heading structure
      const headings = stat.locator("h1, h2, h3, h4, h5, h6");
      const headingCount = await headings.count();

      // Check stat value is prominent
      const statValue = stat.locator(".stat-value");
      await expect(statValue).toBeVisible();

      const valueText = await statValue.textContent();
      expect(valueText?.trim().length).toBeGreaterThan(0);

      // Check stat title provides context
      const statTitle = stat.locator(".stat-title");
      if (await statTitle.count() > 0) {
        const titleText = await statTitle.textContent();
        expect(titleText?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("stat keyboard navigation", async ({ page }) => {
    // Focus first interactive element in stats
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    const focusedCount = await focusedElement.count();

    if (focusedCount > 0) {
      const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
      expect(["button", "a", "div"]).toContain(tagName);

      // If it's an interactive stat, test activation
      if (tagName === "button" || tagName === "a") {
        await page.keyboard.press("Enter");
        await expect(focusedElement).toBeVisible();
      }
    }
  });

  test("stat responsive behavior", async ({ page }) => {
    const statsContainer = page.locator(".stats").first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(statsContainer).toBeVisible();

    // Check stats are displayed horizontally on desktop
    const statsRect = await statsContainer.boundingBox();
    expect(statsRect?.width).toBeGreaterThan(statsRect?.height || 0);

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(statsContainer).toBeVisible();

    // Stats should still be readable on mobile
    const statValues = page.locator(".stat-value");
    const valueCount = await statValues.count();

    for (let i = 0; i < Math.min(valueCount, 3); i++) {
      await expect(statValues.nth(i)).toBeVisible();
    }
  });

  test("stat with trend indicators", async ({ page }) => {
    const statsWithDesc = page.locator(".stat:has(.stat-desc)");
    const descCount = await statsWithDesc.count();

    if (descCount > 0) {
      const statWithDesc = statsWithDesc.first();
      const description = statWithDesc.locator(".stat-desc");

      await expect(description).toBeVisible();

      const descText = await description.textContent();
      expect(descText?.trim()).toBeTruthy();

      // Check for trend indicators (arrows, percentages)
      const hasTrend = descText?.includes("↗") || descText?.includes("↘") ||
        descText?.includes("%") || descText?.includes("increase") ||
        descText?.includes("decrease");

      if (hasTrend) {
        // Trend indicators should be properly styled
        const textColor = await description.evaluate((el) => getComputedStyle(el).color);
        expect(textColor).toBeTruthy();
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="title"')).toBeVisible();
    await expect(page.locator('text="value"')).toBeVisible();
    await expect(page.locator('text="description"')).toBeVisible();
    await expect(page.locator('text="figure"')).toBeVisible();
    await expect(page.locator('text="actions"')).toBeVisible();
  });
});
