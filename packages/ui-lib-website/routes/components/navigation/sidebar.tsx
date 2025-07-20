import { SidebarLayout } from "@suppers/ui-lib";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Projects", href: "/projects", icon: "📁" },
  { label: "Team", href: "/team", icon: "👥" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

const sidebarSections = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "🏠" },
      { label: "Analytics", href: "/analytics", icon: "📊" },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Posts", href: "/posts", icon: "📝" },
      { label: "Media", href: "/media", icon: "🖼️" },
      { label: "Comments", href: "/comments", icon: "💬" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "General", href: "/settings/general", icon: "⚙️" },
      { label: "Users", href: "/settings/users", icon: "👥" },
      { label: "Security", href: "/settings/security", icon: "🔒" },
    ],
  },
];

export default function SidebarPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Sidebar Component</h1>
        <p>Navigation sidebar for application layouts</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Sidebar</h2>
          <div class="mockup-window border bg-base-300 h-96">
            <SidebarLayout
              sidebarItems={sidebarItems}
              title="My App"
            >
              <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Main Content</h3>
                <p>This is the main content area next to the sidebar.</p>
              </div>
            </SidebarLayout>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sidebar with Sections</h2>
          <div class="mockup-window border bg-base-300 h-96">
            <SidebarLayout
              sidebarSections={sidebarSections}
              title="Admin Panel"
            >
              <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Admin Dashboard</h3>
                <p>Sidebar with organized sections for better navigation.</p>
              </div>
            </SidebarLayout>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Collapsible Sidebar</h2>
          <div class="mockup-window border bg-base-300 h-96">
            <SidebarLayout
              sidebarItems={sidebarItems}
              title="Collapsible"
              collapsible
            >
              <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Responsive Layout</h3>
                <p>Sidebar can be collapsed on smaller screens.</p>
              </div>
            </SidebarLayout>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Styles</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold mb-2">Light Theme</h3>
              <div class="mockup-window border bg-base-300 h-64">
                <SidebarLayout
                  sidebarItems={sidebarItems.slice(0, 3)}
                  title="Light App"
                  theme="light"
                >
                  <div class="p-4">
                    <p class="text-sm">Light themed sidebar</p>
                  </div>
                </SidebarLayout>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Dark Theme</h3>
              <div class="mockup-window border bg-base-300 h-64">
                <SidebarLayout
                  sidebarItems={sidebarItems.slice(0, 3)}
                  title="Dark App"
                  theme="dark"
                >
                  <div class="p-4">
                    <p class="text-sm">Dark themed sidebar</p>
                  </div>
                </SidebarLayout>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="space-y-6">
            <div class="card bg-base-200 p-4">
              <h3 class="text-lg font-semibold mb-2">Dashboard Application</h3>
              <div class="mockup-window border bg-base-300 h-48">
                <SidebarLayout
                  sidebarItems={[
                    { label: "Overview", href: "/overview", icon: "📊" },
                    { label: "Reports", href: "/reports", icon: "📈" },
                    { label: "Users", href: "/users", icon: "👥" },
                    { label: "Settings", href: "/settings", icon: "⚙️" },
                  ]}
                  title="Analytics"
                >
                  <div class="p-4">
                    <h4 class="font-semibold">Dashboard Overview</h4>
                    <p class="text-sm">Key metrics and insights</p>
                  </div>
                </SidebarLayout>
              </div>
            </div>

            <div class="card bg-base-200 p-4">
              <h3 class="text-lg font-semibold mb-2">E-commerce Admin</h3>
              <div class="mockup-window border bg-base-300 h-48">
                <SidebarLayout
                  sidebarSections={[
                    {
                      title: "Sales",
                      items: [
                        { label: "Orders", href: "/orders", icon: "🛒" },
                        { label: "Products", href: "/products", icon: "📦" },
                        { label: "Customers", href: "/customers", icon: "👤" },
                      ],
                    },
                    {
                      title: "Marketing",
                      items: [
                        { label: "Campaigns", href: "/campaigns", icon: "📢" },
                        { label: "Coupons", href: "/coupons", icon: "🎫" },
                      ],
                    },
                  ]}
                  title="Store Admin"
                >
                  <div class="p-4">
                    <h4 class="font-semibold">Store Management</h4>
                    <p class="text-sm">Manage your online store</p>
                  </div>
                </SidebarLayout>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}