import { Context } from "fresh";
import { createClient } from "jsr:@supabase/supabase-js@2";
import config from "../../../config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-ID, X-Access-Token",
  "Access-Control-Max-Age": "86400",
};

export { corsHeaders };

export function createErrorResponse(error: string, status: number, code?: string) {
  const body = code ? { error, code } : { error };
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export function createSuccessResponse(data: unknown, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export function createSupabaseClient(accessToken: string) {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export async function authenticateRequest(ctx: Context<unknown>) {
  const userId = ctx.req.headers.get("X-User-ID");
  
  if (!userId) {
    throw new Error("Authentication required");
  }

  const authHeader = ctx.req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization required");
  }

  const accessToken = authHeader.replace("Bearer ", "");
  const supabase = createSupabaseClient(accessToken);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Invalid or expired token. Please log in again.");
  }

  if (user.id !== userId) {
    throw new Error("Token does not match user ID");
  }

  return { userId, user, supabase };
}

export function validateFile(file: File) {
  if (!file.type.startsWith('video/')) {
    throw new Error("Invalid file type. Only video files are allowed.");
  }

  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 100MB.");
  }
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export function createFilePath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = sanitizeFilename(filename);
  return `${userId}/recorder/${timestamp}_${sanitizedFilename}`;
}

export function generateRecordingId(): string {
  const timestamp = Date.now();
  return `rec_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
}