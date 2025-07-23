/**
 * Diff Component Zod Schema
 * Defines props, types, validation, and documentation for the Diff component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Diff-specific props
const DiffSpecificPropsSchema = z.object({
  text1: z.string().describe("First text to compare"),

  text2: z.string().describe("Second text to compare"),

  mode: withMetadata(
    z.enum(["chars", "words", "lines"]).default("lines").describe("Comparison mode"),
    { examples: ["chars", "words", "lines"], since: "1.0.0" },
  ),

  showStats: z.boolean()
    .default(false)
    .describe("Show diff statistics"),

  ignoreWhitespace: z.boolean()
    .default(false)
    .describe("Ignore whitespace differences"),

  ignoreCase: z.boolean()
    .default(false)
    .describe("Case-insensitive comparison"),
});

// Complete Diff Props Schema
export const DiffPropsSchema = BaseComponentPropsSchema
  .merge(DiffSpecificPropsSchema)
  .describe("Text difference comparison component");

// Infer TypeScript type from schema
export type DiffProps = z.infer<typeof DiffPropsSchema>;

// Export validation function
export const validateDiffProps = (props: unknown): DiffProps => {
  return DiffPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateDiffProps = (props: unknown) => {
  return DiffPropsSchema.safeParse(props);
};
