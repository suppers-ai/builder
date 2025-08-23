import { corsHeaders, errorResponses } from "../../_common/index.ts";
import { handleUserSubscriptions } from "./subscriptions.ts";

export async function handleUsers(req: Request): Promise<Response> {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/").filter((segment) => segment);

  // Remove 'api', 'v1', 'users' from the path to get the action
  const actionIndex = pathSegments.findIndex((segment) => segment === "users") + 1;
  const action = pathSegments[actionIndex];

  switch (action) {
    case "subscriptions":
      return await handleUserSubscriptions(req);
    default:
      return errorResponses.notFound(`Users endpoint '${action}' not found`, origin || undefined);
  }
}
