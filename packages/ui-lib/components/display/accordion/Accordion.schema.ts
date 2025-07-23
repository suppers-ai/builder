/**
 * Accordion Component Zod Schema
 * Defines props, types, validation, and documentation for the Accordion component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// AccordionItem Schema
const AccordionItemSchema = z.object({
  id: z.string().describe("Unique item identifier"),
  title: z.any().describe("Item title content"),
  content: z.any().describe("Item content"),
  disabled: z.boolean().optional().describe("Whether item is disabled"),
});

// Accordion-specific props
const AccordionSpecificPropsSchema = z.object({
  items: withMetadata(
    z.array(AccordionItemSchema).describe("Array of accordion items"),
    { examples: ['[{ id: "1", title: "Item 1", content: "Content 1" }]'], since: "1.0.0" },
  ),

  multiple: withMetadata(
    z.boolean().default(false).describe("Allow multiple items to be open simultaneously"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  defaultOpen: z.array(z.string())
    .default([])
    .describe("Array of item IDs that should be open by default"),

  openItems: z.array(z.string())
    .optional()
    .describe("Controlled mode: array of currently open item IDs"),

  onToggle: z.function()
    .args(z.string(), z.boolean())
    .returns(z.void())
    .optional()
    .describe("Callback when an item is toggled"),
});

// Complete Accordion Props Schema
export const AccordionPropsSchema = BaseComponentPropsSchema
  .merge(AccordionSpecificPropsSchema)
  .describe("Collapsible accordion component for organizing content sections");

// Export AccordionItem schema for reuse
export { AccordionItemSchema };

// Infer TypeScript types from schemas
export type AccordionItem = z.infer<typeof AccordionItemSchema>;
export type AccordionProps = z.infer<typeof AccordionPropsSchema>;

// Export validation functions
export const validateAccordionProps = (props: unknown): AccordionProps => {
  return AccordionPropsSchema.parse(props);
};

export const safeValidateAccordionProps = (props: unknown) => {
  return AccordionPropsSchema.safeParse(props);
};

export const validateAccordionItem = (item: unknown): AccordionItem => {
  return AccordionItemSchema.parse(item);
};

export const safeValidateAccordionItem = (item: unknown) => {
  return AccordionItemSchema.safeParse(item);
};
