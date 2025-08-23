import { corsHeaders } from "../../_common/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function handleAdminEntities(
  request: Request,
  context: {
    supabase: SupabaseClient;
    userId?: string;
  },
): Promise<Response> {
  const { supabase, userId } = context;
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split("/");
  const entityId = pathParts[pathParts.indexOf("entities") + 1];

  // Check if user is admin
  if (!userId) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (userError || user?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    switch (method) {
      case "GET":
        if (entityId && entityId !== "entities") {
          // Get specific entity
          return await getAdminEntity(supabase, entityId);
        } else {
          // Get all entities
          return await getAdminEntities(supabase, url);
        }

      case "PUT":
        if (entityId && url.pathname.includes("/status")) {
          // Update entity status
          return await updateEntityStatus(supabase, request, entityId);
        }
        return new Response("Method not allowed", {
          status: 405,
          headers: corsHeaders,
        });

      case "DELETE":
        if (entityId) {
          // Delete entity
          return await deleteEntity(supabase, entityId);
        }
        return new Response("Method not allowed", {
          status: 405,
          headers: corsHeaders,
        });

      default:
        return new Response("Method not allowed", {
          status: 405,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error("Admin entities handler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function getAdminEntities(supabase: SupabaseClient, url: URL): Promise<Response> {
  const status = url.searchParams.get("status");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let query = supabase
    .from("entities")
    .select(`
      *,
      users!entities_owner_id_fkey (
        email
      )
    `)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data: entities, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Transform the data to include owner email
  const transformedEntities = entities?.map((entity) => ({
    ...entity,
    owner_email: entity.users?.email || null,
    users: undefined, // Remove the nested object
  })) || [];

  return new Response(JSON.stringify(transformedEntities), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getAdminEntity(supabase: SupabaseClient, entityId: string): Promise<Response> {
  const { data: entity, error } = await supabase
    .from("entities")
    .select(`
      *,
      users!entities_owner_id_fkey (
        email
      )
    `)
    .eq("id", entityId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "Entity not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Transform the data to include owner email
  const transformedEntity = {
    ...entity,
    owner_email: entity.users?.email || null,
    users: undefined, // Remove the nested object
  };

  return new Response(JSON.stringify(transformedEntity), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateEntityStatus(
  supabase: SupabaseClient,
  request: Request,
  entityId: string,
): Promise<Response> {
  const body = await request.json();
  const { status } = body;

  if (!status || !["active", "pending", "deleted"].includes(status)) {
    return new Response(
      JSON.stringify({ error: "Invalid status. Must be 'active', 'pending', or 'deleted'" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const { data: entity, error } = await supabase
    .from("entities")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", entityId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "Entity not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, entity }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function deleteEntity(supabase: SupabaseClient, entityId: string): Promise<Response> {
  // Soft delete by setting status to 'deleted'
  const { data: entity, error } = await supabase
    .from("entities")
    .update({
      status: "deleted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", entityId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "Entity not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
