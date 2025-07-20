import { Breadcrumbs } from "@suppers/ui-lib";

const basicBreadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Breadcrumbs", active: true },
];

const complexBreadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Website Redesign", href: "/projects/website-redesign" },
  { label: "Design System", href: "/projects/website-redesign/design-system" },
  { label: "Components", active: true },
];

const withDisabledItems = [
  { label: "Home", href: "/" },
  { label: "Archive", disabled: true },
  { label: "2023", href: "/archive/2023" },
  { label: "December", active: true },
];

export default function BreadcrumbsPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Breadcrumbs Component</h1>
        <p>Navigation breadcrumbs to show current page location</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Breadcrumbs</h2>
          <Breadcrumbs items={basicBreadcrumbs} />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold mb-2">Small</h3>
              <Breadcrumbs size="sm" items={basicBreadcrumbs} />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Medium (Default)</h3>
              <Breadcrumbs size="md" items={basicBreadcrumbs} />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Large</h3>
              <Breadcrumbs size="lg" items={basicBreadcrumbs} />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Custom Separator</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold mb-2">With Slash</h3>
              <Breadcrumbs
                items={basicBreadcrumbs}
                separator={<span>/</span>}
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">With Dot</h3>
              <Breadcrumbs
                items={basicBreadcrumbs}
                separator={<span>•</span>}
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">With Custom Icon</h3>
              <Breadcrumbs
                items={basicBreadcrumbs}
                separator={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="w-4 h-4 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    >
                    </path>
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Complex Navigation</h2>
          <Breadcrumbs items={complexBreadcrumbs} />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">With Disabled Items</h2>
          <Breadcrumbs items={withDisabledItems} />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Contexts</h2>
          <div class="space-y-6">
            <div class="card bg-base-200 p-4">
              <h3 class="text-lg font-semibold mb-2">E-commerce Example</h3>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Electronics", href: "/electronics" },
                  { label: "Computers", href: "/electronics/computers" },
                  { label: "Laptops", href: "/electronics/computers/laptops" },
                  { label: "MacBook Pro", active: true },
                ]}
              />
            </div>

            <div class="card bg-base-200 p-4">
              <h3 class="text-lg font-semibold mb-2">Documentation Example</h3>
              <Breadcrumbs
                items={[
                  { label: "Docs", href: "/docs" },
                  { label: "Components", href: "/docs/components" },
                  { label: "Navigation", href: "/docs/components/navigation" },
                  { label: "Breadcrumbs", active: true },
                ]}
              />
            </div>

            <div class="card bg-base-200 p-4">
              <h3 class="text-lg font-semibold mb-2">Admin Panel Example</h3>
              <Breadcrumbs
                items={[
                  { label: "Admin", href: "/admin" },
                  { label: "Users", href: "/admin/users" },
                  { label: "John Doe", href: "/admin/users/john-doe" },
                  { label: "Edit Profile", active: true },
                ]}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Responsive Example</h2>
          <div class="mockup-browser border bg-base-300">
            <div class="mockup-browser-toolbar">
              <div class="input">https://example.com/very/long/navigation/path</div>
            </div>
            <div class="bg-base-200 p-4">
              <Breadcrumbs
                items={[
                  { label: "🏠", href: "/" },
                  { label: "Projects", href: "/projects" },
                  { label: "Web Development", href: "/projects/web-dev" },
                  { label: "Client Sites", href: "/projects/web-dev/clients" },
                  { label: "Company XYZ", href: "/projects/web-dev/clients/xyz" },
                  { label: "Landing Page", active: true },
                ]}
                class="hidden sm:block"
              />
              <Breadcrumbs
                items={[
                  { label: "🏠", href: "/" },
                  { label: "...", disabled: true },
                  { label: "Company XYZ", href: "/projects/web-dev/clients/xyz" },
                  { label: "Landing Page", active: true },
                ]}
                class="sm:hidden"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
