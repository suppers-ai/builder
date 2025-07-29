import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function resetPassword(request: Request, supabase: SupabaseClient): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the origin from the request or use a default
    const requestUrl = new URL(request.url);
    const appOrigin = requestUrl.searchParams.get("origin") || "http://localhost:8000";
    const redirectUrl = `${appOrigin}/auth/callback?type=recovery`;
    
    console.log("🔄 Password reset request:");
    console.log("  Email:", email);
    console.log("  App Origin:", appOrigin);
    console.log("  Redirect URL:", redirectUrl);
    console.log("  Request URL:", request.url);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    console.log("🔄 Password reset result:");
    console.log("  Error:", error?.message || "No error");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Password reset email sent" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}