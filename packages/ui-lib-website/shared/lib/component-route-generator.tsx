/**
 * Generic component route generator
 * Extracts common logic for creating component documentation routes
 */

import type { ComponentChildren } from "preact";
import type { PageProps } from "fresh";
import { join } from "jsr:@std/path@^1.0.8";
import { parse as parseYaml } from "https://deno.land/std@0.224.0/yaml/mod.ts";

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
  category: string;
  examples: Array<{
    title: string;
    description?: string;
    code: string;
  }>;
  apiProps: Array<{
    name: string;
    type: string;
    description: string;
    required?: boolean;
  }>;
  usageNotes: string[];
}

/**
 * Extract examples from markdown content
 */
function extractExamplesFromMarkdown(
  content: string,
): Array<{ title: string; description: string; code: string }> {
  const examples: Array<{ title: string; description: string; code: string }> = [];

  // Remove frontmatter
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, "");

  // Match all sections with ## headers and code blocks
  const sectionRegex = /## ([^\n]+)\n\n([^#]*?)```tsx\n([\s\S]*?)```/g;
  let match;

  while ((match = sectionRegex.exec(contentWithoutFrontmatter)) !== null) {
    const title = match[1].trim();
    const description = match[2].trim();
    const code = match[3].trim();

    if (code) {
      examples.push({ title, description, code });
    }
  }

  return examples;
}

/**
 * Extract preview data from frontmatter
 */
function extractPreviewDataFromFrontmatter(content: string): any[] {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) return [];

  try {
    const frontmatter = parseYaml(frontmatterMatch[1]) as any;
    return frontmatter.previewData || [];
  } catch (error) {
    console.warn("Failed to parse frontmatter:", error);
    return [];
  }
}

/**
 * Load component page data from markdown file
 */
async function loadComponentPageData(
  componentPath: string,
): Promise<ComponentPageData & { previewData: any[] }> {
  try {
    // Extract component info from path
    const pathParts = componentPath.split("/");
    const componentName = pathParts[pathParts.length - 1].replace(".tsx", "");
    const category = pathParts[pathParts.length - 3];

    // Try to find the examples markdown file
    const examplesPath = componentPath.replace(".tsx", ".examples.md");

    try {
      const content = await Deno.readTextFile(examplesPath);

      // Parse frontmatter for metadata
      const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
      let title = componentName;
      let description = `${componentName} component from the UI library`;
      let apiProps: any[] = [];
      let usageNotes: string[] = [];

      if (frontmatterMatch) {
        try {
          const frontmatter = parseYaml(frontmatterMatch[1]) as any;
          title = frontmatter.title || componentName;
          description = frontmatter.description || description;
          apiProps = frontmatter.apiProps || [];
          usageNotes = frontmatter.usageNotes || [];
        } catch (error) {
          console.warn("Failed to parse frontmatter:", error);
        }
      }

      // Extract examples from markdown
      const examples = extractExamplesFromMarkdown(content);

      // Extract preview data from frontmatter
      const previewData = extractPreviewDataFromFrontmatter(content);

      return {
        title,
        description,
        category,
        examples: examples.length > 0 ? examples : [{
          title: "Basic Example",
          description: "Basic usage of the component",
          code: `<${componentName} />`,
        }],
        apiProps,
        usageNotes,
        previewData,
      };
    } catch (error) {
      console.warn(`Could not load examples file ${examplesPath}:`, error.message);
      // If no markdown file, return basic data
      return {
        title: componentName,
        description: `${componentName} component from the UI library`,
        category,
        examples: [{
          title: "Basic Example",
          description: "Basic usage of the component",
          code: `<${componentName} />`,
        }],
        apiProps: [],
        usageNotes: [],
        previewData: [],
      };
    }
  } catch (error) {
    throw new Error(`Failed to load component data: ${error.message}`);
  }
}

/**
 * Create preview generator for a component using preview data
 */
function createComponentPreviewGenerator(
  componentName: string,
  Component: any,
  previewData: any[],
) {
  return function generatePreviewSpec(code: string, exampleTitle: string): PreviewSpec {
    try {
      // Try to find matching preview data for this example
      const matchingPreview = previewData.find((p) =>
        p.title.toLowerCase().includes(exampleTitle.toLowerCase()) ||
        exampleTitle.toLowerCase().includes(p.title.toLowerCase())
      );

      if (matchingPreview) {
        if (matchingPreview.buttons) {
          return {
            type: "buttons",
            wrapperClass: "flex flex-wrap gap-4",
            buttons: matchingPreview.buttons,
          };
        } else if (matchingPreview.components) {
          return {
            type: "components",
            wrapperClass: "flex flex-wrap gap-4",
            components: matchingPreview.components,
          };
        }
      }

      // Fallback to code display
      return {
        type: "code",
        code,
      };
    } catch (error) {
      return {
        type: "error",
        error: `Failed to parse code: ${error.message}`,
      };
    }
  };
}

/**
 * Generate a component route function
 */
