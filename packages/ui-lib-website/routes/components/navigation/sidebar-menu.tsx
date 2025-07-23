import { Menu } from "@suppers/ui-lib";

const basicMenuItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Team", href: "/team" },
  { label: "Settings", href: "/settings" },
];

const menuWithIcons = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Profile", href: "/profile", icon: "👤" },
  { label: "Messages", href: "/messages", icon: "💬", badge: "3" },
  { label: "Notifications", href: "/notifications", icon: "🔔", badge: "12" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

const nestedMenuItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  {
    label: "Projects",
    icon: "📁",
    children: [
      { label: "Active Projects", href: "/projects/active" },
      { label: "Completed", href: "/projects/completed" },
      { label: "Archived", href: "/projects/archived" },
    ],
  },
  {
    label: "Team",
    icon: "👥",
    children: [
      { label: "Members", href: "/team/members" },
      { label: "Roles", href: "/team/roles" },
      { label: "Permissions", href: "/team/permissions" },
    ],
  },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export default function SidebarMenuPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Sidebar Menu Component</h1>
        <p>Hierarchical navigation menus for sidebar layouts</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Sidebar Menu</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold mb-2">Vertical Menu</h3>
              <div class="bg-base-200 p-4 rounded-lg">
                <Menu items={basicMenuItems} orientation="vertical" />
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Compact Menu</h3>
              <div class="bg-base-200 p-4 rounded-lg">
                <Menu items={basicMenuItems} orientation="vertical" size="sm" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Menu with Icons and Badges</h2>
          <div class="bg-base-200 p-4 rounded-lg max-w-xs">
            <Menu items={menuWithIcons} orientation="vertical" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Nested Menu Items</h2>
          <div class="bg-base-200 p-4 rounded-lg max-w-xs">
            <Menu items={nestedMenuItems} orientation="vertical" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Styles</h2>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 class="text-lg font-semibold mb-2">Default Style</h3>
              <div class="bg-base-200 p-4 rounded-lg">
                <Menu items={menuWithIcons.slice(0, 4)} orientation="vertical" />
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Bordered Style</h3>
              <div class="bg-base-200 p-4 rounded-lg">
                <Menu
                  items={menuWithIcons.slice(0, 4)}
                  orientation="vertical"
                  variant="bordered"
                />
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Rounded Style</h3>
              <div class="bg-base-200 p-4 rounded-lg">
                <Menu
                  items={menuWithIcons.slice(0, 4)}
                  orientation="vertical"
                  variant="rounded"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive States</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold mb-2">With Active Item</h3>
              <div class="bg-base-200 p-4 rounded-lg">
                <Menu
                  items={[
                    { label: "Dashboard", href: "/dashboard", icon: "📊" },
                    { label: "Projects", href: "/projects", icon: "📁", active: true },
                    { label: "Team", href: "/team", icon: "👥" },
                    { label: "Settings", href: "/settings", icon: "⚙️" },
                  ]}
                  orientation="vertical"
                />
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">With Disabled Items</h3>
              <div class="bg-base-200 p-4 rounded-lg">
                <Menu
                  items={[
                    { label: "Dashboard", href: "/dashboard", icon: "📊" },
                    { label: "Projects", href: "/projects", icon: "📁" },
                    { label: "Team", href: "/team", icon: "👥", disabled: true },
                    { label: "Settings", href: "/settings", icon: "⚙️" },
                  ]}
                  orientation="vertical"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Real-world Examples</h2>
          <div class="space-y-6">
            <div class="card bg-base-200 p-4">
              <h3 class="text-lg font-semibold mb-2">Admin Dashboard Sidebar</h3>
              <div class="mockup-window border bg-base-300">
                <div class="flex h-64">
                  <div class="w-64 bg-base-100 p-4">
                    <div class="mb-4">
                      <h4 class="font-bold text-lg">Admin Panel</h4>
                    </div>
                    <Menu
                      items={[
                        { label: "Dashboard", href: "/admin", icon: "📊", active: true },
                        { label: "Users", href: "/admin/users", icon: "👥", badge: "1,234" },
                        { label: "Content", href: "/admin/content", icon: "📝" },
                        { label: "Analytics", href: "/admin/analytics", icon: "📈" },
                        { label: "Settings", href: "/admin/settings", icon: "⚙️" },
                        { label: "Help", href: "/admin/help", icon: "❓" },
                      ]}
                      orientation="vertical"
                    />
                  </div>
                  <div class="flex-1 p-6">
                    <h4 class="font-semibold mb-2">Dashboard Overview</h4>
                    <p class="text-sm">Main content area with dashboard widgets</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-200 p-4">
              <h3 class="text-lg font-semibold mb-2">E-commerce Navigation</h3>
              <div class="mockup-window border bg-base-300">
                <div class="flex h-64">
                  <div class="w-64 bg-base-100 p-4">
                    <div class="mb-4">
                      <h4 class="font-bold text-lg">Store Manager</h4>
                    </div>
                    <Menu
                      items={[
                        { label: "Orders", href: "/orders", icon: "🛒", badge: "5" },
                        {
                          label: "Products",
                          icon: "📦",
                          children: [
                            { label: "All Products", href: "/products" },
                            { label: "Categories", href: "/products/categories" },
                            { label: "Inventory", href: "/products/inventory" },
                          ],
                        },
                        { label: "Customers", href: "/customers", icon: "👤" },
                        { label: "Reports", href: "/reports", icon: "📊" },
                        { label: "Settings", href: "/settings", icon: "⚙️" },
                      ]}
                      orientation="vertical"
                    />
                  </div>
                  <div class="flex-1 p-6">
                    <h4 class="font-semibold mb-2">Store Management</h4>
                    <p class="text-sm">Manage your online store from this interface</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
