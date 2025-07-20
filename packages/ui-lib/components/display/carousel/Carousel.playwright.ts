import { expect, test } from "@playwright/test";

test.describe("Carousel Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/carousel");
    await page.waitForLoadState("networkidle");
  });

  test("carousel variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("carousel-basic-variants.png");
  });

  test("carousel with indicators visual regression", async ({ page }) => {
    const indicatorsSection = page.locator(".card").nth(1);
    await expect(indicatorsSection).toHaveScreenshot("carousel-indicators.png");
  });

  test("carousel navigation visual regression", async ({ page }) => {
    const navigationSection = page.locator(".card").nth(2);
    await expect(navigationSection).toHaveScreenshot("carousel-navigation.png");
  });

  test("carousel slide transitions", async ({ page }) => {
    const carousel = page.locator(".carousel").first();

    // Initial state
    await expect(carousel).toHaveScreenshot("carousel-initial.png");

    // Look for next button or indicator
    const nextButton = page.locator(
      '.carousel .btn, .carousel-item input[type="radio"]:nth-child(2)',
    );
    if (await nextButton.count() > 0) {
      await nextButton.first().click();
      await page.waitForTimeout(500); // Wait for transition
      await expect(carousel).toHaveScreenshot("carousel-next-slide.png");
    }
  });

  test("carousel item variations", async ({ page }) => {
    // Create different carousel item types
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Image carousel -->
        <div class="carousel w-full">
          <div id="slide1" class="carousel-item relative w-full">
            <img src="https://placeimg.com/800/200/arch" class="w-full" />
            <div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <a href="#slide4" class="btn btn-circle">❮</a> 
              <a href="#slide2" class="btn btn-circle">❯</a>
            </div>
          </div>
          <div id="slide2" class="carousel-item relative w-full">
            <img src="https://placeimg.com/800/200/nature" class="w-full" />
            <div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <a href="#slide1" class="btn btn-circle">❮</a> 
              <a href="#slide3" class="btn btn-circle">❯</a>
            </div>
          </div>
        </div>
        
        <!-- Card carousel -->
        <div class="carousel carousel-center max-w-md p-4 space-x-4 bg-neutral rounded-box">
          <div class="carousel-item">
            <div class="card card-compact w-64 bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title">Card 1</h2>
                <p>Content for card 1</p>
              </div>
            </div>
          </div>
          <div class="carousel-item">
            <div class="card card-compact w-64 bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title">Card 2</h2>
                <p>Content for card 2</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Vertical carousel -->
        <div class="carousel carousel-vertical rounded-box h-96">
          <div class="carousel-item h-full">
            <img src="https://placeimg.com/256/400/arch" />
          </div>
          <div class="carousel-item h-full">
            <img src="https://placeimg.com/256/400/nature" />
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("carousel-item-variations.png");
  });

  test("carousel with indicators", async ({ page }) => {
    // Create carousel with radio button indicators
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="carousel w-full">
          <div id="item1" class="carousel-item w-full">
            <img src="https://placeimg.com/800/200/arch" class="w-full" />
          </div> 
          <div id="item2" class="carousel-item w-full">
            <img src="https://placeimg.com/800/200/nature" class="w-full" />
          </div> 
          <div id="item3" class="carousel-item w-full">
            <img src="https://placeimg.com/800/200/people" class="w-full" />
          </div> 
          <div id="item4" class="carousel-item w-full">
            <img src="https://placeimg.com/800/200/tech" class="w-full" />
          </div>
        </div> 
        <div class="flex justify-center w-full py-2 gap-2">
          <a href="#item1" class="btn btn-xs">1</a> 
          <a href="#item2" class="btn btn-xs">2</a> 
          <a href="#item3" class="btn btn-xs">3</a> 
          <a href="#item4" class="btn btn-xs">4</a>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("carousel-with-indicators.png");
  });

  test("carousel in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const carouselSection = page.locator(".carousel").first();
      await expect(carouselSection).toHaveScreenshot(`carousel-theme-${theme}.png`);
    }
  });

  test("carousel responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const carouselSection = page.locator(".carousel").first();
      await expect(carouselSection).toHaveScreenshot(`carousel-${viewport.name}.png`);
    }
  });

  test("carousel snap behavior", async ({ page }) => {
    // Create carousel with different snap behaviors
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Snap start -->
        <div class="carousel carousel-center rounded-box max-w-md space-x-4 p-4">
          <div class="carousel-item">
            <div class="w-64 h-32 bg-primary rounded-box flex items-center justify-center text-primary-content">
              <span>Snap Start 1</span>
            </div>
          </div>
          <div class="carousel-item">
            <div class="w-64 h-32 bg-secondary rounded-box flex items-center justify-center text-secondary-content">
              <span>Snap Start 2</span>
            </div>
          </div>
        </div>
        
        <!-- Snap end -->
        <div class="carousel carousel-end rounded-box max-w-md space-x-4 p-4">
          <div class="carousel-item">
            <div class="w-64 h-32 bg-accent rounded-box flex items-center justify-center text-accent-content">
              <span>Snap End 1</span>
            </div>
          </div>
          <div class="carousel-item">
            <div class="w-64 h-32 bg-neutral rounded-box flex items-center justify-center text-neutral-content">
              <span>Snap End 2</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("carousel-snap-behavior.png");
  });

  test("carousel navigation controls", async ({ page }) => {
    // Create carousel with various navigation controls
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="carousel w-full relative">
          <div class="carousel-item relative w-full">
            <img src="https://placeimg.com/800/200/arch" class="w-full" />
            <div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <button class="btn btn-circle btn-outline">❮</button>
              <button class="btn btn-circle btn-outline">❯</button>
            </div>
          </div>
        </div>
        <div class="flex justify-center mt-4 space-x-2">
          <button class="btn btn-sm btn-circle">1</button>
          <button class="btn btn-sm btn-circle btn-primary">2</button>
          <button class="btn btn-sm btn-circle">3</button>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("carousel-navigation-controls.png");
  });
});
