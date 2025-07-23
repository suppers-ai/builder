/**
 * NumberInput Component Zod Schema
 * Defines props, types, validation, and documentation for the NumberInput component
 */

import { z } from "zod";
import { InputBaseSchema, withMetadata } from "../../schemas/base.ts";

// NumberInput-specific props
const NumberInputSpecificPropsSchema = z.object({
  value: z.number()
    .optional()
    .describe("The number input value"),

  placeholder: z.string()
    .default("0")
    .describe("Placeholder text for the input"),

  min: withMetadata(
    z.number().optional().describe("Minimum allowed value"),
    { examples: ["0", "-10", "1"], since: "1.0.0" },
  ),

  max: withMetadata(
    z.number().optional().describe("Maximum allowed value"),
    { examples: ["100", "999", "10"], since: "1.0.0" },
  ),

  step: withMetadata(
    z.number().positive().default(1).describe("Step value for increment/decrement"),
    { examples: ["1", "0.5", "5", "10"], since: "1.0.0" },
  ),

  bordered: z.boolean()
    .default(true)
    .describe("Show input border"),

  ghost: z.boolean()
    .default(false)
    .describe("Ghost style input"),

  onChange: z.function()
    .args(z.number())
    .returns(z.void())
    .optional()
    .describe("Callback when number value changes"),

  onIncrement: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when increment button is clicked"),

  onDecrement: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when decrement button is clicked"),

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

  onInput: z.function()
    .args(z.custom<Event>())
    .returns(z.void())
    .optional()
    .describe("Input event handler"),
});

// Complete NumberInput Props Schema
export const NumberInputPropsSchema = InputBaseSchema
  .merge(NumberInputSpecificPropsSchema)
  .describe("Number input field with increment/decrement controls and range validation");

// Infer TypeScript type from schema
export type NumberInputProps = z.infer<typeof NumberInputPropsSchema>;

// Export validation function
export const validateNumberInputProps = (props: unknown): NumberInputProps => {
  return NumberInputPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateNumberInputProps = (props: unknown) => {
  return NumberInputPropsSchema.safeParse(props);
};
