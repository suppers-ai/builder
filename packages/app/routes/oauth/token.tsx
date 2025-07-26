import { Handlers } from "$fresh/server.ts";
import { OAuthService } from "../../lib/oauth-service.ts";

interface TokenRequest {
  grant_type: string;
  code?: string;
  redirect_uri?: string;
  client_id: string;
  client_secret: string;
  refresh_token?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface TokenErrorResponse {
  error: string;
  error_description?: string;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const contentType = req.headers.get("content-type");
      let tokenRequest: TokenRequest;

      if (contentType?.includes("application/json")) {
        tokenRequest = await req.json();
      } else {
        // Parse form data
        const formData = await req.formData();
        tokenRequest = {
          grant_type: formData.get("grant_type")?.toString() || "",
          code: formData.get("code")?.toString(),
          redirect_uri: formData.get("redirect_uri")?.toString(),
          client_id: formData.get("client_id")?.toString() || "",
          client_secret: formData.get("client_secret")?.toString() || "",
          refresh_token: formData.get("refresh_token")?.toString(),
        };
      }

      // Validate required fields
      if (!tokenRequest.client_id || !tokenRequest.client_secret) {
        const errorResponse: TokenErrorResponse = {
          error: "invalid_request",
          error_description: "client_id and client_secret are required",
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (tokenRequest.grant_type === "authorization_code") {
        // Authorization code flow
        if (!tokenRequest.code || !tokenRequest.redirect_uri) {
          const errorResponse: TokenErrorResponse = {
            error: "invalid_request",
            error_description: "code and redirect_uri are required for authorization_code grant",
          };
          return new Response(JSON.stringify(errorResponse), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const tokenResponse = await OAuthService.exchangeCodeForToken(
            tokenRequest.code,
            tokenRequest.client_id,
            tokenRequest.client_secret,
            tokenRequest.redirect_uri
          );

          return new Response(JSON.stringify(tokenResponse), {
            status: 200,
            headers: { 
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
              "Pragma": "no-cache",
            },
          });
        } catch (error) {
          const errorResponse: TokenErrorResponse = {
            error: "invalid_grant",
            error_description: error instanceof Error ? error.message : "Invalid authorization code",
          };
          return new Response(JSON.stringify(errorResponse), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      } else if (tokenRequest.grant_type === "refresh_token") {
        // Refresh token flow
        if (!tokenRequest.refresh_token) {
          const errorResponse: TokenErrorResponse = {
            error: "invalid_request",
            error_description: "refresh_token is required for refresh_token grant",
          };
          return new Response(JSON.stringify(errorResponse), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          // Validate client credentials first
          const client = await OAuthService.validateClientCredentials(
            tokenRequest.client_id,
            tokenRequest.client_secret
          );
          
          if (!client) {
            const errorResponse: TokenErrorResponse = {
              error: "invalid_client",
              error_description: "Invalid client credentials",
            };
            return new Response(JSON.stringify(errorResponse), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const tokenResponse = await OAuthService.refreshToken(tokenRequest.refresh_token);

          return new Response(JSON.stringify(tokenResponse), {
            status: 200,
            headers: { 
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
              "Pragma": "no-cache",
            },
          });
        } catch (error) {
          const errorResponse: TokenErrorResponse = {
            error: "invalid_grant",
            error_description: error instanceof Error ? error.message : "Invalid refresh token",
          };
          return new Response(JSON.stringify(errorResponse), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      } else {
        const errorResponse: TokenErrorResponse = {
          error: "unsupported_grant_type",
          error_description: "Only authorization_code and refresh_token grant types are supported",
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      const errorResponse: TokenErrorResponse = {
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