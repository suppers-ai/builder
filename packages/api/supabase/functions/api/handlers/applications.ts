import { corsHeaders } from "../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function handleApplications(
  request: Request,
  context: { user: any, supabase: SupabaseClient, supabaseAdmin: SupabaseClient, pathSegments: string[] }
): Promise<Response> {
  const { supabase } = context;
  const url = new URL(request.url);
  const method = request.method;

  try {
    switch (method) {
      case "GET":
        return await getApplications(supabase, url);
      case "POST":
        return await createApplication(request, supabase);
      case "PUT":
        return await updateApplication(request, supabase);
      case "DELETE":
        return await deleteApplication(request, supabase);
      default:
        return new Response("Method not allowed", {
          status: 405,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error("Applications handler error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function getApplications(supabase: SupabaseClient, url: URL): Promise<Response> {
  const ownerId = url.searchParams.get("owner_id");
  const applicationId = url.searchParams.get("application_id");

  if (applicationId) {
    // Get specific application
    const { data: application, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Application not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ application }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } else if (ownerId) {
    // Get applications by owner
    const { data: applications, error } = await supabase
      .from("applications")
      .select("*")
      .eq("owner_id", ownerId)
      .order("updated_at", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ applications: applications || [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } else {
    return new Response(
      JSON.stringify({ error: "owner_id or application_id parameter is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function createApplication(request: Request, supabase: SupabaseClient): Promise<Response> {
  const body = await request.json();
  const {
    ownerId,
    name,
    description,
    templateId,
    configuration,
    status = "draft",
  } = body;

  if (!ownerId || !name || !templateId) {
    return new Response(
      JSON.stringify({
        error: "ownerId, name, and templateId are required",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      owner_id: ownerId,
      name,
      description,
      template_id: templateId,
      configuration: configuration || {},
      status,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ application }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateApplication(request: Request, supabase: SupabaseClient): Promise<Response> {
  const body = await request.json();
  const {
    id,
    name,
    description,
    templateId,
    configuration,
    status,
  } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: "Application ID is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (templateId !== undefined) updateData.template_id = templateId;
  if (configuration !== undefined) updateData.configuration = configuration;
  if (status !== undefined) updateData.status = status;

  const { data: application, error } = await supabase
    .from("applications")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ application }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function deleteApplication(request: Request, supabase: SupabaseClient): Promise<Response> {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: "Application ID is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      message: "Application deleted successfully",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
