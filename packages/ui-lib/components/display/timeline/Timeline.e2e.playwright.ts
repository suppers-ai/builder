import { expect, test } from "@playwright/test";

test.describe("Timeline E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/timeline");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays timeline examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Timeline/);
    await expect(page.locator("h1")).toContainText("Timeline");
    await expect(page.locator(".timeline").first()).toBeVisible();
  });

  test("timeline basic structure is correct", async ({ page }) => {
    const timelines = page.locator(".timeline");
    const timelineCount = await timelines.count();

    expect(timelineCount).toBeGreaterThan(0);

    // Check first timeline
    const firstTimeline = timelines.first();
    await expect(firstTimeline).toBeVisible();

    // Should be a list
    const tagName = await firstTimeline.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("ul");

    // Should have timeline items
    const items = firstTimeline.locator("li");
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test("timeline items have proper structure", async ({ page }) => {
    const timelineItems = page.locator(".timeline li");
    const itemCount = await timelineItems.count();

    expect(itemCount).toBeGreaterThan(0);

    // Check first few items
    for (let i = 0; i < Math.min(itemCount, 3); i++) {
      const item = timelineItems.nth(i);

      // Item should be visible
      await expect(item).toBeVisible();

      // Should have timeline middle (marker)
      const middle = item.locator(".timeline-middle");
      const middleCount = await middle.count();

      if (middleCount > 0) {
        await expect(middle.first()).toBeVisible();
      }

      // Should have timeline start or end content
      const start = item.locator(".timeline-start");
      const end = item.locator(".timeline-end");

      const hasStart = await start.count() > 0;
      const hasEnd = await end.count() > 0;

      expect(hasStart || hasEnd).toBe(true);
    }
  });

  test("timeline orientation classes work", async ({ page }) => {
    // Test vertical timeline
    const verticalTimelines = page.locator(".timeline-vertical");
    const verticalCount = await verticalTimelines.count();

    if (verticalCount > 0) {
      const verticalTimeline = verticalTimelines.first();
      await expect(verticalTimeline).toBeVisible();

      const hasClass = await verticalTimeline.evaluate((el) =>
        el.classList.contains("timeline-vertical")
      );
      expect(hasClass).toBe(true);
    }

    // Test horizontal timeline
    const horizontalTimelines = page.locator(".timeline-horizontal");
    const horizontalCount = await horizontalTimelines.count();

    if (horizontalCount > 0) {
      const horizontalTimeline = horizontalTimelines.first();
      await expect(horizontalTimeline).toBeVisible();

      const hasClass = await horizontalTimeline.evaluate((el) =>
        el.classList.contains("timeline-horizontal")
      );
      expect(hasClass).toBe(true);
    }
  });

  test("timeline content is readable", async ({ page }) => {
    const timelineBoxes = page.locator(".timeline-box");
    const boxCount = await timelineBoxes.count();

    for (let i = 0; i < Math.min(boxCount, 5); i++) {
      const box = timelineBoxes.nth(i);

      // Box should be visible
      await expect(box).toBeVisible();

      // Should have readable content
      const textContent = await box.textContent();
      const hasText = textContent?.trim().length > 0;

      const hasChildren = await box.locator("*").count() > 0;

      expect(hasText || hasChildren).toBe(true);
    }
  });

  test("timeline markers are visible", async ({ page }) => {
    const timelineMarkers = page.locator(".timeline-middle");
    const markerCount = await timelineMarkers.count();

    for (let i = 0; i < Math.min(markerCount, 5); i++) {
      const marker = timelineMarkers.nth(i);

      // Marker should be visible
      await expect(marker).toBeVisible();

      // Should have some visual content (icon, dot, etc.)
      const hasIcon = await marker.locator("svg").count() > 0;
      const hasDot = await marker.locator("div").count() > 0;
      const hasText = (await marker.textContent())?.trim().length > 0;

      expect(hasIcon || hasDot || hasText).toBe(true);
    }
  });

  test("timeline interactive elements work", async ({ page }) => {
    // Test buttons in timeline
    const timelineButtons = page.locator(".timeline button");
    const buttonCount = await timelineButtons.count();

    if (buttonCount > 0) {
      const firstButton = timelineButtons.first();
      await expect(firstButton).toBeVisible();
      await expect(firstButton).toBeEnabled();

      // Click button
      await firstButton.click();

      // Button should still be visible
      await expect(firstButton).toBeVisible();
    }

    // Test links in timeline
    const timelineLinks = page.locator(".timeline a");
    const linkCount = await timelineLinks.count();

    if (linkCount > 0) {
      const firstLink = timelineLinks.first();
      await expect(firstLink).toBeVisible();

      // Get href attribute
      const href = await firstLink.getAttribute("href");
      expect(href).toBeTruthy();
    }
  });

  test("timeline responsive behavior", async ({ page }) => {
    const timeline = page.locator(".timeline").first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(timeline).toBeVisible();

    const desktopLayout = await timeline.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
      direction: getComputedStyle(el).flexDirection || "column",
    }));

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(timeline).toBeVisible();

    const mobileLayout = await timeline.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
      direction: getComputedStyle(el).flexDirection || "column",
    }));

    // Timeline should adapt to smaller screens
    expect(mobileLayout.width).toBeLessThanOrEqual(desktopLayout.width);
    expect(mobileLayout.height).toBeGreaterThan(0);
  });

  test("timeline connectors display correctly", async ({ page }) => {
    const timelineHrs = page.locator(".timeline hr");
    const hrCount = await timelineHrs.count();

    for (let i = 0; i < Math.min(hrCount, 3); i++) {
      const hr = timelineHrs.nth(i);

      // HR should be visible
      await expect(hr).toBeVisible();

      // Should have some styling (background, border, etc.)
      const styles = await hr.evaluate((el) => ({
        backgroundColor: getComputedStyle(el).backgroundColor,
        borderColor: getComputedStyle(el).borderColor,
        height: getComputedStyle(el).height,
        width: getComputedStyle(el).width,
      }));

      // Should have some visual styling
      const hasBackground = styles.backgroundColor !== "rgba(0, 0, 0, 0)" &&
        styles.backgroundColor !== "transparent";
      const hasBorder = styles.borderColor !== "rgba(0, 0, 0, 0)" &&
        styles.borderColor !== "transparent";

      expect(hasBackground || hasBorder).toBe(true);
    }
  });

  test("timeline accessibility", async ({ page }) => {
    const timelines = page.locator(".timeline");
    const timelineCount = await timelines.count();

    for (let i = 0; i < Math.min(timelineCount, 2); i++) {
      const timeline = timelines.nth(i);

      // Timeline should be visible
      await expect(timeline).toBeVisible();

      // Should be a list element
      const tagName = await timeline.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe("ul");

      // Check for proper list structure
      const listItems = timeline.locator("li");
      const itemCount = await listItems.count();
      expect(itemCount).toBeGreaterThan(0);

      // Check for meaningful content in items
      for (let j = 0; j < Math.min(itemCount, 3); j++) {
        const item = listItems.nth(j);
        const itemText = await item.textContent();
        const hasContent = itemText?.trim().length > 0;

        const hasInteractiveElements = await item.locator("button, a, input").count() > 0;

        expect(hasContent || hasInteractiveElements).toBe(true);
      }
    }
  });

  test("timeline time elements display correctly", async ({ page }) => {
    const timeElements = page.locator(".timeline time");
    const timeCount = await timeElements.count();

    if (timeCount > 0) {
      for (let i = 0; i < Math.min(timeCount, 3); i++) {
        const timeElement = timeElements.nth(i);

        // Time element should be visible
        await expect(timeElement).toBeVisible();

        // Should have datetime or text content
        const datetime = await timeElement.getAttribute("datetime");
        const textContent = await timeElement.textContent();

        expect(datetime || (textContent?.trim().length > 0)).toBe(true);
      }
    }
  });

  test("timeline keyboard navigation", async ({ page }) => {
    // Focus first interactive element in timeline
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    const focusedCount = await focusedElement.count();

    if (focusedCount > 0) {
      // Should be within a timeline
      const isInTimeline = await focusedElement.evaluate((el) => {
        return !!el.closest(".timeline");
      });

      if (isInTimeline) {
        // Test activation with Enter
        const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());

        if (["button", "a"].includes(tagName)) {
          await page.keyboard.press("Enter");
          await expect(focusedElement).toBeVisible();
        }

        // Test Tab navigation to next element
        await page.keyboard.press("Tab");

        const nextFocused = page.locator(":focus");
        const nextFocusedCount = await nextFocused.count();

        if (nextFocusedCount > 0) {
          const nextTagName = await nextFocused.evaluate((el) => el.tagName.toLowerCase());
          expect(["button", "a", "input", "select", "textarea"]).toContain(nextTagName);
        }
      }
    }
  });

  test("timeline variant classes work", async ({ page }) => {
    const variants = [
      "timeline-compact",
      "timeline-snap-icon",
    ];

    for (const variant of variants) {
      const variantTimelines = page.locator(`.${variant}`);
      const variantCount = await variantTimelines.count();

      if (variantCount > 0) {
        const variantTimeline = variantTimelines.first();
        await expect(variantTimeline).toBeVisible();

        // Should have the variant class
        const hasClass = await variantTimeline.evaluate(
          (el, className) => el.classList.contains(className),
          variant,
        );
        expect(hasClass).toBe(true);
      }
    }
  });

  test("timeline images load correctly", async ({ page }) => {
    const timelineImages = page.locator(".timeline img");
    const imageCount = await timelineImages.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const image = timelineImages.nth(i);

        // Image should be visible
        await expect(image).toBeVisible();

        // Image should have src
        const src = await image.getAttribute("src");
        expect(src).toBeTruthy();

        // Image should have alt text
        const alt = await image.getAttribute("alt");
        expect(alt).toBeTruthy();

        // Wait for image to load
        await image.evaluate((img) => {
          if (img.complete) return;
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        });
      }
    }
  });

  test("timeline badges and status indicators", async ({ page }) => {
    const timelineBadges = page.locator(".timeline .badge");
    const badgeCount = await timelineBadges.count();

    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(badgeCount, 3); i++) {
        const badge = timelineBadges.nth(i);

        // Badge should be visible
        await expect(badge).toBeVisible();

        // Should have text content
        const badgeText = await badge.textContent();
        expect(badgeText?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("timeline scroll behavior in containers", async ({ page }) => {
    // Look for scrollable timeline containers
    const scrollableTimelines = page.locator(".timeline").locator("..")
      .filter({ hasText: /overflow|scroll/ });
    const scrollableCount = await scrollableTimelines.count();

    if (scrollableCount > 0) {
      const scrollableContainer = scrollableTimelines.first();

      // Check if container is scrollable
      const scrollInfo = await scrollableContainer.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      }));

      // If content exceeds container, test scrolling
      if (
        scrollInfo.scrollHeight > scrollInfo.clientHeight ||
        scrollInfo.scrollWidth > scrollInfo.clientWidth
      ) {
        // Test scroll functionality
        await scrollableContainer.evaluate((el) => el.scrollBy(0, 50));

        // Container should still be visible
        await expect(scrollableContainer).toBeVisible();
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="items"')).toBeVisible();
    await expect(page.locator('text="orientation"')).toBeVisible();
    await expect(page.locator('text="markers"')).toBeVisible();
  });
});
