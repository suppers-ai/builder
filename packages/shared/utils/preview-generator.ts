/**
 * Preview generation utilities
 * Returns configuration objects for generating component previews
 */

export interface PreviewConfig {
  wrapperClass?: string;
  imports?: Record<string, any>;
}

export interface PreviewSpec {
  type: 'buttons' | 'components' | 'code' | 'error';
  wrapperClass?: string;
  buttons?: Array<{
    content: string;
    props?: Record<string, any>;
    isInteractive?: boolean;
  }>;
  components?: Array<{
    props?: Record<string, any>;
    children?: string;
  }>;
  code?: string;
  error?: string;
}

/**
 * Generate a preview specification from TSX code string
 * Returns a configuration object that can be used to render the preview
 */
export function generatePreview(
  code: string, 
  imports: Record<string, any> = {},
  config: PreviewConfig = {}
): PreviewSpec {
  const { wrapperClass = "flex flex-wrap gap-4" } = config;

  try {
    return generatePreviewSpec(code, wrapperClass);
  } catch (error) {
    return {
      type: 'error',
      error: `Failed to generate preview: ${error.message}`,
    };
  }
}

/**
 * Create a preview generator function for a specific component
 * This allows for component-specific preview logic
 */
export function createComponentPreviewGenerator(
  componentName: string,
  component: any,
  config: PreviewConfig = {}
) {
  return (code: string): PreviewSpec => {
    // Component-specific preview logic can be added here
    switch (componentName) {
      case "Button":
        return generateButtonPreviewSpec(code, config);
      case "Card":
        return generateCardPreviewSpec(code, config);
      case "Badge":
        return generateBadgePreviewSpec(code, config);
      case "Avatar":
        return generateAvatarPreviewSpec(code, config);
      case "Alert":
        return generateAlertPreviewSpec(code, config);
      case "Loading":
        return generateLoadingPreviewSpec(code, config);
      case "Progress":
        return generateProgressPreviewSpec(code, config);
      case "Modal":
        return generateModalPreviewSpec(code, config);
      case "Dropdown":
        return generateDropdownPreviewSpec(code, config);
      case "Input":
        return generateInputPreviewSpec(code, config);
      case "Checkbox":
        return generateCheckboxPreviewSpec(code, config);
      case "BrowserMockup":
        return generateMockupPreviewSpec(code, "Browser Mockup", config);
      case "CodeMockup":
        return generateMockupPreviewSpec(code, "Code Mockup", config);
      case "PhoneMockup":
        return generateMockupPreviewSpec(code, "Phone Mockup", config);
      case "WindowMockup":
        return generateMockupPreviewSpec(code, "Window Mockup", config);
      default:
        return generateGenericComponentPreviewSpec(code, componentName, config);
    }
  };
}

/**
 * Button-specific preview generator
 * Handles common Button patterns and layouts
 */
