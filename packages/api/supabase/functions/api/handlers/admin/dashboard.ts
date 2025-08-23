import { corsHeaders } from "../../_common/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAdminDashboard(
  supabase: SupabaseClient,
  url: URL,
  userRole: string,
): Promise<Response> {
  try {
    if (userRole !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get users count
    const { count: usersCount, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (usersError) {
      console.error("Error counting users:", usersError);
    }

    // Calculate monthly active users (users created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: monthlyActiveCount, error: monthlyError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (monthlyError) {
      console.error("Error counting monthly active users:", monthlyError);
    }

    // For now, set subscribed users to 0 since subscription tables aren't set up yet
    const subscribedUsersCount = 0;

    // Calculate total storage used by all users from the users table
    const { data: storageData, error: storageError } = await supabase
      .from("users")
      .select("storage_used, bandwidth_used, storage_limit, bandwidth_limit");

    if (storageError) {
      console.error("Error fetching storage data:", storageError);
    }

    const totalStorageUsed = (storageData || []).reduce((total, item) => {
      return total + (item.storage_used || 0);
    }, 0);

    const totalBandwidthUsed = (storageData || []).reduce((total, item) => {
      return total + (item.bandwidth_used || 0);
    }, 0);

    const totalStorageAllocated = (storageData || []).reduce((total, item) => {
      return total + (item.storage_limit || 0);
    }, 0);

    const totalBandwidthAllocated = (storageData || []).reduce((total, item) => {
      return total + (item.bandwidth_limit || 0);
    }, 0);

    const dashboardData = {
      totalUsers: usersCount || 0,
      activeUsers: monthlyActiveCount || 0,
      subscribedUsers: subscribedUsersCount || 0,
      storageUsed: totalStorageUsed,
      bandwidthUsed: totalBandwidthUsed,
      totalStorageAllocated: totalStorageAllocated,
      totalBandwidthAllocated: totalBandwidthAllocated,
    };

    return new Response(JSON.stringify(dashboardData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
