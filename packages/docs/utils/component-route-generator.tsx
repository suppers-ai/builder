/**
 * Generic component route generator for the simplified metadata system
 * 
 * This utility provides functions for generating component documentation routes using
 * a simplified, props-based metadata system. The system has been streamlined to remove
 * complex parsing logic and multiple rendering approaches in favor of a single,
 * consistent props-based approach.
 * 
 * Key improvements in the simplified system:
 * - Removed complex JSX parsing functions (parseJSXExample, parseProps)
 * - Eliminated old properties: code, staticRender, showCode
 * - Unified rendering approach using only props objects
 * - Automatic JSX code generation from props
 * - Consistent presentation across all components
 * 
 * @deprecated The createComponentRoute function is deprecated in favor of the
 * direct route handler approach in [category]/[name].tsx for better performance
 * and simpler maintenance.
 */

import type { ComponentChildren } from "preact";
import type { PageProps } from "fresh";
import { join } from "jsr:@std/path@^1.0.8";
import {
  type ApiProp,
  extractApiPropsFromSchema,
} from "../../ui-lib/components/schemas/extractor.ts";
import CodeExample from "../islands/CodeExample.tsx";
import { generateJSXFromProps } from "./props-to-jsx.ts";



export interface ComponentPageData {
  title: string;
  description: string;
  examples: Array<{
    title: string;
    description: string;
    props: Record<string, any> | Array<Record<string, any>>;
    interactive?: boolean;
  }>;
  apiProps: ApiProp[];
  usageNotes: string[];
}

/**
 * Load component page data from metadata system
 */
export async function loadComponentPageData(
  componentPath: string,
): Promise<ComponentPageData & { previewData: any[] }> {
  try {
    // Extract component info from path
    const pathParts = componentPath.split("/");
    const componentName = pathParts[pathParts.length - 1].replace(".tsx", "");

    // Try to load from metadata first (new preferred method)
    const { flatComponentsMetadata } = await import("@suppers/ui-lib");
    const metadata = flatComponentsMetadata.find((meta) => meta.name === componentName);

    if (metadata) {
      // Use rich metadata if available
      console.log("Component metadata found:", {
        name: metadata.name,
        hasSchema: !!metadata.schema,
        schemaType: metadata.schema?.schema?.constructor?.name,
      });

      return {
        title: metadata.name,
        description: metadata.description,
        examples: metadata.examples.map((example) => ({
          title: example.title,
          description: example.description,
          props: example.props,
          interactive: example.interactive,
        })),
        apiProps: await (async () => {
          try {
            if (metadata.schema?.schema) {
              console.log("Extracting API props from schema:", metadata.schema.schema);
              const props = extractApiPropsFromSchema(metadata.schema.schema);
              console.log("Extracted API props:", props);
              return props;
            }
            return [];
          } catch (error) {
            console.warn(`Failed to extract API props for ${metadata.name}:`, error);
            return [];
          }
        })(),
        usageNotes: metadata.usageNotes || [],
        previewData: metadata.examples.map((example) => ({
          title: example.title,
          description: example.description,
          props: example.props,
          interactive: example.interactive,
          type: example.interactive ? "interactive" : "static",
        })),
      };
    }

    // Fallback: return basic data if no metadata found
    return {
      title: componentName,
      description: `${componentName} component from the UI library`,
      examples: [{
        title: "Basic Example",
        description: "Basic usage of the component",
        props: {},
      }],
      apiProps: [],
      usageNotes: [],
      previewData: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load component data: ${errorMessage}`);
  }
}



/**
 * Create a component route with proper documentation
 * 
 * @deprecated This function is deprecated in favor of the direct route handler
 * approach in [category]/[name].tsx for better performance and simpler maintenance.
 */
export function createComponentRoute(config: {
  componentName: string;
  category: string;
  StaticComponent: any;
  InteractiveComponent?: any;
  customPreviewRenderer?: any;
  titleSuffix?: string;
}) {
  const {
    componentName,
    category,
    StaticComponent,
    InteractiveComponent,
    customPreviewRenderer,
    titleSuffix = "",
  } = config;

  return async function ComponentRoute(props: PageProps) {
    // Convert category/name to component path for loading metadata
    const directoryName = componentName.toLowerCase().replace(/([A-Z])/g, "-$1").replace(/^-/, "");
    const componentPath = join(
      Deno.cwd(),
      `../ui-lib/components/${category}/${directoryName}/${componentName}.tsx`,
    );

    const pageData = await loadComponentPageData(componentPath);

    return (
      <>
        {/* Page Header */}
        <header class="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-base-300">
          <div class="px-4 lg:px-6 pt-8 pb-8">
            <div class="max-w-4xl">
              <h1 class="text-3xl lg:text-4xl font-bold text-base-content mb-2">
                {pageData.title}
              </h1>
              <p class="text-lg text-base-content/70">
                {pageData.description}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div class="px-4 lg:px-6 py-8">
          <div class="max-w-7xl mx-auto">
            <div class="space-y-8">
              {pageData.examples.map((example, index) => (
                <div key={index} class="border rounded-lg p-6">
                  <h2 class="text-2xl font-semibold mb-4">{example.title}</h2>
                  <p class="text-gray-600 mb-4">{example.description}</p>

                  <div class="p-4 rounded mb-4">
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

                        const Component = (example.interactive && InteractiveComponent)
                          ? InteractiveComponent
                          : StaticComponent;

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
              <div class="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 class="text-xl font-semibold mb-4">Usage Notes</h3>
                <ul class="list-disc list-inside space-y-2">
                  {pageData.usageNotes.map((note, index) => (
                    <li key={index} class="text-gray-700">{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {pageData.apiProps.length > 0 && (
              <div class="mt-8">
                <h3 class="text-2xl font-semibold mb-6">API Props</h3>
                <div class="overflow-x-auto">
                  <table class="min-w-full border border-gray-300 rounded-lg">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Prop</th>
                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Type</th>
                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Required</th>
                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Default</th>
                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.apiProps.map((prop, index) => (
                        <tr key={index} class="hover:bg-gray-50">
                          <td class="px-4 py-3 text-sm font-mono text-gray-900 border-b">
                            {prop.name}
                            {prop.required && <span class="text-red-500 ml-1">*</span>}
                          </td>
                          <td class="px-4 py-3 text-sm font-mono text-gray-700 border-b">
                            <code class="bg-gray-100 px-2 py-1 rounded">{prop.type}</code>
                          </td>
                          <td class="px-4 py-3 text-sm text-gray-700 border-b">
                            {prop.required ? (
                              <span class="text-red-500 font-medium">Yes</span>
                            ) : (
                              <span class="text-gray-500">No</span>
                            )}
                          </td>
                          <td class="px-4 py-3 text-sm font-mono text-gray-700 border-b">
                            {prop.default ? (
                              <code class="bg-gray-100 px-2 py-1 rounded">{prop.default}</code>
                            ) : (
                              <span class="text-gray-400">-</span>
                            )}
                          </td>
                          <td class="px-4 py-3 text-sm text-gray-700 border-b">
                            {prop.description}
                            {prop.examples && prop.examples.length > 0 && (
                              <div class="mt-1 text-xs text-gray-500">
                                Examples: {prop.examples.join(", ")}
                              </div>
                            )}
                            {prop.since && (
                              <div class="mt-1 text-xs text-blue-500">
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
  };
}