export function createComponentRoute(config: ComponentRouteConfig) {
  const {
    componentName,
    category,
    StaticComponent,
    InteractiveComponent,
    customPreviewRenderer,
    titleSuffix = "DaisyUI Component Library",
  } = config;

  return async function ComponentRoute(props: PageProps) {
    // Set the title in state for the app component
    if (props.state) {
      (props.state as any).title = `${componentName} - ${titleSuffix}`;
    }

    // Load examples from markdown file
    // Handle special directory naming for mockup components
    let directoryName = componentName.toLowerCase();
    if (category === "mockup") {
      directoryName = componentName.toLowerCase().replace("mockup", "");
    }

    const componentPath = join(
      Deno.cwd(),
      `../ui-lib/components/${category}/${directoryName}/${componentName}.tsx`,
    );

    const pageData = await loadComponentPageData(componentPath);

    // Create automatic preview generator with preview data
    const generatePreviewSpec = createComponentPreviewGenerator(
      componentName,
      StaticComponent,
      pageData.previewData,
    );

    // Generate preview components for each example using the code from markdown
    const examples = pageData.examples.map((example) => {
      const previewSpec = generatePreviewSpec(example.code, example.title);

      // Use custom preview renderer if provided
      if (customPreviewRenderer) {
        return {
          ...example,
          preview: customPreviewRenderer(previewSpec, {
            Static: StaticComponent,
            Interactive: InteractiveComponent,
          }),
        };
      }

      // Default preview rendering
      const preview = renderPreview(previewSpec, {
        Static: StaticComponent,
        Interactive: InteractiveComponent,
        componentName,
      });

      return {
        ...example,
        preview,
      };
    });

    // Add additional preview sections from previewData that don't have corresponding examples
    const additionalPreviews = pageData.previewData.filter((previewItem) => {
      return !pageData.examples.some((example) =>
        example.title.toLowerCase().includes(previewItem.title.toLowerCase()) ||
        previewItem.title.toLowerCase().includes(example.title.toLowerCase())
      );
    }).map((previewItem) => {
      const previewSpec: PreviewSpec = {
        type: previewItem.buttons ? "buttons" : (previewItem.components ? "components" : "code"),
        wrapperClass: "flex flex-wrap gap-4",
        buttons: previewItem.buttons,
        components: previewItem.components,
        code: previewItem.code,
      };

      const preview = renderPreview(previewSpec, {
        Static: StaticComponent,
        Interactive: InteractiveComponent,
        componentName,
      });

      return {
        title: previewItem.title,
        description: previewItem.description || "",
        code: previewItem.code || `// Preview for ${previewItem.title}`,
        preview,
      };
    });

    const allExamples = [...examples, ...additionalPreviews];

    // Simple component page template for now
    return (
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-4">{pageData.title}</h1>
        <p class="text-lg text-gray-600 mb-8">{pageData.description}</p>

        <div class="space-y-8">
          {allExamples.map((example, index) => (
            <div key={index} class="border rounded-lg p-6">
              <h2 class="text-2xl font-semibold mb-4">{example.title}</h2>
              {example.description && <p class="text-gray-600 mb-4">{example.description}</p>}

              <div class="bg-gray-50 p-4 rounded mb-4">
                {example.preview}
              </div>

              <details class="mt-4">
                <summary class="cursor-pointer text-blue-600 hover:text-blue-800">
                  Show Code
                </summary>
                <pre class="bg-gray-900 text-white p-4 rounded mt-2 overflow-x-auto">
                  <code>{example.code}</code>
                </pre>
              </details>
            </div>
          ))}
        </div>
      </div>
    );
  };
}

/**
 * Default preview renderer for common component patterns
 */
function renderPreview(
  previewSpec: PreviewSpec,
  components: { Static: any; Interactive?: any; componentName: string },
): ComponentChildren {
  const { Static, Interactive, componentName } = components;

  if (previewSpec.type === "buttons" && previewSpec.buttons && componentName === "Button") {
    return (
      <div class={previewSpec.wrapperClass || "flex flex-wrap gap-4"}>
        {previewSpec.buttons.map((buttonSpec, index) => {
          const Component = buttonSpec.isInteractive && Interactive ? Interactive : Static;
          const props = { ...buttonSpec.props };

          if (buttonSpec.isInteractive && Interactive) {
            if (buttonSpec.content === "Click Me") {
              props.onClick = () => alert("Button clicked!");
            } else {
              props.onClick = () => console.log("Logged to console");
            }
          }

          return <Component key={index} {...props}>{buttonSpec.content}</Component>;
        })}
      </div>
    );
  }

  if (previewSpec.type === "components" && previewSpec.components) {
    return (
      <div class={previewSpec.wrapperClass || "flex flex-wrap gap-4"}>
        {previewSpec.components.map((componentSpec, index) => {
          const props = { ...componentSpec.props };
          return (
            <Static key={index} {...props}>
              {componentSpec.children}
            </Static>
          );
        })}
      </div>
    );
  }

  if (previewSpec.type === "code") {
    return (
      <div class={previewSpec.wrapperClass || "flex flex-wrap gap-4"}>
        <Static>Default {componentName}</Static>
      </div>
    );
  }

  if (previewSpec.type === "error") {
    return (
      <div class="alert alert-error">
        <span>{previewSpec.error}</span>
      </div>
    );
  }

  return <div class="text-gray-500">Preview not available</div>;
}

/**
 * Helper to create button-specific routes
 */
export function createButtonRoute(StaticButton: any, InteractiveButton: any) {
  return createComponentRoute({
    componentName: "Button",
    category: "action",
    StaticComponent: StaticButton,
    InteractiveComponent: InteractiveButton,
  });
}

/**
 * Helper to create simple component routes (no interactivity)
 */
export function createSimpleComponentRoute(
  componentName: string,
  category: string,
  Component: any,
) {
  return createComponentRoute({
    componentName,
    category,
    StaticComponent: Component,
  });
}
