/**
 * Dynamic component route handler for the simplified metadata system
 *
 * This route handler processes component documentation using a simplified, props-based approach.
 * All component examples are now defined purely through props objects, with automatic JSX code
 * generation and consistent presentation.
 *
 * Key features of the simplified system:
 * - Props-based examples: All examples use `props` objects instead of raw JSX strings
 * - Automatic code generation: JSX code is generated from props using `generateJSXFromProps`
 * - Consistent presentation: All examples show rendered component + generated code
 * - Single rendering path: No more complex parsing or multiple rendering approaches
 *
 * Handles URLs like /components/action/button, /components/display/card, etc.
 * Uses metadata-driven approach for automatic component discovery.
 *
 * @example
 * // Example metadata structure (simplified)
 * {
 *   title: "Primary Button",
 *   description: "A button with primary styling",
 *   props: { color: "primary", children: "Click me" }
 * }
 *
 * @example
 * // Multiple component example
 * {
 *   title: "Button Colors",
 *   description: "Various button color options",
 *   props: [
 *     { color: "primary", children: "Primary" },
 *     { color: "secondary", children: "Secondary" }
 *   ]
 * }
 */

import type { PageProps } from "fresh";
import { createComponentRoute } from "../../../utils/component-route-generator.tsx";
import { ComponentMetadata, flatComponentsMetadata } from "@suppers/ui-lib";
import { Breadcrumbs, Button } from "@suppers/ui-lib";
import CodeExample from "../../../islands/CodeExample.tsx";
import { generateJSXFromProps } from "../../../utils/props-to-jsx.ts";
import { h } from "preact";

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
              <Button as="a" href="/components" color="primary">
                Back to Components
              </Button>
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
                {pageData.description}
              </p>
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

                  <div class="p-6 bg-base-100 border border-base-300 rounded-lg mb-4">
                    <div class="flex flex-wrap gap-4">
                      {(() => {
                        // Only handle props-based rendering
                        if (!example.props) {
                          return (
                            <div class="text-error">
                              Example missing props data. Please update to use props-based format.
                            </div>
                          );
                        }

                        const Component = (example.interactive && components.Interactive)
                          ? components.Interactive
                          : components.Static;

                        // Handle array of props (multiple component instances)
                        if (Array.isArray(example.props)) {
                          return example.props.map((propSet, propIndex) => (
                            <Component key={propIndex} {...propSet} />
                          ));
                        }

                        // Handle single props object
                        return <Component {...example.props} />;
                      })()}
                    </div>
                  </div>

                  <details class="mt-4">
                    <summary class="cursor-pointer text-blue-600 hover:text-blue-800">
                      Show Code
                    </summary>
                    <CodeExample code={generateJSXFromProps(componentName, example.props || {})} />
                  </details>
                </div>
              ))}
            </div>

            {pageData.usageNotes.length > 0 && (
              <div class="mt-8 p-6 bg-info/10 border border-info/20 rounded-lg">
                <h3 class="text-xl font-semibold mb-4 text-base-content">Usage Notes</h3>
                <ul class="list-disc list-inside space-y-2">
                  {pageData.usageNotes.map((note, index) => (
                    <li key={index} class="text-base-content/80">{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {pageData.apiProps.length > 0 && (
              <div class="mt-8">
                <h3 class="text-2xl font-semibold mb-6 text-base-content">API Props</h3>
                <div class="overflow-x-auto">
                  <table class="table table-zebra w-full border border-base-300 rounded-lg">
                    <thead>
                      <tr class="border-base-300">
                        <th class="text-base-content font-medium">Prop</th>
                        <th class="text-base-content font-medium">Type</th>
                        <th class="text-base-content font-medium">Required</th>
                        <th class="text-base-content font-medium">Default</th>
                        <th class="text-base-content font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.apiProps.map((prop, index) => (
                        <tr key={index} class="border-base-300">
                          <td class="font-mono text-base-content">
                            {prop.name}
                            {prop.required && <span class="text-error ml-1">*</span>}
                          </td>
                          <td class="font-mono">
                            <code class="bg-base-200 text-base-content px-2 py-1 rounded text-xs">
                              {prop.type}
                            </code>
                          </td>
                          <td class="text-base-content">
                            {prop.required
                              ? <span class="text-error font-medium">Yes</span>
                              : <span class="text-base-content/60">No</span>}
                          </td>
                          <td class="font-mono">
                            {prop.default
                              ? (
                                <code class="bg-base-200 text-base-content px-2 py-1 rounded text-xs">
                                  {prop.default}
                                </code>
                              )
                              : <span class="text-base-content/40">-</span>}
                          </td>
                          <td class="text-base-content">
                            {prop.description}
                            {prop.examples && prop.examples.length > 0 && (
                              <div class="mt-1 text-xs text-base-content/60">
                                Examples: {prop.examples.join(", ")}
                              </div>
                            )}
                            {prop.since && (
                              <div class="mt-1 text-xs text-info">
                                Since: {prop.since}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
            <Button as="a" href="/components" color="primary">
              Back to Components
            </Button>
          </div>
        </div>
      </>
    );
  }
}
