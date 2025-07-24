/**
 * ComponentPageTemplate Zod Schema
 * Defines props, types, validation, and documentation for the ComponentPageTemplate component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// Example schema
const ExampleSchema = z.object({
  title: z.string().describe("Example title"),
  description: z.string().optional().describe("Optional example description"),
  code: z.string().describe("Example code snippet"),
  preview: z.any().describe("Preview component/element"),
});

// API Property schema
const ApiPropertySchema = z.object({
  name: z.string().describe("Property name"),
  type: z.string().describe("Property type"),
  default: z.string().optional().describe("Default value"),
  description: z.string().describe("Property description"),
  required: z.boolean().optional().describe("Whether property is required"),
});

// ComponentPageTemplate-specific props
const ComponentPageTemplateSpecificPropsSchema = z.object({
  title: z.string().describe("Component page title"),
  description: z.string().describe("Component description"),
  category: z.string().describe("Component category"),

  examples: withMetadata(
    z.array(ExampleSchema).describe("Array of component examples"),
    { examples: ['[{ title: "Basic Usage", code: "<Component />", preview: <Component /> }]'], since: "1.0.0" },
  ),

  apiProps: z.array(ApiPropertySchema)
    .optional()
    .describe("Optional API properties documentation"),

  usageNotes: z.array(z.string())
    .optional()
    .describe("Optional usage notes and tips"),

  accessibilityNotes: z.array(z.string())
    .optional()
    .describe("Optional accessibility considerations"),

  designNotes: z.array(z.string())
    .optional()
    .describe("Optional design implementation notes"),

  codeSnippet: z.string()
    .optional()
    .describe("Optional installation/import code snippet"),

  demoUrl: z.string()
    .optional()
    .describe("Optional demo URL"),

  sourceUrl: z.string()
    .optional()
    .describe("Optional source code URL"),
});

// Complete ComponentPageTemplate Props Schema
export const ComponentPageTemplatePropsSchema = BaseComponentPropsSchema
  .merge(ComponentPageTemplateSpecificPropsSchema)
  .describe("Template for component documentation pages with examples and API reference");

// Export related schemas for reuse
export { ExampleSchema, ApiPropertySchema };

// Infer TypeScript types from schemas
export type Example = z.infer<typeof ExampleSchema>;
export type ApiProperty = z.infer<typeof ApiPropertySchema>;
export type ComponentPageProps = z.infer<typeof ComponentPageTemplatePropsSchema>;

// Export validation functions
export const validateComponentPageProps = (props: unknown): ComponentPageProps => {
  return ComponentPageTemplatePropsSchema.parse(props);
};

export const safeValidateComponentPageProps = (props: unknown) => {
  return ComponentPageTemplatePropsSchema.safeParse(props);
};

export const validateExample = (example: unknown): Example => {
  return ExampleSchema.parse(example);
};

export const validateApiProperty = (prop: unknown): ApiProperty => {
  return ApiPropertySchema.parse(prop);
};