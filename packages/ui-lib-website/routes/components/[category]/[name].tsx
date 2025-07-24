/**
 * Dynamic component route handler
 * Handles URLs like /components/action/button, /components/display/card, etc.
 * Uses metadata-driven approach for automatic component discovery
 */

import type { PageProps } from "fresh";
import { createComponentRoute } from "../../../utils/component-route-generator.tsx";
import { ComponentMetadata, flatComponentsMetadata } from "@suppers/ui-lib";
import { Breadcrumbs } from "@suppers/ui-lib";

/**
 * Convert URL-friendly component name to PascalCase component name
 * Examples: "button" -> "Button", "theme-controller" -> "ThemeController"
 */
function urlToComponentName(urlName: string): string {
  return urlName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Find component metadata by category and URL name
 */
function findComponentMetadata(category: string, name: string): ComponentMetadata | null {
  const expectedPath = `/components/${category}/${name}`;
  return flatComponentsMetadata.find((meta) => meta.path === expectedPath) || null;
}

/**
 * Dynamically import component from UI library based on component name and metadata
 */
async function dynamicComponentImport(
  componentName: string,
  metadata: ComponentMetadata,
): Promise<{ Static: any; Interactive?: any }> {
  try {
    const module = await import("@suppers/ui-lib");
    const component = (module as any)[componentName];

    if (!component) {
      throw new Error(`Component ${componentName} not found in @suppers/ui-lib`);
    }

    return {
      Static: component,
      Interactive: metadata.interactive ? component : undefined,
    };
  } catch (error) {
    console.error(`Failed to import component ${componentName}:`, error);
    throw error;
  }
}

export default async function DynamicComponentPage(props: PageProps) {
  const { category, name } = props.params;

  try {
    // Find component metadata to validate it exists
    const metadata = findComponentMetadata(category, name);

    if (!metadata) {
      // Return 404 for non-existent components
      return (
        <>
          <header class="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-base-300">
            <div class="px-4 lg:px-6 pt-8 pb-8">
              <div class="max-w-4xl">
                <h1 class="text-3xl lg:text-4xl font-bold text-base-content mb-2">
                  Component Not Found
                </h1>
                <p class="text-lg text-base-content/70">
                  The component "{name}" in category "{category}" was not found.
                </p>
              </div>
            </div>
          </header>
          <div class="px-4 lg:px-6 py-8">
            <div class="max-w-7xl mx-auto">
              <a href="/components" class="btn btn-primary">
                Back to Components
              </a>
            </div>
          </div>
        </>
      );
    }

    // Convert URL name to component name and dynamically import
    const componentName = urlToComponentName(name);
    const components = await dynamicComponentImport(componentName, metadata);

    // Load component page data directly here instead of using createComponentRoute
    const { loadComponentPageData } = await import("../../../utils/component-route-generator.tsx");
    const directoryName = componentName.toLowerCase().replace(/([A-Z])/g, "-$1").replace(/^-/, "");
    const componentPath = `../ui-lib/components/${category}/${directoryName}/${componentName}.tsx`;
    const pageData = await loadComponentPageData(componentPath);

    // Return the component page JSX directly
    return (
      <>
        {/* Page Header */}
        <header class="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-base-300">
          <div class="px-4 lg:px-6 pt-20 pb-8">
            <div class="max-w-7xl mx-auto">
              <h1 class="text-3xl lg:text-4xl font-bold text-base-content mb-2">
              {pageData.title}
              </h1>
              <p class="text-lg text-base-content/70 max-w-2xl">
                {pageData.description}            </p>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <nav class="bg-base-200/50 border-b border-base-300">
          <div class="px-4 lg:px-6 py-3">
            <div class="max-w-7xl mx-auto">
              <Breadcrumbs
                size="sm"
                items={[
                  { label: "Home", href: "/" },
                  { label: "Components", active: true },
                ]}
              />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div class="px-4 lg:px-6 py-8">
          <div class="max-w-7xl mx-auto">
            <div class="space-y-8">
              {pageData.examples.map((example, index) => (
                <div key={index} class="border rounded-lg p-6">
                  <h2 class="text-2xl font-semibold mb-4">{example.title}</h2>
                  <p class="text-gray-600 mb-4">{example.description}</p>

                  <div class="bg-gray-50 p-4 rounded mb-4">
                    <div class="flex flex-wrap gap-4">
                      {(() => {
                        // Simple component rendering for now
                        const Component = components.Static;
                        return <Component>Example</Component>;
                      })()}
                    </div>
                  </div>

                  {(example.showCode !== false) && (
                    <details class="mt-4">
                      <summary class="cursor-pointer text-blue-600 hover:text-blue-800">
                        Show Code
                      </summary>
                      <pre class="bg-gray-100 p-4 rounded mt-2 overflow-x-auto">
                        <code>{example.code}</code>
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error(`Error loading component ${category}/${name}:`, error);

    // Return error page for import failures
    return (
      <>
        <header class="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-base-300">
          <div class="px-4 lg:px-6 pt-8 pb-8">
            <div class="max-w-4xl">
              <h1 class="text-3xl lg:text-4xl font-bold text-base-content mb-2">
                Component Load Error
              </h1>
              <p class="text-lg text-base-content/70">
                Failed to load the component "{name}" in category "{category}".
              </p>
            </div>
          </div>
        </header>
        <div class="px-4 lg:px-6 py-8">
          <div class="max-w-7xl mx-auto">
            <p class="text-sm text-gray-500 mb-8">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <a href="/components" class="btn btn-primary">
              Back to Components
            </a>
          </div>
        </div>
      </>
    );
  }
}
