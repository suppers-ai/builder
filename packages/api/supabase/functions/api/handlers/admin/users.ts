import type { SupabaseClient } from "@supabase/supabase-js";
import { corsHeaders } from "../../lib/cors.ts";

/**
 * Handle admin user management requests
 */
export async function handleAdminUsers(
  req: Request,
  supabase: SupabaseClient,
  pathSegments: string[]
): Promise<Response> {
  const method = req.method;
  const url = new URL(req.url);

  console.log("👥 Admin users handler - method:", method, "pathSegments:", pathSegments);

  try {
    switch (method) {
      case "GET":
        return await getUsersList(supabase, url);
      
      case "PUT":
        if (pathSegments.length > 0) {
          const userId = pathSegments[0];
          return await updateUser(req, supabase, userId);
        }
        break;
      
      case "PATCH":
        if (pathSegments.length >= 1) {
          const firstSegment = pathSegments[0];
          
          // Handle bulk operations
          if (firstSegment === "bulk-status") {
            return await bulkUpdateUserStatus(req, supabase);
          }
          
          // Handle individual user updates
          if (pathSegments.length >= 2) {
            const userId = pathSegments[0];
            const action = pathSegments[1];
            
            switch (action) {
              case "status":
                return await updateUserStatus(req, supabase, userId);
              case "role":
                return await updateUserRole(req, supabase, userId);
              case "limits":
                return await updateUserLimits(req, supabase, userId);
              default:
                return new Response(
                  JSON.stringify({ error: `Unknown PATCH action: ${action}. Available actions: status, role, limits, bulk-status` }),
                  {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                  }
                );
            }
          }
        }
        break;
      
      case "DELETE":
        if (pathSegments.length > 0) {
          const userId = pathSegments[0];
          return await deleteUser(supabase, userId);
        }
        break;
    }

    return new Response(
      JSON.stringify({ error: `Method ${method} not allowed or invalid path` }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Admin users handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Get paginated list of users
 */
async function getUsersList(supabase: SupabaseClient, url: URL): Promise<Response> {
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const sortBy = url.searchParams.get("sort_by") || "created_at";
  const sortOrder = url.searchParams.get("sort_order") || "desc";
  const search = url.searchParams.get("search") || "";

  console.log("📋 Getting users list with params:", { limit, offset, sortBy, sortOrder, search });

  let query = supabase
    .from("users")
    .select("id, email, first_name, last_name, display_name, role, status, storage_used, storage_limit, bandwidth_used, bandwidth_limit, created_at, updated_at")
    .range(offset, offset + limit - 1)
    .order(sortBy, { ascending: sortOrder === "asc" });

  // Add search filter if provided
  if (search) {
    query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,display_name.ilike.%${search}%`);
  }

  const { data: users, error: usersError } = await query;

  if (usersError) {
    console.error("Error fetching users:", usersError);
    return new Response(
      JSON.stringify({ error: "Failed to fetch users", details: usersError.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Get total count for pagination
  let countQuery = supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  if (search) {
    countQuery = countQuery.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,display_name.ilike.%${search}%`);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error("Error getting users count:", countError);
    return new Response(
      JSON.stringify({ error: "Failed to get users count", details: countError.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  console.log(`✅ Retrieved ${users?.length || 0} users out of ${count || 0} total`);

  return new Response(
    JSON.stringify({
      users: users || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Update user information
 */
async function updateUser(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  const updates = await req.json();
  
  console.log("✏️ Updating user:", userId, "with updates:", updates);

  // Validate allowed fields
  const allowedFields = ["first_name", "last_name", "display_name", "role", "status", "storage_limit", "bandwidth_limit"];
  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {} as Record<string, any>);

  if (Object.keys(filteredUpdates).length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid fields to update. Allowed fields: " + allowedFields.join(", ") }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      ...filteredUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, email, first_name, last_name, display_name, role, status, storage_used, storage_limit, bandwidth_used, bandwidth_limit, created_at, updated_at")
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update user", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  console.log("✅ User updated successfully:", data?.id);

  return new Response(
    JSON.stringify({ user: data }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Delete user (soft delete by setting status to 'deleted')
 */
async function deleteUser(supabase: SupabaseClient, userId: string): Promise<Response> {
  console.log("🗑️ Soft deleting user:", userId);

  const { data, error } = await supabase
    .from("users")
    .update({
      status: "deleted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, email, first_name, last_name, display_name, role, status, storage_used, storage_limit, bandwidth_used, bandwidth_limit, created_at, updated_at")
    .single();

  if (error) {
    console.error("Error deleting user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete user", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  console.log("✅ User soft deleted successfully:", data?.id);

  return new Response(
    JSON.stringify({ user: data }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Update user status only
 */
async function updateUserStatus(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  const { status } = await req.json();
  
  console.log("🔄 Updating user status:", userId, "to:", status);

  if (!status || !['active', 'suspended', 'deleted'].includes(status)) {
    return new Response(
      JSON.stringify({ error: "Invalid status. Must be one of: active, suspended, deleted" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, email, first_name, last_name, display_name, role, status, storage_used, storage_limit, bandwidth_used, bandwidth_limit, created_at, updated_at")
    .single();

  if (error) {
    console.error("Error updating user status:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update user status", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  console.log("✅ User status updated successfully:", data?.id);

  return new Response(
    JSON.stringify({ user: data }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Update user role only
 */
async function updateUserRole(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  const { role } = await req.json();
  
  console.log("🔑 Updating user role:", userId, "to:", role);

  if (!role || !['user', 'admin'].includes(role)) {
    return new Response(
      JSON.stringify({ error: "Invalid role. Must be one of: user, admin" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, email, first_name, last_name, display_name, role, status, storage_used, storage_limit, bandwidth_used, bandwidth_limit, created_at, updated_at")
    .single();

  if (error) {
    console.error("Error updating user role:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update user role", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  console.log("✅ User role updated successfully:", data?.id);

  return new Response(
    JSON.stringify({ user: data }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Update user storage/bandwidth limits
 */
async function updateUserLimits(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  const limits = await req.json();
  
  console.log("💾 Updating user limits:", userId, "with:", limits);

  // Validate allowed limit fields
  const allowedFields = ["storage_limit", "bandwidth_limit"];
  const filteredLimits = Object.keys(limits)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      // Ensure values are positive numbers
      const value = parseInt(limits[key]);
      if (isNaN(value) || value < 0) {
        return obj; // Skip invalid values
      }
      obj[key] = value;
      return obj;
    }, {} as Record<string, any>);

  if (Object.keys(filteredLimits).length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid limit fields provided. Allowed fields: " + allowedFields.join(", ") }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      ...filteredLimits,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, email, first_name, last_name, display_name, role, status, storage_used, storage_limit, bandwidth_used, bandwidth_limit, created_at, updated_at")
    .single();

  if (error) {
    console.error("Error updating user limits:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update user limits", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  console.log("✅ User limits updated successfully:", data?.id);

  return new Response(
    JSON.stringify({ user: data }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Bulk update user status
 */
async function bulkUpdateUserStatus(req: Request, supabase: SupabaseClient): Promise<Response> {
  const { user_ids, status } = await req.json();
  
  console.log("🔄 Bulk updating user status:", { user_ids, status });

  // Validate inputs
  if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
    return new Response(
      JSON.stringify({ error: "user_ids must be a non-empty array" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  if (!status || !['active', 'suspended', 'deleted'].includes(status)) {
    return new Response(
      JSON.stringify({ error: "Invalid status. Must be one of: active, suspended, deleted" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Limit bulk operations to prevent abuse
  if (user_ids.length > 100) {
    return new Response(
      JSON.stringify({ error: "Cannot update more than 100 users at once" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Update users in batch
    const { data, error } = await supabase
      .from("users")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in("id", user_ids)
      .select("id");

    if (error) {
      console.error("Error bulk updating user status:", error);
      return new Response(
        JSON.stringify({ error: "Failed to bulk update user status", details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const updatedCount = data?.length || 0;
    console.log(`✅ Bulk updated ${updatedCount} users to status: ${status}`);

    return new Response(
      JSON.stringify({
        success: true,
        updated_count: updatedCount,
        requested_count: user_ids.length,
        status: status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error during bulk update:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error during bulk update" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}