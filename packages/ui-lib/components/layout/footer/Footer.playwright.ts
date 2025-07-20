import { expect, test } from "@playwright/test";

test.describe("Footer Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/footer");
    await page.waitForLoadState("networkidle");
  });

  test("footer basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("footer-basic-variants.png");
  });

  test("footer with logo visual regression", async ({ page }) => {
    const logoSection = page.locator(".card").nth(1);
    await expect(logoSection).toHaveScreenshot("footer-with-logo.png");
  });

  test("footer with social links visual regression", async ({ page }) => {
    const socialSection = page.locator(".card").nth(2);
    await expect(socialSection).toHaveScreenshot("footer-with-social.png");
  });

  test("footer newsletter signup visual regression", async ({ page }) => {
    const newsletterSection = page.locator(".card").nth(3);
    await expect(newsletterSection).toHaveScreenshot("footer-newsletter.png");
  });

  // Theme testing
  test("footers in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const footerSection = page.locator(".card").first();
      await expect(footerSection).toHaveScreenshot(`footer-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("footers responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const footerSection = page.locator(".card").first();
      await expect(footerSection).toHaveScreenshot(`footer-${viewport.name}.png`);
    }
  });

  test("footer with different configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "space-y-8";
      container.innerHTML = `
        <footer class="footer p-10 bg-neutral text-neutral-content">
          <div>
            <span class="footer-title">Services</span>
            <a class="link link-hover">Branding</a>
            <a class="link link-hover">Design</a>
            <a class="link link-hover">Marketing</a>
            <a class="link link-hover">Advertisement</a>
          </div>
          <div>
            <span class="footer-title">Company</span>
            <a class="link link-hover">About us</a>
            <a class="link link-hover">Contact</a>
            <a class="link link-hover">Jobs</a>
            <a class="link link-hover">Press kit</a>
          </div>
          <div>
            <span class="footer-title">Legal</span>
            <a class="link link-hover">Terms of use</a>
            <a class="link link-hover">Privacy policy</a>
            <a class="link link-hover">Cookie policy</a>
          </div>
        </footer>
        <footer class="footer px-10 py-4 border-t bg-base-200 text-base-content border-base-300">
          <div class="items-center grid-flow-col">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Company Ltd. <br/>Providing reliable tech since 1992</p>
          </div>
          <div class="md:place-self-center md:justify-self-end">
            <div class="grid grid-flow-col gap-4">
              <a><svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a>
              <a><svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></a>
              <a><svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg></a>
            </div>
          </div>
        </footer>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("footer-complete-example.png");
  });
});
