/**
 * Dynamic component route handler
 * Handles URLs like /components/action/button, /components/display/card, etc.
 * Uses metadata-driven approach for automatic component discovery
 */

import type { PageProps } from "fresh";
import { createComponentRoute } from "../../../utils/component-route-generator.tsx";
import { ComponentMetadata, flatComponentsMetadata } from "@suppers/ui-lib";
import { Breadcrumbs } from "@suppers/ui-lib";
import CodeExample from "../../../islands/CodeExample.tsx";

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
 * Parse JSX code and extract component props and content
 */
function parseJSXExample(code: string, componentName: string): Array<{
  props: Record<string, any>;
  content: string;
}> {
  const components: Array<{ props: Record<string, any>; content: string }> = [];

  // Improved regex to handle multiline JSX and various prop formats
  const componentRegex = new RegExp(
    `<${componentName}([^>]*?)>([\\s\\S]*?)<\\/${componentName}>`,
    "g",
  );
  const selfClosingRegex = new RegExp(`<${componentName}([^>]*?)\\s*\\/>`, "g");

  let match;

  // Match components with content (e.g., <Button color="primary">Primary</Button>)
  while ((match = componentRegex.exec(code)) !== null) {
    const propsString = match[1];
    const content = match[2].trim();
    const props = parseProps(propsString);

    components.push({
      props,
      content: content || (props.children as string) || "Button",
    });
  }

  // Reset regex lastIndex for self-closing components
  selfClosingRegex.lastIndex = 0;

  // Match self-closing components (e.g., <Button color="primary" />)
  while ((match = selfClosingRegex.exec(code)) !== null) {
    const propsString = match[1];
    const props = parseProps(propsString);

    components.push({
      props,
      content: (props.children as string) || "Button",
    });
  }

  return components;
}

/**
 * Parse props string and return props object
 */
function parseProps(propsString: string): Record<string, any> {
  const props: Record<string, any> = {};

  // Handle different prop formats: prop="value", prop={value}, prop={true}, prop
  const propsRegex = /(\w+)(?:=(?:"([^"]*)"|{([^}]*)}|([^\s>]+)))?/g;

  let propMatch;
  while ((propMatch = propsRegex.exec(propsString)) !== null) {
    const [, key, quotedValue, bracedValue, unquotedValue] = propMatch;

    if (quotedValue !== undefined) {
      // String value: prop="value"
      props[key] = quotedValue;
    } else if (bracedValue !== undefined) {
      // Expression value: prop={value}
      const value = bracedValue.trim();
      if (value === "true") props[key] = true;
      else if (value === "false") props[key] = false;
      else if (value.match(/^\d+$/)) props[key] = parseInt(value);
      else if (value.startsWith('"') && value.endsWith('"')) {
        props[key] = value.slice(1, -1);
      } else {
        props[key] = value;
      }
    } else if (unquotedValue !== undefined) {
      // Unquoted value: prop=value
      props[key] = unquotedValue;
    } else {
      // Boolean prop: prop (defaults to true)
      props[key] = true;
    }
  }

  return props;
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
                        // Parse the JSX code to get component instances
                        const parsedComponents = parseJSXExample(example.code, componentName);

                        return parsedComponents.map((comp, compIndex) => {
                          const Component = (example.interactive && components.Interactive)
                            ? components.Interactive
                            : components.Static;

                          return (
                            <Component key={compIndex} {...comp.props}>
                              {comp.content}
                            </Component>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {(example.showCode !== false) && (
                    <details class="mt-4">
                      <summary class="cursor-pointer text-blue-600 hover:text-blue-800">
                        Show Code
                      </summary>
                      <CodeExample code={example.code} />
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
