/**
 * FileInput Component Zod Schema
 * Defines props, types, validation, and documentation for the FileInput component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  ColorPropsSchema,
  DisabledPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// FileInput-specific props
const FileInputSpecificPropsSchema = z.object({
  accept: z.string()
    .optional()
    .describe("File type restrictions (MIME types or extensions)"),

  multiple: withMetadata(
    z.boolean().default(false).describe("Allow multiple file selection"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  bordered: withMetadata(
    z.boolean().default(true).describe("Show input border"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  ghost: withMetadata(
    z.boolean().default(false).describe("Ghost style (transparent background)"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onChange: z.function()
    .args(z.union([z.instanceof(FileList), z.null()]))
    .returns(z.void())
    .optional()
    .describe("File change event handler"),

  onSelect: z.function()
    .args(z.array(z.instanceof(File)))
    .returns(z.void())
    .optional()
    .describe("File selection handler with file array"),
});

// Complete FileInput Props Schema
export const FileInputPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(DisabledPropsSchema)
  .merge(FileInputSpecificPropsSchema)
  .describe("File upload input component");

// Infer TypeScript type from schema
export type FileInputProps = z.infer<typeof FileInputPropsSchema>;

// Export validation function
export const validateFileInputProps = (props: unknown): FileInputProps => {
  return FileInputPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateFileInputProps = (props: unknown) => {
  return FileInputPropsSchema.safeParse(props);
};
