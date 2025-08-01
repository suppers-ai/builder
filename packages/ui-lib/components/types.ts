// Base interfaces for DaisyUI 5 components
import { ComponentChildren, RefObject } from "preact";

export type DaisyUISize = "xs" | "sm" | "md" | "lg" | "xl";

// DaisyUI 5 Enhanced Color Types
export type DaisyUIColor =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "base-100"
  | "base-200"
  | "base-300"
  | "base-content"  // Added for DaisyUI 5
  | "info"
  | "success"
  | "warning"
  | "error";

// DaisyUI 5 Enhanced Variant Types
export type DaisyUIVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "outline"
  | "ghost"
  | "link"
  | "neutral";  // Added for DaisyUI 5

// DaisyUI 5 Loading Types
export type DaisyUILoadingType =
  | "spinner"
  | "dots"
  | "ring"
  | "ball"
  | "bars"
  | "infinity";

// Common component props
export interface BaseComponentProps {
  class?: string;
  children?: ComponentChildren;
  id?: string;
}

export interface SizeProps {
  size?: DaisyUISize;
}

export interface ColorProps {
  color?: DaisyUIColor;
}

export interface VariantProps {
  variant?: DaisyUIVariant;
}

export interface DisabledProps {
  disabled?: boolean;
}

export interface LoadingProps {
  loading?: boolean;
  loadingType?: DaisyUILoadingType;  // Added for DaisyUI 5
}

export interface EventProps {
  onChange?: (event: Event) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onInput?: (event: Event) => void;
}

// Utility types
export type ComponentRef<T = HTMLElement> = RefObject<T>;
export type EventHandler<T = Event> = (event: T) => void;

// Steps interfaces
export interface StepProps {
  title: string;
  description?: string;
  status: "pending" | "current" | "completed" | "error";
  icon?: ComponentChildren;
}

// Component category enum for type safety
export enum ComponentCategory {
  ACTION = "action",
  DISPLAY = "display",
  INPUT = "input",
  LAYOUT = "layout",
  NAVIGATION = "navigation",
  FEEDBACK = "feedback",
  MOCKUP = "mockup",
  PAGE = "page",
  SECTIONS = "sections",
  TEMPLATES = "templates",
}

/**
 * Component example interface for simplified props-based examples.
 * 
 * This interface defines the structure for component examples in the documentation.
 * Examples are now purely props-based, with automatic code generation and consistent
 * presentation. The JSX code is automatically generated from the provided props.
 * 
 * @example
 * // Single component example
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
export interface ComponentExample {
  /** Display title for the example */
  title: string;
  /** Description explaining what the example demonstrates */
  description: string;
  /** 
   * Props to pass to the component(s). Can be a single props object for one component,
   * or an array of props objects for multiple component instances.
   */
  props: Record<string, any> | Array<Record<string, any>>;
  /** Whether to use the interactive version of the component (for islands) */
  interactive?: boolean;
}

// Component prop documentation interface
export interface ComponentProp {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  default?: string;
}

// Schema reference for automatic prop generation
export interface ComponentSchema {
  schema: any; // Zod schema object
  validateFn?: (props: unknown) => any;
  safeValidateFn?: (props: unknown) => any;
}

// Component metadata interface
export interface ComponentMetadata {
  name: string;
  description: string;
  category: ComponentCategory;
  path: string;
  tags: string[];
  relatedComponents: string[];
  preview: ComponentChildren; // JSX preview component
  interactive?: boolean; // Whether component supports interactive mode (islands)

  // Rich examples with full data (replaces simple examples: string[])
  examples: ComponentExample[];

  // API documentation (either manual props or schema reference)
  props?: ComponentProp[];
  schema?: ComponentSchema;

  // Usage information
  usageNotes?: string[];
  variants?: string[];
  useCases?: string[];
}
