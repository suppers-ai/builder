import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

interface UserStorageGetContext {
  userId: string;
  supabase: SupabaseClient;
}

export async function handleUserStorageGet(
  req: Request,
  context: UserStorageGetContext,
): Promise<Response> {
  const { userId, supabase } = context;

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  console.log("📊 Getting storage usage for user:", userId);

  try {
    // Get user's storage limit and usage from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('storage_used, storage_limit, bandwidth_used, bandwidth_limit')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error("❌ Failed to fetch user storage info:", userError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user storage information" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const userStorageLimit = userData.storage_limit || (250 * 1024 * 1024); // Default 250MB
    const userStorageUsed = userData.storage_used || 0;
    const userBandwidthLimit = userData.bandwidth_limit || (250 * 1024 * 1024); // Default 250MB per month
    const userBandwidthUsed = userData.bandwidth_used || 0;

    // Get storage objects for detailed breakdown
    const { data: storageObjects, error: objectsError } = await supabase
      .from('storage_objects')
      .select('file_size, object_type, mime_type')
      .eq('user_id', userId);

    if (objectsError) {
      console.error("❌ Failed to fetch storage objects:", objectsError.message);
      // Continue with just user storage data if objects fetch fails
    }

    // Calculate actual usage from storage objects (for verification)
    const calculatedUsage = (storageObjects || []).reduce((total, obj) => {
      return total + (obj.file_size || 0);
    }, 0);

    const storageInfo = {
      used: userStorageUsed,
      calculatedUsed: calculatedUsage, // For debugging/verification
      limit: userStorageLimit,
      percentage: Math.round((userStorageUsed / userStorageLimit) * 100),
      remaining: userStorageLimit - userStorageUsed,
      fileCount: (storageObjects || []).length,
      maxFileSize: 50 * 1024 * 1024, // 50MB from config
      objectTypes: (storageObjects || []).reduce((acc, obj) => {
        acc[obj.object_type] = (acc[obj.object_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const bandwidthInfo = {
      used: userBandwidthUsed,
      limit: userBandwidthLimit,
      percentage: Math.round((userBandwidthUsed / userBandwidthLimit) * 100),
      remaining: userBandwidthLimit - userBandwidthUsed,
    };

    console.log("✅ Storage usage calculated for user:", userId, "used:", userStorageUsed, "limit:", userStorageLimit);
    console.log("✅ Bandwidth usage calculated for user:", userId, "used:", userBandwidthUsed, "limit:", userBandwidthLimit);

    return new Response(
      JSON.stringify({
        success: true,
        storage: storageInfo,
        bandwidth: bandwidthInfo
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );

  } catch (error) {
    console.error("❌ Storage calculation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to calculate storage usage" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}