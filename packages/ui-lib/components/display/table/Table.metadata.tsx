import { ComponentMetadata } from "../../types.ts";
import { Table } from "./Table.tsx";

export const tableMetadata: ComponentMetadata = {
  name: "Table",
  description: "Data table display",
  category: "Data Display",
  path: "/components/display/table",
  tags: ["table", "data", "grid", "rows", "columns", "tabular"],
  examples: ["basic", "zebra", "compact", "with-actions", "responsive", "sortable"],
  relatedComponents: ["pagination", "checkbox", "badge"],
  preview: (
    <div class="w-full max-w-md">
      <Table
        columns={[
          { key: "name", title: "Name" },
          { key: "role", title: "Role" },
          { key: "status", title: "Status" },
        ]}
        data={[
          { name: "John Doe", role: "Admin", status: "Active" },
          { name: "Jane Smith", role: "User", status: "Active" },
        ]}
        zebra
        compact
      />
    </div>
  ),
};
