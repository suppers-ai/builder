import { Table } from "@suppers/ui-lib";

export default function TablePage() {
  const basicColumns = [
    { key: "id", title: "ID", sortable: true, width: "80px" },
    { key: "name", title: "Name", sortable: true },
    { key: "email", title: "Email", sortable: true },
    { key: "role", title: "Role", sortable: true },
    { key: "status", title: "Status", sortable: false, align: "center" as const },
  ];

  const basicData = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Moderator", status: "Inactive" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", role: "User", status: "Active" },
    {
      id: 5,
      name: "Charlie Wilson",
      email: "charlie@example.com",
      role: "Admin",
      status: "Pending",
    },
  ];

  const productColumns = [
    {
      key: "image",
      title: "Product",
      width: "100px",
      render: (value: string, row: any) => (
        <div class="avatar">
          <div class="mask mask-squircle w-12 h-12">
            <img src={value} alt={row.name} />
          </div>
        </div>
      ),
    },
    { key: "name", title: "Name", sortable: true },
    { key: "category", title: "Category", sortable: true },
    {
      key: "price",
      title: "Price",
      sortable: true,
      align: "right" as const,
      render: (value: number) => <span class="font-bold">${value.toFixed(2)}</span>,
    },
    {
      key: "stock",
      title: "Stock",
      sortable: true,
      align: "center" as const,
      render: (value: number) => (
        <span
          class={`badge ${
            value > 10 ? "badge-success" : value > 0 ? "badge-warning" : "badge-error"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: "120px",
      render: () => (
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-xs">Edit</button>
          <button class="btn btn-ghost btn-xs text-error">Delete</button>
        </div>
      ),
    },
  ];

  const productData = [
    {
      id: 1,
      image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
      name: "Wireless Headphones",
      category: "Electronics",
      price: 99.99,
      stock: 15,
    },
    {
      id: 2,
      image: "https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp",
      name: "Coffee Mug",
      category: "Home",
      price: 12.50,
      stock: 5,
    },
    {
      id: 3,
      image: "https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp",
      name: "Laptop Stand",
      category: "Office",
      price: 45.00,
      stock: 0,
    },
    {
      id: 4,
      image: "https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp",
      name: "Desk Lamp",
      category: "Office",
      price: 28.99,
      stock: 23,
    },
  ];

  const orderColumns = [
    { key: "orderNumber", title: "Order #", sortable: true, width: "120px" },
    {
      key: "customer",
      title: "Customer",
      sortable: true,
      render: (value: any) => (
        <div class="flex items-center gap-3">
          <div class="avatar">
            <div class="mask mask-squircle w-12 h-12">
              <img src={value.avatar} alt={value.name} />
            </div>
          </div>
          <div>
            <div class="font-bold">{value.name}</div>
            <div class="text-sm opacity-50">{value.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "total",
      title: "Total",
      sortable: true,
      align: "right" as const,
      render: (value: number) => <span class="font-bold text-lg">${value.toFixed(2)}</span>,
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      align: "center" as const,
      render: (value: string) => {
        const statusColors = {
          "Pending": "badge-warning",
          "Processing": "badge-info",
          "Shipped": "badge-primary",
          "Delivered": "badge-success",
          "Cancelled": "badge-error",
        };
        return (
          <span class={`badge ${statusColors[value as keyof typeof statusColors]}`}>{value}</span>
        );
      },
    },
    {
      key: "date",
      title: "Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const orderData = [
    {
      orderNumber: "ORD-001",
      customer: {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
      },
      total: 156.99,
      status: "Delivered",
      date: "2024-01-15",
    },
    {
      orderNumber: "ORD-002",
      customer: {
        name: "Mike Chen",
        email: "mike@example.com",
        avatar: "https://img.daisyui.com/images/stock/photo-1507003211169-0a1dd7228f2d.webp",
      },
      total: 89.50,
      status: "Shipped",
      date: "2024-01-16",
    },
    {
      orderNumber: "ORD-003",
      customer: {
        name: "Emma Davis",
        email: "emma@example.com",
        avatar: "https://img.daisyui.com/images/stock/photo-1517841905240-472988babdf9.webp",
      },
      total: 234.75,
      status: "Processing",
      date: "2024-01-17",
    },
  ];

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Table Component</h1>
        <p>Data table with sorting, custom rendering, and various styling options</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Table</h2>
          <Table columns={basicColumns} data={basicData} />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Table with Zebra Stripes</h2>
          <Table columns={basicColumns} data={basicData} zebra />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Compact Table with Hover</h2>
          <Table columns={basicColumns} data={basicData} compact hover />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Product Table with Custom Rendering</h2>
          <Table
            columns={productColumns}
            data={productData}
            zebra
            hover
            onSort={(column, direction) => console.log(`Sorting by ${column} ${direction}`)}
          />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Order Management Table</h2>
          <Table
            columns={orderColumns}
            data={orderData}
            hover
            pinRows
          />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Empty Table</h2>
          <Table
            columns={basicColumns}
            data={[]}
            emptyMessage="No users found. Add some users to get started."
          />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Loading State</h2>
          <Table
            columns={basicColumns}
            data={[]}
            loading={true}
          />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Analytics Dashboard Table</h2>
          <AnalyticsTableDemo />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Table Display</code></pre>
                <pre data-prefix=">"><code>{'<Table columns={columns} data={data} />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Interactive Sortable Table</code></pre>
                <pre data-prefix=">"><code>{'<Table columns={columns} data={data} onSort={handleSort} zebra hover />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Custom Column Rendering</code></pre>
                <pre data-prefix=">"><code>{'{ key: "status", title: "Status", render: (value) => <Badge>{value}</Badge> }'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AnalyticsTableDemo() {
  const analyticsColumns = [
    { key: "metric", title: "Metric", sortable: true },
    {
      key: "value",
      title: "Value",
      sortable: true,
      align: "right" as const,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "change",
      title: "Change",
      sortable: true,
      align: "right" as const,
      render: (value: number) => (
        <span class={`flex items-center gap-1 ${value >= 0 ? "text-success" : "text-error"}`}>
          {value >= 0 ? "↗" : "↘"} {Math.abs(value)}%
        </span>
      ),
    },
    {
      key: "trend",
      title: "Trend",
      align: "center" as const,
      render: (value: number[]) => (
        <div class="flex gap-1">
          {value.map((v, i) => (
            <div
              key={i}
              class={`w-2 bg-primary opacity-${Math.min(100, Math.max(20, v * 10))}`}
              style={`height: ${Math.max(4, v * 2)}px`}
            >
            </div>
          ))}
        </div>
      ),
    },
  ];

  const analyticsData = [
    { metric: "Page Views", value: 125430, change: 12.5, trend: [3, 5, 2, 8, 4, 9, 6, 7] },
    { metric: "Unique Visitors", value: 45230, change: -2.3, trend: [4, 6, 3, 7, 5, 8, 4, 6] },
    { metric: "Bounce Rate", value: 34, change: -5.7, trend: [6, 4, 7, 3, 8, 2, 5, 4] },
    { metric: "Conversion Rate", value: 4.2, change: 8.9, trend: [2, 3, 5, 6, 4, 7, 8, 9] },
  ];

  return (
    <Table
      columns={analyticsColumns}
      data={analyticsData}
      hover
      zebra
    />
  );
}
