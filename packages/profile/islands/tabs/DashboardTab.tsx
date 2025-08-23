import { useEffect, useState } from "preact/hooks";
import { Card, Badge } from "@suppers/ui-lib";
import { Package, ShoppingCart, Users, Eye, Heart, TrendingUp, DollarSign, BarChart } from "lucide-preact";
import { getAuthClient } from "../../lib/auth.ts";
import toast from "../../lib/toast-manager.ts";

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalEntities: number;
  totalViews: number;
  totalProductLikes: number;
  totalEntityLikes: number;
  recentSales: Array<{
    id: string;
    productName: string;
    amount: number;
    date: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    views: number;
    likes: number;
    sales: number;
  }>;
}

interface DashboardTabProps {
  user: any;
}

export default function DashboardTab({ user }: DashboardTabProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    totalEntities: 0,
    totalViews: 0,
    totalProductLikes: 0,
    totalEntityLikes: 0,
    recentSales: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const authClient = getAuthClient();
      const accessToken = await authClient.getAccessToken();

      // TODO: Replace with actual API call
      // const response = await fetch("/api/dashboard/stats", {
      //   headers: {
      //     "Authorization": `Bearer ${accessToken}`,
      //   },
      // });

      // Simulated data for now
      setStats({
        totalProducts: 12,
        totalSales: 47,
        totalEntities: 5,
        totalViews: 1234,
        totalProductLikes: 89,
        totalEntityLikes: 23,
        recentSales: [
          { id: "1", productName: "Premium Service", amount: 99.99, date: "2024-01-15" },
          { id: "2", productName: "Basic Package", amount: 29.99, date: "2024-01-14" },
          { id: "3", productName: "Advanced Plan", amount: 199.99, date: "2024-01-13" },
        ],
        topProducts: [
          { id: "1", name: "Premium Service", views: 342, likes: 45, sales: 12 },
          { id: "2", name: "Basic Package", views: 287, likes: 32, sales: 23 },
          { id: "3", name: "Advanced Plan", views: 198, likes: 12, sales: 8 },
        ]
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
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
      {/* Stats Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Products Card */}
        <div class="bg-base-100 rounded-lg p-6 border border-base-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-base-content/60 text-sm">Total Products</p>
              <p class="text-3xl font-bold text-base-content mt-1">{stats.totalProducts}</p>
            </div>
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Package class="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Sales Card */}
        <div class="bg-base-100 rounded-lg p-6 border border-base-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-base-content/60 text-sm">Total Sales</p>
              <p class="text-3xl font-bold text-base-content mt-1">{stats.totalSales}</p>
            </div>
            <div class="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <ShoppingCart class="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        {/* Entities Card */}
        <div class="bg-base-100 rounded-lg p-6 border border-base-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-base-content/60 text-sm">Total Entities</p>
              <p class="text-3xl font-bold text-base-content mt-1">{stats.totalEntities}</p>
            </div>
            <div class="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center">
              <Users class="w-6 h-6 text-info" />
            </div>
          </div>
        </div>

        {/* Views Card */}
        <div class="bg-base-100 rounded-lg p-6 border border-base-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-base-content/60 text-sm">Total Views</p>
              <p class="text-3xl font-bold text-base-content mt-1">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div class="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Eye class="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>

        {/* Product Likes Card */}
        <div class="bg-base-100 rounded-lg p-6 border border-base-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-base-content/60 text-sm">Product Likes</p>
              <p class="text-3xl font-bold text-base-content mt-1">{stats.totalProductLikes}</p>
            </div>
            <div class="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
              <Heart class="w-6 h-6 text-error" />
            </div>
          </div>
        </div>

        {/* Entity Likes Card */}
        <div class="bg-base-100 rounded-lg p-6 border border-base-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-base-content/60 text-sm">Entity Likes</p>
              <p class="text-3xl font-bold text-base-content mt-1">{stats.totalEntityLikes}</p>
            </div>
            <div class="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
              <Heart class="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales and Top Products */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div class="bg-base-100 rounded-lg p-6 border border-base-300">
          <h3 class="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <DollarSign class="w-5 h-5" />
            Recent Sales
          </h3>
          <div class="space-y-3">
            {stats.recentSales.map((sale) => (
              <div key={sale.id} class="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
                <div>
                  <p class="font-medium text-base-content">{sale.productName}</p>
                  <p class="text-sm text-base-content/60">{new Date(sale.date).toLocaleDateString()}</p>
                </div>
                <Badge color="success" variant="outline">
                  ${sale.amount.toFixed(2)}
                </Badge>
              </div>
            ))}
            {stats.recentSales.length === 0 && (
              <p class="text-base-content/60 text-center py-4">No recent sales</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div class="bg-base-100 rounded-lg p-6 border border-base-300">
          <h3 class="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <BarChart class="w-5 h-5" />
            Top Products
          </h3>
          <div class="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div key={product.id} class="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p class="font-medium text-base-content">{product.name}</p>
                    <div class="flex items-center gap-4 text-xs text-base-content/60 mt-1">
                      <span class="flex items-center gap-1">
                        <Eye class="w-3 h-3" /> {product.views}
                      </span>
                      <span class="flex items-center gap-1">
                        <Heart class="w-3 h-3" /> {product.likes}
                      </span>
                      <span class="flex items-center gap-1">
                        <ShoppingCart class="w-3 h-3" /> {product.sales}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {stats.topProducts.length === 0 && (
              <p class="text-base-content/60 text-center py-4">No products yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}