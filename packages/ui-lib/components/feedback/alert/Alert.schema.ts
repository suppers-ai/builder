/**
 * Alert Component Zod Schema
 * Defines props, types, validation, and documentation for the Alert component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, ColorPropsSchema, withMetadata } from "../../schemas/base.ts";

// Alert-specific props
const AlertSpecificPropsSchema = z.object({
  icon: z.any()
    .optional()
    .describe("Alert icon component"),

  dismissible: withMetadata(
    z.boolean().default(false).describe("Whether alert can be dismissed"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  actions: z.any()
    .optional()
    .describe("Alert action buttons"),

  onDismiss: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when alert is dismissed"),
});

// Complete Alert Props Schema
export const AlertPropsSchema = BaseComponentPropsSchema
  .merge(ColorPropsSchema)
  .merge(AlertSpecificPropsSchema)
  .describe("Alert component for displaying important messages and notifications");

// Infer TypeScript type from schema
export type AlertProps = z.infer<typeof AlertPropsSchema>;

// Export validation function
export const validateAlertProps = (props: unknown): AlertProps => {
  return AlertPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateAlertProps = (props: unknown) => {
  return AlertPropsSchema.safeParse(props);
};
