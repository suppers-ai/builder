import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Table } from "./Table.tsx";

const tableExamples: ComponentExample[] = [
  {
    title: "Basic Table",
    description: "Simple data table with columns and rows",
    code: `<Table
  columns={[
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    { key: "role", title: "Role" }
  ]}
  data={[
    { name: "John Doe", email: "john@example.com", role: "Admin" },
    { name: "Jane Smith", email: "jane@example.com", role: "User" },
    { name: "Bob Johnson", email: "bob@example.com", role: "Editor" }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Zebra Striped Table",
    description: "Table with alternating row colors",
    code: `<Table
  columns={[
    { key: "id", title: "ID" },
    { key: "product", title: "Product" },
    { key: "price", title: "Price" },
    { key: "stock", title: "Stock" }
  ]}
  data={[
    { id: 1, product: "Laptop", price: "$999", stock: 15 },
    { id: 2, product: "Mouse", price: "$25", stock: 50 },
    { id: 3, product: "Keyboard", price: "$75", stock: 30 },
    { id: 4, product: "Monitor", price: "$299", stock: 8 }
  ]}
  zebra
/>`,
    showCode: true,
  },
  {
    title: "Compact Table",
    description: "Table with reduced padding for denser display",
    code: `<Table
  columns={[
    { key: "code", title: "Code" },
    { key: "status", title: "Status" },
    { key: "date", title: "Date" }
  ]}
  data={[
    { code: "ORD-001", status: "Completed", date: "2024-01-15" },
    { code: "ORD-002", status: "Pending", date: "2024-01-16" },
    { code: "ORD-003", status: "Shipped", date: "2024-01-17" }
  ]}
  compact
  zebra
/>`,
    showCode: true,
  },
  {
    title: "Table with Actions",
    description: "Table with custom action buttons in cells",
    code: `<Table
  columns={[
    { key: "name", title: "User" },
    { key: "status", title: "Status" },
    { 
      key: "actions", 
      title: "Actions",
      render: (_, row) => (
        <div class="flex gap-2">
          <button class="btn btn-xs btn-primary">Edit</button>
          <button class="btn btn-xs btn-error">Delete</button>
        </div>
      )
    }
  ]}
  data={[
    { name: "Alice Cooper", status: "Active" },
    { name: "Bob Wilson", status: "Inactive" }
  ]}
  hover
/>`,
    showCode: true,
  },
  {
    title: "Responsive Table",
    description: "Table that adapts to smaller screens",
    code: `<Table
  columns={[
    { key: "name", title: "Name" },
    { key: "department", title: "Department" },
    { key: "salary", title: "Salary", align: "right" },
    { key: "hired", title: "Hire Date" }
  ]}
  data={[
    { name: "Sarah Johnson", department: "Engineering", salary: "$95,000", hired: "2023-03-15" },
    { name: "Mike Davis", department: "Marketing", salary: "$70,000", hired: "2023-06-01" },
    { name: "Lisa Wong", department: "Design", salary: "$85,000", hired: "2023-04-20" }
  ]}
  zebra
  hover
  class="w-full"
/>`,
    showCode: true,
  },
  {
    title: "Sortable Table",
    description: "Table with sortable columns",
    code: `<Table
  columns={[
    { key: "rank", title: "Rank", sortable: true },
    { key: "team", title: "Team", sortable: true },
    { key: "points", title: "Points", sortable: true, align: "center" },
    { key: "wins", title: "Wins", sortable: true, align: "center" }
  ]}
  data={[
    { rank: 1, team: "Team Alpha", points: 95, wins: 18 },
    { rank: 2, team: "Team Beta", points: 89, wins: 16 },
    { rank: 3, team: "Team Gamma", points: 82, wins: 14 }
  ]}
  sortable
  hover
/>`,
    showCode: true,
  },
];

export const tableMetadata: ComponentMetadata = {
  name: "Table",
  description: "Data table display",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/table",
  tags: ["table", "data", "grid", "rows", "columns", "tabular"],
  examples: tableExamples,
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
