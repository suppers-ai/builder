import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAdminDashboard(supabase: SupabaseClient, url: URL, userRole: string): Promise<Response> {
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

    // Get users with subscriptions
    const { count: subscribedUsersCount, error: subscribedError } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    if (subscribedError) {
      console.error("Error counting subscribed users:", subscribedError);
    }

    // Calculate total storage used by all users
    const { data: storageData, error: storageError } = await supabase
      .from("user_storage")
      .select("storage_used");

    if (storageError) {
      console.error("Error fetching storage data:", storageError);
    }

    const totalStorageUsed = (storageData || []).reduce((total, item) => {
      return total + (item.storage_used || 0);
    }, 0);

    // Calculate total bandwidth used by all users
    const { data: bandwidthData, error: bandwidthError } = await supabase
      .from("user_storage")
      .select("bandwidth_used");

    if (bandwidthError) {
      console.error("Error fetching bandwidth data:", bandwidthError);
    }

    const totalBandwidthUsed = (bandwidthData || []).reduce((total, item) => {
      return total + (item.bandwidth_used || 0);
    }, 0);

    // Calculate total storage allocation (sum of all user limits)
    const { data: allocationData, error: allocationError } = await supabase
      .from("user_storage")
      .select("storage_limit, bandwidth_limit");

    if (allocationError) {
      console.error("Error fetching allocation data:", allocationError);
    }

    const totalStorageAllocated = (allocationData || []).reduce((total, item) => {
      return total + (item.storage_limit || 0);
    }, 0);

    const totalBandwidthAllocated = (allocationData || []).reduce((total, item) => {
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