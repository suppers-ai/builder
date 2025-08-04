import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "jsr:@supabase/supabase-js@2";

export async function updateUserMetadata(
  request: Request,
  supabase: SupabaseClient,
): Promise<Response> {
  const body = await request.json();
  const {
    firstName,
    lastName,
    displayName,
    theme,
  } = body;

  console.log("Updating user metadata:", body);

  // Get the Authorization header to extract the token
  const authHeader = request.headers.get("Authorization")?.trim();
  const token = authHeader?.replace("Bearer ", "");

  console.log("🔍 Auth header:", authHeader);
  console.log("token", token);
  console.log("🔍 Token:", token ? "present" : "missing");

  if (!token) {
    console.log("❌ No token found in request");
    return new Response(JSON.stringify({ error: "Auth session missing!" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  console.log("🔍 Token:", token);

  // Create admin client to verify token and update user
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  console.log("🔍 Supabase URL:", supabaseUrl);
  console.log("🔍 Supabase Service Key:", supabaseServiceKey);

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Get current user using the token
  const { data: { user: authUser }, error: userError } = await supabaseAdmin.auth.getUser(token);
  console.log("🔍 Auth user:", authUser);
  console.log("🔍 User error:", userError);

  if (userError || !authUser) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Prepare metadata update
  const metadata: Record<string, any> = {};

  if (firstName !== undefined) metadata.firstName = firstName;
  if (lastName !== undefined) metadata.lastName = lastName;
  if (displayName !== undefined) metadata.displayName = displayName;
  if (theme !== undefined) metadata.theme = theme;

  console.log("🔍 Metadata:", metadata);

  // Update user metadata using admin client with user ID
  const { data: user, error } = await supabaseAdmin.auth.admin.updateUserById(
    authUser.id,
    { user_metadata: metadata },
  );

  console.log("🔍 User:", user);
  console.log("🔍 Error:", error);

  if (error) {
    console.error("User metadata update error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Also update the database table if we have theme or other database fields
  if (
    theme !== undefined || firstName !== undefined || lastName !== undefined ||
    displayName !== undefined
  ) {
    const dbUpdateData: Record<string, any> = {};

    if (firstName !== undefined) dbUpdateData.first_name = firstName;
    if (lastName !== undefined) dbUpdateData.last_name = lastName;
    if (displayName !== undefined) dbUpdateData.display_name = displayName;
    if (theme !== undefined) dbUpdateData.theme_id = theme; // Save theme as theme_id in database

    const { error: dbError } = await supabaseAdmin
      .from("users")
      .update(dbUpdateData)
      .eq("id", authUser.id);

    if (dbError) {
      console.error("Database update error:", dbError);
      // Don't fail the request, just log the error
    } else {
      console.log("✅ Database updated successfully");
    }
  }

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
