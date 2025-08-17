import { corsHeaders } from "../../lib/cors.ts";
import { handleUserSubscriptions } from "./subscriptions.ts";

export async function handleUsers(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/").filter(segment => segment);
  
  // Remove 'api', 'v1', 'users' from the path to get the action
  const actionIndex = pathSegments.findIndex(segment => segment === "users") + 1;
  const action = pathSegments[actionIndex];

  switch (action) {
    case "subscriptions":
      return await handleUserSubscriptions(req);
    default:
      return new Response(JSON.stringify({ error: `Users endpoint '${action}' not found` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
  }
}