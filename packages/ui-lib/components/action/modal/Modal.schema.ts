/**
 * Modal Component Zod Schema
 * Defines props, types, validation, and documentation for the Modal component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Modal-specific props
const ModalSpecificPropsSchema = z.object({
  open: withMetadata(
    z.boolean().default(false).describe("Whether modal is open"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  title: z.string()
    .optional()
    .describe("Modal title text"),

  backdrop: withMetadata(
    z.boolean().default(true).describe("Whether to show backdrop overlay"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  responsive: withMetadata(
    z.boolean().default(true).describe("Whether modal should be responsive"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  // DaisyUI 5 specific modal features
  position: withMetadata(
    z.enum(["top", "middle", "bottom"]).default("middle").describe("Modal position (DaisyUI 5)"),
    { examples: ["top", "middle", "bottom"], since: "2.0.0" },
  ),

  onClose: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when modal closes"),

  onOpen: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when modal opens"),

  onBackdropClick: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when backdrop is clicked"),
});

// Complete Modal Props Schema
export const ModalPropsSchema = BaseComponentPropsSchema
  .merge(ModalSpecificPropsSchema)
  .describe("Modal dialog component with backdrop and responsive options");

// Infer TypeScript type from schema
export type ModalProps = z.infer<typeof ModalPropsSchema>;

// Export validation function
export const validateModalProps = (props: unknown): ModalProps => {
  return ModalPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateModalProps = (props: unknown) => {
  return ModalPropsSchema.safeParse(props);
};
