import { corsHeaders } from "../lib/cors.ts";

export async function handleAuthRequest(request: Request, supabase: unknown): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.split("/").pop();

  try {
    switch (path) {
      case "me":
        return await getCurrentUser(request, supabase);
      case "register":
        return await registerUser(request, supabase);
      case "login":
        return await loginUser(request, supabase);
      case "logout":
        return await logoutUser(request, supabase);
      case "refresh":
        return await refreshToken(request, supabase);
      default:
        return new Response("Not found", {
          status: 404,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error("Auth handler error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function getCurrentUser(_request: Request, supabase: unknown): Promise<Response> {
  const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

  if (userError || !authUser) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get user from users table
  const { data: user, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (dbError && dbError.code !== "PGRST116") {
    return new Response(JSON.stringify({ error: dbError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      user: {
        ...user,
        user,
      },
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function registerUser(request: Request, supabase: unknown): Promise<Response> {
  const body = await request.json();
  const {
    email,
    password,
    firstName,
    middleNames,
    lastName,
    displayName,
  } = body;

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        middle_names: middleNames,
        last_name: lastName,
        display_name: displayName,
      },
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      user: data.user,
      session: data.session,
    }),
    {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function loginUser(request: Request, supabase: unknown): Promise<Response> {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      user: data.user,
      session: data.session,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function logoutUser(_request: Request, supabase: unknown): Promise<Response> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "Logged out successfully" }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function refreshToken(request: Request, supabase: unknown): Promise<Response> {
  const body = await request.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    return new Response(JSON.stringify({ error: "Refresh token is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      session: data.session,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
