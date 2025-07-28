import { handleOAuthCallback } from "./oauth-callback.ts";

export async function handleCallbackRequest(req: Request): Promise<Response> {
  return await handleOAuthCallback(req);
}