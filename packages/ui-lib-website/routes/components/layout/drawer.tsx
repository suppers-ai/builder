import { Drawer } from "@suppers/ui-lib";

export default function DrawerPage() {
  const sidebarMenu = (
    <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
      <li>
        <a class="text-xl font-bold mb-4">Sidebar Menu</a>
      </li>
      <li>
        <a href="#">
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>Home
        </a>
      </li>
      <li>
        <a href="#">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>About
        </a>
      </li>
      <li>
        <a href="#">
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>Contact
        </a>
      </li>
      <li>
        <a href="#">
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>Settings
        </a>
      </li>
    </ul>
  );

  const profileSidebar = (
    <div class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
      <div class="avatar flex justify-center mb-4">
        <div class="w-24 rounded-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            alt="Profile"
          />
        </div>
      </div>
      <h3 class="text-xl font-bold text-center mb-2">John Doe</h3>
      <p class="text-center text-base-content/70 mb-6">Software Developer</p>

      <ul class="menu">
        <li>
          <a href="#">👤 Profile</a>
        </li>
        <li>
          <a href="#">📊 Dashboard</a>
        </li>
        <li>
          <a href="#">⚙️ Settings</a>
        </li>
        <li>
          <a href="#">📧 Messages</a>
        </li>
        <li>
          <a href="#">🔔 Notifications</a>
        </li>
        <li>
          <a href="#">❤️ Favorites</a>
        </li>
        <li class="mt-4">
          <a href="#" class="text-error">🚪 Logout</a>
        </li>
      </ul>
    </div>
  );

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Drawer Component</h1>
        <p>Slide-out navigation panels for mobile-friendly navigation and additional content</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Left Drawer</h2>
          <div class="border border-base-300 rounded-lg h-96 overflow-hidden">
            <Drawer sidebarContent={sidebarMenu}>
              <div class="navbar bg-base-300">
                <div class="flex-none">
                  <label for="drawer-toggle" class="btn btn-square btn-ghost">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      class="inline-block w-6 h-6 stroke-current"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      >
                      </path>
                    </svg>
                  </label>
                </div>
                <div class="flex-1">
                  <a class="btn btn-ghost text-xl">My App</a>
                </div>
              </div>

              <div class="p-8">
                <h3 class="text-2xl font-bold mb-4">Main Content Area</h3>
                <p class="mb-4">Click the hamburger menu button to open the drawer.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="card bg-base-100 shadow-md">
                    <div class="card-body">
                      <h2 class="card-title">Card 1</h2>
                      <p>Some content in the main area.</p>
                    </div>
                  </div>
                  <div class="card bg-base-100 shadow-md">
                    <div class="card-body">
                      <h2 class="card-title">Card 2</h2>
                      <p>More content to demonstrate layout.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Drawer>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Right Side Drawer</h2>
          <div class="border border-base-300 rounded-lg h-96 overflow-hidden">
            <Drawer side="right" sidebarContent={profileSidebar}>
              <div class="navbar bg-base-300">
                <div class="flex-1">
                  <a class="btn btn-ghost text-xl">Dashboard</a>
                </div>
                <div class="flex-none">
                  <label for="drawer-toggle" class="btn btn-square btn-ghost">
                    <div class="avatar">
                      <div class="w-8 rounded-full">
                        <img
                          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                          alt="Profile"
                        />
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div class="p-8">
                <h3 class="text-2xl font-bold mb-4">Dashboard Content</h3>
                <p class="mb-4">Click the profile avatar to open the right drawer.</p>
                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">Downloads</div>
                    <div class="stat-value">31K</div>
                    <div class="stat-desc">Jan 1st - Feb 1st</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">Users</div>
                    <div class="stat-value">4,200</div>
                    <div class="stat-desc">↗︎ 400 (22%)</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">Registrations</div>
                    <div class="stat-value">1,200</div>
                    <div class="stat-desc">↘︎ 90 (14%)</div>
                  </div>
                </div>
              </div>
            </Drawer>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Drawer with Controls</h2>
          <InteractiveDrawerDemo />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Mobile-First Navigation</h2>
          <div class="border border-base-300 rounded-lg h-96 overflow-hidden">
            <Drawer
              sidebarContent={
                <div class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
                  <div class="mb-4">
                    <img
                      src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                      class="w-full h-32 object-cover rounded-lg"
                      alt="Banner"
                    />
                  </div>
                  <h3 class="text-lg font-bold mb-4">Navigation</h3>
                  <ul class="menu">
                    <li>
                      <a href="#" class="active">🏠 Home</a>
                    </li>
                    <li>
                      <a href="#">📱 Products</a>
                    </li>
                    <li>
                      <a href="#">
                        🛒 Cart <span class="badge badge-primary">3</span>
                      </a>
                    </li>
                    <li>
                      <a href="#">👤 Account</a>
                    </li>
                    <li>
                      <a href="#">🔍 Search</a>
                    </li>
                  </ul>
                  <div class="divider"></div>
                  <ul class="menu">
                    <li>
                      <a href="#">📞 Support</a>
                    </li>
                    <li>
                      <a href="#">ℹ️ About</a>
                    </li>
                  </ul>
                </div>
              }
            >
              <div class="navbar bg-primary text-primary-content">
                <div class="navbar-start">
                  <label for="drawer-toggle" class="btn btn-ghost btn-circle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </label>
                </div>
                <div class="navbar-center">
                  <a class="btn btn-ghost text-xl">Store</a>
                </div>
                <div class="navbar-end">
                  <button class="btn btn-ghost btn-circle">
                    <div class="indicator">
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
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l-2.5 5m0 0L9 16h8"
                        />
                      </svg>
                      <span class="badge badge-sm indicator-item">3</span>
                    </div>
                  </button>
                </div>
              </div>

              <div class="p-6">
                <h2 class="text-2xl font-bold mb-4">Welcome to Our Store</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from(
                    { length: 6 },
                    (_, i) => (
                      <div key={i} class="card bg-base-100 shadow-md">
                        <figure>
                          <img
                            src={`https://img.daisyui.com/images/stock/photo-${
                              i + 1
                            }559703248-dcaaec9fab78.webp`}
                            alt="Product"
                            class="h-48 w-full object-cover"
                          />
                        </figure>
                        <div class="card-body">
                          <h2 class="card-title">Product {i + 1}</h2>
                          <p>Product description here</p>
                          <div class="card-actions justify-end">
                            <button class="btn btn-primary btn-sm">Add to Cart</button>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </Drawer>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Admin Dashboard Layout</h2>
          <div class="border border-base-300 rounded-lg h-96 overflow-hidden">
            <Drawer
              sidebarContent={
                <div class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
                  <div class="mb-6">
                    <h2 class="text-xl font-bold">Admin Panel</h2>
                    <p class="text-sm opacity-70">v2.1.0</p>
                  </div>

                  <ul class="menu">
                    <li class="menu-title">Overview</li>
                    <li>
                      <a href="#" class="active">📊 Dashboard</a>
                    </li>
                    <li>
                      <a href="#">📈 Analytics</a>
                    </li>
                    <li>
                      <a href="#">💰 Revenue</a>
                    </li>

                    <li class="menu-title">Management</li>
                    <li>
                      <a href="#">👥 Users</a>
                    </li>
                    <li>
                      <a href="#">📦 Products</a>
                    </li>
                    <li>
                      <a href="#">🏪 Orders</a>
                    </li>
                    <li>
                      <a href="#">🏷️ Categories</a>
                    </li>

                    <li class="menu-title">System</li>
                    <li>
                      <a href="#">⚙️ Settings</a>
                    </li>
                    <li>
                      <a href="#">🔒 Security</a>
                    </li>
                    <li>
                      <a href="#">📄 Logs</a>
                    </li>
                    <li>
                      <a href="#">🔧 Tools</a>
                    </li>
                  </ul>
                </div>
              }
            >
              <div class="navbar bg-base-300">
                <div class="navbar-start">
                  <label for="drawer-toggle" class="btn btn-ghost btn-square">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </label>
                  <a class="btn btn-ghost text-xl ml-2">Admin Dashboard</a>
                </div>
                <div class="navbar-end">
                  <div class="dropdown dropdown-end">
                    <div tabIndex={0} role="button" class="btn btn-ghost btn-circle avatar">
                      <div class="w-10 rounded-full">
                        <img
                          alt="Admin"
                          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-6 bg-base-100">
                <div class="breadcrumbs mb-4">
                  <ul>
                    <li>
                      <a>Home</a>
                    </li>
                    <li>
                      <a>Dashboard</a>
                    </li>
                    <li>Overview</li>
                  </ul>
                </div>

                <h1 class="text-3xl font-bold mb-6">Dashboard Overview</h1>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div class="stat bg-primary text-primary-content">
                    <div class="stat-title text-primary-content/70">Total Users</div>
                    <div class="stat-value">89,400</div>
                    <div class="stat-desc text-primary-content/70">21% more than last month</div>
                  </div>
                  <div class="stat bg-secondary text-secondary-content">
                    <div class="stat-title text-secondary-content/70">Revenue</div>
                    <div class="stat-value">$12,300</div>
                    <div class="stat-desc text-secondary-content/70">14% increase</div>
                  </div>
                  <div class="stat bg-accent text-accent-content">
                    <div class="stat-title text-accent-content/70">Orders</div>
                    <div class="stat-value">1,240</div>
                    <div class="stat-desc text-accent-content/70">90 pending</div>
                  </div>
                  <div class="stat bg-neutral text-neutral-content">
                    <div class="stat-title text-neutral-content/70">Products</div>
                    <div class="stat-value">4,200</div>
                    <div class="stat-desc text-neutral-content/70">400 in stock</div>
                  </div>
                </div>
              </div>
            </Drawer>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Drawer Display</code></pre>
                <pre data-prefix=">"><code>{'<Drawer sidebarContent={menu}>{content}</Drawer>'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Interactive Drawer with callbacks</code></pre>
                <pre data-prefix=">"><code>{'<Drawer open={isOpen} onToggle={setOpen} side="right">...</Drawer>'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Right-side drawer</code></pre>
                <pre data-prefix=">"><code>{'<Drawer side="right" overlay={false}>...</Drawer>'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Create a separate island for the interactive demo
function InteractiveDrawerDemo() {
  return <InteractiveDrawerControls />;
}
