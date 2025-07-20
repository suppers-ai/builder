import { expect, test } from "@playwright/test";

test.describe("ChatBubble E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/chat-bubble");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays chat bubble examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Chat Bubble|ChatBubble/);
    await expect(page.locator("h1")).toContainText(/Chat Bubble|ChatBubble/);
    await expect(page.locator(".chat").first()).toBeVisible();
  });

  test("chat bubble structure is correct", async ({ page }) => {
    const chats = page.locator(".chat");
    const chatCount = await chats.count();

    expect(chatCount).toBeGreaterThan(0);

    // Check first chat bubble
    const firstChat = chats.first();
    await expect(firstChat).toBeVisible();

    // Should contain a chat bubble
    const chatBubble = firstChat.locator(".chat-bubble");
    await expect(chatBubble).toBeVisible();

    const bubbleText = await chatBubble.textContent();
    expect(bubbleText?.trim()).toBeTruthy();
  });

  test("chat bubble alignment works", async ({ page }) => {
    // Test start alignment
    const chatStart = page.locator(".chat-start");
    const startCount = await chatStart.count();

    if (startCount > 0) {
      const startChat = chatStart.first();
      await expect(startChat).toBeVisible();

      // Should have chat-start class
      const hasStartClass = await startChat.evaluate((el) => el.classList.contains("chat-start"));
      expect(hasStartClass).toBe(true);
    }

    // Test end alignment
    const chatEnd = page.locator(".chat-end");
    const endCount = await chatEnd.count();

    if (endCount > 0) {
      const endChat = chatEnd.first();
      await expect(endChat).toBeVisible();

      // Should have chat-end class
      const hasEndClass = await endChat.evaluate((el) => el.classList.contains("chat-end"));
      expect(hasEndClass).toBe(true);
    }
  });

  test("chat bubble with avatar displays correctly", async ({ page }) => {
    const chatsWithAvatar = page.locator(".chat:has(.chat-image)");
    const avatarCount = await chatsWithAvatar.count();

    if (avatarCount > 0) {
      const chatWithAvatar = chatsWithAvatar.first();
      const avatar = chatWithAvatar.locator(".chat-image");

      await expect(avatar).toBeVisible();

      // Check if avatar contains image or avatar component
      const avatarContent = avatar.locator("img, .avatar, div");
      const contentCount = await avatarContent.count();
      expect(contentCount).toBeGreaterThan(0);
    }
  });

  test("chat bubble with header and footer", async ({ page }) => {
    // Test chat header
    const chatsWithHeader = page.locator(".chat:has(.chat-header)");
    const headerCount = await chatsWithHeader.count();

    if (headerCount > 0) {
      const chatWithHeader = chatsWithHeader.first();
      const header = chatWithHeader.locator(".chat-header");

      await expect(header).toBeVisible();

      const headerText = await header.textContent();
      expect(headerText?.trim()).toBeTruthy();
    }

    // Test chat footer
    const chatsWithFooter = page.locator(".chat:has(.chat-footer)");
    const footerCount = await chatsWithFooter.count();

    if (footerCount > 0) {
      const chatWithFooter = chatsWithFooter.first();
      const footer = chatWithFooter.locator(".chat-footer");

      await expect(footer).toBeVisible();

      const footerText = await footer.textContent();
      expect(footerText?.trim()).toBeTruthy();
    }
  });

  test("chat bubble color variants work", async ({ page }) => {
    const colorVariants = [
      "chat-bubble-primary",
      "chat-bubble-secondary",
      "chat-bubble-accent",
      "chat-bubble-info",
      "chat-bubble-success",
      "chat-bubble-warning",
      "chat-bubble-error",
    ];

    for (const variant of colorVariants) {
      const variantBubbles = page.locator(`.${variant}`);
      const variantCount = await variantBubbles.count();

      if (variantCount > 0) {
        const variantBubble = variantBubbles.first();
        await expect(variantBubble).toBeVisible();

        // Should have the variant class
        const hasClass = await variantBubble.evaluate(
          (el, className) => el.classList.contains(className),
          variant,
        );
        expect(hasClass).toBe(true);
      }
    }
  });

  test("chat bubble content is interactive", async ({ page }) => {
    // Look for interactive elements within chat bubbles
    const interactiveElements = page.locator(".chat-bubble a, .chat-bubble button");
    const interactiveCount = await interactiveElements.count();

    if (interactiveCount > 0) {
      const firstInteractive = interactiveElements.first();
      await expect(firstInteractive).toBeVisible();

      // Click interactive element
      await firstInteractive.click();

      // Element should still be visible after click
      await expect(firstInteractive).toBeVisible();
    }
  });

  test("chat bubble accessibility", async ({ page }) => {
    const chatBubbles = page.locator(".chat-bubble");
    const bubbleCount = await chatBubbles.count();

    for (let i = 0; i < Math.min(bubbleCount, 3); i++) {
      const bubble = chatBubbles.nth(i);

      // Bubble should be visible
      await expect(bubble).toBeVisible();

      // Should have readable text
      const text = await bubble.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);

      // Check color contrast (bubble should have background)
      const backgroundColor = await bubble.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(backgroundColor).toBeTruthy();
      expect(backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    }
  });

  test("chat conversation flow interaction", async ({ page }) => {
    const chats = page.locator(".chat");
    const chatCount = await chats.count();

    if (chatCount > 1) {
      // Check conversation order
      for (let i = 0; i < Math.min(chatCount, 3); i++) {
        const chat = chats.nth(i);
        await expect(chat).toBeVisible();

        const chatBubble = chat.locator(".chat-bubble");
        await expect(chatBubble).toBeVisible();
      }
    }
  });

  test("chat bubble keyboard navigation", async ({ page }) => {
    // Focus first interactive element in chat
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    const focusedCount = await focusedElement.count();

    if (focusedCount > 0) {
      // Should be within a chat bubble or chat container
      const isInChat = await focusedElement.evaluate((el) => {
        return !!el.closest(".chat") || !!el.closest(".chat-bubble");
      });

      if (isInChat) {
        // Test activation with Enter
        await page.keyboard.press("Enter");
        await expect(focusedElement).toBeVisible();
      }
    }
  });

  test("chat bubble responsive behavior", async ({ page }) => {
    const chatBubble = page.locator(".chat-bubble").first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(chatBubble).toBeVisible();

    const desktopSize = await chatBubble.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(chatBubble).toBeVisible();

    const mobileSize = await chatBubble.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Chat bubble should adapt to mobile
    expect(mobileSize.width).toBeLessThanOrEqual(desktopSize.width);
    expect(mobileSize.height).toBeGreaterThan(0);
  });

  test("chat timestamps and metadata", async ({ page }) => {
    // Look for time elements
    const timeElements = page.locator(".chat time, .chat .text-xs");
    const timeCount = await timeElements.count();

    if (timeCount > 0) {
      const timeElement = timeElements.first();
      await expect(timeElement).toBeVisible();

      const timeText = await timeElement.textContent();
      expect(timeText?.trim()).toBeTruthy();
    }
  });

  test("chat bubble text wrapping", async ({ page }) => {
    // Look for chat bubbles with longer text
    const chatBubbles = page.locator(".chat-bubble");
    const bubbleCount = await chatBubbles.count();

    for (let i = 0; i < Math.min(bubbleCount, 3); i++) {
      const bubble = chatBubbles.nth(i);
      const text = await bubble.textContent();

      if (text && text.length > 50) {
        // Long text should wrap properly
        await expect(bubble).toBeVisible();

        const boundingBox = await bubble.boundingBox();
        expect(boundingBox?.width).toBeLessThan(600); // Should not be too wide
        expect(boundingBox?.height).toBeGreaterThan(30); // Should have height for wrapping
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="message"')).toBeVisible();
    await expect(page.locator('text="alignment"')).toBeVisible();
    await expect(page.locator('text="avatar"')).toBeVisible();
    await expect(page.locator('text="color"')).toBeVisible();
  });
});
