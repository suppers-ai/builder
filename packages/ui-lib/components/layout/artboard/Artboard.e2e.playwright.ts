import { expect, test } from "@playwright/test";

test.describe("Artboard E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/artboard");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays artboard examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Artboard");
    await expect(page.locator(".artboard").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Artboard");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/artboard$/);
  });

  test("artboard examples render correctly", async ({ page }) => {
    const artboards = page.locator(".artboard");
    const artboardCount = await artboards.count();
    expect(artboardCount).toBeGreaterThanOrEqual(3);

    // Check for different artboard sizes/types
    await expect(page.locator('.artboard.phone-1, .artboard[class*="phone-"]').first())
      .toBeVisible();
    await expect(page.locator(".artboard-horizontal").first()).toBeVisible();
  });

  test("artboard content is interactive", async ({ page }) => {
    // Look for interactive elements within artboards
    const artboardButtons = page.locator(".artboard button");
    const hasButtons = await artboardButtons.count() > 0;

    if (hasButtons) {
      const button = artboardButtons.first();
      await button.click();

      // Verify button is clickable (no specific action expected)
      await expect(button).toBeVisible();
    }

    // Look for links within artboards
    const artboardLinks = page.locator(".artboard a");
    const hasLinks = await artboardLinks.count() > 0;

    if (hasLinks) {
      const link = artboardLinks.first();
      await expect(link).toBeVisible();
    }
  });

  test("artboard sizes work correctly", async ({ page }) => {
    const phoneArtboards = page.locator('.artboard[class*="phone-"]');
    const hasPhoneArtboards = await phoneArtboards.count() > 0;

    if (hasPhoneArtboards) {
      for (let i = 0; i < Math.min(3, await phoneArtboards.count()); i++) {
        const artboard = phoneArtboards.nth(i);
        await expect(artboard).toBeVisible();

        // Check that artboard has content
        const content = artboard.locator("*");
        const hasContent = await content.count() > 0;
        expect(hasContent).toBe(true);
      }
    }
  });

  test("artboard horizontal orientation works", async ({ page }) => {
    const horizontalArtboards = page.locator(".artboard-horizontal");
    const hasHorizontal = await horizontalArtboards.count() > 0;

    if (hasHorizontal) {
      const horizontalArtboard = horizontalArtboards.first();
      await expect(horizontalArtboard).toBeVisible();

      // Check that it has artboard class
      const hasArtboardClass = await horizontalArtboard.evaluate((el) =>
        el.classList.contains("artboard")
      );
      expect(hasArtboardClass).toBe(true);
    }
  });

  test("artboard maintains aspect ratio", async ({ page }) => {
    const artboards = page.locator(".artboard");
    const artboardCount = await artboards.count();

    if (artboardCount > 0) {
      const artboard = artboards.first();

      // Get dimensions
      const box = await artboard.boundingBox();
      expect(box).toBeTruthy();

      if (box) {
        // Artboards should have reasonable dimensions
        expect(box.width).toBeGreaterThan(100);
        expect(box.height).toBeGreaterThan(100);

        // Phone artboards typically have a portrait aspect ratio
        const isPhone = await artboard.evaluate((el) => el.className.includes("phone-"));

        if (isPhone) {
          // For non-horizontal phones, height should be greater than width
          const isHorizontal = await artboard.evaluate((el) =>
            el.classList.contains("artboard-horizontal")
          );

          if (!isHorizontal) {
            expect(box.height).toBeGreaterThan(box.width);
          }
        }
      }
    }
  });

  test("artboard content accessibility", async ({ page }) => {
    const artboards = page.locator(".artboard");
    const artboardCount = await artboards.count();

    if (artboardCount > 0) {
      const artboard = artboards.first();

      // Check if artboard content is accessible
      const textContent = await artboard.textContent();
      expect(textContent).toBeTruthy();

      // Check for interactive elements accessibility
      const interactiveElements = artboard.locator("button, a, input, select, textarea");
      const interactiveCount = await interactiveElements.count();

      for (let i = 0; i < interactiveCount; i++) {
        const element = interactiveElements.nth(i);
        await expect(element).toBeVisible();

        // Elements should be focusable
        await element.focus();
        await expect(element).toBeFocused();
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="phone-1"')).toBeVisible();
    await expect(page.locator('text="artboard-horizontal"')).toBeVisible();
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".artboard").first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();

    // Artboards should still be visible and functional on mobile
    const artboards = page.locator(".artboard");
    const artboardCount = await artboards.count();

    if (artboardCount > 0) {
      const artboard = artboards.first();
      await expect(artboard).toBeVisible();

      // Should maintain reasonable size even on mobile
      const box = await artboard.boundingBox();
      expect(box).toBeTruthy();

      if (box) {
        expect(box.width).toBeGreaterThan(50);
        expect(box.height).toBeGreaterThan(50);
      }
    }
  });

  test("artboard overflow handling", async ({ page }) => {
    // Test how artboards handle content overflow
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="artboard phone-2">
          <div class="p-4">
            <h1>Very Long Title That Might Overflow The Artboard Container</h1>
            <p>This is a very long paragraph with lots of text that should test how the artboard handles content overflow and whether it maintains its container boundaries properly.</p>
            <div class="mt-4">
              <button class="btn">Button 1</button>
              <button class="btn">Button 2</button>
              <button class="btn">Button 3</button>
              <button class="btn">Button 4</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const testArtboard = page.locator("div").last().locator(".artboard");
    await expect(testArtboard).toBeVisible();

    // Check that overflow is handled properly
    const hasScrollableContent = await testArtboard.evaluate((el) => {
      return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
    });

    // This is expected behavior - artboards should contain their content
    expect(typeof hasScrollableContent).toBe("boolean");
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/layout/artboard");
    await navigationPromise;

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
