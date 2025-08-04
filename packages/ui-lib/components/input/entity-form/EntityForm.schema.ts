/**
 * EntityForm Component Zod Schema
 * Defines props, types, validation, and documentation for the EntityForm component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Form Field Option schema
const FormFieldOptionSchema = z.object({
  value: z.string().describe("Option value"),
  label: z.string().describe("Option display label"),
  description: z.string()
    .optional()
    .describe("Optional option description"),
});

// Form Field Validation schema
const FormFieldValidationSchema = z.object({
  minLength: z.number()
    .int()
    .positive()
    .optional()
    .describe("Minimum length validation"),

  maxLength: z.number()
    .int()
    .positive()
    .optional()
    .describe("Maximum length validation"),

  pattern: z.custom<RegExp>()
    .optional()
    .describe("Regular expression pattern validation"),

  custom: z.function()
    .args(z.any())
    .returns(z.union([z.string(), z.null()]))
    .optional()
    .describe("Custom validation function (returns error message or null)"),
});

// Form Field schema
const FormFieldSchema = z.object({
  key: z.string().describe("Unique field identifier"),

  label: z.string().describe("Field display label"),

  type: withMetadata(
    z.enum(["text", "textarea", "select", "json"]).describe("Field input type"),
    { examples: ["text", "textarea", "select", "json"], since: "1.0.0" },
  ),

  required: z.boolean()
    .default(false)
    .describe("Whether field is required"),

  placeholder: z.string()
    .optional()
    .describe("Field placeholder text"),

  options: z.array(FormFieldOptionSchema)
    .optional()
    .describe("Options for select field type"),

  validation: FormFieldValidationSchema
    .optional()
    .describe("Field validation rules"),
});

// EntityForm-specific props
const EntityFormSpecificPropsSchema = z.object({
  title: z.string().describe("Form title"),

  fields: z.array(FormFieldSchema)
    .min(1)
    .describe("Array of form field configurations"),

  initialData: z.record(z.string(), z.any())
    .default({})
    .describe("Initial form data values"),

  onSubmit: z.function()
    .args(z.record(z.string(), z.any()))
    .returns(z.promise(z.void()))
    .describe("Form submission handler (async)"),

  onCancel: z.function()
    .args()
    .returns(z.void())
    .describe("Form cancellation handler"),

  isLoading: z.boolean()
    .default(false)
    .describe("Loading state during form submission"),

  submitLabel: z.string()
    .default("Save")
    .describe("Submit button label"),

  cancelLabel: z.string()
    .default("Cancel")
    .describe("Cancel button label"),
});

// Complete EntityForm Props Schema
export const EntityFormPropsSchema = BaseComponentPropsSchema
  .merge(EntityFormSpecificPropsSchema)
  .describe("Dynamic form builder with field validation, JSON support, and async submission");

// Export related schemas for reuse
export { FormFieldOptionSchema, FormFieldSchema, FormFieldValidationSchema };

// Infer TypeScript types from schemas
export type FormField = z.infer<typeof FormFieldSchema>;
export type FormFieldOption = z.infer<typeof FormFieldOptionSchema>;
export type FormFieldValidation = z.infer<typeof FormFieldValidationSchema>;
export type EntityFormProps = z.infer<typeof EntityFormPropsSchema>;

// Export validation functions
export const validateEntityFormProps = (props: unknown): EntityFormProps => {
  return EntityFormPropsSchema.parse(props);
};

export const safeValidateEntityFormProps = (props: unknown) => {
  return EntityFormPropsSchema.safeParse(props);
};

export const validateFormField = (field: unknown): FormField => {
  return FormFieldSchema.parse(field);
};

export const validateFormFieldOption = (option: unknown): FormFieldOption => {
  return FormFieldOptionSchema.parse(option);
};

export const validateFormFieldValidation = (validation: unknown): FormFieldValidation => {
  return FormFieldValidationSchema.parse(validation);
};
