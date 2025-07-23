/**
 * Preview generation utilities
 * Reads from examples.md files to generate component previews
 */
import { parse as parseYaml } from "https://deno.land/std@0.224.0/yaml/mod.ts";

export interface PreviewConfig {
  wrapperClass?: string;
  imports?: Record<string, any>;
}

export interface PreviewSpec {
  type: "buttons" | "components" | "code" | "error";
  wrapperClass?: string;
  previews?: Array<{
    title: string;
    description: string;
    buttons?: Array<{
      content: string;
      props?: Record<string, any>;
      isInteractive?: boolean;
    }>;
    components?: Array<{
      props?: Record<string, any>;
      children?: string;
    }>;
    type?: "buttons" | "components" | "code";
    showCode?: boolean;
  }>;
  code?: string;
  error?: string;
}

interface PreviewData {
  title: string;
  description: string;
  buttons?: Array<{
    content: string;
    props?: Record<string, any>;
    isInteractive?: boolean;
  }>;
  components?: Array<{
    props?: Record<string, any>;
    children?: string;
  }>;
  type?: "buttons" | "components" | "code";
  showCode?: boolean;
}

interface ComponentExample {
  title: string;
  description: string;
  code: string;
}

// Component path mappings
const COMPONENT_PATHS: Record<string, string> = {
  "Button": "../ui-lib/components/action/button/Button.examples.md",
  "Card": "../ui-lib/components/display/card/Card.examples.md",
  "Modal": "../ui-lib/components/action/modal/Modal.examples.md",
  "Navbar": "../ui-lib/components/layout/navbar/Navbar.examples.md",
  "Input": "../ui-lib/components/input/input/Input.examples.md",
  "ThemeController": "../ui-lib/components/action/theme-controller/Theme Controller.examples.md",
  "Badge": "../ui-lib/components/display/badge/Badge.examples.md",
  "Avatar": "../ui-lib/components/display/avatar/Avatar.examples.md",
  "Alert": "../ui-lib/components/feedback/alert/Alert.examples.md",
  "Loading": "../ui-lib/components/feedback/loading/Loading.examples.md",
  "Progress": "../ui-lib/components/feedback/progress/Progress.examples.md",
  "Dropdown": "../ui-lib/components/action/dropdown/Dropdown.examples.md",
  "Checkbox": "../ui-lib/components/input/checkbox/Checkbox.examples.md",
  "BrowserMockup": "../ui-lib/components/mockup/browser/BrowserMockup.examples.md",
  "CodeMockup": "../ui-lib/components/mockup/code/CodeMockup.examples.md",
  "PhoneMockup": "../ui-lib/components/mockup/phone/PhoneMockup.examples.md",
  "WindowMockup": "../ui-lib/components/mockup/window/WindowMockup.examples.md",
};

// Cache for loaded data
const examplesCache = new Map<string, ComponentExample[]>();
const previewCache = new Map<string, PreviewData[]>();

/**
 * Load preview data from a component's examples.md file
 */
async function loadComponentPreviewData(componentName: string): Promise<PreviewData[]> {
  const cached = previewCache.get(componentName);
  if (cached) return cached;

  const filePath = COMPONENT_PATHS[componentName];
  if (!filePath) return [];

  try {
    const content = await Deno.readTextFile(filePath);
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) return [];

    const frontmatter = parseYaml(frontmatterMatch[1]) as any;
    const previewData = frontmatter.previewData || [];

    previewCache.set(componentName, previewData);
    return previewData;
  } catch (error) {
    console.warn(`Could not load preview data for ${componentName}:`, error.message);
    return [];
  }
}

/**
 * Load examples from a component's examples.md file
 */
async function loadComponentExamples(componentName: string): Promise<ComponentExample[]> {
  const cached = examplesCache.get(componentName);
  if (cached) return cached;

  const filePath = COMPONENT_PATHS[componentName];
  if (!filePath) return [];

  try {
    const content = await Deno.readTextFile(filePath);
    const examples = extractExamplesFromMarkdown(content);
    examplesCache.set(componentName, examples);
    return examples;
  } catch (error) {
    console.warn(`Could not load examples for ${componentName}:`, error.message);
    return [];
  }
}

/**
 * Extract examples from markdown content
 */
function extractExamplesFromMarkdown(content: string): ComponentExample[] {
  const examples: ComponentExample[] = [];

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
 * Generate a preview specification from TSX code string
 * Returns a configuration object that can be used to render the preview
 */
export function generatePreview(
  code: string,
  imports: Record<string, any> = {},
  config: PreviewConfig = {},
): PreviewSpec {
  const { wrapperClass = "flex flex-wrap gap-4" } = config;

  try {
    return {
      type: "code",
      code,
      wrapperClass,
    };
  } catch (error) {
    return {
      type: "error",
      error: `Failed to generate preview: ${error.message}`,
    };
  }
}

/**
 * Create a preview generator function for a specific component
 * Reads preview data from the component's examples.md file
 */
export function createComponentPreviewGenerator(
  componentName: string,
  component: any,
  config: PreviewConfig = {},
) {
  return async (code: string): Promise<PreviewSpec> => {
    const { wrapperClass = "flex flex-wrap gap-4" } = config;

    try {
      const previewData = await loadComponentPreviewData(componentName);

      if (previewData.length > 0) {
        // Determine the primary type based on the first preview
        const primaryType = previewData[0]?.type ||
          (previewData[0]?.buttons ? "buttons" : "components");

        return {
          type: primaryType,
          wrapperClass,
          previews: previewData,
        };
      } else {
        // Fallback to code display if no preview data found
        return {
          type: "code",
          code,
          wrapperClass,
        };
      }
    } catch (error) {
      return {
        type: "error",
        error: `Failed to load preview data for ${componentName}: ${error.message}`,
      };
    }
  };
}

/**
 * Get preview data for a specific component
 * Public API for accessing component preview data
 */
export async function getComponentPreviewData(componentName: string): Promise<PreviewData[]> {
  return await loadComponentPreviewData(componentName);
}

/**
 * Get examples for a specific component
 * Public API for accessing component examples
 */
export async function getComponentExamples(componentName: string): Promise<ComponentExample[]> {
  return await loadComponentExamples(componentName);
}

/**
 * Generate preview from code (fallback method)
 */
export async function generatePreviewFromCode(
  componentName: string,
  code: string,
  config: PreviewConfig = {},
): Promise<PreviewSpec> {
  const generator = createComponentPreviewGenerator(componentName, null, config);
  return await generator(code);
}

// All the hardcoded component-specific generators have been removed
// The new system reads examples directly from the examples.md files

// All hardcoded component-specific preview generators have been removed
// The preview system now reads real examples from component examples.md files
// This ensures that previews always show actual, documented usage patterns
// rather than artificial or outdated examples
