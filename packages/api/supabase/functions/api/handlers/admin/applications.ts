import type { SupabaseClient } from "@supabase/supabase-js";
import { corsHeaders } from "../../lib/cors.ts";

/**
 * Admin applications handler
 * Handles CRUD operations for applications in the admin panel
 */
export async function handleAdminApplications(
  req: Request,
  supabase: SupabaseClient,
  pathSegments: string[]
): Promise<Response> {
  const method = req.method;
  const url = new URL(req.url);

  console.log("🔧 Admin applications handler - method:", method, "pathSegments:", pathSegments);

  try {
    // Route based on path segments
    // pathSegments could be [] for list, ["id"] for CRUD, or ["action", "id"] for special actions
    const [firstSegment, secondSegment, ...rest] = pathSegments;

    switch (method) {
      case "OPTIONS":
        // Handle CORS preflight requests
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });

      case "GET":
        if (!firstSegment) {
          // GET /admin/applications - list all
          return await getApplicationsList(supabase, url);
        } else {
          // GET /admin/applications/{id} - get by ID
          return await getApplicationById(supabase, firstSegment);
        }
        break;

      case "POST":
        if (!firstSegment) {
          // POST /admin/applications - create new
          return await createApplication(supabase, req);
        }
        break;

      case "PUT":
        if (firstSegment) {
          // PUT /admin/applications/{id} - update application
          return await updateApplication(supabase, firstSegment, req);
        }
        break;

      case "DELETE":
        if (firstSegment) {
          // DELETE /admin/applications/{id} - delete application
          return await deleteApplication(supabase, firstSegment);
        }
        break;

      case "PATCH":
        console.log("🔧 PATCH request received:", { firstSegment, secondSegment, rest });
        if (firstSegment === "status" && secondSegment) {
          // PATCH /admin/applications/status/{id} - update status
          return await updateApplicationStatus(supabase, secondSegment, req);
        } else if (firstSegment === "bulk-status") {
          // PATCH /admin/applications/bulk-status - bulk update status
          return await bulkUpdateApplicationStatus(supabase, req);
        }
        break;
    }

    return new Response(JSON.stringify({ error: `Method ${method} not allowed for admin applications` }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin applications handler error:", error);
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
 * Get filtered list of applications for admin
 */
async function getApplicationsList(supabaseAdmin: SupabaseClient, url: URL): Promise<Response> {
  try {
    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sort_by") || "updated_at";
    const sortOrder = searchParams.get("sort_order") || "desc";

    console.log("📋 Getting applications list with filters:", { limit, offset, search, status, sortBy, sortOrder });

    // Build query
    let query = supabaseAdmin
      .from("applications")
      .select(`*`);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: applications, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching applications:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch applications" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`✅ Found ${applications?.length || 0} applications`);

    return new Response(
      JSON.stringify({
        data: applications || [],
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        limit,
        hasMore: (applications?.length || 0) === limit,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in getApplicationsList:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch applications" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

/**
 * Get application by ID with owner details
 */
async function getApplicationById(supabaseAdmin: SupabaseClient, id: string): Promise<Response> {
  try {
    console.log("📋 Getting application by ID:", id);

    const { data: application, error } = await supabaseAdmin
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ Error fetching application:", error);
      if (error.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Application not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to fetch application" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Application found:", application.id);

    return new Response(JSON.stringify({ data: application }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error in getApplicationById:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch application" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

/**
 * Create new application
 */
async function createApplication(supabaseAdmin: SupabaseClient, req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { name, slug, description, website_url, thumbnail_url, status = "draft" } = body;

    console.log("📝 Creating application:", { name, slug });

    // Validate required fields
    if (!name || !slug) {
      return new Response(JSON.stringify({ error: "Name and slug are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if slug is unique
    const { data: existingApp } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingApp) {
      return new Response(JSON.stringify({ error: "Application with this slug already exists" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create application
    const { data: application, error } = await supabaseAdmin
      .from("applications")
      .insert({
        name,
        slug,
        description,
        website_url,
        thumbnail_url,
        status,
      })
      .select("*")
      .single();

    if (error) {
      console.error("❌ Error creating application:", error);
      return new Response(JSON.stringify({ error: "Failed to create application" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Application created:", application.id);

    return new Response(JSON.stringify({ data: application }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error in createApplication:", error);
    return new Response(JSON.stringify({ error: "Failed to create application" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

/**
 * Update application
 */
async function updateApplication(supabaseAdmin: SupabaseClient, id: string, req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { name, slug, description, website_url, thumbnail_url, status } = body;

    console.log("📝 Updating application:", id, { name, slug, status });

    // Check if application exists
    const { data: existingApp } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingApp) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if slug is unique (if being updated)
    if (slug) {
      const { data: slugConflict } = await supabaseAdmin
        .from("applications")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single();

      if (slugConflict) {
        return new Response(JSON.stringify({ error: "Application with this slug already exists" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Update application
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (website_url !== undefined) updateData.website_url = website_url;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data: application, error } = await supabaseAdmin
      .from("applications")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("❌ Error updating application:", error);
      return new Response(JSON.stringify({ error: "Failed to update application" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Application updated:", application.id);

    return new Response(JSON.stringify({ data: application }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error in updateApplication:", error);
    return new Response(JSON.stringify({ error: "Failed to update application" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

/**
 * Update application status
 */
async function updateApplicationStatus(supabaseAdmin: SupabaseClient, id: string, req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { status } = body;

    console.log("📝 Updating application status:", id, status);

    if (!status) {
      return new Response(JSON.stringify({ error: "Status is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status
    const { data: application, error } = await supabaseAdmin
      .from("applications")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("❌ Error updating application status:", error);
      return new Response(JSON.stringify({ error: "Failed to update application status" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Application status updated:", application.id, status);

    return new Response(JSON.stringify({ data: application }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error in updateApplicationStatus:", error);
    return new Response(JSON.stringify({ error: "Failed to update application status" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

/**
 * Delete application
 */
async function deleteApplication(supabaseAdmin: SupabaseClient, id: string): Promise<Response> {
  try {
    console.log("🗑️ Deleting application:", id);

    // Check if application exists
    const { data: existingApp } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingApp) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete application
    const { error } = await supabaseAdmin
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Error deleting application:", error);
      return new Response(JSON.stringify({ error: "Failed to delete application" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Application deleted:", id);

    return new Response(JSON.stringify({ data: { id } }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error in deleteApplication:", error);
    return new Response(JSON.stringify({ error: "Failed to delete application" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

/**
 * Bulk update application status
 */
async function bulkUpdateApplicationStatus(supabaseAdmin: SupabaseClient, req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { ids, status } = body;

    console.log("📝 Bulk updating application status:", { ids, status });

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: "Application IDs are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!status) {
      return new Response(JSON.stringify({ error: "Status is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update all applications
    const { data: applications, error } = await supabaseAdmin
      .from("applications")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .in("id", ids)
      .select("*");

    if (error) {
      console.error("❌ Error bulk updating application status:", error);
      return new Response(JSON.stringify({ error: "Failed to update application status" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`✅ Bulk updated ${applications?.length || 0} applications to ${status}`);

    return new Response(JSON.stringify({ data: applications }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error in bulkUpdateApplicationStatus:", error);
    return new Response(JSON.stringify({ error: "Failed to bulk update application status" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}