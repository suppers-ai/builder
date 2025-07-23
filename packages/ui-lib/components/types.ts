// Base interfaces for DaisyUI components
import { ComponentChildren, RefObject } from "preact";

export type DaisyUISize = "xs" | "sm" | "md" | "lg" | "xl";
export type DaisyUIColor =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "base-100"
  | "base-200"
  | "base-300"
  | "info"
  | "success"
  | "warning"
  | "error";
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
  | "link";

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

// Component example interface for rich examples
export interface ComponentExample {
  title: string;
  description: string;
  code: string;
  props?: Record<string, any>;
  interactive?: boolean;
  showCode?: boolean;
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
