import { corsHeaders } from "../../../_common/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function handleEntityPut(req: Request, {
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
  if (entityId && !subAction) {
    // TODO: allow admin to update as well
    // PUT /entity/{entityId} - Update entity
    const body = await req.json();

    const updateData: any = {};
    if (body.name) {
      updateData.name = body.name;
    }
    if (body.description) {
      updateData.description = body.description;
    }
    if (body.photos) {
      updateData.photos = body.photos;
    }
    if (body.tags) {
      updateData.tags = body.tags;
    }
    if (body.connected_application_ids) {
      updateData.connected_application_ids = body.connected_application_ids;
    }

    const { data, error } = await supabase
      .from("entities")
      .update(updateData)
      .eq("id", entityId)
      .eq("owner_id", userId)
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
