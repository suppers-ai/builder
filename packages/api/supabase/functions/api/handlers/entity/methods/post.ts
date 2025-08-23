import { corsHeaders } from "../../../_common/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapMetadataToFilters,
  mergeFilterConfigs,
  mergeMetadataSchemas,
  validateMetadata,
} from "../../../lib/metadata-validation.ts";

export async function handleEntityPost(req: Request, {
  url,
  userId,
  supabase,
  entityId,
  subAction,
  subId,
}: {
  url: URL;
  userId: string;
  supabase: SupabaseClient;
  entityId: string;
  subAction: string;
  subId: string;
}) {
  if (!entityId) {
    // POST /entity - Create new entity
    const body = await req.json();
    if (!body.name) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!body.type) {
      return new Response(JSON.stringify({ error: "Type is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get type configuration to validate metadata
    let typeSchema = null;
    let filterConfig = null;

    try {
      // Get entity type
      const { data: entityType, error: typeError } = await supabase
        .from("entity_types")
        .select("*")
        .eq("name", body.type)
        .single();

      if (typeError || !entityType) {
        return new Response(JSON.stringify({ error: "Invalid entity type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      typeSchema = entityType.metadata_schema;
      filterConfig = entityType.filter_config;

      // If sub_type is provided, get sub-type configuration
      if (body.sub_type) {
        const { data: subType, error: subTypeError } = await supabase
          .from("entity_sub_types")
          .select("*")
          .eq("entity_type_id", entityType.id)
          .eq("name", body.sub_type)
          .single();

        if (subTypeError || !subType) {
          return new Response(JSON.stringify({ error: "Invalid entity sub-type" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Merge parent and child schemas
        typeSchema = mergeMetadataSchemas(typeSchema, subType.metadata_schema);
        filterConfig = mergeFilterConfigs(filterConfig, subType.filter_config);
      }

      // Validate location requirement
      if (
        entityType.location_required &&
        (!body.location || (!body.location.latitude || !body.location.longitude))
      ) {
        return new Response(
          JSON.stringify({ error: "Location is required for this entity type" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } catch (err) {
      console.error("Error fetching type configuration:", err);
      return new Response(JSON.stringify({ error: "Failed to validate entity type" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate metadata against schema
    let validatedMetadata = body.metadata || {};
    let filterMappings: Record<string, any> = {};

    if (typeSchema) {
      const validation = validateMetadata(body.metadata || {}, typeSchema);
      if (!validation.isValid) {
        return new Response(
          JSON.stringify({
            error: "Metadata validation failed",
            details: validation.errors,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      validatedMetadata = validation.filteredMetadata;
      filterMappings = mapMetadataToFilters(validatedMetadata, filterConfig);
    }

    // Prepare location data
    let locationData = null;
    if (body.location && body.location.latitude && body.location.longitude) {
      locationData = `POINT(${body.location.longitude} ${body.location.latitude})`;
    }

    // Set the owner_id to the authenticated user's ID
    const entityData = {
      id: crypto.randomUUID(),
      name: body.name,
      description: body.description || "",
      photos: body.photos || [],
      type: body.type,
      sub_type: body.sub_type || null,
      metadata: validatedMetadata,
      location: locationData,
      // Map metadata to filter columns
      filter_numeric_1: filterMappings["filter_numeric_1"] || null,
      filter_numeric_2: filterMappings["filter_numeric_2"] || null,
      filter_numeric_3: filterMappings["filter_numeric_3"] || null,
      filter_numeric_4: filterMappings["filter_numeric_4"] || null,
      filter_numeric_5: filterMappings["filter_numeric_5"] || null,
      filter_text_1: filterMappings["filter_text_1"] || null,
      filter_text_2: filterMappings["filter_text_2"] || null,
      filter_text_3: filterMappings["filter_text_3"] || null,
      filter_text_4: filterMappings["filter_text_4"] || null,
      filter_text_5: filterMappings["filter_text_5"] || null,
      filter_boolean_1: filterMappings["filter_boolean_1"] || null,
      filter_boolean_2: filterMappings["filter_boolean_2"] || null,
      filter_boolean_3: filterMappings["filter_boolean_3"] || null,
      filter_boolean_4: filterMappings["filter_boolean_4"] || null,
      filter_boolean_5: filterMappings["filter_boolean_5"] || null,
      filter_date_1: filterMappings["filter_date_1"] || null,
      filter_date_2: filterMappings["filter_date_2"] || null,
      filter_date_3: filterMappings["filter_date_3"] || null,
      filter_date_4: filterMappings["filter_date_4"] || null,
      filter_date_5: filterMappings["filter_date_5"] || null,
      connected_application_ids: body.connected_application_ids || [],
      status: "pending",
      verified: true,
      owner_id: userId,
    };

    const { data, error } = await supabase
      .from("entities")
      .insert(entityData)
      .select()
      .single();

    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
