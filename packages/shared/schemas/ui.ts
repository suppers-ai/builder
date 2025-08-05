/**
 * UI Schema Definitions
 * Zod schemas for UI components, themes, and styling
 */

import { z } from "zod";

// Component Size Schema
export const ComponentSizeSchema = z.enum(["xs", "sm", "md", "lg", "xl"]);

// Component Color Schema
export const ComponentColorSchema = z.enum([
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
  "ghost",
  "link",
]);

// Component Variant Schema
export const ComponentVariantSchema = z.enum([
  "default",
  "outline",
  "ghost",
  "link",
  "solid",
  "soft",
  "surface",
]);

// Button Props Schema
export const ButtonPropsSchema = z.object({
  size: ComponentSizeSchema.optional(),
  color: ComponentColorSchema.optional(),
  variant: ComponentVariantSchema.optional(),
  disabled: z.boolean().optional(),
  loading: z.boolean().optional(),
  wide: z.boolean().optional(),
  block: z.boolean().optional(),
  circle: z.boolean().optional(),
  square: z.boolean().optional(),
});

// Input Props Schema
export const InputPropsSchema = z.object({
  size: ComponentSizeSchema.optional(),
  color: ComponentColorSchema.optional(),
  bordered: z.boolean().optional(),
  ghost: z.boolean().optional(),
  disabled: z.boolean().optional(),
  readonly: z.boolean().optional(),
  error: z.boolean().optional(),
});

// Modal Props Schema
export const ModalPropsSchema = z.object({
  open: z.boolean().optional(),
  backdrop: z.boolean().optional(),
  responsive: z.boolean().optional(),
  size: z.enum(["sm", "md", "lg", "xl", "full"]).optional(),
});

// Alert Props Schema
export const AlertPropsSchema = z.object({
  type: z.enum(["info", "success", "warning", "error"]).optional(),
  dismissible: z.boolean().optional(),
});

// Card Props Schema
export const CardPropsSchema = z.object({
  compact: z.boolean().optional(),
  bordered: z.boolean().optional(),
  shadow: z.boolean().optional(),
  glass: z.boolean().optional(),
});

// Badge Props Schema
export const BadgePropsSchema = z.object({
  size: ComponentSizeSchema.optional(),
  color: ComponentColorSchema.optional(),
  variant: z.enum(["default", "outline"]).optional(),
  dot: z.boolean().optional(),
});

// Progress Props Schema
export const ProgressPropsSchema = z.object({
  value: z.number().min(0).max(100).optional(),
  max: z.number().positive().optional(),
  color: ComponentColorSchema.optional(),
  size: ComponentSizeSchema.optional(),
});

// Avatar Props Schema
export const AvatarPropsSchema = z.object({
  size: ComponentSizeSchema.optional(),
  shape: z.enum(["circle", "square"]).optional(),
  online: z.boolean().optional(),
  offline: z.boolean().optional(),
  placeholder: z.boolean().optional(),
});

// Breadcrumb Item Schema
export const BreadcrumbItemSchema = z.object({
  name: z.string().min(1, "Breadcrumb name is required"),
  path: z.string().optional(),
  active: z.boolean().optional(),
});

// Menu Item Schema (recursive)
export const MenuItemSchema: z.ZodType<{
  label: string;
  href?: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  children?: any[];
}> = z.lazy(() =>
  z.object({
    label: z.string().min(1, "Menu item label is required"),
    href: z.string().optional(),
    icon: z.string().optional(),
    active: z.boolean().optional(),
    disabled: z.boolean().optional(),
    children: z.array(MenuItemSchema).optional(),
  })
);

// Tab Item Schema
export const TabItemSchema = z.object({
  label: z.string().min(1, "Tab label is required"),
  value: z.string().min(1, "Tab value is required"),
  content: z.any().optional(), // React.ReactNode
  disabled: z.boolean().optional(),
});

// Table Column Schema
export const TableColumnSchema = z.object({
  key: z.string().min(1, "Column key is required"),
  label: z.string().min(1, "Column label is required"),
  sortable: z.boolean().optional(),
  width: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
});

