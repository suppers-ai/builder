import { useEffect, useState } from "preact/hooks";
import { Badge, Button, Input, Select } from "@suppers/ui-lib";
import { Search, Filter, Download, Eye, CheckCircle, Clock, XCircle } from "lucide-preact";
import { getAuthClient } from "../../lib/auth.ts";
import toast from "../../lib/toast-manager.ts";

interface Order {
  id: string;
  orderNumber: string;
  buyerEmail: string;
  productName: string;
  amount: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
}

interface SalesOrdersTabProps {
  user: any;
}

export default function SalesOrdersTab({ user }: SalesOrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, sortBy]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const authClient = getAuthClient();
      const accessToken = await authClient.getAccessToken();

      // TODO: Replace with actual API call
      // const response = await fetch("/api/orders", {
      //   headers: {
      //     "Authorization": `Bearer ${accessToken}`,
      //   },
      // });

      // Simulated data for now
      setOrders([
        {
          id: "1",
          orderNumber: "ORD-2024-001",
          buyerEmail: "john@example.com",
          productName: "Premium Service",
          amount: 99.99,
          status: "completed",
          paymentMethod: "Credit Card",
          createdAt: "2024-01-15T10:30:00Z",
          completedAt: "2024-01-15T10:31:00Z"
        },
        {
          id: "2",
          orderNumber: "ORD-2024-002",
          buyerEmail: "jane@example.com",
          productName: "Basic Package",
          amount: 29.99,
          status: "pending",
          paymentMethod: "PayPal",
          createdAt: "2024-01-14T14:20:00Z"
        },
        {
          id: "3",
          orderNumber: "ORD-2024-003",
          buyerEmail: "bob@example.com",
          productName: "Advanced Plan",
          amount: 199.99,
          status: "completed",
          paymentMethod: "Credit Card",
          createdAt: "2024-01-13T09:15:00Z",
          completedAt: "2024-01-13T09:16:00Z"
        },
        {
          id: "4",
          orderNumber: "ORD-2024-004",
          buyerEmail: "alice@example.com",
          productName: "Starter Kit",
          amount: 19.99,
          status: "cancelled",
          paymentMethod: "Credit Card",
          createdAt: "2024-01-12T16:45:00Z"
        },
        {
          id: "5",
          orderNumber: "ORD-2024-005",
          buyerEmail: "charlie@example.com",
          productName: "Pro Bundle",
          amount: 149.99,
          status: "refunded",
          paymentMethod: "PayPal",
          createdAt: "2024-01-11T11:00:00Z"
        }
      ]);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case "date-desc":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "date-asc":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "amount-desc":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-asc":
        filtered.sort((a, b) => a.amount - b.amount);
        break;
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return <Badge color="success" variant="soft">Completed</Badge>;
      case "pending":
        return <Badge color="warning" variant="soft">Pending</Badge>;
      case "cancelled":
        return <Badge color="error" variant="soft">Cancelled</Badge>;
      case "refunded":
        return <Badge color="info" variant="soft">Refunded</Badge>;
      default:
        return <Badge variant="soft">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle class="w-4 h-4 text-success" />;
      case "pending":
        return <Clock class="w-4 h-4 text-warning" />;
      case "cancelled":
      case "refunded":
        return <XCircle class="w-4 h-4 text-error" />;
      default:
        return null;
    }
  };

  const handleExport = () => {
    toast.success("Export feature coming soon!");
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center h-64">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Filters and Search */}
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/60" />
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
              class="pl-10 w-full"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value)}
            class="w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </Select>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy((e.target as HTMLSelectElement).value)}
            class="w-40"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </Select>
          <Button
            variant="outline"
            onClick={handleExport}
            class="flex items-center gap-2"
          >
            <Download class="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} class="hover">
                <td class="font-medium">{order.orderNumber}</td>
                <td>
                  <div>
                    <p class="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p class="text-xs text-base-content/60">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </td>
                <td>{order.buyerEmail}</td>
                <td>{order.productName}</td>
                <td class="font-semibold">${order.amount.toFixed(2)}</td>
                <td>{order.paymentMethod}</td>
                <td>
                  <div class="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    {getStatusBadge(order.status)}
                  </div>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.info(`View order ${order.orderNumber}`)}
                  >
                    <Eye class="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div class="text-center py-8">
            <p class="text-base-content/60">No orders found</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div class="bg-base-200/50 rounded-lg p-4">
          <p class="text-sm text-base-content/60">Total Orders</p>
          <p class="text-2xl font-bold">{filteredOrders.length}</p>
        </div>
        <div class="bg-success/10 rounded-lg p-4">
          <p class="text-sm text-success">Completed</p>
          <p class="text-2xl font-bold text-success">
            {filteredOrders.filter(o => o.status === "completed").length}
          </p>
        </div>
        <div class="bg-warning/10 rounded-lg p-4">
          <p class="text-sm text-warning">Pending</p>
          <p class="text-2xl font-bold text-warning">
            {filteredOrders.filter(o => o.status === "pending").length}
          </p>
        </div>
        <div class="bg-primary/10 rounded-lg p-4">
          <p class="text-sm text-primary">Total Revenue</p>
          <p class="text-2xl font-bold text-primary">
            ${filteredOrders
              .filter(o => o.status === "completed")
              .reduce((sum, o) => sum + o.amount, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}