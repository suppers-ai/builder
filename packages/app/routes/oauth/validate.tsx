import { Handlers } from "$fresh/server.ts";
import { OAuthService } from "../../lib/oauth-service.ts";
import { TokenManager } from "../../lib/token-manager.ts";

interface ValidateResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  };
  expires_in?: number;
  should_refresh?: boolean;
  client_id?: string;
  scope?: string;
}

interface ErrorResponse {
  error: string;
  error_description?: string;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      // Extract Bearer token from Authorization header
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const errorResponse: ErrorResponse = {
          error: "invalid_request",
          error_description: "Bearer token required in Authorization header",
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 401,
          headers: { 
            "Content-Type": "application/json",
            "WWW-Authenticate": 'Bearer realm="oauth"',
          },
        });
      }

      const token = authHeader.substring(7);

      try {
        // Use enhanced token validation with timing information
        const validation = await TokenManager.validateTokenWithTiming(token);
        
        if (!validation.valid) {
          const errorResponse: ErrorResponse = {
            error: "invalid_token",
            error_description: "Token is invalid or expired",
          };
          return new Response(JSON.stringify(errorResponse), {
            status: 401,
            headers: { 
              "Content-Type": "application/json",
              "WWW-Authenticate": 'Bearer realm="oauth"',
            },
          });
        }

        // Get token info for additional details
        const tokenInfo = await TokenManager.getTokenInfo(token);
        
        const response: ValidateResponse = {
          valid: true,
          user: {
            id: validation.user!.id,
            email: validation.user!.email,
            name: validation.user!.display_name || 
                  `${validation.user!.first_name || ""} ${validation.user!.last_name || ""}`.trim() || 
                  validation.user!.email,
            avatar_url: validation.user!.avatar_url || undefined,
          },
          expires_in: validation.expiresIn,
          should_refresh: validation.shouldRefresh,
          client_id: tokenInfo?.token.client_id || undefined,
          scope: tokenInfo?.token.scope || undefined,
        };

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
          },
        });
      } catch (error) {
        const errorResponse: ErrorResponse = {
          error: "invalid_token",
          error_description: error instanceof Error ? error.message : "Token validation failed",
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 401,
          headers: { 
            "Content-Type": "application/json",
            "WWW-Authenticate": 'Bearer realm="oauth"',
          },
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