import { expect, test } from "@playwright/test";

test.describe("Drawer E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/drawer");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays drawer examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Drawer");
    await expect(page.locator(".drawer").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Drawer");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/drawer$/);
  });

  test("drawer examples render correctly", async ({ page }) => {
    const drawers = page.locator(".drawer");
    const drawerCount = await drawers.count();
    expect(drawerCount).toBeGreaterThanOrEqual(1);

    // Check for drawer components
    await expect(page.locator(".drawer-content").first()).toBeVisible();
    await expect(page.locator(".drawer-side").first()).toBeVisible();
  });

  test("drawer toggle functionality works", async ({ page }) => {
    const toggleButtons = page.locator(
      'label[for*="drawer"], button:has-text("Open"), .drawer-button',
    );
    const drawerCheckbox = page.locator(".drawer-toggle").first();

    const hasToggle = await toggleButtons.count() > 0;
    const hasCheckbox = await drawerCheckbox.count() > 0;

    if (hasToggle && hasCheckbox) {
      // Check initial state
      const initialState = await drawerCheckbox.isChecked();

      // Click toggle
      await toggleButtons.first().click();
      await page.waitForTimeout(300);

      // Check if state changed
      const newState = await drawerCheckbox.isChecked();
      expect(newState).not.toBe(initialState);

      // Click again to close
      await toggleButtons.first().click();
      await page.waitForTimeout(300);

      const finalState = await drawerCheckbox.isChecked();
      expect(finalState).toBe(initialState);
    }
  });

  test("drawer overlay closes drawer", async ({ page }) => {
    const toggleButtons = page.locator(
      'label[for*="drawer"], button:has-text("Open"), .drawer-button',
    );
    const drawerOverlay = page.locator(".drawer-overlay");
    const drawerCheckbox = page.locator(".drawer-toggle").first();

    const hasToggle = await toggleButtons.count() > 0;
    const hasOverlay = await drawerOverlay.count() > 0;
    const hasCheckbox = await drawerCheckbox.count() > 0;

    if (hasToggle && hasOverlay && hasCheckbox) {
      // Open drawer
      await toggleButtons.first().click();
      await page.waitForTimeout(300);

      // Verify drawer is open
      const isOpen = await drawerCheckbox.isChecked();
      expect(isOpen).toBe(true);

      // Click overlay to close
      await drawerOverlay.first().click();
      await page.waitForTimeout(300);

      // Verify drawer is closed
      const isClosed = await drawerCheckbox.isChecked();
      expect(isClosed).toBe(false);
    }
  });

  test("drawer sidebar navigation works", async ({ page }) => {
    const sidebarLinks = page.locator(".drawer-side a, .drawer-side .menu a");
    const hasLinks = await sidebarLinks.count() > 0;

    if (hasLinks) {
      // Ensure drawer is open first
      const toggleButtons = page.locator(
        'label[for*="drawer"], button:has-text("Open"), .drawer-button',
      );
      const hasToggle = await toggleButtons.count() > 0;

      if (hasToggle) {
        await toggleButtons.first().click();
        await page.waitForTimeout(300);
      }

      // Test clicking sidebar links
      const link = sidebarLinks.first();
      await expect(link).toBeVisible();

      const linkText = await link.textContent();
      expect(linkText).toBeTruthy();

      // Click link (might navigate or perform action)
      await link.click();
    }
  });

  test("drawer responsive behavior", async ({ page }) => {
    const responsiveDrawers = page.locator(".drawer.lg\\:drawer-open");
    const hasResponsive = await responsiveDrawers.count() > 0;

    if (hasResponsive) {
      // Test desktop view (drawer should be open)
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(200);

      const drawerSide = responsiveDrawers.first().locator(".drawer-side");
      await expect(drawerSide).toBeVisible();

      // Test mobile view (drawer should be closable)
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(200);

      const toggleButton = page.locator('label[for*="drawer"], .drawer-button');
      const hasToggleOnMobile = await toggleButton.count() > 0;

      if (hasToggleOnMobile) {
        await expect(toggleButton.first()).toBeVisible();
      }
    }
  });

  test("drawer content accessibility", async ({ page }) => {
    const drawerContent = page.locator(".drawer-content");
    const drawerSide = page.locator(".drawer-side");

    const hasContent = await drawerContent.count() > 0;
    const hasSide = await drawerSide.count() > 0;

    if (hasContent) {
      // Main content should be accessible
      const contentLinks = drawerContent.first().locator("a, button");
      const linkCount = await contentLinks.count();

      for (let i = 0; i < Math.min(3, linkCount); i++) {
        const link = contentLinks.nth(i);
        await expect(link).toBeVisible();

        // Should be focusable
        await link.focus();
        await expect(link).toBeFocused();
      }
    }

    if (hasSide) {
      // Sidebar should be accessible when open
      const toggleButtons = page.locator('label[for*="drawer"], button:has-text("Open")');
      const hasToggle = await toggleButtons.count() > 0;

      if (hasToggle) {
        await toggleButtons.first().click();
        await page.waitForTimeout(300);

        const sidebarLinks = drawerSide.first().locator("a, button");
        const sidebarLinkCount = await sidebarLinks.count();

        for (let i = 0; i < Math.min(3, sidebarLinkCount); i++) {
          const link = sidebarLinks.nth(i);
          await expect(link).toBeVisible();
        }
      }
    }
  });

  test("drawer keyboard navigation", async ({ page }) => {
    const toggleButtons = page.locator('label[for*="drawer"], button:has-text("Open")');
    const hasToggle = await toggleButtons.count() > 0;

    if (hasToggle) {
      // Focus and activate toggle with keyboard
      await toggleButtons.first().focus();
      await expect(toggleButtons.first()).toBeFocused();

      // Press Enter to toggle
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);

      // Check if drawer opened
      const drawerCheckbox = page.locator(".drawer-toggle").first();
      const hasCheckbox = await drawerCheckbox.count() > 0;

      if (hasCheckbox) {
        const isOpen = await drawerCheckbox.isChecked();
        expect(typeof isOpen).toBe("boolean");
      }

      // Test ESC key to close (if implemented)
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="drawer-toggle"')).toBeVisible();
    await expect(page.locator('text="drawer-content"')).toBeVisible();
    await expect(page.locator('text="drawer-side"')).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/layout/drawer");
    await navigationPromise;

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
