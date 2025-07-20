import { expect, test } from "@playwright/test";

test.describe("Avatar Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to avatar component page
    await page.goto("http://localhost:8001/components/display/avatar");
    await page.waitForLoadState("networkidle");
  });

  test("avatar variants visual regression", async ({ page }) => {
    // Test basic avatar section - get the first card with avatars
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("avatar-basic-variants.png");
  });

  test("avatar sizes visual regression", async ({ page }) => {
    // Test avatar sizes section
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("avatar-sizes.png");
  });

  test("avatar status indicators visual regression", async ({ page }) => {
    // Test avatar with status indicators
    const statusSection = page.locator(".card").nth(2);
    await expect(statusSection).toHaveScreenshot("avatar-status.png");
  });

  test("avatar placeholders visual regression", async ({ page }) => {
    // Test avatar placeholders and initials
    const placeholderSection = page.locator(".card").nth(3);
    await expect(placeholderSection).toHaveScreenshot("avatar-placeholders.png");
  });

  // Theme testing
  test("avatars in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of avatar examples
      const avatarSection = page.locator(".card").first();
      await expect(avatarSection).toHaveScreenshot(`avatars-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("avatars responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const avatarSection = page.locator(".card").first();
      await expect(avatarSection).toHaveScreenshot(`avatars-${viewport.name}.png`);
    }
  });

  // Avatar size variations
  test("avatar size variations visual regression", async ({ page }) => {
    // Create test avatars in different sizes
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-4 flex flex-col items-center";
      container.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="avatar">
            <img src="https://via.placeholder.com/24" alt="XS Avatar" class="w-6 h-6 rounded-full" />
          </div>
          <span>XS (24px)</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="avatar">
            <img src="https://via.placeholder.com/32" alt="SM Avatar" class="w-8 h-8 rounded-full" />
          </div>
          <span>SM (32px)</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="avatar">
            <img src="https://via.placeholder.com/48" alt="MD Avatar" class="w-12 h-12 rounded-full" />
          </div>
          <span>MD (48px)</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="avatar">
            <img src="https://via.placeholder.com/64" alt="LG Avatar" class="w-16 h-16 rounded-full" />
          </div>
          <span>LG (64px)</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="avatar">
            <img src="https://via.placeholder.com/96" alt="XL Avatar" class="w-24 h-24 rounded-full" />
          </div>
          <span>XL (96px)</span>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("avatar-sizes-comparison.png");
  });

  // Avatar with ring variations
  test("avatar ring variations visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6 text-center";
      container.innerHTML = `
        <div>
          <h3 class="mb-4 font-bold">No Ring</h3>
          <div class="avatar">
            <img src="https://via.placeholder.com/64" alt="No Ring" class="w-16 h-16 rounded-full" />
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Primary Ring</h3>
          <div class="avatar">
            <img src="https://via.placeholder.com/64" alt="Primary Ring" class="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2" />
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Secondary Ring</h3>
          <div class="avatar">
            <img src="https://via.placeholder.com/64" alt="Secondary Ring" class="w-16 h-16 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2" />
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Accent Ring</h3>
          <div class="avatar">
            <img src="https://via.placeholder.com/64" alt="Accent Ring" class="w-16 h-16 rounded-full ring ring-accent ring-offset-base-100 ring-offset-2" />
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("avatar-ring-variations.png");
  });

  // Avatar status indicators
  test("avatar status indicators visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6 grid grid-cols-2 gap-8 text-center";
      container.innerHTML = `
        <div>
          <h3 class="mb-4 font-bold">Normal</h3>
          <div class="avatar">
            <img src="https://via.placeholder.com/64" alt="Normal" class="w-16 h-16 rounded-full" />
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Online</h3>
          <div class="avatar online">
            <img src="https://via.placeholder.com/64" alt="Online" class="w-16 h-16 rounded-full" />
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Offline</h3>
          <div class="avatar offline">
            <img src="https://via.placeholder.com/64" alt="Offline" class="w-16 h-16 rounded-full" />
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Online + Ring</h3>
          <div class="avatar online">
            <img src="https://via.placeholder.com/64" alt="Online Ring" class="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2" />
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("avatar-status-indicators.png");
  });

  // Avatar placeholders
  test("avatar placeholders visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6 grid grid-cols-3 gap-8 text-center";
      container.innerHTML = `
        <div>
          <h3 class="mb-4 font-bold">Initials</h3>
          <div class="avatar">
            <div class="w-16 h-16 rounded-full bg-neutral text-neutral-content placeholder">
              <span class="text-xl">JD</span>
            </div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Single Letter</h3>
          <div class="avatar">
            <div class="w-16 h-16 rounded-full bg-neutral text-neutral-content placeholder">
              <span class="text-xl">A</span>
            </div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Default</h3>
          <div class="avatar">
            <div class="w-16 h-16 rounded-full bg-neutral text-neutral-content placeholder">
              <span class="text-xl">?</span>
            </div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Primary BG</h3>
          <div class="avatar">
            <div class="w-16 h-16 rounded-full bg-primary text-primary-content placeholder">
              <span class="text-xl">P</span>
            </div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Secondary BG</h3>
          <div class="avatar">
            <div class="w-16 h-16 rounded-full bg-secondary text-secondary-content placeholder">
              <span class="text-xl">S</span>
            </div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Accent BG</h3>
          <div class="avatar">
            <div class="w-16 h-16 rounded-full bg-accent text-accent-content placeholder">
              <span class="text-xl">A</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("avatar-placeholders.png");
  });

  // Avatar groups
  test("avatar groups visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="text-center">
          <h3 class="mb-4 font-bold">Avatar Group</h3>
          <div class="avatar-group -space-x-6 rtl:space-x-reverse">
            <div class="avatar">
              <div class="w-12 h-12">
                <img src="https://via.placeholder.com/48/FF6B6B/FFFFFF?text=A" alt="User A" class="rounded-full" />
              </div>
            </div>
            <div class="avatar">
              <div class="w-12 h-12">
                <img src="https://via.placeholder.com/48/4ECDC4/FFFFFF?text=B" alt="User B" class="rounded-full" />
              </div>
            </div>
            <div class="avatar">
              <div class="w-12 h-12">
                <img src="https://via.placeholder.com/48/45B7D1/FFFFFF?text=C" alt="User C" class="rounded-full" />
              </div>
            </div>
            <div class="avatar">
              <div class="w-12 h-12">
                <div class="rounded-full bg-neutral text-neutral-content placeholder">
                  <span>+3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Avatar Stack with Rings</h3>
          <div class="avatar-group -space-x-6 rtl:space-x-reverse">
            <div class="avatar">
              <div class="w-12 h-12">
                <img src="https://via.placeholder.com/48/FF6B6B/FFFFFF?text=1" alt="User 1" class="rounded-full ring ring-primary ring-offset-base-100 ring-offset-2" />
              </div>
            </div>
            <div class="avatar">
              <div class="w-12 h-12">
                <img src="https://via.placeholder.com/48/4ECDC4/FFFFFF?text=2" alt="User 2" class="rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2" />
              </div>
            </div>
            <div class="avatar">
              <div class="w-12 h-12">
                <img src="https://via.placeholder.com/48/45B7D1/FFFFFF?text=3" alt="User 3" class="rounded-full ring ring-accent ring-offset-base-100 ring-offset-2" />
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("avatar-groups.png");
  });

  // Accessibility testing
  test("avatar accessibility visual regression", async ({ page }) => {
    // Test high contrast mode
    await page.emulateMedia({ reducedMotion: "reduce" });

    const avatarSection = page.locator(".card").first();
    await expect(avatarSection).toHaveScreenshot("avatars-reduced-motion.png");
  });

  // Avatar loading states
  test("avatar loading and error states", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6 grid grid-cols-2 gap-8 text-center";
      container.innerHTML = `
        <div>
          <h3 class="mb-4 font-bold">Loading State</h3>
          <div class="avatar">
            <div class="w-16 h-16 rounded-full bg-base-300 animate-pulse"></div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Error Fallback</h3>
          <div class="avatar">
            <div class="w-16 h-16 rounded-full bg-error text-error-content placeholder">
              <span class="text-xl">!</span>
            </div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Skeleton</h3>
          <div class="flex items-center gap-4">
            <div class="avatar">
              <div class="w-16 h-16 rounded-full bg-base-300 animate-pulse"></div>
            </div>
            <div class="space-y-2">
              <div class="h-4 bg-base-300 rounded w-24 animate-pulse"></div>
              <div class="h-3 bg-base-300 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Profile Card</h3>
          <div class="card w-64 bg-base-100 shadow-xl">
            <div class="card-body items-center text-center">
              <div class="avatar">
                <div class="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src="https://via.placeholder.com/64/6366F1/FFFFFF?text=U" alt="User" class="rounded-full" />
                </div>
              </div>
              <h2 class="card-title">User Name</h2>
              <p>Software Developer</p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("avatar-states.png");
  });
});
