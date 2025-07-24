/**
 * Steps Component Zod Schema
 * Defines props, types, validation, and documentation for the Steps component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  withMetadata,
} from "../../schemas/base.ts";
import type { ComponentChildren } from "preact";

// StepProps schema
const StepPropsSchema = z.object({
  title: z.string().describe("Step title"),
  description: z.string().optional().describe("Optional step description"),
  status: z.enum(["pending", "current", "completed", "error"])
    .describe("Step status"),
  icon: z.custom<ComponentChildren>().optional().describe("Optional step icon"),
});

// Steps-specific props
const StepsSpecificPropsSchema = z.object({
  steps: withMetadata(
    z.array(StepPropsSchema).describe("Array of step objects"),
    { examples: ['[{ title: "Step 1", status: "completed" }]'], since: "1.0.0" },
  ),

  vertical: withMetadata(
    z.boolean().default(false).describe("Display steps vertically"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  responsive: withMetadata(
    z.boolean().default(false).describe("Use responsive layout (vertical on mobile, horizontal on desktop)"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  currentStep: z.number()
    .optional()
    .describe("Current step index (for controlled mode)"),

  onStepClick: z.function()
    .args(z.number())
    .returns(z.void())
    .optional()
    .describe("Step click handler (Islands only)"),
});

// Complete Steps Props Schema
export const StepsPropsSchema = BaseComponentPropsSchema
  .merge(StepsSpecificPropsSchema)
  .describe("Step-by-step navigation component showing progress through a process");

// Export StepProps schema for reuse
export { StepPropsSchema };

// Infer TypeScript types from schemas
export type StepProps = z.infer<typeof StepPropsSchema>;
export type StepsProps = z.infer<typeof StepsPropsSchema>;

// Export validation functions
export const validateStepsProps = (props: unknown): StepsProps => {
  return StepsPropsSchema.parse(props);
};

export const safeValidateStepsProps = (props: unknown) => {
  return StepsPropsSchema.safeParse(props);
};

export const validateStepProps = (step: unknown): StepProps => {
  return StepPropsSchema.parse(step);
};

export const safeValidateStepProps = (step: unknown) => {
  return StepPropsSchema.safeParse(step);
};