import {
  pageTemplates,
  getPagesByCategory,
  getPageCount,
} from "../data/pages.ts";

export default function PagesPage() {
  const landingTemplates = pageTemplates.templates.landing;
  const dashboardTemplates = pageTemplates.templates.dashboard;
  const formTemplates = pageTemplates.templates.form;
  const authTemplates = pageTemplates.templates.auth;
  const allTemplates = [
    ...landingTemplates,
    ...dashboardTemplates,
    ...formTemplates,
    ...authTemplates,
  ];

  return (
    <>
      <div class="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div class="text-center space-y-4">
          <h1 class="text-4xl font-bold">Building Complete Pages</h1>
          <p class="text-lg text-base-content/70">
            Learn how to compose ui-lib components into complete page layouts and templates
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Page Templates</div>
            <div class="stat-value text-2xl">{allTemplates.length}</div>
            <div class="stat-desc">Ready to use</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Categories</div>
            <div class="stat-value text-2xl">4</div>
            <div class="stat-desc">Different types</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Components Used</div>
            <div class="stat-value text-2xl">15+</div>
            <div class="stat-desc">UI library components</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Guides</div>
            <div class="stat-value text-2xl">{pageTemplates.guides.length}</div>
            <div class="stat-desc">Best practices</div>
          </div>
        </div>

        {/* What are Page Templates? */}
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">What are Page Templates?</h2>
            <div class="prose max-w-none">
              <p>
                Page templates are complete page implementations built using ui-lib components.
                They demonstrate how to combine components effectively to create cohesive user interfaces
                for different use cases.
              </p>
              <ul>
                <li>
                  <strong>Component Composition:</strong> Show how to combine multiple ui-lib components
                </li>
                <li>
                  <strong>Layout Patterns:</strong> Demonstrate effective page structure and organization
                </li>
                <li>
                  <strong>Responsive Design:</strong> All templates work across different screen sizes
                </li>
                <li>
                  <strong>Production Ready:</strong> Complete implementations you can adapt for your projects
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Template Categories */}
        <div class="space-y-8">
          <h2 class="text-2xl font-bold">Page Template Categories</h2>

          {/* Landing Pages */}
          <div class="card bg-base-100 shadow-sm border border-base-300">
            <div class="card-body">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-xl">🚀</span>
                <h3 class="card-title text-lg">Landing Pages</h3>
                <div class="badge badge-primary">{landingTemplates.length} templates</div>
              </div>
              <p class="text-sm text-base-content/70 mb-4">
                Marketing and promotional pages designed to convert visitors
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {landingTemplates.map((template) => (
                  <div key={template.id} class="card bg-base-200 hover:bg-base-300 transition-colors">
                    <div class="card-body p-4">
                      <h4 class="font-semibold text-sm">{template.name}</h4>
                      <p class="text-xs text-base-content/70 line-clamp-2 mb-2">
                        {template.description}
                      </p>
                      
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-xs text-base-content/50">
                          {template.components.slice(0, 3).join(", ")}
                          {template.components.length > 3 && "..."}
                        </div>
                        <div class="flex flex-wrap gap-1">
                          {template.features.slice(0, 2).map((feature) => (
                            <div key={feature} class="badge badge-xs badge-outline">
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div class="text-xs text-base-content/60">
                        {template.layout.structure}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dashboard Pages */}
          <div class="card bg-base-100 shadow-sm border border-base-300">
            <div class="card-body">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-xl">📊</span>
                <h3 class="card-title text-lg">Dashboard Pages</h3>
                <div class="badge badge-secondary">{dashboardTemplates.length} templates</div>
              </div>
              <p class="text-sm text-base-content/70 mb-4">
                Data-rich interfaces for analytics, admin panels, and user dashboards
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardTemplates.map((template) => (
                  <div key={template.id} class="card bg-base-200 hover:bg-base-300 transition-colors">
                    <div class="card-body p-4">
                      <h4 class="font-semibold text-sm">{template.name}</h4>
                      <p class="text-xs text-base-content/70 line-clamp-2 mb-2">
                        {template.description}
                      </p>
                      
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-xs text-base-content/50">
                          {template.components.slice(0, 3).join(", ")}
                          {template.components.length > 3 && "..."}
                        </div>
                        <div class="flex flex-wrap gap-1">
                          {template.features.slice(0, 2).map((feature) => (
                            <div key={feature} class="badge badge-xs badge-outline">
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div class="text-xs text-base-content/60">
                        {template.layout.structure}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Pages */}
          <div class="card bg-base-100 shadow-sm border border-base-300">
            <div class="card-body">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-xl">📝</span>
                <h3 class="card-title text-lg">Form Pages</h3>
                <div class="badge badge-accent">{formTemplates.length} templates</div>
              </div>
              <p class="text-sm text-base-content/70 mb-4">
                Data collection interfaces with validation and user-friendly design
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formTemplates.map((template) => (
                  <div key={template.id} class="card bg-base-200 hover:bg-base-300 transition-colors">
                    <div class="card-body p-4">
                      <h4 class="font-semibold text-sm">{template.name}</h4>
                      <p class="text-xs text-base-content/70 line-clamp-2 mb-2">
                        {template.description}
                      </p>
                      
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-xs text-base-content/50">
                          {template.components.slice(0, 3).join(", ")}
                          {template.components.length > 3 && "..."}
                        </div>
                        <div class="flex flex-wrap gap-1">
                          {template.features.slice(0, 2).map((feature) => (
                            <div key={feature} class="badge badge-xs badge-outline">
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div class="text-xs text-base-content/60">
                        {template.layout.structure}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Authentication Pages */}
          <div class="card bg-base-100 shadow-sm border border-base-300">
            <div class="card-body">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-xl">🔐</span>
                <h3 class="card-title text-lg">Authentication Pages</h3>
                <div class="badge badge-info">{authTemplates.length} templates</div>
              </div>
              <p class="text-sm text-base-content/70 mb-4">
                User authentication flows including login, signup, and password recovery
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {authTemplates.map((template) => (
                  <div key={template.id} class="card bg-base-200 hover:bg-base-300 transition-colors">
                    <div class="card-body p-4">
                      <h4 class="font-semibold text-sm">{template.name}</h4>
                      <p class="text-xs text-base-content/70 line-clamp-2 mb-2">
                        {template.description}
                      </p>
                      
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-xs text-base-content/50">
                          {template.components.slice(0, 3).join(", ")}
                          {template.components.length > 3 && "..."}
                        </div>
                        <div class="flex flex-wrap gap-1">
                          {template.features.slice(0, 2).map((feature) => (
                            <div key={feature} class="badge badge-xs badge-outline">
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div class="text-xs text-base-content/60">
                        {template.layout.structure}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Composition Guide */}
        <div class="card bg-secondary text-secondary-content">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">Page Composition Guide</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 class="font-semibold mb-2">Layout Structure</h3>
                <ul class="text-sm space-y-1 opacity-90">
                  <li>• Start with clear page hierarchy</li>
                  <li>• Use layout components for structure</li>
                  <li>• Maintain consistent spacing</li>
                  <li>• Plan for responsive behavior</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold mb-2">Component Selection</h3>
                <ul class="text-sm space-y-1 opacity-90">
                  <li>• Choose components that fit the purpose</li>
                  <li>• Combine components thoughtfully</li>
                  <li>• Consider user experience flow</li>
                  <li>• Maintain visual consistency</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold mb-2">Best Practices</h3>
                <ul class="text-sm space-y-1 opacity-90">
                  <li>• Test on multiple screen sizes</li>
                  <li>• Ensure accessibility compliance</li>
                  <li>• Optimize for performance</li>
                  <li>• Follow design system guidelines</li>
                </ul>
              </div>
            </div>
            
            {pageTemplates.guides.length > 0 && (
              <div class="mt-6">
                <h3 class="font-semibold mb-3">Composition Guide: {pageTemplates.guides[0].title}</h3>
                <p class="text-sm opacity-90 mb-4">{pageTemplates.guides[0].description}</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pageTemplates.guides[0].sections.map((section, index) => (
                    <div key={index} class="bg-secondary-content/10 rounded-lg p-3">
                      <div class="text-sm font-medium mb-1">{section.title}</div>
                      <div class="text-xs opacity-80">{section.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
