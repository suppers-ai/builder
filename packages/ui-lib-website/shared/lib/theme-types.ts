// Theme interfaces that align with DaisyUI's dynamic CSS variable approach
export interface CustomTheme {
  id: string;
  name: string;
  label: string;
  description: string;
  variables: Record<string, string | number>;
  createdBy?: string;
  isPublic?: boolean;
}

// DaisyUI CSS variable names for reference and validation
export const DAISYUI_CSS_VARIABLES = {
  // Color variables
  colors: [
    "color-primary",
    "color-primary-content",
    "color-secondary",
    "color-secondary-content",
    "color-accent",
    "color-accent-content",
    "color-neutral",
    "color-neutral-content",
    "color-base-100",
    "color-base-200",
    "color-base-300",
    "color-base-content",
    "color-info",
    "color-info-content",
    "color-success",
    "color-success-content",
    "color-warning",
    "color-warning-content",
    "color-error",
    "color-error-content",
  ],
  // Layout and styling variables
  layout: [
    "radius-selector",
    "radius-field",
    "radius-box",
    "size-selector",
    "size-field",
    "border",
  ],
  // Effects (binary 0/1 values)
  effects: [
    "depth",
    "noise",
  ],
} as const;

// Helper function to create a theme with proper CSS variable prefixes
export function createThemeVariables(variables: Record<string, string | number>): string {
  const cssVariables = Object.entries(variables)
    .map(([key, value]) => {
      // Ensure the variable has the CSS variable prefix
      const cssVarName = key.startsWith("--") ? key : `--${key}`;
      return `  ${cssVarName}: ${value};`;
    })
    .join("\n");

  return `{\n${cssVariables}\n}`;
}

// Helper function to apply theme variables to an element
export function applyThemeToElement(
  element: HTMLElement,
  variables: Record<string, string | number>,
) {
  Object.entries(variables).forEach(([key, value]) => {
    const cssVarName = key.startsWith("--") ? key : `--${key}`;
    element.style.setProperty(cssVarName, String(value));
  });
}

// Default theme structure with common DaisyUI variables
export const DEFAULT_THEME_VARIABLES: Record<string, string | number> = {
  "color-primary": "#570df8",
  "color-primary-content": "#ffffff",
  "color-secondary": "#f000b8",
  "color-secondary-content": "#ffffff",
  "color-accent": "#37cdbe",
  "color-accent-content": "#ffffff",
  "color-neutral": "#3d4451",
  "color-neutral-content": "#ffffff",
  "color-base-100": "#ffffff",
  "color-base-200": "#f2f2f2",
  "color-base-300": "#e6e6e6",
  "color-base-content": "#1f2937",
  "color-info": "#3abff8",
  "color-info-content": "#ffffff",
  "color-success": "#36d399",
  "color-success-content": "#ffffff",
  "color-warning": "#fbbd23",
  "color-warning-content": "#ffffff",
  "color-error": "#f87272",
  "color-error-content": "#ffffff",
  "radius-box": "1rem",
  "radius-field": "0.5rem",
  "radius-selector": "0.25rem",
  "border": "1px",
  "depth": 0,
  "noise": 0,
};
