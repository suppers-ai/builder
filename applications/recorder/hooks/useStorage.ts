import { useState } from "preact/hooks";
import { getAuthClient } from "../lib/auth.ts";

export interface StorageInfo {
  used: number;
  limit: number;
  percentage: number;
  remaining: number;
}

export function useStorage() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  const fetchStorageInfo = async () => {
    try {
      const authClient = getAuthClient();
      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        return;
      }

      const response = await fetch('http://127.0.0.1:54321/functions/v1/api/v1/storage/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.storage) {
          setStorageInfo({
            used: data.storage.used,
            limit: data.storage.limit,
            percentage: data.storage.percentage,
            remaining: data.storage.remaining,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch storage info:", error);
    }
  };

  const clearStorageInfo = () => {
    setStorageInfo(null);
  };

  return {
    storageInfo,
    fetchStorageInfo,
    clearStorageInfo,
  };
}