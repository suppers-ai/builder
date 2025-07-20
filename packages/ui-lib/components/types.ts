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
