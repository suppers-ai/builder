import { Context, type PageProps } from "fresh";
import LogoutHandler from "../../islands/LogoutHandler.tsx";
import { getAuthClient } from "../../lib/auth.ts";
import { createCORSHeaders, createPreflightCORSHeaders } from "../../lib/cors.ts";

// Get the singleton auth client
const authClient = getAuthClient();

export const handler = {
  async POST(ctx: Context<any>) {
    const requestOrigin = ctx.req.headers.get("origin");

    try {
      // Initialize auth client if needed
      await authClient.initialize();

      // Sign out using the profile auth client
      await authClient.signOut();

      return new Response(
        JSON.stringify({
          success: true,
          message: "Logged out successfully",
        }),
        {
          status: 200,
          headers: createCORSHeaders(requestOrigin),
        },
      );
    } catch (error) {
      console.error("Logout API error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to logout",
        }),
        {
          status: 500,
          headers: createCORSHeaders(requestOrigin),
        },
      );
    }
  },

  // Handle CORS preflight requests
  OPTIONS(ctx: Context<any>) {
    const requestOrigin = ctx.req.headers.get("origin");

    return new Response(null, {
      status: 200,
      headers: createPreflightCORSHeaders(requestOrigin),
    });
  },
};

export default function Logout(props: PageProps) {
  return <LogoutHandler />;
}
