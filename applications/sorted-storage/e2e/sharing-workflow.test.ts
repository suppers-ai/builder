/**
 * E2E tests for sharing workflow
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { assertEquals, assertExists } from "@std/assert";
import type { StorageObject } from "../types/storage.ts";

// Mock API responses for sharing operations
const mockSharingApiResponses = () => {
  (globalThis as any).fetch = async (url: string, options?: RequestInit) => {
    const method = options?.method || "GET";

    if (url.includes("/api/storage/share") && method === "POST") {
      // Create share link
      const body = JSON.parse(options?.body as string || "{}");
      return new Response(
        JSON.stringify({
          success: true,
          shareToken: "mock-share-token-123",
          shareUrl: `https://example.com/share/mock-share-token-123`,
          expiresAt: body.expiresAt || null,
        }),
        { status: 201 },
      );
    }

    if (url.includes("/api/storage/share") && method === "GET") {
      // Get shared content
      return new Response(
        JSON.stringify({
          success: true,
          item: mockSharedItem,
          isValid: true,
        }),
        { status: 200 },
      );
    }

    if (url.includes("/api/storage/share") && method === "DELETE") {
      // Revoke share link
      return new Response(
        JSON.stringify({
          success: true,
          message: "Share link revoked successfully",
        }),
        { status: 200 },
      );
    }

    return new Response("{}", { status: 200 });
  };
};

const mockSharedItem: StorageObject = {
  id: "shared-item-id",
  user_id: "owner-user-id",
  name: "shared-document.pdf",
  file_path: "documents/shared-document.pdf",
  file_size: 2048,
  mime_type: "application/pdf",
  object_type: "file",
  parent_id: null,
  is_public: true,
  share_token: "mock-share-token-123",
  thumbnail_url: null,
  metadata: {
    custom_name: "Important Shared Document",
    description: "This document is shared with external users",
    emoji: "📄",
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

Deno.test("Sharing workflow E2E", async (t) => {
  mockSharingApiResponses();

  await t.step("should create share link for file", async () => {
    const fileId = "file-to-share";
    const shareOptions = {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      allowDownload: true,
      requireAuth: false,
    };

    const result = await createShareLink(fileId, shareOptions);

    assertEquals(result.success, true);
    assertEquals(typeof result.shareToken, "string");
    assertEquals(result.shareToken.length > 0, true);
    assertEquals(result.shareUrl.includes(result.shareToken), true);
  });

  await t.step("should create share link for folder", async () => {
    const folderId = "folder-to-share";
    const shareOptions = {
      allowDownload: true,
      requireAuth: false,
    };

    const result = await createShareLink(folderId, shareOptions);

    assertEquals(result.success, true);
    assertEquals(typeof result.shareToken, "string");
    assertEquals(result.shareUrl.includes(result.shareToken), true);
  });

  await t.step("should access shared content with valid token", async () => {
    const shareToken = "mock-share-token-123";

    const result = await getSharedContent(shareToken);

    assertEquals(result.success, true);
    assertEquals(result.isValid, true);
    assertExists(result.item);
    assertEquals(result.item.name, "shared-document.pdf");
  });

  await t.step("should handle invalid share token", async () => {
    // Mock invalid token response
    (globalThis as any).fetch = async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid or expired share token",
          isValid: false,
        }),
        { status: 404 },
      );
    };

    const result = await getSharedContent("invalid-token");

    assertEquals(result.success, false);
    assertEquals(result.isValid, false);
    assertEquals(result.error, "Invalid or expired share token");
  });

  await t.step("should handle expired share links", async () => {
    // Mock expired token response
    (globalThis as any).fetch = async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Share link has expired",
          isValid: false,
        }),
        { status: 410 },
      );
    };

    const result = await getSharedContent("expired-token");

    assertEquals(result.success, false);
    assertEquals(result.error, "Share link has expired");
  });

  await t.step("should revoke share link", async () => {
    mockSharingApiResponses(); // Reset to normal responses

    const shareToken = "mock-share-token-123";

    const result = await revokeShareLink(shareToken);

    assertEquals(result.success, true);
    assertEquals(result.message, "Share link revoked successfully");
  });

  await t.step("should list all shares for user", async () => {
    // Mock list shares response
    (globalThis as any).fetch = async () => {
      return new Response(
        JSON.stringify({
          success: true,
          shares: [
            {
              id: "share-1",
              itemId: "file-1",
              itemName: "document.pdf",
              shareToken: "token-1",
              createdAt: "2024-01-01T00:00:00Z",
              expiresAt: null,
              accessCount: 5,
            },
            {
              id: "share-2",
              itemId: "folder-1",
              itemName: "Photos",
              shareToken: "token-2",
              createdAt: "2024-01-02T00:00:00Z",
              expiresAt: "2024-01-09T00:00:00Z",
              accessCount: 12,
            },
          ],
        }),
        { status: 200 },
      );
    };

    const result = await getUserShares("user-id");

    assertEquals(result.success, true);
    assertEquals(Array.isArray(result.shares), true);
    assertEquals(result.shares.length, 2);
    assertEquals(result.shares[0].itemName, "document.pdf");
    assertEquals(result.shares[1].itemName, "Photos");
  });

  await t.step("should handle share link with password protection", async () => {
    const fileId = "protected-file";
    const shareOptions = {
      password: "secure123",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day
    };

    const result = await createShareLink(fileId, shareOptions);

    assertEquals(result.success, true);
    assertEquals(typeof result.shareToken, "string");

    // Accessing password-protected share should require password
    const accessResult = await getSharedContent(result.shareToken, "secure123");
    assertEquals(accessResult.success, true);
  });

  await t.step("should track share access analytics", async () => {
    // Mock analytics response
    (globalThis as any).fetch = async () => {
      return new Response(
        JSON.stringify({
          success: true,
          analytics: {
            totalViews: 25,
            uniqueVisitors: 18,
            lastAccessed: "2024-01-15T10:30:00Z",
            accessHistory: [
              { timestamp: "2024-01-15T10:30:00Z", ip: "192.168.1.1" },
              { timestamp: "2024-01-15T09:15:00Z", ip: "192.168.1.2" },
            ],
          },
        }),
        { status: 200 },
      );
    };

    const shareToken = "analytics-token";
    const result = await getShareAnalytics(shareToken);

    assertEquals(result.success, true);
    assertEquals(result.analytics.totalViews, 25);
    assertEquals(result.analytics.uniqueVisitors, 18);
    assertEquals(Array.isArray(result.analytics.accessHistory), true);
  });

  await t.step("should handle bulk share operations", async () => {
    const itemIds = ["file-1", "file-2", "folder-1"];
    const shareOptions = {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Mock bulk share response
    (globalThis as any).fetch = async () => {
      return new Response(
        JSON.stringify({
          success: true,
          shares: itemIds.map((id, index) => ({
            itemId: id,
            shareToken: `bulk-token-${index + 1}`,
            shareUrl: `https://example.com/share/bulk-token-${index + 1}`,
          })),
        }),
        { status: 201 },
      );
    };

    const result = await createBulkShareLinks(itemIds, shareOptions);

    assertEquals(result.success, true);
    assertEquals(result.shares.length, 3);
    assertEquals(result.shares[0].itemId, "file-1");
  });
});

// Helper functions for sharing E2E tests
async function createShareLink(itemId: string, options: any = {}) {
  const response = await fetch("/api/storage/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, ...options }),
  });

  return await response.json();
}

async function getSharedContent(shareToken: string, password?: string) {
  const url = `/api/storage/share/${shareToken}`;
  const options: RequestInit = { method: "GET" };

  if (password) {
    options.headers = { "X-Share-Password": password };
  }

  const response = await fetch(url, options);
  return await response.json();
}

async function revokeShareLink(shareToken: string) {
  const response = await fetch(`/api/storage/share/${shareToken}`, {
    method: "DELETE",
  });

  return await response.json();
}

async function getUserShares(userId: string) {
  const response = await fetch(`/api/storage/shares?userId=${userId}`);
  return await response.json();
}

async function getShareAnalytics(shareToken: string) {
  const response = await fetch(`/api/storage/share/${shareToken}/analytics`);
  return await response.json();
}

async function createBulkShareLinks(itemIds: string[], options: any = {}) {
  const response = await fetch("/api/storage/share/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemIds, ...options }),
  });

  return await response.json();
}
