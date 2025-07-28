import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../api/lib/cors.ts";
import { handleCallbackRequest } from "./handlers/index.ts";

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  return await handleCallbackRequest(req);
});
