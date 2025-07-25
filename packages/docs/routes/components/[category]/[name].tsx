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
    `<${componentName}([\\s\\S]*?)\\/>|<${componentName}([\\s\\S]*?)>([\\s\\S]*?)<\\/${componentName}>`,
    "g",
  );

  let match;

  while ((match = componentRegex.exec(code)) !== null) {
    let propsString: string;
    let content: string;

    if (match[1] !== undefined) {
      // Self-closing component: <Component props... />
      propsString = match[1];
      content = "";
    } else {
      // Component with content: <Component props...>content</Component>
      propsString = match[2];
      content = match[3]?.trim() || "";
    }

    const props = parseComplexProps(propsString);

    components.push({
      props,
      content: content || (props.children as string) || componentName,
    });
  }

  return components;
}

/**
 * Parse complex props including nested JSX
 */
function parseComplexProps(propsString: string): Record<string, any> {
  const props: Record<string, any> = {};
  
  // Remove extra whitespace and newlines
  const cleanProps = propsString.replace(/\s+/g, ' ').trim();
  
  // Simple regex for basic props (will expand this as needed)
  const simplePropsRegex = /(\w+)=(?:"([^"]*)"|{([^}]*)}|(\w+))/g;
  
  let match;
  while ((match = simplePropsRegex.exec(cleanProps)) !== null) {
    const [, key, quotedValue, bracedValue, unquotedValue] = match;
    
    if (quotedValue !== undefined) {
      props[key] = quotedValue;
    } else if (bracedValue !== undefined) {
      const value = bracedValue.trim();
      if (value === "true") props[key] = true;
      else if (value === "false") props[key] = false;
      else if (value.match(/^\d+$/)) props[key] = parseInt(value);
      else props[key] = value;
    } else if (unquotedValue !== undefined) {
      props[key] = unquotedValue;
    }
  }
  
  // For now, handle complex JSX props by setting placeholder values
  if (cleanProps.includes('trigger={')) {
    props.trigger = "Button"; // Placeholder - will be handled by component
  }
  if (cleanProps.includes('content={')) {
    props.content = "Menu Items"; // Placeholder - will be handled by component  
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

                  <div class="p-6 bg-base-100 border border-base-300 rounded-lg mb-4">
                    <div class="flex flex-wrap gap-4">
                      {(() => {
                        // Check if example has static render override
                        if (example.staticRender) {
                          return example.staticRender;
                        }
                        
                        // Check if example has predefined props data
                        if (example.props) {
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
                        }

                        // Fallback: Parse the JSX code to get component instances
                        const parsedComponents = parseJSXExample(example.code, componentName);

                        // If no components were parsed, render as raw HTML (for daisyUI examples)
                        if (parsedComponents.length === 0) {
                          return (
                            <div class="w-full">
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: example.code
                                    .replace(/{(\d+)}/g, '$1') // Replace {0}, {1} with 0, 1
                                    .replace(/tabIndex=\{0\}/g, 'tabindex="0"') // Fix tabIndex
                                    .replace(/class="/g, 'class="') // Ensure proper class syntax
                                }} 
                              />
                            </div>
                          );
                        }

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
                            <code class="bg-base-200 text-base-content px-2 py-1 rounded text-xs">{prop.type}</code>
                          </td>
                          <td class="text-base-content">
                            {prop.required ? (
                              <span class="text-error font-medium">Yes</span>
                            ) : (
                              <span class="text-base-content/60">No</span>
                            )}
                          </td>
                          <td class="font-mono">
                            {prop.default ? (
                              <code class="bg-base-200 text-base-content px-2 py-1 rounded text-xs">{prop.default}</code>
                            ) : (
                              <span class="text-base-content/40">-</span>
                            )}
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
            <a href="/components" class="btn btn-primary">
              Back to Components
            </a>
          </div>
        </div>
      </>
    );
  }
}
