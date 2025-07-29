import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Table } from "./Table.tsx";

const tableExamples: ComponentExample[] = [
  {
    title: "Basic Table",
    description: "Simple data table with columns and rows",
    props: {
      columns: [
        {
          key: "name",
      title: "Name"
        },
        {
          key: "role",
      title: "Role"
        },
        {
          key: "status",
      title: "Status"
        }
      ],
      data: [
        {
          name: "John Doe",
      role: "Admin",
      status: "Active"
        },
        {
          name: "Jane Smith",
      role: "User",
      status: "Active"
        },
        {
          name: "Bob Johnson",
      role: "Editor",
      status: "Inactive"
        }
      ]
    }
  },  {
    title: "Zebra Striped Table",
    description: "Table with alternating row colors",
    props: {
      columns: [
        {
          key: "name",
      title: "Name"
        },
        {
          key: "role",
      title: "Role"
        },
        {
          key: "status",
      title: "Status"
        }
      ],
      data: [
        {
          name: "John Doe",
      role: "Admin",
      status: "Active"
        },
        {
          name: "Jane Smith",
      role: "User",
      status: "Active"
        },
        {
          name: "Bob Johnson",
      role: "Editor",
      status: "Inactive"
        }
      ]
    }
  },  {
    title: "Compact Table",
    description: "Table with reduced padding for denser display",
    props: {
      columns: [
        {
          key: "name",
      title: "Name"
        },
        {
          key: "role",
      title: "Role"
        },
        {
          key: "status",
      title: "Status"
        }
      ],
      data: [
        {
          name: "John Doe",
      role: "Admin",
      status: "Active"
        },
        {
          name: "Jane Smith",
      role: "User",
      status: "Active"
        },
        {
          name: "Bob Johnson",
      role: "Editor",
      status: "Inactive"
        }
      ]
    }
  },  {
    title: "Table with Actions",
    description: "Table with custom action buttons in cells",
    props: {
      columns: [
        {
          key: "name",
      title: "Name"
        },
        {
          key: "role",
      title: "Role"
        },
        {
          key: "status",
      title: "Status"
        }
      ],
      data: [
        {
          name: "John Doe",
      role: "Admin",
      status: "Active"
        },
        {
          name: "Jane Smith",
      role: "User",
      status: "Active"
        },
        {
          name: "Bob Johnson",
      role: "Editor",
      status: "Inactive"
        }
      ]
    }
  },  {
    title: "Responsive Table",
    description: "Table that adapts to smaller screens",
    props: {
      columns: [
        {
          key: "name",
      title: "Name"
        },
        {
          key: "role",
      title: "Role"
        },
        {
          key: "status",
      title: "Status"
        }
      ],
      data: [
        {
          name: "John Doe",
      role: "Admin",
      status: "Active"
        },
        {
          name: "Jane Smith",
      role: "User",
      status: "Active"
        },
        {
          name: "Bob Johnson",
      role: "Editor",
      status: "Inactive"
        }
      ]
    }
  },  {
    title: "Sortable Table",
    description: "Table with sortable columns",
    props: {
      columns: [
        {
          key: "name",
      title: "Name"
        },
        {
          key: "role",
      title: "Role"
        },
        {
          key: "status",
      title: "Status"
        }
      ],
      data: [
        {
          name: "John Doe",
      role: "Admin",
      status: "Active"
        },
        {
          name: "Jane Smith",
      role: "User",
      status: "Active"
        },
        {
          name: "Bob Johnson",
      role: "Editor",
      status: "Inactive"
        }
      ]
    }
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
  )};
