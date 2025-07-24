/**
 * Generic component route generator
 * Uses metadata system for component documentation
 */

import type { ComponentChildren } from "preact";
import type { PageProps } from "fresh";
import { join } from "jsr:@std/path@^1.0.8";
import {
  type ApiProp,
  extractApiPropsFromSchema,
} from "../../ui-lib/components/schemas/extractor.ts";

export interface ComponentRouteConfig {
  /** Component name (e.g., "Button") */
  componentName: string;

  /** Component category (e.g., "action", "display") */
  category: string;

  /** Static component for server-side rendering */
  StaticComponent: any;

  /** Interactive component for islands (optional) */
  InteractiveComponent?: any;

  /** Custom preview renderer (optional) */
  customPreviewRenderer?: (previewSpec: PreviewSpec, components: any) => ComponentChildren;

  /** Page title suffix */
  titleSuffix?: string;
}

export interface PreviewSpec {
  type: "buttons" | "components" | "code" | "error";
  wrapperClass?: string;
  buttons?: Array<{
    props: Record<string, any>;
    content: string;
    isInteractive?: boolean;
  }>;
  components?: Array<{
    props: Record<string, any>;
    children?: string;
  }>;
  code?: string;
  error?: string;
}

export interface ComponentPageData {
  title: string;
  description: string;
  examples: Array<{
    title: string;
    description: string;
    code: string;
    showCode?: boolean;
    interactive?: boolean;
  }>;
  apiProps: ApiProp[];
  usageNotes: string[];
}

/**
 * Load component page data from metadata system
 */
async function loadComponentPageData(
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
          code: example.code,
          showCode: example.showCode,
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
          code: example.code,
          showCode: example.showCode,
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
        code: `<${componentName} />`,
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
 * Create a component route with proper documentation
 */
export function createComponentRoute(config: ComponentRouteConfig) {
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
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-4">{pageData.title}</h1>
        <p class="text-lg text-gray-600 mb-8">{pageData.description}</p>

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
                      const Component = (example.interactive && InteractiveComponent)
                        ? InteractiveComponent
                        : StaticComponent;

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
                  <pre class="bg-gray-900 text-white p-4 rounded mt-2 overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </details>
              )}
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
    );
  };
}
