/**
 * Stack Component Zod Schema
 * Defines props, types, validation, and documentation for the Stack component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Stack-specific props
const StackSpecificPropsSchema = z.object({
  children: z.any()
    .describe("Child elements to stack"),

  direction: withMetadata(
    z.enum(["horizontal", "vertical"]).default("vertical").describe("Direction of stacking"),
    { examples: ["horizontal", "vertical"], since: "1.0.0" },
  ),

  gap: withMetadata(
    z.enum(["xs", "sm", "md", "lg", "xl"]).default("md").describe("Gap between stacked elements"),
    { examples: ["xs", "sm", "md", "lg", "xl"], since: "1.0.0" },
  ),

  align: withMetadata(
    z.enum(["start", "center", "end", "stretch"]).default("start").describe(
      "Alignment of stacked elements",
    ),
    { examples: ["start", "center", "end", "stretch"], since: "1.0.0" },
  ),

  justify: withMetadata(
    z.enum(["start", "center", "end", "between", "around", "evenly"]).default("start").describe(
      "Justification of stacked elements",
    ),
    { examples: ["start", "center", "end", "between", "around", "evenly"], since: "1.0.0" },
  ),

  wrap: withMetadata(
    z.boolean().default(false).describe("Whether to wrap elements"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onStackClick: z.function()
    .returns(z.void())
    .optional()
    .describe("Click handler for the stack container"),
});

// Complete Stack Props Schema
export const StackPropsSchema = BaseComponentPropsSchema
  .merge(StackSpecificPropsSchema)
  .describe("Flexible layout component for stacking elements with controlled spacing");

// Infer TypeScript type from schema
export type StackProps = z.infer<typeof StackPropsSchema>;

// Export validation function
export const validateStackProps = (props: unknown): StackProps => {
  return StackPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateStackProps = (props: unknown) => {
  return StackPropsSchema.safeParse(props);
};
