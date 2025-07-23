/**
 * Button Component Zod Schema
 * Defines props, types, validation, and documentation for the Button component
 */

import { z } from "zod";
import { 
  ButtonBaseSchema, 
  LinkPropsSchema,
  withMetadata
} from "../../schemas/base.ts";

// Button-specific props
const ButtonSpecificPropsSchema = z.object({
  type: z.enum(["button", "submit", "reset"])
    .default("button")
    .describe("HTML button type attribute"),
    
  wide: withMetadata(
    z.boolean().default(false).describe("Make button full width"),
    { examples: ["true", "false"], since: "1.0.0" }
  ),
  
  circle: z.boolean()
    .default(false)
    .describe("Make button circular (requires fixed dimensions)"),
    
  square: z.boolean()
    .default(false)
    .describe("Make button square (equal width and height)"),
    
  shape: z.enum(["circle", "square"])
    .optional()
    .describe("Button shape (alternative to circle/square props)"),
    
  glass: withMetadata(
    z.boolean().default(false).describe("Apply glass morphism effect"),
    { examples: ["true"], since: "1.1.0" }
  ),
  
  noAnimation: z.boolean()
    .default(false)
    .describe("Disable button animations and transitions"),
    
  as: z.string()
    .optional()
    .describe("Render as different HTML element (e.g., 'a', 'div')"),
});

// Complete Button Props Schema
export const ButtonPropsSchema = ButtonBaseSchema
  .merge(ButtonSpecificPropsSchema)
  .merge(LinkPropsSchema)
  .describe("Interactive buttons with multiple variants, sizes, and states for user actions");

// Infer TypeScript type from schema
export type ButtonProps = z.infer<typeof ButtonPropsSchema>;

// Export validation function
export const validateButtonProps = (props: unknown): ButtonProps => {
  return ButtonPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateButtonProps = (props: unknown) => {
  return ButtonPropsSchema.safeParse(props);
};