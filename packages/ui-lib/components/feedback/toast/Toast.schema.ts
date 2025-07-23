/**
 * Toast Component Zod Schema
 * Defines props, types, validation, and documentation for the Toast component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, ColorPropsSchema, withMetadata } from "../../schemas/base.ts";

// Toast-specific props
const ToastSpecificPropsSchema = z.object({
  message: z.string().describe("Toast message content"),

  position: withMetadata(
    z.enum(["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"])
      .default("top-right")
      .describe("Toast position on screen"),
    { examples: ["top-right", "bottom-center", "top-left"], since: "1.0.0" },
  ),

  duration: z.number()
    .positive()
    .default(3000)
    .describe("Auto-dismiss duration in milliseconds"),

  dismissible: z.boolean()
    .default(true)
    .describe("Whether toast can be manually dismissed"),

  icon: z.any()
    .optional()
    .describe("Toast icon"),

  actions: z.any()
    .optional()
    .describe("Toast action buttons"),

  onDismiss: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when toast is dismissed"),
});

// Complete Toast Props Schema
export const ToastPropsSchema = BaseComponentPropsSchema
  .merge(ColorPropsSchema)
  .merge(ToastSpecificPropsSchema)
  .describe("Toast notification component for temporary messages");

// Infer TypeScript type from schema
export type ToastProps = z.infer<typeof ToastPropsSchema>;

// Export validation function
export const validateToastProps = (props: unknown): ToastProps => {
  return ToastPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateToastProps = (props: unknown) => {
  return ToastPropsSchema.safeParse(props);
};
