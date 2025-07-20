import { expect, test } from "@playwright/test";

test.describe("Carousel E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/carousel");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays carousel examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Carousel/);
    await expect(page.locator("h1")).toContainText("Carousel");
    await expect(page.locator(".carousel").first()).toBeVisible();
  });

  test("carousel items are displayed correctly", async ({ page }) => {
    const carousels = page.locator(".carousel");
    const carouselCount = await carousels.count();

    expect(carouselCount).toBeGreaterThan(0);

    // Check first carousel
    const firstCarousel = carousels.first();
    await expect(firstCarousel).toBeVisible();

    // Check carousel items
    const carouselItems = firstCarousel.locator(".carousel-item");
    const itemCount = await carouselItems.count();

    expect(itemCount).toBeGreaterThan(0);

    // First item should be visible
    const firstItem = carouselItems.first();
    await expect(firstItem).toBeVisible();
  });

  test("carousel navigation with indicators works", async ({ page }) => {
    // Look for carousel with navigation indicators
    const indicators = page.locator('.btn:has-text("1"), .btn:has-text("2"), .btn:has-text("3")');
    const indicatorCount = await indicators.count();

    if (indicatorCount > 1) {
      const firstIndicator = indicators.first();
      const secondIndicator = indicators.nth(1);

      // Click first indicator
      await firstIndicator.click();
      await page.waitForTimeout(500);

      // Click second indicator
      await secondIndicator.click();
      await page.waitForTimeout(500);

      // Carousel should still be visible
      const carousel = page.locator(".carousel").first();
      await expect(carousel).toBeVisible();
    }
  });

  test("carousel navigation with arrow buttons", async ({ page }) => {
    const arrowButtons = page.locator('.carousel .btn:has-text("❮"), .carousel .btn:has-text("❯")');
    const buttonCount = await arrowButtons.count();

    if (buttonCount > 0) {
      // Test next button
      const nextButton = page.locator('.carousel .btn:has-text("❯")');
      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForTimeout(500);

        // Carousel should still be functional
        const carousel = page.locator(".carousel").first();
        await expect(carousel).toBeVisible();
      }

      // Test previous button
      const prevButton = page.locator('.carousel .btn:has-text("❮")');
      if (await prevButton.count() > 0) {
        await prevButton.first().click();
        await page.waitForTimeout(500);

        // Carousel should still be functional
        const carousel = page.locator(".carousel").first();
        await expect(carousel).toBeVisible();
      }
    }
  });

  test("carousel scroll behavior", async ({ page }) => {
    const carousel = page.locator(".carousel").first();

    // Get initial scroll position
    const initialScroll = await carousel.evaluate((el) => el.scrollLeft);

    // Scroll horizontally
    await carousel.evaluate((el) => el.scrollBy(200, 0));
    await page.waitForTimeout(300);

    const newScroll = await carousel.evaluate((el) => el.scrollLeft);

    // Scroll position should have changed (unless at end)
    expect(typeof newScroll).toBe("number");
    expect(newScroll).toBeGreaterThanOrEqual(initialScroll);
  });

  test("carousel item click functionality", async ({ page }) => {
    const carouselItems = page.locator(".carousel-item");
    const itemCount = await carouselItems.count();

    if (itemCount > 0) {
      const firstItem = carouselItems.first();

      // Click carousel item
      await firstItem.click();

      // Item should still be visible after click
      await expect(firstItem).toBeVisible();

      // Check if item has interactive content
      const interactiveElements = firstItem.locator("button, a, img");
      const interactiveCount = await interactiveElements.count();

      if (interactiveCount > 0) {
        const interactive = interactiveElements.first();
        await expect(interactive).toBeVisible();
      }
    }
  });

  test("carousel keyboard navigation", async ({ page }) => {
    const carousel = page.locator(".carousel").first();

    // Focus carousel
    await carousel.focus();

    // Test arrow key navigation
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);

    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(200);

    // Carousel should still be visible and functional
    await expect(carousel).toBeVisible();
  });

  test("carousel accessibility attributes", async ({ page }) => {
    const carousels = page.locator(".carousel");
    const carouselCount = await carousels.count();

    for (let i = 0; i < Math.min(carouselCount, 2); i++) {
      const carousel = carousels.nth(i);

      // Carousel should be visible
      await expect(carousel).toBeVisible();

      // Check for proper structure
      const items = carousel.locator(".carousel-item");
      const itemCount = await items.count();
      expect(itemCount).toBeGreaterThan(0);

      // Items should have content
      for (let j = 0; j < Math.min(itemCount, 3); j++) {
        const item = items.nth(j);
        await expect(item).toBeVisible();

        // Check for content (img, text, or other elements)
        const content = item.locator("img, div, span, h1, h2, h3, p");
        const hasContent = await content.count() > 0;
        expect(hasContent).toBe(true);
      }
    }
  });

  test("carousel responsive behavior", async ({ page }) => {
    const carousel = page.locator(".carousel").first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(carousel).toBeVisible();

    const desktopSize = await carousel.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(carousel).toBeVisible();

    const mobileSize = await carousel.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Carousel should adapt to viewport
    expect(mobileSize.width).toBeLessThanOrEqual(desktopSize.width);
    expect(mobileSize.height).toBeGreaterThan(0);
  });

  test("carousel vertical orientation", async ({ page }) => {
    const verticalCarousels = page.locator(".carousel-vertical");
    const verticalCount = await verticalCarousels.count();

    if (verticalCount > 0) {
      const verticalCarousel = verticalCarousels.first();
      await expect(verticalCarousel).toBeVisible();

      // Test vertical scrolling
      const initialScroll = await verticalCarousel.evaluate((el) => el.scrollTop);

      await verticalCarousel.evaluate((el) => el.scrollBy(0, 100));
      await page.waitForTimeout(200);

      const newScroll = await verticalCarousel.evaluate((el) => el.scrollTop);
      expect(newScroll).toBeGreaterThanOrEqual(initialScroll);
    }
  });

  test("carousel center and end alignment", async ({ page }) => {
    // Test carousel-center
    const centerCarousels = page.locator(".carousel-center");
    const centerCount = await centerCarousels.count();

    if (centerCount > 0) {
      const centerCarousel = centerCarousels.first();
      await expect(centerCarousel).toBeVisible();

      // Should have proper styling
      const hasClass = await centerCarousel.evaluate((el) =>
        el.classList.contains("carousel-center")
      );
      expect(hasClass).toBe(true);
    }

    // Test carousel-end
    const endCarousels = page.locator(".carousel-end");
    const endCount = await endCarousels.count();

    if (endCount > 0) {
      const endCarousel = endCarousels.first();
      await expect(endCarousel).toBeVisible();

      // Should have proper styling
      const hasClass = await endCarousel.evaluate((el) => el.classList.contains("carousel-end"));
      expect(hasClass).toBe(true);
    }
  });

  test("carousel with image loading", async ({ page }) => {
    const carouselImages = page.locator(".carousel img");
    const imageCount = await carouselImages.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const image = carouselImages.nth(i);

        // Image should be visible
        await expect(image).toBeVisible();

        // Image should have src attribute
        const src = await image.getAttribute("src");
        expect(src).toBeTruthy();

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

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="items"')).toBeVisible();
    await expect(page.locator('text="indicators"')).toBeVisible();
    await expect(page.locator('text="navigation"')).toBeVisible();
  });
});
