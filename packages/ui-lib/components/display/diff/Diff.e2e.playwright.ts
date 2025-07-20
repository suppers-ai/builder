import { expect, test } from "@playwright/test";

test.describe("Diff E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/diff");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays diff examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Diff/);
    await expect(page.locator("h1")).toContainText("Diff");
    await expect(page.locator(".diff").first()).toBeVisible();
  });

  test("diff basic structure is correct", async ({ page }) => {
    const diffs = page.locator(".diff");
    const diffCount = await diffs.count();

    expect(diffCount).toBeGreaterThan(0);

    // Check first diff
    const firstDiff = diffs.first();
    await expect(firstDiff).toBeVisible();

    // Should have two items
    const item1 = firstDiff.locator(".diff-item-1");
    const item2 = firstDiff.locator(".diff-item-2");

    await expect(item1).toBeVisible();
    await expect(item2).toBeVisible();

    // Should have resizer
    const resizer = firstDiff.locator(".diff-resizer");
    await expect(resizer).toBeVisible();
  });

  test("diff resizer drag functionality", async ({ page }) => {
    const diff = page.locator(".diff").first();
    const resizer = diff.locator(".diff-resizer");

    if (await resizer.count() > 0) {
      // Get initial position
      const initialPosition = await resizer.boundingBox();
      const diffBox = await diff.boundingBox();

      if (initialPosition && diffBox) {
        // Drag resizer to the left
        await page.mouse.move(
          initialPosition.x + initialPosition.width / 2,
          initialPosition.y + initialPosition.height / 2,
        );
        await page.mouse.down();

        // Move to 25% position
        const newX = diffBox.x + diffBox.width * 0.25;
        await page.mouse.move(newX, initialPosition.y + initialPosition.height / 2);
        await page.mouse.up();

        // Wait for any animations
        await page.waitForTimeout(200);

        // Resizer should have moved
        const newPosition = await resizer.boundingBox();
        expect(newPosition?.x).not.toBe(initialPosition.x);

        // Diff should still be functional
        await expect(diff).toBeVisible();
        await expect(resizer).toBeVisible();
      }
    }
  });

  test("diff items display content correctly", async ({ page }) => {
    const diffItems = page.locator(".diff-item-1, .diff-item-2");
    const itemCount = await diffItems.count();

    expect(itemCount).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(itemCount, 4); i++) {
      const item = diffItems.nth(i);
      await expect(item).toBeVisible();

      // Item should have content (text, images, or other elements)
      const hasText = (await item.textContent())?.trim().length > 0;
      const hasImages = await item.locator("img").count() > 0;
      const hasChildren = await item.locator("*").count() > 0;

      expect(hasText || hasImages || hasChildren).toBe(true);
    }
  });

  test("diff resizer keyboard navigation", async ({ page }) => {
    const resizer = page.locator(".diff-resizer").first();

    if (await resizer.count() > 0) {
      // Try to focus resizer
      await resizer.focus();

      // Test if resizer is focusable
      const isFocused = await resizer.evaluate((el) => el === document.activeElement);

      if (isFocused) {
        // Test arrow key navigation
        await page.keyboard.press("ArrowLeft");
        await page.waitForTimeout(100);

        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(100);

        // Resizer should still be visible and functional
        await expect(resizer).toBeVisible();
      }
    }
  });

  test("diff hover and interaction states", async ({ page }) => {
    const diff = page.locator(".diff").first();
    const resizer = diff.locator(".diff-resizer");

    // Test hover on diff container
    await diff.hover();
    await expect(diff).toBeVisible();

    // Test hover on resizer
    if (await resizer.count() > 0) {
      await resizer.hover();
      await expect(resizer).toBeVisible();

      // Check cursor changes to indicate draggable
      const cursor = await resizer.evaluate((el) => getComputedStyle(el).cursor);
      expect(cursor).toContain("resize");
    }
  });

  test("diff aspect ratio maintains", async ({ page }) => {
    const diffs = page.locator(".diff");
    const diffCount = await diffs.count();

    for (let i = 0; i < Math.min(diffCount, 3); i++) {
      const diff = diffs.nth(i);

      // Get dimensions
      const dimensions = await diff.evaluate((el) => ({
        width: el.offsetWidth,
        height: el.offsetHeight,
        aspectRatio: el.offsetWidth / el.offsetHeight,
      }));

      // Should have reasonable dimensions
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);

      // Aspect ratio should be reasonable (not extremely narrow or wide)
      expect(dimensions.aspectRatio).toBeGreaterThan(0.1);
      expect(dimensions.aspectRatio).toBeLessThan(10);
    }
  });

  test("diff with images loads correctly", async ({ page }) => {
    const diffImages = page.locator(".diff img");
    const imageCount = await diffImages.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 4); i++) {
        const image = diffImages.nth(i);

        // Image should be visible
        await expect(image).toBeVisible();

        // Image should have src
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

        // Image should have dimensions after loading
        const dimensions = await image.evaluate((img) => ({
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          width: img.offsetWidth,
          height: img.offsetHeight,
        }));

        expect(dimensions.width).toBeGreaterThan(0);
        expect(dimensions.height).toBeGreaterThan(0);
      }
    }
  });

  test("diff accessibility", async ({ page }) => {
    const diffs = page.locator(".diff");
    const diffCount = await diffs.count();

    for (let i = 0; i < Math.min(diffCount, 3); i++) {
      const diff = diffs.nth(i);

      // Diff should be visible
      await expect(diff).toBeVisible();

      // Check for alternative text on images
      const images = diff.locator("img");
      const imageCount = await images.count();

      for (let j = 0; j < imageCount; j++) {
        const image = images.nth(j);
        const alt = await image.getAttribute("alt");

        // Images should have alt text or aria-label
        const ariaLabel = await image.getAttribute("aria-label");
        expect(alt || ariaLabel).toBeTruthy();
      }

      // Check for meaningful content in diff items
      const item1 = diff.locator(".diff-item-1");
      const item2 = diff.locator(".diff-item-2");

      if (await item1.count() > 0) {
        const item1Content = await item1.textContent();
        const item1HasImages = await item1.locator("img").count() > 0;
        expect(item1Content?.trim().length > 0 || item1HasImages).toBe(true);
      }

      if (await item2.count() > 0) {
        const item2Content = await item2.textContent();
        const item2HasImages = await item2.locator("img").count() > 0;
        expect(item2Content?.trim().length > 0 || item2HasImages).toBe(true);
      }
    }
  });

  test("diff responsive behavior", async ({ page }) => {
    const diff = page.locator(".diff").first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(diff).toBeVisible();

    const desktopSize = await diff.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(diff).toBeVisible();

    const mobileSize = await diff.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Diff should adapt to smaller screens
    expect(mobileSize.width).toBeLessThanOrEqual(desktopSize.width);
    expect(mobileSize.height).toBeGreaterThan(0);

    // Should maintain functionality on mobile
    const resizer = diff.locator(".diff-resizer");
    if (await resizer.count() > 0) {
      await expect(resizer).toBeVisible();
    }
  });

  test("diff resizer position limits", async ({ page }) => {
    const diff = page.locator(".diff").first();
    const resizer = diff.locator(".diff-resizer");

    if (await resizer.count() > 0) {
      const diffBox = await diff.boundingBox();
      const initialResizerBox = await resizer.boundingBox();

      if (diffBox && initialResizerBox) {
        // Try to drag resizer beyond left edge
        await page.mouse.move(
          initialResizerBox.x + initialResizerBox.width / 2,
          initialResizerBox.y + initialResizerBox.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(diffBox.x - 50, initialResizerBox.y + initialResizerBox.height / 2);
        await page.mouse.up();

        await page.waitForTimeout(100);

        // Resizer should not go beyond container
        const leftLimitBox = await resizer.boundingBox();
        expect(leftLimitBox?.x).toBeGreaterThanOrEqual(diffBox.x - 20); // Small tolerance

        // Try to drag resizer beyond right edge
        await page.mouse.move(
          leftLimitBox?.x + (leftLimitBox?.width || 0) / 2,
          leftLimitBox?.y + (leftLimitBox?.height || 0) / 2,
        );
        await page.mouse.down();
        await page.mouse.move(
          diffBox.x + diffBox.width + 50,
          leftLimitBox?.y + (leftLimitBox?.height || 0) / 2,
        );
        await page.mouse.up();

        await page.waitForTimeout(100);

        // Resizer should not go beyond container
        const rightLimitBox = await resizer.boundingBox();
        expect(rightLimitBox?.x).toBeLessThanOrEqual(diffBox.x + diffBox.width + 20); // Small tolerance
      }
    }
  });

  test("diff performance with complex content", async ({ page }) => {
    // Test if diff works smoothly with complex content
    const complexDiffs = page.locator(".diff:has(img), .diff:has(div > div)");
    const complexCount = await complexDiffs.count();

    if (complexCount > 0) {
      const complexDiff = complexDiffs.first();
      const resizer = complexDiff.locator(".diff-resizer");

      // Multiple rapid movements to test performance
      if (await resizer.count() > 0) {
        const resizerBox = await resizer.boundingBox();
        const diffBox = await complexDiff.boundingBox();

        if (resizerBox && diffBox) {
          await page.mouse.move(
            resizerBox.x + resizerBox.width / 2,
            resizerBox.y + resizerBox.height / 2,
          );
          await page.mouse.down();

          // Rapid movements
          for (let i = 0; i < 5; i++) {
            const position = diffBox.x + (diffBox.width * (0.2 + i * 0.15));
            await page.mouse.move(position, resizerBox.y + resizerBox.height / 2);
            await page.waitForTimeout(50);
          }

          await page.mouse.up();

          // Should still be functional
          await expect(complexDiff).toBeVisible();
          await expect(resizer).toBeVisible();
        }
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="item1"')).toBeVisible();
    await expect(page.locator('text="item2"')).toBeVisible();
    await expect(page.locator('text="resizer"')).toBeVisible();
  });
});
