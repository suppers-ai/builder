import { Handlers } from "$fresh/server.ts";
import { OAuthService } from "../../lib/oauth-service.ts";

interface UserInfoResponse {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  updated_at?: string;
}

interface ErrorResponse {
  error: string;
  error_description?: string;
}

export const handler: Handlers = {
  async GET(req) {
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

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      try {
        // Validate token and get user data
        const user = await OAuthService.validateToken(token);

        // Build userinfo response according to OpenID Connect standard
        const userInfo: UserInfoResponse = {
          sub: user.id, // Subject identifier
          email: user.email,
          email_verified: true, // Assuming email is verified since it's from our system
          name: user.display_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || undefined,
          given_name: user.first_name || undefined,
          family_name: user.last_name || undefined,
          picture: user.avatar_url || undefined,
          updated_at: Math.floor(new Date(user.updated_at).getTime() / 1000).toString(),
        };

        // Remove undefined values
        const cleanedUserInfo = Object.fromEntries(
          Object.entries(userInfo).filter(([_, value]) => value !== undefined)
        );

        return new Response(JSON.stringify(cleanedUserInfo), {
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
          error_description: error instanceof Error ? error.message : "Invalid or expired token",
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

  async POST(req) {
    // POST method also supported for userinfo endpoint
    return handler.GET!(req, {} as any);
  },

  // Method not allowed for other HTTP methods
  async PUT() {
    return new Response("Method Not Allowed", { status: 405 });
  },

  async DELETE() {
    return new Response("Method Not Allowed", { status: 405 });
  },

  async PATCH() {
    return new Response("Method Not Allowed", { status: 405 });
  },
};