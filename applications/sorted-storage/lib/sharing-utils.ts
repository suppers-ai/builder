/**
 * Sharing utilities for sorted-storage application
 * Based on recorder package patterns and requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */

import type { ShareInfo, ShareOptions, StorageObject } from "../types/storage.ts";
import config from "../../../config.ts";

// Generate a secure random token for sharing
export function generateShareToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Create a share link for a storage object
export async function createShareLink(
  storageObject: StorageObject,
  options: ShareOptions = {},
): Promise<ShareInfo> {
  const token = generateShareToken();
  const expiresAt = options.expiresAt || getDefaultExpiryDate();

  try {
    // Update the storage object with share token
    const response = await fetch(`${config.apiUrl}/api/v1/storage/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        objectId: storageObject.id,
        shareToken: token,
        expiresAt,
        options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create share link: ${response.statusText}`);
    }

    const shareUrl = `${globalThis.location?.origin || "http://localhost:8000"}/share/${token}`;

    return {
      token,
      url: shareUrl,
      expiresAt,
      createdAt: new Date().toISOString(),
      accessCount: 0,
      options,
    };
  } catch (error) {
    console.error("Error creating share link:", error);
    throw error;
  }
}

// Revoke a share link
export async function revokeShareLink(storageObject: StorageObject): Promise<void> {
  try {
    const response = await fetch(`${config.apiUrl}/api/v1/storage/share/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        objectId: storageObject.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to revoke share link: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error revoking share link:", error);
    throw error;
  }
}

// Validate a share token and get the associated storage object
export async function validateShareToken(token: string): Promise<{
  valid: boolean;
  storageObject?: StorageObject;
  error?: string;
}> {
  try {
    const response = await fetch(`${config.apiUrl}/api/v1/storage/share/validate/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        error: response.status === 404 ? "Share link not found or expired" : "Invalid share link",
      };
    }

    const data = await response.json();
    return {
      valid: true,
      storageObject: data.storageObject,
    };
  } catch (error) {
    console.error("Error validating share token:", error);
    return {
      valid: false,
      error: "Failed to validate share link",
    };
  }
}

// Get share information for a storage object
export async function getShareInfo(storageObject: StorageObject): Promise<ShareInfo | null> {
  if (!storageObject.share_token) {
    return null;
  }

  try {
    const response = await fetch(`${config.apiUrl}/api/v1/storage/share/info/${storageObject.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await getAuthToken()}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      token: storageObject.share_token,
      url: `${globalThis.location.origin}/share/${storageObject.share_token}`,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
      accessCount: data.accessCount || 0,
      options: data.options || {},
    };
  } catch (error) {
    console.error("Error getting share info:", error);
    return null;
  }
}

// Copy share link to clipboard
export async function copyShareLink(shareUrl: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && globalThis.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      if (typeof document === "undefined") {
        return false;
      }
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    return false;
  }
}

// Format share expiry date for display
export function formatExpiryDate(expiresAt: string): string {
  const date = new Date(expiresAt);
  const now = new Date();
  const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 0) {
    return "Expired";
  } else if (diffInHours < 24) {
    return `Expires in ${Math.ceil(diffInHours)} hours`;
  } else {
    const diffInDays = Math.ceil(diffInHours / 24);
    return `Expires in ${diffInDays} days`;
  }
}

// Check if a share link is expired
export function isShareExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

// Get default expiry date (7 days from now)
function getDefaultExpiryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

// Get authentication token (placeholder - should be implemented based on auth system)
async function getAuthToken(): Promise<string> {
  // This should be implemented to get the actual auth token
  // For now, returning empty string as placeholder
  return "";
}

// Generate a shareable URL for email sharing
export function generateEmailShareUrl(token: string): string {
  return `${globalThis.location?.origin || "http://localhost:8000"}/share/email/${token}`;
}

// Create email share session (similar to paint app pattern)
export async function createEmailShare(
  storageObject: StorageObject,
  emails: string[],
  message?: string,
  expiresIn: number = 168, // 7 days in hours
): Promise<{
  success: boolean;
  sessionId?: string;
  recipients?: Array<{
    email: string;
    token: string;
    status: "pending" | "sent" | "failed";
  }>;
  error?: string;
}> {
  try {
    const response = await fetch(`${config.apiUrl}/api/v1/storage/share/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        objectId: storageObject.id,
        emails,
        message,
        expiresIn,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create email share: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating email share:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create email share",
    };
  }
}