// Table Props Schema
export const TablePropsSchema = z.object({
  compact: z.boolean().optional(),
  zebra: z.boolean().optional(),
  pinRows: z.boolean().optional(),
  pinCols: z.boolean().optional(),
});

// Form Field Props Schema
export const FormFieldPropsSchema = z.object({
  label: z.string().optional(),
  hint: z.string().optional(),
  error: z.string().optional(),
  required: z.boolean().optional(),
});

// Layout Props Schema
export const LayoutPropsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  breadcrumbs: z.array(BreadcrumbItemSchema).optional(),
  showSidebar: z.boolean().optional(),
  sidebarCollapsed: z.boolean().optional(),
});

// Responsive Breakpoint Schema
export const BreakpointSchema = z.enum(["sm", "md", "lg", "xl", "2xl"]);

// Tailwind Spacing Schema
export const TailwindSpacingSchema = z.enum([
  "0",
  "px",
  "0.5",
  "1",
  "1.5",
  "2",
  "2.5",
  "3",
  "3.5",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "20",
  "24",
  "28",
  "32",
  "36",
  "40",
  "44",
  "48",
  "52",
  "56",
  "60",
  "64",
  "72",
  "80",
  "96",
]);

// Animation Type Schema
export const AnimationTypeSchema = z.enum([
  "bounce",
  "flash",
  "pulse",
  "rubber-band",
  "shake",
  "swing",
  "tada",
  "wobble",
  "jello",
  "heart-beat",
  "fade-in",
  "fade-out",
  "slide-in",
  "slide-out",
  "zoom-in",
  "zoom-out",
]);

// Icon Props Schema
export const IconPropsSchema = z.object({
  name: z.string().min(1, "Icon name is required"),
  size: ComponentSizeSchema.optional(),
  color: z.string().optional(),
  className: z.string().optional(),
});

// Component State Schema
export const ComponentStateSchema = z.object({
  loading: z.boolean().optional(),
  disabled: z.boolean().optional(),
  error: z.string().optional(),
  success: z.boolean().optional(),
});

// Event Handler Schemas (for type checking function signatures)
export const ClickHandlerSchema = z.function().args(z.any()).returns(z.void());
export const ChangeHandlerSchema = z.function().args(z.any()).returns(z.void());
export const SubmitHandlerSchema = z.function().args(z.record(z.any())).returns(z.void());

// Export inferred types
export type ComponentSize = z.infer<typeof ComponentSizeSchema>;
export type ComponentColor = z.infer<typeof ComponentColorSchema>;
export type ComponentVariant = z.infer<typeof ComponentVariantSchema>;
export type ButtonProps = z.infer<typeof ButtonPropsSchema>;
export type InputProps = z.infer<typeof InputPropsSchema>;
export type ModalProps = z.infer<typeof ModalPropsSchema>;
export type AlertProps = z.infer<typeof AlertPropsSchema>;
export type CardProps = z.infer<typeof CardPropsSchema>;
export type BadgeProps = z.infer<typeof BadgePropsSchema>;
export type ProgressProps = z.infer<typeof ProgressPropsSchema>;
export type AvatarProps = z.infer<typeof AvatarPropsSchema>;
export type BreadcrumbItem = z.infer<typeof BreadcrumbItemSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type TabItem = z.infer<typeof TabItemSchema>;
export type TableColumn = z.infer<typeof TableColumnSchema>;
export type TableProps = z.infer<typeof TablePropsSchema>;
export type FormFieldProps = z.infer<typeof FormFieldPropsSchema>;
export type LayoutProps = z.infer<typeof LayoutPropsSchema>;
export type Breakpoint = z.infer<typeof BreakpointSchema>;
export type TailwindSpacing = z.infer<typeof TailwindSpacingSchema>;
export type AnimationType = z.infer<typeof AnimationTypeSchema>;
export type IconProps = z.infer<typeof IconPropsSchema>;
export type ComponentState = z.infer<typeof ComponentStateSchema>;
