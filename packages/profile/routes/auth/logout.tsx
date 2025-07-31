import { type PageProps, type Handlers } from "fresh";
import LogoutHandler from "../../islands/LogoutHandler.tsx";
import { AuthHelpers } from "../../lib/auth-helpers.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      // Get the authorization header
      const authHeader = req.headers.get("Authorization");
      
      if (authHeader?.startsWith("Bearer ")) {
        // Perform logout with the provided token
        await AuthHelpers.signOut();
      }

      // Return success response with CORS headers
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:8000",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      return new Response(JSON.stringify({ error: "Logout failed" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:8000",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }
  },

  async OPTIONS(req) {
    // Handle preflight requests
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:8000",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }
};

export default function Logout(props: PageProps) {
  return <LogoutHandler />;
}
