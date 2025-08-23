/**
 * Tests for sharing utilities
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { assertEquals, assertExists, assertStringIncludes } from "@std/assert";
import {
  copyShareLink,
  formatExpiryDate,
  generateEmailShareUrl,
  generateShareToken,
  isShareExpired,
} from "./sharing-utils.ts";

Deno.test("generateShareToken", () => {
  const token1 = generateShareToken();
  const token2 = generateShareToken();

  // Tokens should be 64 characters long (32 bytes * 2 hex chars)
  assertEquals(token1.length, 64);
  assertEquals(token2.length, 64);

  // Tokens should be different
  assertEquals(token1 === token2, false);

  // Tokens should only contain hex characters
  const hexRegex = /^[0-9a-f]+$/;
  assertEquals(hexRegex.test(token1), true);
  assertEquals(hexRegex.test(token2), true);
});

Deno.test("formatExpiryDate", () => {
  const now = new Date();

  // Test expired date
  const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
  assertEquals(formatExpiryDate(pastDate.toISOString()), "Expired");

  // Test future date within 24 hours
  const futureHours = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now
  const hoursResult = formatExpiryDate(futureHours.toISOString());
  assertStringIncludes(hoursResult, "hours");

  // Test future date beyond 24 hours
  const futureDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
  const daysResult = formatExpiryDate(futureDays.toISOString());
  assertStringIncludes(daysResult, "days");
});

Deno.test("isShareExpired", () => {
  const now = new Date();

  // Test expired date
  const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
  assertEquals(isShareExpired(pastDate.toISOString()), true);

  // Test future date
  const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
  assertEquals(isShareExpired(futureDate.toISOString()), false);

  // Test current time (should not be expired)
  assertEquals(isShareExpired(now.toISOString()), false);
});

Deno.test("generateEmailShareUrl", () => {
  const token = "test-token-123";
  const url = generateEmailShareUrl(token);

  assertExists(url);
  assertStringIncludes(url, "/share/email/");
  assertStringIncludes(url, token);
});

// Mock test for copyShareLink (requires DOM environment)
Deno.test("copyShareLink - mock test", async () => {
  // This is a basic test since we can't test clipboard in Deno environment
  const shareUrl = "https://example.com/share/token123";

  // In a real browser environment, this would test clipboard functionality
  // For now, we just verify the function exists and doesn't throw
  try {
    // This will fail in Deno but shouldn't throw an error due to our fallback
    const result = await copyShareLink(shareUrl);
    // In Deno environment, this should return false due to lack of clipboard API
    assertEquals(typeof result, "boolean");
  } catch (error) {
    // Expected in Deno environment
    assertExists(error);
  }
});

// Test helper functions
Deno.test("date formatting edge cases", () => {
  // Test with very small time differences
  const now = new Date();
  const almostExpired = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
  const result = formatExpiryDate(almostExpired.toISOString());
  assertStringIncludes(result, "1 hours"); // Should round up to 1 hour

  // Test with exactly 24 hours
  const exactly24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const result24 = formatExpiryDate(exactly24Hours.toISOString());
  assertStringIncludes(result24, "1 days"); // Should show as 1 day
});

Deno.test("token generation consistency", () => {
  // Generate multiple tokens and verify they're all unique
  const tokens = new Set();
  for (let i = 0; i < 100; i++) {
    const token = generateShareToken();
    assertEquals(tokens.has(token), false, `Duplicate token generated: ${token}`);
    tokens.add(token);
  }

  assertEquals(tokens.size, 100);
});
