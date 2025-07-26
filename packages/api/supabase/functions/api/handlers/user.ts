import { corsHeaders } from "../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function handleUserRequest(request: Request, supabase: SupabaseClient): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;

  try {
    switch (method) {
      case "GET":
        return await getUser(supabase, url);
      case "PUT":
        return await updateUser(request, supabase);
      case "POST":
        return await createUser(request, supabase);
      default:
        return new Response("Method not allowed", {
          status: 405,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error("User handler error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function getUser(supabase: SupabaseClient, url: URL): Promise<Response> {
  const userId = url.searchParams.get("user_id");

  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createUser(request: Request, supabase: SupabaseClient): Promise<Response> {
  const body = await request.json();
  const {
    id,
    email,
    firstName,
    middleNames,
    lastName,
    displayName,
    avatarUrl,
  } = body;

  if (!id || !email) {
    return new Response(JSON.stringify({ error: "ID and email are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userData = {
    id,
    email,
    first_name: firstName || null,
    middle_names: middleNames || null,
    last_name: lastName || null,
    display_name: displayName || null,
    avatar_url: avatarUrl || null,
  };

  const { data: user, error } = await supabase
    .from("users")
    .insert(userData)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ user }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateUser(request: Request, supabase: SupabaseClient): Promise<Response> {
  const body = await request.json();
  const {
    id,
    email,
    firstName,
    middleNames,
    lastName,
    displayName,
    avatarUrl,
  } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (email !== undefined) updateData.email = email;
  if (firstName !== undefined) updateData.first_name = firstName;
  if (middleNames !== undefined) updateData.middle_names = middleNames;
  if (lastName !== undefined) updateData.last_name = lastName;
  if (displayName !== undefined) updateData.display_name = displayName;
  if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

  const { data: user, error } = await supabase
    .from("users")
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

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
