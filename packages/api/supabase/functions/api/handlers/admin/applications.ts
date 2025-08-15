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
    const [action, id, ...rest] = pathSegments;

    switch (method) {
      case "GET":
        if (!action || action === "list") {
          return await getApplicationsList(supabase, url);
        } else if (id) {
          return await getApplicationById(supabase, id);
        }
        break;

      case "POST":
        if (!action || action === "create") {
          return await createApplication(supabase, req);
        }
        break;

      case "PUT":
        if (id) {
          return await updateApplication(supabase, id, req);
        }
        break;

      case "DELETE":
        if (id) {
          return await deleteApplication(supabase, id);
        }
        break;

      case "PATCH":
        if (id && action === "status") {
          return await updateApplicationStatus(supabase, id, req);
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
      .select(`
        *,
        owner:users!applications_owner_id_fkey(
          id,
          email,
          display_name,
          first_name,
          last_name
        )
      `);

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
      .select(`
        *,
        owner:users!applications_owner_id_fkey(
          id,
          email,
          display_name,
          first_name,
          last_name
        )
      `)
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
    const { name, slug, description, owner_id, template_id, status = "draft", configuration = {} } = body;

    console.log("📝 Creating application:", { name, slug, owner_id });

    // Validate required fields
    if (!name || !slug || !owner_id) {
      return new Response(JSON.stringify({ error: "Name, slug, and owner_id are required" }), {
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
        owner_id,
        template_id,
        status,
        configuration,
      })
      .select(`
        *,
        owner:users!applications_owner_id_fkey(
          id,
          email,
          display_name,
          first_name,
          last_name
        )
      `)
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
    const { name, slug, description, template_id, status, configuration } = body;

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
    if (template_id !== undefined) updateData.template_id = template_id;
    if (status !== undefined) updateData.status = status;
    if (configuration !== undefined) updateData.configuration = configuration;
    updateData.updated_at = new Date().toISOString();

    const { data: application, error } = await supabaseAdmin
      .from("applications")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        owner:users!applications_owner_id_fkey(
          id,
          email,
          display_name,
          first_name,
          last_name
        )
      `)
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
      .select(`
        *,
        owner:users!applications_owner_id_fkey(
          id,
          email,
          display_name,
          first_name,
          last_name
        )
      `)
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