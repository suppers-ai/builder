import { expect, test } from "@playwright/test";

test.describe("Table Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/table");
    await page.waitForLoadState("networkidle");
  });

  test("table variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("table-basic-variants.png");
  });

  test("table sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("table-sizes.png");
  });

  test("table zebra and styling visual regression", async ({ page }) => {
    const stylingSection = page.locator(".card").nth(2);
    await expect(stylingSection).toHaveScreenshot("table-styling.png");
  });

  test("table with complex content", async ({ page }) => {
    // Create table with various content types
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- Data table with sorting -->
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" class="checkbox" />
                  </label>
                </th>
                <th>Name <span class="text-xs">↕️</span></th>
                <th>Job <span class="text-xs">↕️</span></th>
                <th>Company <span class="text-xs">↕️</span></th>
                <th>Status <span class="text-xs">↕️</span></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" class="checkbox" />
                  </label>
                </th>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12">
                        <img src="https://placeimg.com/40/40/people" alt="Avatar" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold">Hart Hagerty</div>
                      <div class="text-sm opacity-50">United States</div>
                    </div>
                  </div>
                </td>
                <td>
                  Zemlak, Daniel and Leannon
                  <br/>
                  <span class="badge badge-ghost badge-sm">Desktop Support Technician</span>
                </td>
                <td>Purple</td>
                <td>
                  <span class="badge badge-success badge-sm">Active</span>
                </td>
                <th>
                  <button class="btn btn-ghost btn-xs">details</button>
                  <button class="btn btn-ghost btn-xs">edit</button>
                </th>
              </tr>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" class="checkbox" />
                  </label>
                </th>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12">
                        <img src="https://placeimg.com/40/40/animals" alt="Avatar" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold">Brice Swyre</div>
                      <div class="text-sm opacity-50">China</div>
                    </div>
                  </div>
                </td>
                <td>
                  Carroll Group
                  <br/>
                  <span class="badge badge-ghost badge-sm">Tax Accountant</span>
                </td>
                <td>Red</td>
                <td>
                  <span class="badge badge-error badge-sm">Inactive</span>
                </td>
                <th>
                  <button class="btn btn-ghost btn-xs">details</button>
                  <button class="btn btn-ghost btn-xs">edit</button>
                </th>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Compact table -->
        <div class="overflow-x-auto">
          <table class="table table-compact w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover">
                <td>001</td>
                <td>Wireless Headphones</td>
                <td>$99.99</td>
                <td>45</td>
                <td>Electronics</td>
              </tr>
              <tr class="hover">
                <td>002</td>
                <td>Smartphone Case</td>
                <td>$24.99</td>
                <td>120</td>
                <td>Accessories</td>
              </tr>
              <tr class="hover">
                <td>003</td>
                <td>Laptop Stand</td>
                <td>$39.99</td>
                <td>23</td>
                <td>Office</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("table-complex-content.png");
  });

  test("table size variations", async ({ page }) => {
    // Create tables with different sizes
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- Extra small table -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Extra Small Table</h3>
          <div class="overflow-x-auto">
            <table class="table table-xs">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Job</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cy Ganderton</td>
                  <td>Quality Control Specialist</td>
                  <td>Littel, Schaden and Vandervort</td>
                </tr>
                <tr>
                  <td>Hart Hagerty</td>
                  <td>Desktop Support Technician</td>
                  <td>Zemlak, Daniel and Leannon</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Small table -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Small Table</h3>
          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Job</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cy Ganderton</td>
                  <td>Quality Control Specialist</td>
                  <td>Littel, Schaden and Vandervort</td>
                </tr>
                <tr>
                  <td>Hart Hagerty</td>
                  <td>Desktop Support Technician</td>
                  <td>Zemlak, Daniel and Leannon</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Large table -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Large Table</h3>
          <div class="overflow-x-auto">
            <table class="table table-lg">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Job</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cy Ganderton</td>
                  <td>Quality Control Specialist</td>
                  <td>Littel, Schaden and Vandervort</td>
                </tr>
                <tr>
                  <td>Hart Hagerty</td>
                  <td>Desktop Support Technician</td>
                  <td>Zemlak, Daniel and Leannon</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("table-size-variations.png");
  });

  test("table styling variants", async ({ page }) => {
    // Create tables with different styling
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- Zebra striped table -->
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th>Job</th>
                <th>Favorite Color</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cy Ganderton</td>
                <td>Quality Control Specialist</td>
                <td>Blue</td>
              </tr>
              <tr>
                <td>Hart Hagerty</td>
                <td>Desktop Support Technician</td>
                <td>Purple</td>
              </tr>
              <tr>
                <td>Brice Swyre</td>
                <td>Tax Accountant</td>
                <td>Red</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pinned rows table -->
        <div class="overflow-x-auto">
          <table class="table table-pin-rows">
            <thead>
              <tr>
                <th>Name</th>
                <th>Job</th>
                <th>Favorite Color</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cy Ganderton</td>
                <td>Quality Control Specialist</td>
                <td>Blue</td>
              </tr>
              <tr>
                <td>Hart Hagerty</td>
                <td>Desktop Support Technician</td>
                <td>Purple</td>
              </tr>
              <tr>
                <td>Brice Swyre</td>
                <td>Tax Accountant</td>
                <td>Red</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pinned columns table -->
        <div class="overflow-x-auto">
          <table class="table table-pin-cols">
            <thead>
              <tr>
                <th>Name</th>
                <th>Job</th>
                <th>Company</th>
                <th>Location</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cy Ganderton</td>
                <td>Quality Control Specialist</td>
                <td>Littel, Schaden and Vandervort</td>
                <td>Canada</td>
                <td>cy.ganderton@example.com</td>
                <td>+1 234 567 8901</td>
              </tr>
              <tr>
                <td>Hart Hagerty</td>
                <td>Desktop Support Technician</td>
                <td>Zemlak, Daniel and Leannon</td>
                <td>United States</td>
                <td>hart.hagerty@example.com</td>
                <td>+1 234 567 8902</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("table-styling-variants.png");
  });

  test("table in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const tableSection = page.locator(".table").first();
      await expect(tableSection).toHaveScreenshot(`table-theme-${theme}.png`);
    }
  });

  test("table responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const tableSection = page.locator(".table").first();
      await expect(tableSection).toHaveScreenshot(`table-${viewport.name}.png`);
    }
  });

  test("table with interactive elements", async ({ page }) => {
    // Create table with various interactive elements
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" class="checkbox" />
                  </label>
                </th>
                <th>User</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Settings</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" class="checkbox" />
                  </label>
                </th>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12">
                        <img src="https://placeimg.com/40/40/people" alt="User avatar" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold">John Doe</div>
                      <div class="text-sm opacity-50">john@example.com</div>
                    </div>
                  </div>
                </td>
                <td>
                  <select class="select select-sm max-w-xs">
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Pending</option>
                  </select>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-xs">View</button>
                    <button class="btn btn-primary btn-xs">Edit</button>
                    <button class="btn btn-error btn-xs">Delete</button>
                  </div>
                </td>
                <td>
                  <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-xs">⋮</div>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><a>Permissions</a></li>
                      <li><a>Preferences</a></li>
                      <li><a>Export Data</a></li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" class="checkbox" />
                  </label>
                </th>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12">
                        <img src="https://placeimg.com/40/40/animals" alt="User avatar" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold">Jane Smith</div>
                      <div class="text-sm opacity-50">jane@example.com</div>
                    </div>
                  </div>
                </td>
                <td>
                  <input type="checkbox" class="toggle toggle-success" checked />
                </td>
                <td>
                  <div class="rating rating-sm">
                    <input type="radio" name="rating-1" class="mask mask-star-2 bg-orange-400" />
                    <input type="radio" name="rating-1" class="mask mask-star-2 bg-orange-400" checked />
                    <input type="radio" name="rating-1" class="mask mask-star-2 bg-orange-400" />
                    <input type="radio" name="rating-1" class="mask mask-star-2 bg-orange-400" />
                    <input type="radio" name="rating-1" class="mask mask-star-2 bg-orange-400" />
                  </div>
                </td>
                <td>
                  <div class="form-control">
                    <label class="cursor-pointer label">
                      <input type="checkbox" class="checkbox checkbox-sm" />
                      <span class="label-text">Notify</span>
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("table-interactive-elements.png");
  });

  test("table hover effects", async ({ page }) => {
    const table = page.locator(".table").first();
    const rows = table.locator("tbody tr");

    if (await rows.count() > 0) {
      const firstRow = rows.first();

      // Normal state
      await expect(firstRow).toHaveScreenshot("table-row-normal.png");

      // Hover state
      await firstRow.hover();
      await expect(firstRow).toHaveScreenshot("table-row-hover.png");
    }
  });

  test("table with loading and empty states", async ({ page }) => {
    // Create table with loading and empty states
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- Loading state -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Loading State</h3>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div class="skeleton h-4 w-20"></div></td>
                  <td><div class="skeleton h-4 w-16"></div></td>
                  <td><div class="skeleton h-8 w-16"></div></td>
                </tr>
                <tr>
                  <td><div class="skeleton h-4 w-24"></div></td>
                  <td><div class="skeleton h-4 w-12"></div></td>
                  <td><div class="skeleton h-8 w-16"></div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Empty state -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Empty State</h3>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="3" class="text-center py-8">
                    <div class="text-gray-400">
                      <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p class="text-lg font-medium">No data available</p>
                      <p class="text-sm">Add some items to get started</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("table-states.png");
  });
});
