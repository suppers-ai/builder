import { expect, test } from "@playwright/test";

test.describe("ChatBubble Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/chat-bubble");
    await page.waitForLoadState("networkidle");
  });

  test("chat bubble variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("chatbubble-basic-variants.png");
  });

  test("chat bubble alignment visual regression", async ({ page }) => {
    const alignmentSection = page.locator(".card").nth(1);
    await expect(alignmentSection).toHaveScreenshot("chatbubble-alignment.png");
  });

  test("chat bubble colors visual regression", async ({ page }) => {
    const colorsSection = page.locator(".card").nth(2);
    await expect(colorsSection).toHaveScreenshot("chatbubble-colors.png");
  });

  test("chat bubble with avatar visual regression", async ({ page }) => {
    const avatarSection = page.locator(".card").nth(3);
    await expect(avatarSection).toHaveScreenshot("chatbubble-avatar.png");
  });

  test("chat conversation flow", async ({ page }) => {
    // Create a realistic chat conversation
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4 max-w-md mx-auto";
      container.innerHTML = `
        <!-- User message -->
        <div class="chat chat-end">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img src="https://placeimg.com/40/40/people" />
            </div>
          </div>
          <div class="chat-header">
            You
            <time class="text-xs opacity-50">12:45</time>
          </div>
          <div class="chat-bubble">Hello there!</div>
          <div class="chat-footer opacity-50">
            Delivered
          </div>
        </div>
        
        <!-- Bot/Other user message -->
        <div class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img src="https://placeimg.com/40/40/animals" />
            </div>
          </div>
          <div class="chat-header">
            Assistant
            <time class="text-xs opacity-50">12:46</time>
          </div>
          <div class="chat-bubble chat-bubble-primary">Hi! How can I help you today?</div>
        </div>
        
        <!-- Another user message -->
        <div class="chat chat-end">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img src="https://placeimg.com/40/40/people" />
            </div>
          </div>
          <div class="chat-bubble">I need help with my project</div>
          <div class="chat-footer opacity-50">
            Seen at 12:46
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("chatbubble-conversation-flow.png");
  });

  test("chat bubble color variants", async ({ page }) => {
    // Create chat bubbles with different colors
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="chat chat-start">
          <div class="chat-bubble">Default bubble</div>
        </div>
        
        <div class="chat chat-start">
          <div class="chat-bubble chat-bubble-primary">Primary bubble</div>
        </div>
        
        <div class="chat chat-start">
          <div class="chat-bubble chat-bubble-secondary">Secondary bubble</div>
        </div>
        
        <div class="chat chat-start">
          <div class="chat-bubble chat-bubble-accent">Accent bubble</div>
        </div>
        
        <div class="chat chat-start">
          <div class="chat-bubble chat-bubble-info">Info bubble</div>
        </div>
        
        <div class="chat chat-start">
          <div class="chat-bubble chat-bubble-success">Success bubble</div>
        </div>
        
        <div class="chat chat-start">
          <div class="chat-bubble chat-bubble-warning">Warning bubble</div>
        </div>
        
        <div class="chat chat-start">
          <div class="chat-bubble chat-bubble-error">Error bubble</div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("chatbubble-color-variants.png");
  });

  test("chat bubble with different content types", async ({ page }) => {
    // Create chat bubbles with various content
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Text message -->
        <div class="chat chat-start">
          <div class="chat-bubble">Simple text message</div>
        </div>
        
        <!-- Long message -->
        <div class="chat chat-end">
          <div class="chat-bubble">This is a much longer message that spans multiple lines to test how the chat bubble handles longer content and wrapping behavior.</div>
        </div>
        
        <!-- Message with emoji -->
        <div class="chat chat-start">
          <div class="chat-bubble">Great! 😄 Let's get started 🚀</div>
        </div>
        
        <!-- Message with inline code -->
        <div class="chat chat-end">
          <div class="chat-bubble">You can use <code>npm install</code> to install packages</div>
        </div>
        
        <!-- Message with link -->
        <div class="chat chat-start">
          <div class="chat-bubble">Check out <a href="#" class="link">this link</a> for more info</div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("chatbubble-content-types.png");
  });

  test("chat bubble in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const chatSection = page.locator(".chat").first();
      await expect(chatSection).toHaveScreenshot(`chatbubble-theme-${theme}.png`);
    }
  });

  test("chat bubble responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const chatSection = page.locator(".chat").first();
      await expect(chatSection).toHaveScreenshot(`chatbubble-${viewport.name}.png`);
    }
  });

  test("chat bubble with complete metadata", async ({ page }) => {
    // Create chat with full metadata (header, footer, timestamp)
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img src="https://placeimg.com/40/40/people" />
            </div>
          </div>
          <div class="chat-header">
            John Doe
            <time class="text-xs opacity-50">2 hours ago</time>
          </div>
          <div class="chat-bubble">Hey, how's it going?</div>
          <div class="chat-footer opacity-50">
            Seen
          </div>
        </div>
        
        <div class="chat chat-end">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img src="https://placeimg.com/40/40/animals" />
            </div>
          </div>
          <div class="chat-header">
            You
            <time class="text-xs opacity-50">1 hour ago</time>
          </div>
          <div class="chat-bubble chat-bubble-primary">Going well! Working on some new features.</div>
          <div class="chat-footer opacity-50">
            Delivered
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("chatbubble-complete-metadata.png");
  });

  test("chat bubble alignment variations", async ({ page }) => {
    // Test different alignment options
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Start aligned -->
        <div class="chat chat-start">
          <div class="chat-bubble">Start aligned message (left)</div>
        </div>
        
        <!-- End aligned -->
        <div class="chat chat-end">
          <div class="chat-bubble">End aligned message (right)</div>
        </div>
        
        <!-- Start with avatar -->
        <div class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <span class="text-xs">JS</span>
            </div>
          </div>
          <div class="chat-bubble">Message with avatar on left</div>
        </div>
        
        <!-- End with avatar -->
        <div class="chat chat-end">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full bg-secondary text-secondary-content flex items-center justify-center">
              <span class="text-xs">ME</span>
            </div>
          </div>
          <div class="chat-bubble">Message with avatar on right</div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("chatbubble-alignment-variations.png");
  });
});