function generateButtonPreviewSpec(
  code: string, 
  config: PreviewConfig = {}
): PreviewSpec {
  const { wrapperClass = "flex flex-wrap gap-4" } = config;

  // Detect common button patterns and generate appropriate previews
  if (code.includes('color="primary"') && code.includes('color="secondary"')) {
    // Multiple color buttons
    return {
      type: 'buttons',
      wrapperClass,
      buttons: [
        { content: 'Default', props: {} },
        { content: 'Primary', props: { color: 'primary' } },
        { content: 'Secondary', props: { color: 'secondary' } },
        { content: 'Accent', props: { color: 'accent' } },
      ],
    };
  }
  
  if (code.includes('variant="outline"') && code.includes('variant="ghost"')) {
    // Variant buttons
    return {
      type: 'buttons',
      wrapperClass,
      buttons: [
        { content: 'Outline', props: { variant: 'outline', color: 'primary' } },
        { content: 'Ghost', props: { variant: 'ghost', color: 'primary' } },
        { content: 'Link', props: { variant: 'link', color: 'primary' } },
      ],
    };
  }
  
  if (code.includes('size="xs"') && code.includes('size="sm"')) {
    // Size buttons
    return {
      type: 'buttons',
      wrapperClass: "flex flex-wrap items-center gap-4",
      buttons: [
        { content: 'Extra Small', props: { size: 'xs', color: 'primary' } },
        { content: 'Small', props: { size: 'sm', color: 'primary' } },
        { content: 'Medium', props: { color: 'primary' } },
        { content: 'Large', props: { size: 'lg', color: 'primary' } },
      ],
    };
  }
  
  if (code.includes('disabled') && code.includes('loading')) {
    // State buttons
    return {
      type: 'buttons',
      wrapperClass,
      buttons: [
        { content: 'Normal', props: { color: 'primary' } },
        { content: 'Active', props: { color: 'primary', active: true } },
        { content: 'Disabled', props: { color: 'primary', disabled: true } },
        { content: 'Loading', props: { color: 'primary', loading: true } },
      ],
    };
  }
  
  if (code.includes('onClick')) {
    // Interactive buttons
    return {
      type: 'buttons',
      wrapperClass,
      buttons: [
        { 
          content: 'Click Me', 
          props: { color: 'primary' },
          isInteractive: true,
        },
        { 
          content: 'Log to Console', 
          props: { color: 'secondary', variant: 'outline' },
          isInteractive: true,
        },
      ],
    };
  }
  
  // Fallback: single button
  return {
    type: 'buttons',
    wrapperClass,
    buttons: [
      { content: 'Default Button', props: {} },
    ],
  };
}

/**
 * Generate preview spec from arbitrary code
 */
function generatePreviewSpec(code: string, wrapperClass: string): PreviewSpec {
  // For arbitrary code, return code display
  return {
    type: 'code',
    code,
    wrapperClass,
  };
}

/**
 * Card-specific preview generator
 */
function generateCardPreviewSpec(code: string, config: PreviewConfig = {}): PreviewSpec {
  const { wrapperClass = "flex flex-wrap gap-4" } = config;
  
  if (code.includes('title="Card Title"') && code.includes('<p>This is a basic card')) {
    return {
      type: 'components',
      wrapperClass,
      components: [{ props: { title: "Card Title" }, children: "This is a basic card with some content." }],
    };
  }
  
  if (code.includes('image=') && code.includes('title="Shoes!"')) {
    return {
      type: 'components',
      wrapperClass,
      components: [{
        props: {
          image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg",
          imageAlt: "Shoes",
          title: "Shoes!"
        },
        children: "If a dog chews shoes whose shoes does he choose?"
      }],
    };
  }
  
  return { type: 'code', code, wrapperClass };
}

/**
 * Badge-specific preview generator
 */
function generateBadgePreviewSpec(code: string, config: PreviewConfig = {}): PreviewSpec {
  const { wrapperClass = "flex flex-wrap gap-2" } = config;
  
  if (code.includes('color=') && code.includes('Badge')) {
    return {
      type: 'components',
      wrapperClass,
      components: [
        { props: {}, children: "Default" },
        { props: { color: "primary" }, children: "Primary" },
        { props: { color: "secondary" }, children: "Secondary" },
        { props: { color: "accent" }, children: "Accent" },
      ],
    };
  }
  
  return { type: 'code', code, wrapperClass };
}

/**
 * Avatar-specific preview generator
 */
