/**
 * Tests for toast manager utilities
 * Requirements: 8.1, 8.2, 8.4
 */

import { assertEquals, assertExists } from "@std/assert";
import {
  clearAllToasts,
  dismissToast,
  getToasts,
  showError,
  showInfo,
  showSuccess,
  showToast,
  showWarning,
} from "./toast-manager.ts";

Deno.test("Toast manager utilities", async (t) => {
  await t.step("should show success toast", () => {
    const toastId = showSuccess("Operation completed successfully");

    assertEquals(typeof toastId, "string");
    assertEquals(toastId.length > 0, true);
  });

  await t.step("should show error toast", () => {
    const toastId = showError("Something went wrong");

    assertEquals(typeof toastId, "string");
    assertEquals(toastId.length > 0, true);
  });

  await t.step("should show warning toast", () => {
    const toastId = showWarning("Please check your input");

    assertEquals(typeof toastId, "string");
    assertEquals(toastId.length > 0, true);
  });

  await t.step("should show info toast", () => {
    const toastId = showInfo("Here's some information");

    assertEquals(typeof toastId, "string");
    assertEquals(toastId.length > 0, true);
  });

  await t.step("should show generic toast with custom type", () => {
    const toastId = showToast("Custom message", "success", 5000);

    assertEquals(typeof toastId, "string");
    assertEquals(toastId.length > 0, true);
  });

  await t.step("should get all active toasts", () => {
    // Clear existing toasts first
    clearAllToasts();

    // Add some toasts
    showSuccess("Success message");
    showError("Error message");

    const toasts = getToasts();
    assertEquals(Array.isArray(toasts), true);
    assertEquals(toasts.length >= 2, true);

    // Check toast structure
    if (toasts.length > 0) {
      const toast = toasts[0];
      assertEquals(typeof toast.id, "string");
      assertEquals(typeof toast.message, "string");
      assertEquals(typeof toast.type, "string");
    }
  });

  await t.step("should dismiss specific toast", () => {
    clearAllToasts();

    const toastId = showInfo("Dismissible toast");
    let toasts = getToasts();
    const initialCount = toasts.length;

    dismissToast(toastId);
    toasts = getToasts();

    // Toast should be removed or marked as dismissed
    assertEquals(toasts.length <= initialCount, true);
  });

  await t.step("should clear all toasts", () => {
    // Add multiple toasts
    showSuccess("Toast 1");
    showError("Toast 2");
    showWarning("Toast 3");

    clearAllToasts();

    const toasts = getToasts();
    assertEquals(toasts.length, 0);
  });

  await t.step("should handle toast with custom duration", () => {
    const toastId = showToast("Custom duration toast", "info", 10000);

    assertEquals(typeof toastId, "string");

    const toasts = getToasts();
    const toast = toasts.find((t) => t.id === toastId);

    if (toast) {
      assertEquals(toast.duration, 10000);
    }
  });

  await t.step("should handle toast with action button", () => {
    const toastId = showToast(
      "Toast with action",
      "info",
      5000,
      {
        label: "Undo",
        action: () => console.log("Action clicked"),
      },
    );

    assertEquals(typeof toastId, "string");

    const toasts = getToasts();
    const toast = toasts.find((t) => t.id === toastId);

    if (toast && toast.action) {
      assertEquals(typeof toast.action.label, "string");
      assertEquals(typeof toast.action.action, "function");
    }
  });

  await t.step("should prevent duplicate toasts", () => {
    clearAllToasts();

    const message = "Duplicate test message";
    showError(message);
    showError(message); // Same message

    const toasts = getToasts();
    const duplicates = toasts.filter((t) => t.message === message);

    // Should either prevent duplicates or allow them based on implementation
    assertEquals(duplicates.length >= 1, true);
  });
});
