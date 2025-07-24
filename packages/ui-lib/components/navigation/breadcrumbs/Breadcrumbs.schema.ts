/**
 * Breadcrumbs Component Zod Schema
 * Defines props, types, validation, and documentation for the Breadcrumbs component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// BreadcrumbItem schema
const BreadcrumbItemPropsSchema = z.object({
  label: z.string().describe("Breadcrumb item label"),
  href: z.string().optional().describe("Optional link URL"),
  active: z.boolean().default(false).describe("Whether item is active/current"),
  disabled: z.boolean().default(false).describe("Whether item is disabled"),
});

// Breadcrumbs-specific props
const BreadcrumbsSpecificPropsSchema = z.object({
  items: withMetadata(
    z.array(BreadcrumbItemPropsSchema).describe("Array of breadcrumb items"),
    { examples: ['[{ label: "Home", href: "/" }, { label: "Current", active: true }]'], since: "1.0.0" },
  ),
});

// Complete Breadcrumbs Props Schema
export const BreadcrumbsPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(BreadcrumbsSpecificPropsSchema)
  .describe("Breadcrumb navigation component showing current location in hierarchy");

// Export BreadcrumbItem schema for reuse
export { BreadcrumbItemPropsSchema };

// Infer TypeScript types from schemas
export type BreadcrumbItemProps = z.infer<typeof BreadcrumbItemPropsSchema>;
export type BreadcrumbsProps = z.infer<typeof BreadcrumbsPropsSchema>;

// Export validation functions
export const validateBreadcrumbsProps = (props: unknown): BreadcrumbsProps => {
  return BreadcrumbsPropsSchema.parse(props);
};

export const safeValidateBreadcrumbsProps = (props: unknown) => {
  return BreadcrumbsPropsSchema.safeParse(props);
};

export const validateBreadcrumbItemProps = (item: unknown): BreadcrumbItemProps => {
  return BreadcrumbItemPropsSchema.parse(item);
};

export const safeValidateBreadcrumbItemProps = (item: unknown) => {
  return BreadcrumbItemPropsSchema.safeParse(item);
};