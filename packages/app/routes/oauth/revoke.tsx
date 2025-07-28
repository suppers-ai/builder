import { OAuthService } from "../../lib/oauth-service.ts";

interface RevokeRequest {
  token: string;
  token_type_hint?: "access_token" | "refresh_token";
  client_id: string;
  client_secret: string;
}

interface ErrorResponse {
  error: string;
  error_description?: string;
}

export const handler = {
  async POST(req) {
    try {
      const contentType = req.headers.get("content-type");
      let revokeRequest: RevokeRequest;

      if (contentType?.includes("application/json")) {
        revokeRequest = await req.json();
      } else {
        // Parse form data
        const formData = await req.formData();
        revokeRequest = {
          token: formData.get("token")?.toString() || "",
          token_type_hint: formData.get("token_type_hint")?.toString() as "access_token" | "refresh_token" | undefined,
          client_id: formData.get("client_id")?.toString() || "",
          client_secret: formData.get("client_secret")?.toString() || "",
        };
      }

      // Validate required fields
      if (!revokeRequest.token) {
        const errorResponse: ErrorResponse = {
          error: "invalid_request",
          error_description: "token parameter is required",
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!revokeRequest.client_id || !revokeRequest.client_secret) {
        const errorResponse: ErrorResponse = {
          error: "invalid_request",
          error_description: "client_id and client_secret are required",
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      try {
        // Validate client credentials
        const client = await OAuthService.validateClientCredentials(
          revokeRequest.client_id,
          revokeRequest.client_secret
        );

        if (!client) {
          const errorResponse: ErrorResponse = {
            error: "invalid_client",
            error_description: "Invalid client credentials",
          };
          return new Response(JSON.stringify(errorResponse), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Revoke the token
        // Try both access_token and refresh_token columns
        // TODO: Replace with API client calls
        const { apiClient } = await import("../../lib/api-client.ts");
        const { error: accessTokenError } = await supabase
          .from("oauth_tokens")
          .delete()
          .eq("access_token", revokeRequest.token)
          .eq("client_id", revokeRequest.client_id);

        if (accessTokenError) {
          // Try refresh_token if access_token deletion failed
          const { error: refreshTokenError } = await supabase
            .from("oauth_tokens")
            .delete()
            .eq("refresh_token", revokeRequest.token)
            .eq("client_id", revokeRequest.client_id);

          if (refreshTokenError) {
            console.error("Failed to revoke token:", refreshTokenError);
          }
        }

        // According to RFC 7009, the revocation endpoint should return 200 OK
        // even if the token was not found or already revoked
        return new Response("", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        const errorResponse: ErrorResponse = {
          error: "server_error",
          error_description: "Failed to revoke token",
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