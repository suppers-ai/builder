/**
 * AdminDashboardIsland Component
 * Dashboard overview with metrics cards, loading states, and error handling
 */

import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { showError, showSuccess } from "../lib/toast-manager.ts";
import { Button, ErrorState, Loading, MetricCard } from "@suppers/ui-lib";
import {
  Activity,
  AlertCircle,
  BarChart3,
  DollarSign,
  Package,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-preact";
import { formatBytes } from "@suppers/admin";
import { DashboardApiClient } from "../lib/api-client/dashboard/dashboard-api.ts";
import { getAuthClient } from "../lib/auth.ts";

// Types
interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  subscribedUsers: number;
  storageUsed: number;
  bandwidthUsed: number;
  totalStorageAllocated: number;
  totalBandwidthAllocated: number;
}

// Global state for dashboard data
const dashboardData = signal<DashboardMetrics | null>(null);
const isLoading = signal<boolean>(true);
const error = signal<string | null>(null);

export default function AdminDashboardIsland() {
  const [refreshing, setRefreshing] = useState(false);

  // Initialize API client
  const apiClient = new DashboardApiClient(getAuthClient());

  // Load dashboard data
  const loadDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        isLoading.value = true;
      }

      error.value = null;

      const response = await apiClient.getDashboardMetrics();

      if (response.error) {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : response.error.message || 'Failed to load dashboard data';
        error.value = errorMessage;
        dashboardData.value = null;
        showError(errorMessage);
      } else {
        dashboardData.value = response.data || null;
        if (showRefreshing) {
          showSuccess("Dashboard data refreshed successfully");
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data";
      error.value = errorMessage;
      dashboardData.value = null;
      showError(errorMessage);
    } finally {
      isLoading.value = false;
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  // Error state
  if (error.value && !dashboardData.value) {
    return (
      <div class="container mx-auto px-4 py-8">
        <ErrorState
          title="Failed to load dashboard data"
          description={error.value}
          onRetry={handleRefresh}
          retryText="Retry"
          icon={<AlertCircle size={48} class="text-error opacity-60 mx-auto" />}
        />
      </div>
    );
  }

  const data = dashboardData.value;
  const loading = isLoading.value;

  return (
    <div class="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-base-content">Dashboard</h1>
          <p class="text-base-content/70 mt-1">Platform overview and key metrics</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          class="gap-2"
        >
          {refreshing
            ? (
              <>
                <Loading size="sm" />
                Refreshing...
              </>
            )
            : (
              <>
                <RefreshCw size={16} />
                Refresh
              </>
            )}
        </Button>
      </div>

      {/* Metrics Cards */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value={data?.totalUsers || 0}
          subtitle="Registered users"
          icon={<Users size={20} />}
          loading={loading}
          formatter="number"
          color="success"
        />

        <MetricCard
          title="New Users (30 days)"
          value={data?.activeUsers || 0}
          subtitle="New users in last 30 days"
          icon={<TrendingUp size={20} />}
          loading={loading}
          formatter="number"
          color="primary"
        />

        <MetricCard
          title="Users with Subscription"
          value={data?.subscribedUsers || 0}
          subtitle="Active subscriptions"
          icon={<DollarSign size={20} />}
          loading={loading}
          formatter="number"
          color="warning"
        />
      </div>

      {/* Allocation Metrics */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Total Storage Used"
          value={loading ? 0 : formatBytes(data?.storageUsed || 0)}
          subtitle="All users combined"
          icon={<Package size={20} />}
          loading={loading}
          color="info"
        />
        <MetricCard
          title="Total Storage Allocated"
          value={loading ? 0 : formatBytes(data?.totalStorageAllocated || 0)}
          subtitle="Total user storage limits"
          icon={<BarChart3 size={20} />}
          loading={loading}
          color="primary"
        />
      </div>

      {/* Secondary Metrics */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Total Bandwidth Used"
          value={loading ? 0 : formatBytes(data?.bandwidthUsed || 0)}
          subtitle="All users combined"
          icon={<Activity size={20} />}
          loading={loading}
          color="accent"
        />

        <MetricCard
          title="Total Bandwidth Allocated"
          value={loading ? 0 : formatBytes(data?.totalBandwidthAllocated || 0)}
          subtitle="Total user bandwidth limits"
          icon={<Activity size={20} />}
          loading={loading}
          color="secondary"
        />
      </div>
    </div>
  );
}

// Export utility functions
export { dashboardData, error, isLoading };
