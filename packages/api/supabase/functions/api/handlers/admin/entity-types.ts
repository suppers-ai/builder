import type { SupabaseClient } from "@supabase/supabase-js";
import { corsHeaders } from "../../_common/index.ts";

export interface EntityTypeContext {
  supabase: SupabaseClient;
  userId: string;
}

/**
 * Handle entity type management requests
 */
export async function handleAdminEntityTypes(
  req: Request,
  context: EntityTypeContext,
  pathSegments: string[],
): Promise<Response> {
  const { supabase } = context;
  const method = req.method;
  const url = new URL(req.url);

  console.log("🏷️ Entity types handler - method:", method, "pathSegments:", pathSegments);

  try {
    const [entityTypeId, subEndpoint, subEntityTypeId] = pathSegments;

    switch (method) {
      case "GET":
        if (!entityTypeId) {
          // GET /api/v1/admin/entity-types - Get all entity types
          return await getAllEntityTypes(supabase);
        } else if (subEndpoint === "sub-types" && !subEntityTypeId) {
          // GET /api/v1/admin/entity-types/:id/sub-types - Get sub-types for entity type
          return await getEntitySubTypes(supabase, entityTypeId);
        } else if (!subEndpoint) {
          // GET /api/v1/admin/entity-types/:id - Get specific entity type
          return await getEntityType(supabase, entityTypeId);
        }
        break;

      case "POST":
        if (!entityTypeId) {
          // POST /api/v1/admin/entity-types - Create new entity type
          const body = await req.json();
          return await createEntityType(supabase, body);
        } else if (subEndpoint === "sub-types") {
          // POST /api/v1/admin/entity-types/:id/sub-types - Create sub-type for entity type
          const body = await req.json();
          return await createEntitySubType(supabase, entityTypeId, body);
        }
        break;

      case "PUT":
        if (entityTypeId && !subEndpoint) {
          // PUT /api/v1/admin/entity-types/:id - Update entity type
          const body = await req.json();
          return await updateEntityType(supabase, entityTypeId, body);
        } else if (subEndpoint === "sub-types" && subEntityTypeId) {
          // PUT /api/v1/admin/entity-types/:id/sub-types/:subId - Update entity sub-type
          const body = await req.json();
          return await updateEntitySubType(supabase, subEntityTypeId, body);
        }
        break;

      case "DELETE":
        if (entityTypeId && !subEndpoint) {
          // DELETE /api/v1/admin/entity-types/:id - Delete entity type
          return await deleteEntityType(supabase, entityTypeId);
        } else if (subEndpoint === "sub-types" && subEntityTypeId) {
          // DELETE /api/v1/admin/entity-types/:id/sub-types/:subId - Delete entity sub-type
          return await deleteEntitySubType(supabase, subEntityTypeId);
        }
        break;
    }

    return new Response(JSON.stringify({ error: "Invalid endpoint or method" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Entity types handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Get all entity types
 */
async function getAllEntityTypes(supabase: SupabaseClient): Promise<Response> {
  const { data, error } = await supabase
    .from("entity_types")
    .select(`
      *,
      entity_sub_types (*)
    `)
    .order("name");

  if (error) {
    console.error("Error fetching entity types:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch entity types" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Get specific entity type
 */
async function getEntityType(supabase: SupabaseClient, id: string): Promise<Response> {
  const { data, error } = await supabase
    .from("entity_types")
    .select(`
      *,
      entity_sub_types (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching entity type:", error);
    return new Response(JSON.stringify({ error: "Entity type not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Create new entity type
 */
async function createEntityType(supabase: SupabaseClient, body: any): Promise<Response> {
  const { name, description, metadata_schema, filter_config, location_required } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: "Name is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("entity_types")
    .insert({
      name,
      description,
      metadata_schema,
      filter_config,
      location_required: location_required ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating entity type:", error);
    return new Response(JSON.stringify({ error: "Failed to create entity type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Update entity type
 */
async function updateEntityType(
  supabase: SupabaseClient,
  id: string,
  body: any,
): Promise<Response> {
  const { name, description, metadata_schema, filter_config, location_required } = body;

  const { data, error } = await supabase
    .from("entity_types")
    .update({
      name,
      description,
      metadata_schema,
      filter_config,
      location_required,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating entity type:", error);
    return new Response(JSON.stringify({ error: "Failed to update entity type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Delete entity type
 */
async function deleteEntityType(supabase: SupabaseClient, id: string): Promise<Response> {
  const { error } = await supabase
    .from("entity_types")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting entity type:", error);
    return new Response(JSON.stringify({ error: "Failed to delete entity type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "Entity type deleted successfully" }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Get entity sub-types for a specific entity type
 */
async function getEntitySubTypes(
  supabase: SupabaseClient,
  entityTypeId: string,
): Promise<Response> {
  const { data, error } = await supabase
    .from("entity_sub_types")
    .select("*")
    .eq("entity_type_id", entityTypeId)
    .order("name");

  if (error) {
    console.error("Error fetching entity sub-types:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch entity sub-types" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Create entity sub-type
 */
async function createEntitySubType(
  supabase: SupabaseClient,
  entityTypeId: string,
  body: any,
): Promise<Response> {
  const { name, description, metadata_schema, filter_config } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: "Name is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("entity_sub_types")
    .insert({
      entity_type_id: entityTypeId,
      name,
      description,
      metadata_schema,
      filter_config,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating entity sub-type:", error);
    return new Response(JSON.stringify({ error: "Failed to create entity sub-type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Update entity sub-type
 */
async function updateEntitySubType(
  supabase: SupabaseClient,
  id: string,
  body: any,
): Promise<Response> {
  const { name, description, metadata_schema, filter_config } = body;

  const { data, error } = await supabase
    .from("entity_sub_types")
    .update({
      name,
      description,
      metadata_schema,
      filter_config,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating entity sub-type:", error);
    return new Response(JSON.stringify({ error: "Failed to update entity sub-type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Delete entity sub-type
 */
async function deleteEntitySubType(supabase: SupabaseClient, id: string): Promise<Response> {
  const { error } = await supabase
    .from("entity_sub_types")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting entity sub-type:", error);
    return new Response(JSON.stringify({ error: "Failed to delete entity sub-type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "Entity sub-type deleted successfully" }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
