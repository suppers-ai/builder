/**
 * Shared UI Types
 * Common types for UI components, themes, and styling
 */

// Custom Theme Variables
export interface CustomThemeVariables {
  primary?: string;
  secondary?: string;
  accent?: string;
  neutral?: string;
  "base-100"?: string;
  "base-200"?: string;
  "base-300"?: string;
  info?: string;
  success?: string;
  warning?: string;
  error?: string;
  [key: string]: string | number | undefined;
}


// Component Size Variants
export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";

// Component Color Variants
export type ComponentColor =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "ghost"
  | "link";

// Component Variants
export type ComponentVariant =
  | "default"
  | "outline"
  | "ghost"
  | "link"
  | "solid"
  | "soft"
  | "surface";

// Button Types
export interface ButtonProps {
  size?: ComponentSize;
  color?: ComponentColor;
  variant?: ComponentVariant;
  disabled?: boolean;
  loading?: boolean;
  wide?: boolean;
  block?: boolean;
  circle?: boolean;
  square?: boolean;
}

// Input Types
export interface InputProps {
  size?: ComponentSize;
  color?: ComponentColor;
  bordered?: boolean;
  ghost?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: boolean;
}

// Modal Types
export interface ModalProps {
  open?: boolean;
  backdrop?: boolean;
  responsive?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

// Alert Types
export interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  dismissible?: boolean;
}

// Card Types
export interface CardProps {
  compact?: boolean;
  bordered?: boolean;
  shadow?: boolean;
  glass?: boolean;
}

// Badge Types
export interface BadgeProps {
  size?: ComponentSize;
  color?: ComponentColor;
  variant?: "default" | "outline";
  dot?: boolean;
}

// Progress Types
export interface ProgressProps {
  value?: number;
  max?: number;
  color?: ComponentColor;
  size?: ComponentSize;
}

// Avatar Types
export interface AvatarProps {
  size?: ComponentSize;
  shape?: "circle" | "square";
  online?: boolean;
  offline?: boolean;
  placeholder?: boolean;
}

// Breadcrumb Types
export interface BreadcrumbItem {
  name: string;
  path?: string;
  active?: boolean;
}

// Menu Types
export interface MenuItem {
  label: string;
  href?: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  children?: MenuItem[];
}

// Tab Types
export interface TabItem {
  label: string;
  value: string;
  content?: any;
  disabled?: boolean;
}

// Table Types
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TableProps {
  compact?: boolean;
  zebra?: boolean;
  pinRows?: boolean;
  pinCols?: boolean;
}

// Form Types
export interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

// Layout Types
export interface LayoutProps {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
}

// Responsive Breakpoints
export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

// CSS Class Utilities
export type TailwindSpacing =
  | "0"
  | "px"
  | "0.5"
  | "1"
  | "1.5"
  | "2"
  | "2.5"
  | "3"
  | "3.5"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "14"
  | "16"
  | "20"
  | "24"
  | "28"
  | "32"
  | "36"
  | "40"
  | "44"
  | "48"
  | "52"
  | "56"
  | "60"
  | "64"
  | "72"
  | "80"
  | "96";

// Animation Types
export type AnimationType =
  | "bounce"
  | "flash"
  | "pulse"
  | "rubber-band"
  | "shake"
  | "swing"
  | "tada"
  | "wobble"
  | "jello"
  | "heart-beat"
  | "fade-in"
  | "fade-out"
  | "slide-in"
  | "slide-out"
  | "zoom-in"
  | "zoom-out";

// Icon Types
export interface IconProps {
  name: string;
  size?: ComponentSize;
  color?: string;
  className?: string;
}

// Event Handler Types
export type ClickHandler = (event: any) => void;
export type ChangeHandler = (value: any) => void;
export type SubmitHandler = (data: Record<string, any>) => void;

// Component State Types
export interface ComponentState {
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  success?: boolean;
}
