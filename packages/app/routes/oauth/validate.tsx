import { Handlers } from "$fresh/server.ts";
import { OAuthService } from "../../lib/oauth-service.ts";

interface ValidateRequest {
  token: string;
}

interface ValidateResponse {
  active: boolean;
  sub?: string;
  client_id?: string;
  scope?: string;
  exp?: number;
  iat?: number;
}

interface ErrorResponse {
  error: string;
  error_description?: string;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const contentType = req.headers.get("content-type");
      let validateRequest: ValidateRequest;

      if (contentType?.includes("application/json")) {
        validateRequest = await req.json();
      } else {
        // Parse form data
        const formData = await req.formData();
        validateRequest = {
          token: formData.get("token")?.toString() || "",
        };
      }

      if (!validateRequest.token) {
        const errorResponse: ErrorResponse = {
          error: "invalid_request",
          error_description: "token parameter is required",
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      try {
        // Get token information from database
        const { supabase } = await import("../../lib/supabase-client.ts");
        const { data: tokenData, error: tokenError } = await supabase
          .from("oauth_tokens")
          .select("*")
          .eq("access_token", validateRequest.token)
          .single();

        if (tokenError || !tokenData) {
          // Token not found - return inactive
          const response: ValidateResponse = {
            active: false,
          };
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Check if token has expired
        const isExpired = new Date(tokenData.expires_at) < new Date();
        if (isExpired) {
          // Clean up expired token
          await supabase
            .from("oauth_tokens")
            .delete()
            .eq("access_token", validateRequest.token);

          const response: ValidateResponse = {
            active: false,
          };
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Token is active
        const response: ValidateResponse = {
          active: true,
          sub: tokenData.user_id || undefined,
          client_id: tokenData.client_id,
          scope: tokenData.scope,
          exp: Math.floor(new Date(tokenData.expires_at).getTime() / 1000),
          iat: Math.floor(new Date(tokenData.created_at).getTime() / 1000),
        };

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        const errorResponse: ErrorResponse = {
          error: "server_error",
          error_description: "Failed to validate token",
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      const errorResponse: ErrorResponse = {
        error: "server_error",
        error_description: "An internal server error occurred",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // Method not allowed for other HTTP methods
  async GET() {
    return new Response("Method Not Allowed", { status: 405 });
  },
};