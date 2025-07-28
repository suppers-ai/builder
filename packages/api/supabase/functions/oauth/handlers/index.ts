import { corsHeaders } from "../../api/lib/cors.ts";
import { handleAuthorizeRequest, handleTokenRequest } from "./authorize.ts";
import { handleOAuthCallbackRequest } from "./callback.ts";

export async function handleOAuthAuthorizeRequest(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);

    if (req.method === "GET") {
      return await handleAuthorizeRequest(url);
    } else if (req.method === "POST") {
      return await handleTokenRequest(req);
    } else {
      return new Response(
        JSON.stringify({ error: "method_not_allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("OAuth error:", error);
    return new Response(
      JSON.stringify({
        error: "server_error",
        error_description: "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

export { handleOAuthCallbackRequest };