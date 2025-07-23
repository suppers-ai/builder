/**
 * Base Zod schemas for common DaisyUI component patterns
 * These can be reused across components to maintain consistency
 */

import { z } from "zod";
import type { ComponentChildren } from "preact";

// DaisyUI Core Types
export const DaisyUISizeSchema = z.enum(["xs", "sm", "md", "lg", "xl"]).describe("Component size");
export const DaisyUIColorSchema = z.enum([
  "primary",
  "secondary",
  "accent",
  "neutral",
  "base-100",
  "base-200",
  "base-300",
  "info",
  "success",
  "warning",
  "error",
]).describe("Component color theme");

export const DaisyUIVariantSchema = z.enum([
  "primary",
  "secondary",
  "accent",
  "info",
  "success",
  "warning",
  "error",
  "outline",
  "ghost",
  "link",
]).describe("Component visual variant");

// Base Props Schemas
export const BaseComponentPropsSchema = z.object({
  children: z.custom<ComponentChildren>().optional().describe("Component content"),
  class: z.string().optional().describe("Additional CSS classes"),
  id: z.string().optional().describe("HTML id attribute"),
}).describe("Base component properties");

export const SizePropsSchema = z.object({
  size: DaisyUISizeSchema.default("md").describe("Component size"),
}).describe("Size-related properties");

export const ColorPropsSchema = z.object({
  color: DaisyUIColorSchema.optional().describe("Component color theme"),
}).describe("Color-related properties");

export const VariantPropsSchema = z.object({
  variant: DaisyUIVariantSchema.optional().describe("Component visual style variant"),
}).describe("Variant-related properties");

export const DisabledPropsSchema = z.object({
  disabled: z.boolean().default(false).describe("Disable component interactions"),
}).describe("Disabled state properties");

export const LoadingPropsSchema = z.object({
  loading: z.boolean().default(false).describe("Show loading state"),
}).describe("Loading state properties");

export const ActivePropsSchema = z.object({
  active: z.boolean().default(false).describe("Apply active state styling"),
}).describe("Active state properties");

// Event Handler Schemas
export const ClickEventPropsSchema = z.object({
  onClick: z.function()
    .args(z.custom<MouseEvent>())
    .returns(z.void())
    .optional()
    .describe("Click event handler (Islands only)"),
}).describe("Click event properties");

export const FocusEventPropsSchema = z.object({
  onFocus: z.function()
    .args(z.custom<FocusEvent>())
    .returns(z.void())
    .optional()
    .describe("Focus event handler"),
  onBlur: z.function()
    .args(z.custom<FocusEvent>())
    .returns(z.void())
    .optional()
    .describe("Blur event handler"),
}).describe("Focus event properties");

export const ChangeEventPropsSchema = z.object({
  onChange: z.function()
    .args(z.custom<Event>())
    .returns(z.void())
    .optional()
    .describe("Change event handler"),
  onInput: z.function()
    .args(z.custom<Event>())
    .returns(z.void())
    .optional()
    .describe("Input event handler"),
}).describe("Change event properties");

// Form Props Schemas
export const FormFieldPropsSchema = z.object({
  name: z.string().optional().describe("Form field name"),
  value: z.any().optional().describe("Form field value"),
  defaultValue: z.any().optional().describe("Default form field value"),
  required: z.boolean().default(false).describe("Mark field as required"),
}).describe("Form field properties");

// Accessibility Props Schemas
export const AccessibilityPropsSchema = z.object({
  role: z.string().optional().describe("ARIA role attribute"),
  tabIndex: z.number().optional().describe("Tab index for keyboard navigation"),
  "aria-label": z.string().optional().describe("Accessible label"),
  "aria-describedby": z.string().optional().describe("ID of element that describes this component"),
  "aria-expanded": z.boolean().optional().describe("Whether expandable element is expanded"),
  "aria-hidden": z.boolean().optional().describe("Whether element is hidden from screen readers"),
}).describe("Accessibility properties");

// Link Props Schemas
export const LinkPropsSchema = z.object({
  href: z.string().optional().describe("Link URL"),
  target: z.enum(["_blank", "_self", "_parent", "_top"]).optional().describe("Link target"),
  rel: z.string().optional().describe("Link relationship"),
}).describe("Link properties");

// Utility Schemas
export const ResponsiveSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([
    schema,
    z.object({
      xs: schema.optional(),
      sm: schema.optional(),
      md: schema.optional(),
      lg: schema.optional(),
      xl: schema.optional(),
    }),
  ]).describe("Responsive value (single value or breakpoint object)");

// Schema Composition Helpers
// Use .merge() directly on schemas for better composition
//
// PREFERRED PATTERN:
//   const MySchema = BaseSchema
//     .merge(SizePropsSchema)
//     .merge(ColorPropsSchema)
//     .describe("My component properties");
//
// AVOID:
//   const MySchema = z.object({
//     ...BaseSchema.shape,      // ❌ Loses metadata
//     ...SizePropsSchema.shape  // ❌ Not composable
//   });

// Common Schema Combinations
export const ButtonBaseSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(VariantPropsSchema)
  .merge(DisabledPropsSchema)
  .merge(LoadingPropsSchema)
  .merge(ActivePropsSchema)
  .merge(ClickEventPropsSchema)
  .merge(FocusEventPropsSchema)
  .merge(AccessibilityPropsSchema);

export const InputBaseSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(DisabledPropsSchema)
  .merge(FormFieldPropsSchema)
  .merge(ChangeEventPropsSchema)
  .merge(FocusEventPropsSchema)
  .merge(AccessibilityPropsSchema);

export const DisplayBaseSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(VariantPropsSchema);

/**
 * Add metadata to a Zod schema
 */
export function withMetadata<T extends z.ZodTypeAny>(
  schema: T,
  metadata: {
    examples?: string[];
    deprecated?: boolean;
    since?: string;
    category?: string;
  },
): T {
  (schema as any)._def.metadata = {
    ...(schema as any)._def.metadata,
    ...metadata,
  };
  return schema;
}
