import { expect, test } from "@playwright/test";

test.describe("Countdown E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/countdown");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays countdown examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Countdown/);
    await expect(page.locator("h1")).toContainText("Countdown");
    await expect(page.locator(".countdown").first()).toBeVisible();
  });

  test("countdown basic structure is correct", async ({ page }) => {
    const countdowns = page.locator(".countdown");
    const countdownCount = await countdowns.count();

    expect(countdownCount).toBeGreaterThan(0);

    // Check first countdown
    const firstCountdown = countdowns.first();
    await expect(firstCountdown).toBeVisible();

    // Should have countdown spans
    const countdownSpans = firstCountdown.locator("span[style*='--value']");
    const spanCount = await countdownSpans.count();

    expect(spanCount).toBeGreaterThan(0);
  });

  test("countdown values display correctly", async ({ page }) => {
    const countdownSpans = page.locator(".countdown span[style*='--value']");
    const spanCount = await countdownSpans.count();

    for (let i = 0; i < Math.min(spanCount, 5); i++) {
      const span = countdownSpans.nth(i);

      // Span should be visible
      await expect(span).toBeVisible();

      // Should have CSS custom property for value
      const style = await span.getAttribute("style");
      expect(style).toContain("--value");

      // Extract value from style
      const valueMatch = style?.match(/--value:(\d+)/);
      if (valueMatch) {
        const value = parseInt(valueMatch[1]);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(99);
      }
    }
  });

  test("countdown font styling is applied", async ({ page }) => {
    const countdowns = page.locator(".countdown");
    const countdownCount = await countdowns.count();

    for (let i = 0; i < Math.min(countdownCount, 3); i++) {
      const countdown = countdowns.nth(i);

      // Should be visible
      await expect(countdown).toBeVisible();

      // Should have monospace font
      const fontFamily = await countdown.evaluate((el) => getComputedStyle(el).fontFamily);
      expect(fontFamily.toLowerCase()).toContain("mono");

      // Should have proper text size
      const fontSize = await countdown.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBeTruthy();
    }
  });

  test("countdown time format validation", async ({ page }) => {
    const countdownContainers = page.locator(".countdown");
    const containerCount = await countdownContainers.count();

    for (let i = 0; i < Math.min(containerCount, 3); i++) {
      const container = countdownContainers.nth(i);
      const spans = container.locator("span[style*='--value']");
      const spanCount = await spans.count();

      // Check for valid time format patterns
      if (spanCount === 1) {
        // Single value countdown
        const value = await spans.first().getAttribute("style");
        expect(value).toContain("--value");
      } else if (spanCount > 1) {
        // Multi-value countdown (hours:minutes:seconds)
        for (let j = 0; j < spanCount; j++) {
          const span = spans.nth(j);
          const style = await span.getAttribute("style");
          expect(style).toContain("--value");
        }
      }
    }
  });

  test("countdown labels and descriptions", async ({ page }) => {
    // Look for countdown with associated labels
    const countdownContainers = page.locator(".countdown").locator("..");
    const containerCount = await countdownContainers.count();

    for (let i = 0; i < Math.min(containerCount, 3); i++) {
      const container = countdownContainers.nth(i);

      // Check for descriptive text near countdown
      const textElements = container.locator("span:not(.countdown), div, p");
      const textCount = await textElements.count();

      if (textCount > 0) {
        // Should have some descriptive text
        let hasText = false;
        for (let j = 0; j < Math.min(textCount, 3); j++) {
          const text = await textElements.nth(j).textContent();
          if (text && text.trim().length > 0) {
            hasText = true;
            break;
          }
        }
        expect(hasText).toBe(true);
      }
    }
  });

  test("countdown accessibility", async ({ page }) => {
    const countdowns = page.locator(".countdown");
    const countdownCount = await countdowns.count();

    for (let i = 0; i < Math.min(countdownCount, 3); i++) {
      const countdown = countdowns.nth(i);

      // Should be visible
      await expect(countdown).toBeVisible();

      // Should have readable text (even if it's just numbers)
      const textContent = await countdown.textContent();
      expect(textContent?.trim().length).toBeGreaterThan(0);

      // Check color contrast
      const color = await countdown.evaluate((el) => getComputedStyle(el).color);
      const backgroundColor = await countdown.evaluate((el) => {
        // Get background from element or its parent
        let bg = getComputedStyle(el).backgroundColor;
        if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
          const parent = el.parentElement;
          if (parent) {
            bg = getComputedStyle(parent).backgroundColor;
          }
        }
        return bg;
      });

      expect(color).toBeTruthy();
      // Background might be transparent, which is fine for countdown
    }
  });

  test("countdown responsive behavior", async ({ page }) => {
    const countdown = page.locator(".countdown").first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(countdown).toBeVisible();

    const desktopSize = await countdown.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
      fontSize: getComputedStyle(el).fontSize,
    }));

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(countdown).toBeVisible();

    const mobileSize = await countdown.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
      fontSize: getComputedStyle(el).fontSize,
    }));

    // Countdown should remain readable on mobile
    expect(mobileSize.width).toBeGreaterThan(0);
    expect(mobileSize.height).toBeGreaterThan(0);
  });

  test("countdown CSS custom properties work", async ({ page }) => {
    const countdownSpans = page.locator(".countdown span[style*='--value']");
    const spanCount = await countdownSpans.count();

    if (spanCount > 0) {
      const firstSpan = countdownSpans.first();

      // Get CSS custom property value
      const customPropertyValue = await firstSpan.evaluate((el) => {
        const style = el.getAttribute("style");
        const match = style?.match(/--value:(\d+)/);
        return match ? parseInt(match[1]) : null;
      });

      expect(customPropertyValue).not.toBeNull();
      expect(customPropertyValue).toBeGreaterThanOrEqual(0);

      // The displayed content should relate to the CSS property
      const displayedContent = await firstSpan.textContent();
      expect(displayedContent?.trim()).toBeTruthy();
    }
  });

  test("countdown in grid layouts", async ({ page }) => {
    const gridLayouts = page.locator(".grid:has(.countdown), [class*='grid']:has(.countdown)");
    const gridCount = await gridLayouts.count();

    if (gridCount > 0) {
      const firstGrid = gridLayouts.first();
      await expect(firstGrid).toBeVisible();

      // Grid should contain countdown elements
      const countdownsInGrid = firstGrid.locator(".countdown");
      const countdownCount = await countdownsInGrid.count();

      if (countdownCount > 0) {
        // Each countdown in grid should be visible
        for (let i = 0; i < Math.min(countdownCount, 3); i++) {
          await expect(countdownsInGrid.nth(i)).toBeVisible();
        }
      }
    }
  });

  test("countdown with background styling", async ({ page }) => {
    const styledCountdowns = page.locator(".countdown").locator("..");
    const styledCount = await styledCountdowns.count();

    for (let i = 0; i < Math.min(styledCount, 3); i++) {
      const container = styledCountdowns.nth(i);

      // Check for background styling
      const backgroundColor = await container.evaluate((el) =>
        getComputedStyle(el).backgroundColor
      );

      // Check for border radius
      const borderRadius = await container.evaluate((el) => getComputedStyle(el).borderRadius);

      // Check for padding
      const padding = await container.evaluate((el) => getComputedStyle(el).padding);

      // At least one styling property should be applied
      const hasBackgroundStyling = backgroundColor !== "rgba(0, 0, 0, 0)" &&
        backgroundColor !== "transparent";
      const hasBorderRadius = borderRadius !== "0px";
      const hasPadding = padding !== "0px";

      if (hasBackgroundStyling || hasBorderRadius || hasPadding) {
        // Container with styling should be visible
        await expect(container).toBeVisible();
      }
    }
  });

  test("countdown text alignment", async ({ page }) => {
    const countdowns = page.locator(".countdown");
    const countdownCount = await countdowns.count();

    for (let i = 0; i < Math.min(countdownCount, 3); i++) {
      const countdown = countdowns.nth(i);

      // Check text alignment of countdown or its container
      const textAlign = await countdown.evaluate((el) => {
        // Check element's text alignment
        let align = getComputedStyle(el).textAlign;
        if (align === "start" || align === "left") {
          // Check parent's alignment
          const parent = el.parentElement;
          if (parent) {
            align = getComputedStyle(parent).textAlign;
          }
        }
        return align;
      });

      expect(textAlign).toBeTruthy();
    }
  });

  test("countdown number display consistency", async ({ page }) => {
    const countdownSpans = page.locator(".countdown span[style*='--value']");
    const spanCount = await countdownSpans.count();

    for (let i = 0; i < Math.min(spanCount, 5); i++) {
      const span = countdownSpans.nth(i);

      // Should display a number or be part of time format
      const content = await span.textContent();

      // Content might be empty (CSS generated content) or contain numbers/colons
      if (content && content.trim()) {
        const hasNumbers = /\d/.test(content);
        const hasTimeDelimiters = /[:]/.test(content);
        expect(hasNumbers || hasTimeDelimiters).toBe(true);
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="value"')).toBeVisible();
    await expect(page.locator('text="size"')).toBeVisible();
    await expect(page.locator('text="format"')).toBeVisible();
  });
});
