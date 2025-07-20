import { expect, test } from "@playwright/test";

test.describe("Timeline Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/timeline");
    await page.waitForLoadState("networkidle");
  });

  test("timeline variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("timeline-basic-variants.png");
  });

  test("timeline vertical visual regression", async ({ page }) => {
    const verticalSection = page.locator(".card").nth(1);
    await expect(verticalSection).toHaveScreenshot("timeline-vertical.png");
  });

  test("timeline horizontal visual regression", async ({ page }) => {
    const horizontalSection = page.locator(".card").nth(2);
    await expect(horizontalSection).toHaveScreenshot("timeline-horizontal.png");
  });

  test("timeline with icons and content", async ({ page }) => {
    // Create timeline with various content types
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-8";
      container.innerHTML = `
        <!-- Vertical timeline with icons -->
        <div>
          <h3 class="text-xl font-bold mb-4">Project Timeline</h3>
          <ul class="timeline timeline-vertical">
            <li>
              <div class="timeline-start timeline-box">
                <div class="font-bold">Project Planning</div>
                <div class="text-sm opacity-70">Define scope and requirements</div>
                <time class="text-xs text-info">March 1, 2024</time>
              </div>
              <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-primary">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.83a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                </svg>
              </div>
              <hr class="bg-primary" />
            </li>
            <li>
              <hr class="bg-primary" />
              <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-secondary">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.83a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="timeline-end timeline-box">
                <div class="font-bold">Development Phase</div>
                <div class="text-sm opacity-70">Build core features and functionality</div>
                <time class="text-xs text-info">March 15, 2024</time>
              </div>
              <hr class="bg-secondary" />
            </li>
            <li>
              <hr class="bg-secondary" />
              <div class="timeline-start timeline-box">
                <div class="font-bold">Testing & QA</div>
                <div class="text-sm opacity-70">Comprehensive testing and bug fixes</div>
                <time class="text-xs text-info">April 1, 2024</time>
              </div>
              <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-accent">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.83a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                </svg>
              </div>
              <hr class="bg-accent" />
            </li>
            <li>
              <hr class="bg-accent" />
              <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-success">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.83a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="timeline-end timeline-box">
                <div class="font-bold">Launch</div>
                <div class="text-sm opacity-70">Deploy to production and monitor</div>
                <time class="text-xs text-info">April 15, 2024</time>
              </div>
            </li>
          </ul>
        </div>
        
        <!-- Horizontal timeline -->
        <div>
          <h3 class="text-xl font-bold mb-4">Release History</h3>
          <ul class="timeline timeline-horizontal">
            <li>
              <div class="timeline-start">v1.0</div>
              <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.83a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="timeline-end timeline-box">Initial Release</div>
              <hr />
            </li>
            <li>
              <hr />
              <div class="timeline-start">v1.1</div>
              <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.83a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="timeline-end timeline-box">Bug Fixes</div>
              <hr />
            </li>
            <li>
              <hr />
              <div class="timeline-start">v2.0</div>
              <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.83a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="timeline-end timeline-box">Major Update</div>
            </li>
          </ul>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("timeline-icons-content.png");
  });

  test("timeline layout variations", async ({ page }) => {
    // Create different timeline layouts
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-8";
      container.innerHTML = `
        <!-- Compact timeline -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Compact Timeline</h3>
          <ul class="timeline timeline-compact timeline-vertical">
            <li>
              <div class="timeline-start timeline-box">Step 1</div>
              <div class="timeline-middle">
                <div class="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <hr />
            </li>
            <li>
              <hr />
              <div class="timeline-middle">
                <div class="w-2 h-2 bg-secondary rounded-full"></div>
              </div>
              <div class="timeline-end timeline-box">Step 2</div>
              <hr />
            </li>
            <li>
              <hr />
              <div class="timeline-start timeline-box">Step 3</div>
              <div class="timeline-middle">
                <div class="w-2 h-2 bg-accent rounded-full"></div>
              </div>
            </li>
          </ul>
        </div>
        
        <!-- Snap timeline -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Snap Timeline</h3>
          <ul class="timeline timeline-snap-icon timeline-vertical">
            <li>
              <div class="timeline-start timeline-box">
                <div class="font-bold">Meeting Scheduled</div>
                <time class="text-xs">9:00 AM</time>
              </div>
              <div class="timeline-middle">
                <div class="bg-info text-info-content rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
              </div>
              <hr />
            </li>
            <li>
              <hr />
              <div class="timeline-middle">
                <div class="bg-success text-success-content rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
              </div>
              <div class="timeline-end timeline-box">
                <div class="font-bold">Presentation</div>
                <time class="text-xs">10:30 AM</time>
              </div>
              <hr />
            </li>
            <li>
              <hr />
              <div class="timeline-start timeline-box">
                <div class="font-bold">Follow-up</div>
                <time class="text-xs">2:00 PM</time>
              </div>
              <div class="timeline-middle">
                <div class="bg-warning text-warning-content rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
              </div>
            </li>
          </ul>
        </div>
        
        <!-- Responsive timeline -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Responsive Timeline</h3>
          <ul class="timeline timeline-vertical lg:timeline-horizontal">
            <li>
              <div class="timeline-start">Q1 2024</div>
              <div class="timeline-middle">
                <div class="w-3 h-3 bg-primary rounded-full"></div>
              </div>
              <div class="timeline-end timeline-box">Planning</div>
              <hr />
            </li>
            <li>
              <hr />
              <div class="timeline-start">Q2 2024</div>
              <div class="timeline-middle">
                <div class="w-3 h-3 bg-secondary rounded-full"></div>
              </div>
              <div class="timeline-end timeline-box">Development</div>
              <hr />
            </li>
            <li>
              <hr />
              <div class="timeline-start">Q3 2024</div>
              <div class="timeline-middle">
                <div class="w-3 h-3 bg-accent rounded-full"></div>
              </div>
              <div class="timeline-end timeline-box">Launch</div>
            </li>
          </ul>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("timeline-layout-variations.png");
  });

  test("timeline with rich content", async ({ page }) => {
    // Create timeline with detailed content
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="max-w-4xl">
          <h3 class="text-xl font-bold mb-6">Product Development Journey</h3>
          <ul class="timeline timeline-vertical">
            <li>
              <div class="timeline-start timeline-box">
                <div class="flex items-start gap-3">
                  <div class="avatar">
                    <div class="w-10 rounded-full">
                      <img src="https://placeimg.com/40/40/people" alt="Team member" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold">Research & Discovery</div>
                    <p class="text-sm opacity-70 mt-1">Conducted user interviews and market analysis to understand customer needs and pain points.</p>
                    <div class="flex gap-2 mt-2">
                      <span class="badge badge-primary badge-sm">Research</span>
                      <span class="badge badge-outline badge-sm">30 Days</span>
                    </div>
                    <time class="text-xs text-info block mt-2">January 2024</time>
                  </div>
                </div>
              </div>
              <div class="timeline-middle">
                <div class="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <hr class="bg-primary" />
            </li>
            <li>
              <hr class="bg-primary" />
              <div class="timeline-middle">
                <div class="w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div class="timeline-end timeline-box">
                <div class="flex items-start gap-3">
                  <div class="avatar">
                    <div class="w-10 rounded-full">
                      <img src="https://placeimg.com/40/40/tech" alt="Design team" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold">Design & Prototyping</div>
                    <p class="text-sm opacity-70 mt-1">Created wireframes, mockups, and interactive prototypes. Validated designs with user testing.</p>
                    <div class="mt-2">
                      <div class="grid grid-cols-3 gap-2">
                        <div class="bg-base-200 p-2 rounded text-center text-xs">Wireframes</div>
                        <div class="bg-base-200 p-2 rounded text-center text-xs">Mockups</div>
                        <div class="bg-base-200 p-2 rounded text-center text-xs">Prototypes</div>
                      </div>
                    </div>
                    <div class="flex gap-2 mt-2">
                      <span class="badge badge-secondary badge-sm">Design</span>
                      <span class="badge badge-outline badge-sm">45 Days</span>
                    </div>
                    <time class="text-xs text-info block mt-2">February 2024</time>
                  </div>
                </div>
              </div>
              <hr class="bg-secondary" />
            </li>
            <li>
              <hr class="bg-secondary" />
              <div class="timeline-start timeline-box">
                <div class="flex items-start gap-3">
                  <div class="avatar">
                    <div class="w-10 rounded-full">
                      <img src="https://placeimg.com/40/40/arch" alt="Dev team" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold">Development & Testing</div>
                    <p class="text-sm opacity-70 mt-1">Built the product using modern technologies. Implemented comprehensive testing and CI/CD.</p>
                    <div class="stats stats-horizontal shadow mt-2 text-xs">
                      <div class="stat p-2">
                        <div class="stat-title text-xs">Lines of Code</div>
                        <div class="stat-value text-sm">50K+</div>
                      </div>
                      <div class="stat p-2">
                        <div class="stat-title text-xs">Test Coverage</div>
                        <div class="stat-value text-sm">95%</div>
                      </div>
                    </div>
                    <div class="flex gap-2 mt-2">
                      <span class="badge badge-accent badge-sm">Development</span>
                      <span class="badge badge-outline badge-sm">90 Days</span>
                    </div>
                    <time class="text-xs text-info block mt-2">March - May 2024</time>
                  </div>
                </div>
              </div>
              <div class="timeline-middle">
                <div class="w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("timeline-rich-content.png");
  });

  test("timeline in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const timelineSection = page.locator(".timeline").first();
      await expect(timelineSection).toHaveScreenshot(`timeline-theme-${theme}.png`);
    }
  });

  test("timeline responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const timelineSection = page.locator(".timeline").first();
      await expect(timelineSection).toHaveScreenshot(`timeline-${viewport.name}.png`);
    }
  });

  test("timeline connector styles", async ({ page }) => {
    // Create timeline with different connector styles
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-8";
      container.innerHTML = `
        <!-- Dotted connectors -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Dotted Connectors</h3>
          <ul class="timeline timeline-vertical">
            <li>
              <div class="timeline-start timeline-box">Event 1</div>
              <div class="timeline-middle">
                <div class="w-3 h-3 bg-primary rounded-full"></div>
              </div>
              <hr class="bg-primary" style="border-style: dotted;" />
            </li>
            <li>
              <hr class="bg-primary" style="border-style: dotted;" />
              <div class="timeline-middle">
                <div class="w-3 h-3 bg-secondary rounded-full"></div>
              </div>
              <div class="timeline-end timeline-box">Event 2</div>
              <hr class="bg-secondary" style="border-style: dotted;" />
            </li>
            <li>
              <hr class="bg-secondary" style="border-style: dotted;" />
              <div class="timeline-start timeline-box">Event 3</div>
              <div class="timeline-middle">
                <div class="w-3 h-3 bg-accent rounded-full"></div>
              </div>
            </li>
          </ul>
        </div>
        
        <!-- Thick connectors -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Thick Connectors</h3>
          <ul class="timeline timeline-vertical">
            <li>
              <div class="timeline-start timeline-box">Start</div>
              <div class="timeline-middle">
                <div class="w-5 h-5 bg-primary rounded-full border-2 border-white"></div>
              </div>
              <hr class="bg-primary h-1" />
            </li>
            <li>
              <hr class="bg-primary h-1" />
              <div class="timeline-middle">
                <div class="w-5 h-5 bg-secondary rounded-full border-2 border-white"></div>
              </div>
              <div class="timeline-end timeline-box">Progress</div>
              <hr class="bg-secondary h-1" />
            </li>
            <li>
              <hr class="bg-secondary h-1" />
              <div class="timeline-start timeline-box">Complete</div>
              <div class="timeline-middle">
                <div class="w-5 h-5 bg-success rounded-full border-2 border-white"></div>
              </div>
            </li>
          </ul>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("timeline-connector-styles.png");
  });

  test("timeline marker variations", async ({ page }) => {
    const timeline = page.locator(".timeline").first();
    const markers = timeline.locator(".timeline-middle");

    if (await markers.count() > 0) {
      const firstMarker = markers.first();

      // Normal state
      await expect(firstMarker).toHaveScreenshot("timeline-marker-normal.png");

      // Hover state (if interactive)
      await firstMarker.hover();
      await expect(firstMarker).toHaveScreenshot("timeline-marker-hover.png");
    }
  });
});
