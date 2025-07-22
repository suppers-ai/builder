/**
 * Generic component route generator
 * Extracts common logic for creating component documentation routes
 */

import type { ComponentChildren } from "preact";
import type { PageProps } from "fresh";
import { loadComponentPageDataCached, createComponentPreviewGenerator, type PreviewSpec } from "@suppers/shared";
import { join } from "jsr:@std/path@^1.0.8";

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
      `../ui-lib/components/${category}/${directoryName}/${componentName}.tsx`
    );
    
    const pageData = await loadComponentPageDataCached(componentPath);

    // Create automatic preview generator
    const generatePreviewSpec = createComponentPreviewGenerator(componentName, StaticComponent);

    // Generate preview components for each example using the code from markdown
    const examples = pageData.examples.map(example => {
      const previewSpec = generatePreviewSpec(example.code);
      
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

    // Import ComponentPageTemplate dynamically to avoid circular imports
    const { ComponentPageTemplate } = await import("@suppers/ui-lib");

    return (
      <ComponentPageTemplate
        title={pageData.title}
        description={pageData.description}
        category={pageData.category}
        examples={examples}
        apiProps={pageData.apiProps}
        usageNotes={pageData.usageNotes}
      />
    );
  };
}

/**
 * Default preview renderer for common component patterns
 */
function renderPreview(
  previewSpec: PreviewSpec,
  components: { Static: any; Interactive?: any; componentName: string }
): ComponentChildren {
  const { Static, Interactive, componentName } = components;

  if (previewSpec.type === 'buttons' && previewSpec.buttons && componentName === 'Button') {
    return (
      <div class={previewSpec.wrapperClass || "flex flex-wrap gap-4"}>
        {previewSpec.buttons.map((buttonSpec, index) => {
          const Component = buttonSpec.isInteractive && Interactive ? Interactive : Static;
          const props = { ...buttonSpec.props };
          
          if (buttonSpec.isInteractive && Interactive) {
            if (buttonSpec.content === 'Click Me') {
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
  
  if (previewSpec.type === 'components' && previewSpec.components) {
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
  
  if (previewSpec.type === 'code') {
    return (
      <div class={previewSpec.wrapperClass || "flex flex-wrap gap-4"}>
        <div class="mockup-code text-sm">
          <pre><code>{previewSpec.code}</code></pre>
        </div>
      </div>
    );
  }
  
  if (previewSpec.type === 'error') {
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
  Component: any
) {
  return createComponentRoute({
    componentName,
    category,
    StaticComponent: Component,
  });
}