function generateAvatarPreviewSpec(code: string, config: PreviewConfig = {}): PreviewSpec {
  const { wrapperClass = "flex gap-4" } = config;
  
  if (code.includes('src=') || code.includes('Avatar')) {
    return {
      type: 'components',
      wrapperClass,
      components: [
        { props: { src: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" } },
      ],
    };
  }
  
  return { type: 'code', code, wrapperClass };
}

/**
 * Alert-specific preview generator
 */
function generateAlertPreviewSpec(code: string, config: PreviewConfig = {}): PreviewSpec {
  const { wrapperClass = "space-y-4" } = config;
  
  if (code.includes('type=') && code.includes('Alert')) {
    return {
      type: 'components',
      wrapperClass,
      components: [
        { props: { type: "info" }, children: "Info alert message" },
        { props: { type: "success" }, children: "Success alert message" },
        { props: { type: "warning" }, children: "Warning alert message" },
        { props: { type: "error" }, children: "Error alert message" },
      ],
    };
  }
  
  return { type: 'code', code, wrapperClass };
}

/**
 * Loading-specific preview generator
 */
function generateLoadingPreviewSpec(code: string, config: PreviewConfig = {}): PreviewSpec {
  const { wrapperClass = "flex gap-4" } = config;
  
  return {
    type: 'components',
    wrapperClass,
    components: [
      { props: {} },
    ],
  };
}

/**
 * Progress-specific preview generator
 */
function generateProgressPreviewSpec(code: string, config: PreviewConfig = {}): PreviewSpec {
  const { wrapperClass = "space-y-4" } = config;
  
  if (code.includes('value=')) {
    return {
      type: 'components',
      wrapperClass,
      components: [
        { props: { value: 25, max: 100 } },
        { props: { value: 50, max: 100 } },
        { props: { value: 75, max: 100 } },
      ],
    };
  }
  
  return { type: 'code', code, wrapperClass };
}

/**
 * Modal-specific preview generator
 */
function generateModalPreviewSpec(code: string, config: PreviewConfig = {}): PreviewSpec {
  return { type: 'code', code, wrapperClass: config.wrapperClass || "flex gap-4" };
}

/**
 * Dropdown-specific preview generator
 */
function generateDropdownPreviewSpec(code: string, config: PreviewConfig = {}): PreviewSpec {
  return { type: 'code', code, wrapperClass: config.wrapperClass || "flex gap-4" };
}

/**
 * Input-specific preview generator
 */
function generateInputPreviewSpec(code: string, config: PreviewConfig = {}): PreviewSpec {
  const { wrapperClass = "space-y-4" } = config;
  
  if (code.includes('placeholder=')) {
    return {
      type: 'components',
      wrapperClass,
      components: [
        { props: { placeholder: "Type here..." } },
        { props: { placeholder: "Email", type: "email" } },
        { props: { placeholder: "Password", type: "password" } },
      ],
    };
  }
  
  return { type: 'code', code, wrapperClass };
}

/**
 * Checkbox-specific preview generator
 */
function generateCheckboxPreviewSpec(code: string, config: PreviewConfig = {}): PreviewSpec {
  const { wrapperClass = "space-y-2" } = config;
  
  return {
    type: 'components',
    wrapperClass,
    components: [
      { props: { checked: false }, children: "Unchecked" },
      { props: { checked: true }, children: "Checked" },
      { props: { disabled: true }, children: "Disabled" },
    ],
  };
}

/**
 * Mockup component preview generator
 */
function generateMockupPreviewSpec(
  code: string, 
  mockupType: string,
  config: PreviewConfig = {}
): PreviewSpec {
  const { wrapperClass = "flex justify-center" } = config;
  
  // For mockup components, show the code since they contain complex nested content
  // The actual mockup rendering is best shown via code examples
  return { 
    type: 'code', 
    code, 
    wrapperClass: wrapperClass + " max-w-4xl mx-auto" 
  };
}

/**
 * Generic component preview generator for unknown components
 */
function generateGenericComponentPreviewSpec(
  code: string, 
  componentName: string, 
  config: PreviewConfig = {}
): PreviewSpec {
  const { wrapperClass = "flex gap-4" } = config;
  
  // Try to extract common patterns
  if (code.includes('color=') || code.includes('variant=') || code.includes('size=')) {
    return {
      type: 'components',
      wrapperClass,
      components: [{ props: {} }],
    };
  }
  
  // Fallback to code display
  return { type: 'code', code, wrapperClass };
}