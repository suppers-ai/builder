import { ThemeController } from "@suppers/ui-lib";

export default function ThemeControllerPage() {
  const popularThemes = ["light", "dark", "cupcake", "synthwave", "retro", "cyberpunk"];
  const allThemes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
  ];

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Theme Controller Component</h1>
        <p>
          Interactive theme switching component for DaisyUI themes with persistence and
          customization
        </p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Theme Variants</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Dropdown Theme Selector</h3>
                <p class="text-sm opacity-70 mb-4">Click to see all available themes</p>
                <ThemeController
                  themes={popularThemes}
                  variant="dropdown"
                  size="md"
                  onThemeChange={(theme) => console.log(`Theme changed to: ${theme}`)}
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Dark Mode Toggle</h3>
                <p class="text-sm opacity-70 mb-4">Simple light/dark toggle</p>
                <ThemeController
                  themes={["light", "dark"]}
                  variant="toggle"
                  showLabel={true}
                  size="md"
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Radio Button Selection</h3>
                <p class="text-sm opacity-70 mb-4">Choose from multiple options</p>
                <ThemeController
                  themes={popularThemes.slice(0, 4)}
                  variant="radio"
                  showLabel={true}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Sizes</h2>
          <div class="grid gap-4">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <div class="flex items-center justify-between">
                  <span class="font-medium">Extra Small</span>
                  <ThemeController
                    themes={popularThemes}
                    variant="dropdown"
                    size="xs"
                  />
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <div class="flex items-center justify-between">
                  <span class="font-medium">Small</span>
                  <ThemeController
                    themes={popularThemes}
                    variant="dropdown"
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <div class="flex items-center justify-between">
                  <span class="font-medium">Medium (Default)</span>
                  <ThemeController
                    themes={popularThemes}
                    variant="dropdown"
                    size="md"
                  />
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <div class="flex items-center justify-between">
                  <span class="font-medium">Large</span>
                  <ThemeController
                    themes={popularThemes}
                    variant="dropdown"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">All Available Themes</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">Complete Theme Collection</h3>
              <p class="text-sm opacity-70 mb-4">
                Try all 29 DaisyUI themes! Your selection will be saved automatically.
              </p>
              <div class="flex justify-center">
                <ThemeController
                  themes={allThemes}
                  variant="dropdown"
                  size="lg"
                  onThemeChange={(theme) => {
                    console.log(`Theme changed to: ${theme}`);
                    // You could add toast notification here
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Theme Preview Cards</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="card bg-primary text-primary-content">
              <div class="card-body">
                <h3 class="card-title">Primary Card</h3>
                <p>This card uses the primary theme color</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary-content">Action</button>
                </div>
              </div>
            </div>

            <div class="card bg-secondary text-secondary-content">
              <div class="card-body">
                <h3 class="card-title">Secondary Card</h3>
                <p>This card uses the secondary theme color</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-secondary-content">Action</button>
                </div>
              </div>
            </div>

            <div class="card bg-accent text-accent-content">
              <div class="card-body">
                <h3 class="card-title">Accent Card</h3>
                <p>This card uses the accent theme color</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-accent-content">Action</button>
                </div>
              </div>
            </div>

            <div class="card bg-neutral text-neutral-content">
              <div class="card-body">
                <h3 class="card-title">Neutral Card</h3>
                <p>This card uses the neutral theme color</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-neutral-content">Action</button>
                </div>
              </div>
            </div>

            <div class="card bg-info text-info-content">
              <div class="card-body">
                <h3 class="card-title">Info Card</h3>
                <p>This card uses the info theme color</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-info-content">Action</button>
                </div>
              </div>
            </div>

            <div class="card bg-success text-success-content">
              <div class="card-body">
                <h3 class="card-title">Success Card</h3>
                <p>This card uses the success theme color</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-success-content">Action</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Navigation Bar Example</h2>
          <div class="navbar bg-base-100 shadow-lg rounded-box">
            <div class="navbar-start">
              <div class="dropdown">
                <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </div>
              </div>
              <a class="btn btn-ghost text-xl">My App</a>
            </div>
            <div class="navbar-center hidden lg:flex">
              <ul class="menu menu-horizontal px-1">
                <li>
                  <a>Home</a>
                </li>
                <li>
                  <a>About</a>
                </li>
                <li>
                  <a>Services</a>
                </li>
                <li>
                  <a>Contact</a>
                </li>
              </ul>
            </div>
            <div class="navbar-end gap-2">
              <ThemeController
                themes={["light", "dark", "cupcake", "synthwave", "retro"]}
                variant="dropdown"
                size="sm"
              />
              <button class="btn btn-primary btn-sm">Sign In</button>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Settings Panel Example</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">⚙️ Application Settings</h3>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Appearance</span>
                </label>
                <ThemeController
                  themes={allThemes}
                  variant="dropdown"
                  size="md"
                />
                <label class="label">
                  <span class="label-text-alt">Choose your preferred theme</span>
                </label>
              </div>

              <div class="divider">Other Settings</div>

              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Email notifications</span>
                  <input type="checkbox" class="toggle toggle-primary" checked />
                </label>
              </div>

              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Push notifications</span>
                  <input type="checkbox" class="toggle toggle-primary" />
                </label>
              </div>

              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Auto-save</span>
                  <input type="checkbox" class="toggle toggle-primary" checked />
                </label>
              </div>

              <div class="card-actions justify-end mt-6">
                <button class="btn btn-outline">Reset</button>
                <button class="btn btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Quick Theme Switcher</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Light/Dark Toggle</h3>
                <p class="text-sm opacity-70 mb-4">Simple toggle between light and dark themes</p>
                <ThemeController
                  themes={["light", "dark"]}
                  variant="toggle"
                  showLabel={false}
                  size="lg"
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Popular Themes</h3>
                <p class="text-sm opacity-70 mb-4">Quick access to favorite themes</p>
                <div class="flex flex-wrap gap-2">
                  {popularThemes.map((theme) => (
                    <ThemeController
                      key={theme}
                      themes={[theme]}
                      variant="dropdown"
                      size="xs"
                      currentTheme={theme}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Theme Showcase</h2>
          <div class="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="stroke-current shrink-0 w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              >
              </path>
            </svg>
            <div>
              <h3 class="font-bold">Theme Persistence</h3>
              <div class="text-xs">
                Your theme selection is automatically saved to localStorage and will persist across
                page reloads.
              </div>
            </div>
          </div>

          <div class="stats shadow w-full">
            <div class="stat">
              <div class="stat-figure text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  >
                  </path>
                </svg>
              </div>
              <div class="stat-title">Available Themes</div>
              <div class="stat-value">29</div>
              <div class="stat-desc">Beautiful DaisyUI themes</div>
            </div>

            <div class="stat">
              <div class="stat-figure text-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  >
                  </path>
                </svg>
              </div>
              <div class="stat-title">Theme Switch Speed</div>
              <div class="stat-value">Instant</div>
              <div class="stat-desc">No page reload required</div>
            </div>

            <div class="stat">
              <div class="stat-figure text-accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  >
                  </path>
                </svg>
              </div>
              <div class="stat-title">Variants</div>
              <div class="stat-value">3</div>
              <div class="stat-desc">Dropdown, Toggle, Radio</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
