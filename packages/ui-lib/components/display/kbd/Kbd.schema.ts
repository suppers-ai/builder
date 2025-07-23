/**
 * Kbd Component Zod Schema
 * Defines props, types, validation, and documentation for the Kbd component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, SizePropsSchema, withMetadata } from "../../schemas/base.ts";

// Kbd-specific props
const KbdSpecificPropsSchema = z.object({
  variant: withMetadata(
    z.enum(["default", "primary", "secondary", "accent", "ghost"])
      .default("default")
      .describe("Keyboard key visual variant"),
    { examples: ["default", "primary", "secondary", "accent", "ghost"], since: "1.0.0" },
  ),

  onClick: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Click event handler for interactive keys"),
});

// Complete Kbd Props Schema
export const KbdPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(KbdSpecificPropsSchema)
  .describe("Keyboard key component for displaying keyboard shortcuts and interactive keys");

// Infer TypeScript type from schema
export type KbdProps = z.infer<typeof KbdPropsSchema>;

// Export validation function
export const validateKbdProps = (props: unknown): KbdProps => {
  return KbdPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateKbdProps = (props: unknown) => {
  return KbdPropsSchema.safeParse(props);
};
