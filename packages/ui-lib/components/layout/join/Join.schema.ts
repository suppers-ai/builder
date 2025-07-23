/**
 * Join Component Zod Schema
 * Defines props, types, validation, and documentation for the Join component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Join-specific props
const JoinSpecificPropsSchema = z.object({
  children: z.any()
    .describe("Child elements to group together"),

  vertical: withMetadata(
    z.boolean().default(false).describe("Whether to display items vertically"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  responsive: withMetadata(
    z.boolean().default(true).describe(
      "Whether to be responsive (vertical on mobile, horizontal on desktop)",
    ),
    { examples: ["true", "false"], since: "1.0.0" },
  ),
});

// Complete Join Props Schema
export const JoinPropsSchema = BaseComponentPropsSchema
  .merge(JoinSpecificPropsSchema)
  .describe("Layout component that groups related elements together");

// Infer TypeScript type from schema
export type JoinProps = z.infer<typeof JoinPropsSchema>;

// Export validation function
export const validateJoinProps = (props: unknown): JoinProps => {
  return JoinPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateJoinProps = (props: unknown) => {
  return JoinPropsSchema.safeParse(props);
};
