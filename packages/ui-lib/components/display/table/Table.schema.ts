/**
 * Table Component Zod Schema
 * Defines props, types, validation, and documentation for the Table component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// TableColumn Schema
const TableColumnSchema = z.object({
  key: z.string().describe("Column data key"),
  title: z.string().describe("Column display title"),
  sortable: z.boolean().optional().describe("Whether column is sortable"),
  render: z.function().optional().describe("Custom render function for column cells"),
  width: z.string().optional().describe("Column width (CSS value)"),
  align: z.enum(["left", "center", "right"]).optional().describe("Column text alignment"),
});

// Table-specific props
const TableSpecificPropsSchema = z.object({
  columns: withMetadata(
    z.array(TableColumnSchema).describe("Table column definitions"),
    { examples: ['[{ key: "name", title: "Name", sortable: true }]'], since: "1.0.0" },
  ),

  data: z.array(z.any()).describe("Table data array"),

  zebra: withMetadata(
    z.boolean().default(false).describe("Alternate row colors"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  compact: z.boolean()
    .default(false)
    .describe("Use compact table layout"),

  hover: z.boolean()
    .default(false)
    .describe("Enable row hover effects"),

  pinRows: z.boolean()
    .default(false)
    .describe("Pin table rows"),

  pinCols: z.boolean()
    .default(false)
    .describe("Pin table columns"),

  emptyMessage: z.string()
    .default("No data available")
    .describe("Message to show when table is empty"),

  sortable: z.boolean()
    .default(false)
    .describe("Enable table sorting"),

  sortColumn: z.string()
    .optional()
    .describe("Currently sorted column"),

  sortDirection: z.enum(["asc", "desc"])
    .optional()
    .describe("Current sort direction"),

  loading: z.boolean()
    .default(false)
    .describe("Show loading state"),

  onSort: z.function()
    .args(z.string(), z.enum(["asc", "desc"]))
    .returns(z.void())
    .optional()
    .describe("Callback when column is sorted"),

  paginated: withMetadata(
    z.boolean().default(false).describe("Enable table pagination"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  currentPage: z.number()
    .positive()
    .optional()
    .describe("Current page number"),

  itemsPerPage: z.number()
    .positive()
    .default(10)
    .describe("Items per page"),

  totalItems: z.number()
    .nonnegative()
    .optional()
    .describe("Total number of items"),

  onPageChange: z.function()
    .args(z.number())
    .returns(z.void())
    .optional()
    .describe("Callback when page changes"),

  onItemsPerPageChange: z.function()
    .args(z.number())
    .returns(z.void())
    .optional()
    .describe("Callback when items per page changes"),

  showControls: z.boolean()
    .default(false)
    .describe("Show table controls"),

  allowItemsPerPageChange: z.boolean()
    .default(false)
    .describe("Allow changing items per page"),

  showStats: z.boolean()
    .default(false)
    .describe("Show table statistics"),
});

// Complete Table Props Schema
export const TablePropsSchema = BaseComponentPropsSchema
  .merge(TableSpecificPropsSchema)
  .describe("Data table component with sorting, pagination, and customizable columns");

// Export TableColumn schema for reuse
export { TableColumnSchema };

// Infer TypeScript types from schemas
export type TableColumn = z.infer<typeof TableColumnSchema>;
export type TableProps = z.infer<typeof TablePropsSchema>;

// Export validation functions
export const validateTableProps = (props: unknown): TableProps => {
  return TablePropsSchema.parse(props);
};

export const safeValidateTableProps = (props: unknown) => {
  return TablePropsSchema.safeParse(props);
};

export const validateTableColumn = (column: unknown): TableColumn => {
  return TableColumnSchema.parse(column);
};

export const safeValidateTableColumn = (column: unknown) => {
  return TableColumnSchema.safeParse(column);
};
