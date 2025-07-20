import { Menu } from "@suppers/ui-lib";

const basicMenuItems = [
  { label: "Home", href: "/", active: true },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact", disabled: true },
];

const nestedMenuItems = [
  { label: "Dashboard", href: "/dashboard", active: true },
  {
    label: "Products",
    children: [
      { label: "All Products", href: "/products" },
      { label: "New Product", href: "/products/new" },
      { label: "Categories", href: "/products/categories" },
    ],
  },
  {
    label: "Settings",
    children: [
      { label: "Profile", href: "/settings/profile" },
      { label: "Account", href: "/settings/account" },
      {
        label: "Security",
        children: [
          { label: "Password", href: "/settings/security/password" },
          { label: "Two-Factor", href: "/settings/security/2fa" },
        ],
      },
    ],
  },
  { label: "Logout", href: "/logout" },
];

const horizontalMenuItems = [
  { label: "File", href: "#" },
  { label: "Edit", href: "#" },
  { label: "View", href: "#", active: true },
  { label: "Help", href: "#" },
];

export default function MenuPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Menu Component</h1>
        <p>Navigation menu component with support for nested items</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Menu</h2>
          <div class="w-64">
            <Menu items={basicMenuItems} />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold mb-2">Small</h3>
              <div class="w-48">
                <Menu size="sm" items={basicMenuItems} />
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Large</h3>
              <div class="w-64">
                <Menu size="lg" items={basicMenuItems} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Horizontal Menu</h2>
          <Menu horizontal items={horizontalMenuItems} />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Compact Menu</h2>
          <div class="w-56">
            <Menu compact items={basicMenuItems} />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Nested Menu</h2>
          <div class="w-64">
            <Menu items={nestedMenuItems} />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Horizontal + Compact</h2>
          <Menu horizontal compact items={horizontalMenuItems} />
        </section>
      </div>
    </div>
  );
}
