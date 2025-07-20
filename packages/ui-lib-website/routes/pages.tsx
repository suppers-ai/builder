import {
  allPages,
  getAllPageCategories,
  getPageCount,
  getPagesByCategory,
  getPagesByType,
} from "../data/pages.ts";
import { Badge, Card, Button } from "@suppers/ui-lib";

export default function PagesPage() {
  const categories = getAllPageCategories();
  const routePages = getPagesByType("route");
  const demoPages = getPagesByType("demo");
  const pageComponents = getPagesByType("page");
  const sharedComponents = getPagesByType("shared");

  return (
    <>
      <div class="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div class="text-center space-y-4">
          <h1 class="text-4xl font-bold">Pages & Routes</h1>
          <p class="text-lg text-base-content/70">
            Complete overview of application pages, routes, and page-level components
          </p>
          <div class="breadcrumbs justify-center">
            <ul>
              <li>
                <a href="/" class="link">Home</a>
              </li>
              <li>Pages</li>
            </ul>
          </div>
        </div>
        {/* Overview Stats */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title text-xs">Routes</div>
            <div class="stat-value text-xl">{routePages.length}</div>
            <div class="stat-desc text-xs">Main routes</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title text-xs">Pages</div>
            <div class="stat-value text-xl">{pageComponents.length}</div>
            <div class="stat-desc text-xs">Page components</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title text-xs">Demos</div>
            <div class="stat-value text-xl">{demoPages.length}</div>
            <div class="stat-desc text-xs">Component demos</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title text-xs">Shared</div>
            <div class="stat-value text-xl">{sharedComponents.length}</div>
            <div class="stat-desc text-xs">Reusable</div>
          </div>
        </div>

        {/* Page Architecture */}
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">Page Architecture</h2>
            <div class="prose max-w-none">
              <p>
                Our application follows Fresh 2.0 patterns with clear separation between different
                types of pages and components.
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 class="font-semibold mb-2">Routes (/routes/)</h3>
                  <ul class="text-sm space-y-1">
                    <li>• Main application entry points</li>
                    <li>• Server-side rendered by default</li>
                    <li>• Handle HTTP requests and responses</li>
                    <li>• Can include page handlers</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold mb-2">Pages (/pages/)</h3>
                  <ul class="text-sm space-y-1">
                    <li>• Organized page-level components</li>
                    <li>• Include display and logic components</li>
                    <li>• Feature-based directory structure</li>
                    <li>• Reusable across different routes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Routes */}
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-xl">🌐</span>
              <h3 class="card-title text-lg">Main Routes</h3>
              <Badge color="neutral">{routePages.length}</Badge>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routePages.map((page) => (
                <a
                  key={page.path}
                  href={page.path}
                  class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
                >
                  <div class="card-body p-4">
                    <h4 class="font-semibold text-sm">{page.name}</h4>
                    <p class="text-xs text-base-content/70 line-clamp-2">{page.description}</p>

                    <div class="flex items-center justify-between mt-3">
                      <div class="text-xs font-mono text-base-content/60">
                        {page.path}
                      </div>
                      <div class="flex gap-2">
                        {(page as any).authRequired && (
                          <Badge size="xs" color="warning">
                            Auth
                          </Badge>
                        )}
                        {(page as any).layoutUsed && (
                          <Badge size="xs" color="info">{(page as any).layoutUsed}</Badge>
                        )}
                      </div>
                    </div>

                    {(page as any).features && (
                      <div class="flex flex-wrap gap-1 mt-2">
                        {(page as any).features.slice(0, 3).map((feature: string) => (
                          <Badge key={feature} size="xs" variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Page Components */}
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-xl">📄</span>
              <h3 class="card-title text-lg">Page Components</h3>
              <Badge color="neutral">{pageComponents.length}</Badge>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pageComponents.map((page) => (
                <div
                  key={page.path}
                  class="card bg-base-200"
                >
                  <div class="card-body p-4">
                    <h4 class="font-semibold text-sm">{page.name}</h4>
                    <p class="text-xs text-base-content/70 line-clamp-2">{page.description}</p>

                    <div class="flex items-center justify-between mt-3">
                      <div class="text-xs font-mono text-base-content/60">
                        {page.path}
                      </div>
                      <div class="flex gap-2">
                        {(page as any).authRequired && (
                          <Badge size="xs" color="warning">Protected</Badge>
                        )}
                      </div>
                    </div>

                    {(page as any).features && (
                      <div class="flex flex-wrap gap-1 mt-2">
                        {(page as any).features.slice(0, 3).map((feature: string) => (
                          <Badge key={feature} size="xs" variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Component Demos */}
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-xl">🎭</span>
              <h3 class="card-title text-lg">Component Demos</h3>
              <Badge color="neutral">
                {demoPages.filter((p) => p.category === "Component Demos").length}
              </Badge>
            </div>
            <p class="text-sm text-base-content/70 mb-4">
              Interactive demonstrations showcasing individual components
            </p>

            <div class="text-center py-8">
              <div class="text-4xl mb-4">🧩</div>
              <p class="text-base-content/60">
                Component demos are integrated into the main{" "}
                <a href="/components" class="link link-primary">Components</a> section
              </p>
              <a href="/components">
                <Button color="primary" size="sm" class="mt-4">
                  Browse Components
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Shared Components */}
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-xl">🔧</span>
              <h3 class="card-title text-lg">Shared Components</h3>
              <Badge color="neutral">{sharedComponents.length}</Badge>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedComponents.map((page) => (
                <div
                  key={page.path}
                  class="card bg-base-200"
                >
                  <div class="card-body p-4">
                    <h4 class="font-semibold text-sm">{page.name}</h4>
                    <p class="text-xs text-base-content/70 line-clamp-2">{page.description}</p>

                    <div class="flex items-center justify-between mt-3">
                      <div class="text-xs font-mono text-base-content/60">
                        {page.path}
                      </div>
                      <div class="flex gap-2">
                        {(page as any).authRequired && (
                          <Badge size="xs" color="warning">
                            Auth
                          </Badge>
                        )}
                      </div>
                    </div>

                    {(page as any).features && (
                      <div class="flex flex-wrap gap-1 mt-2">
                        {(page as any).features.slice(0, 3).map((feature: string) => (
                          <Badge key={feature} size="xs" variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Development Guide */}
        <div class="card bg-secondary text-secondary-content">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">Page Development Guide</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 class="font-semibold mb-2">Routing</h3>
                <ul class="text-sm space-y-1 opacity-90">
                  <li>• File-based routing in /routes/</li>
                  <li>• Dynamic routes with [param]</li>
                  <li>• Nested layouts with _layout</li>
                  <li>• API routes with handlers</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold mb-2">Layouts</h3>
                <ul class="text-sm space-y-1 opacity-90">
                  <li>• MainLayout for most pages</li>
                  <li>• ComponentPageTemplate for demos</li>
                  <li>• AuthLayout for auth pages</li>
                  <li>• Custom layouts as needed</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold mb-2">Best Practices</h3>
                <ul class="text-sm space-y-1 opacity-90">
                  <li>• Use SSR-safe components</li>
                  <li>• Islands for interactivity</li>
                  <li>• Consistent breadcrumbs</li>
                  <li>• Proper meta tags</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
