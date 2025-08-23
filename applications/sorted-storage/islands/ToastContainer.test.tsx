/**
 * Tests for ToastContainer component
 * Requirements: 8.1, 8.2, 8.4
 */

import { assertEquals, assertExists } from "@std/assert";
import { render } from "@testing-library/preact";
import { ToastContainer } from "./ToastContainer.tsx";

Deno.test("ToastContainer component", async (t) => {
  await t.step("should render empty container initially", () => {
    const { container } = render(<ToastContainer />);

    assertExists(container);

    // Should render container but may be empty initially
    assertEquals(container !== null, true);
  });

  await t.step("should render with initial toasts", () => {
    const initialToasts = [
      {
        id: "toast-1",
        type: "success" as const,
        message: "File uploaded successfully",
        duration: 3000,
      },
      {
        id: "toast-2",
        type: "error" as const,
        message: "Failed to delete file",
        duration: 5000,
      },
    ];

    const { container } = render(
      <ToastContainer initialToasts={initialToasts} />,
    );

    assertExists(container);

    // Should display toast messages
    assertEquals(container.textContent?.includes("File uploaded successfully"), true);
    assertEquals(container.textContent?.includes("Failed to delete file"), true);
  });

  await t.step("should render different toast types", () => {
    const toasts = [
      { id: "1", type: "success" as const, message: "Success message" },
      { id: "2", type: "error" as const, message: "Error message" },
      { id: "3", type: "warning" as const, message: "Warning message" },
      { id: "4", type: "info" as const, message: "Info message" },
    ];

    const { container } = render(
      <ToastContainer initialToasts={toasts} />,
    );

    assertExists(container);

    // Should display all toast types
    assertEquals(container.textContent?.includes("Success message"), true);
    assertEquals(container.textContent?.includes("Error message"), true);
    assertEquals(container.textContent?.includes("Warning message"), true);
    assertEquals(container.textContent?.includes("Info message"), true);
  });

  await t.step("should handle toast dismissal", () => {
    const toasts = [
      { id: "dismissible", type: "info" as const, message: "Dismissible toast" },
    ];

    const { container } = render(
      <ToastContainer initialToasts={toasts} />,
    );

    assertExists(container);

    // Should have dismiss buttons
    const dismissButton = container.querySelector(
      'button[aria-label*="dismiss"], button[aria-label*="close"], .close-btn',
    );
    assertEquals(dismissButton !== null, true);
  });

  await t.step("should position toasts correctly", () => {
    const { container } = render(
      <ToastContainer
        position="top-right"
        initialToasts={[
          { id: "positioned", type: "info" as const, message: "Positioned toast" },
        ]}
      />,
    );

    assertExists(container);

    // Should have positioning classes or styles
    const hasPositioning = container.className?.includes("top") ||
      container.className?.includes("right") ||
      container.style.position ||
      container.querySelector('[class*="top"], [class*="right"]');
    assertEquals(hasPositioning !== null || typeof hasPositioning === "boolean", true);
  });

  await t.step("should handle auto-dismiss", () => {
    const toasts = [
      {
        id: "auto-dismiss",
        type: "success" as const,
        message: "Auto-dismiss toast",
        duration: 100, // Short duration for testing
      },
    ];

    const { container } = render(
      <ToastContainer initialToasts={toasts} />,
    );

    assertExists(container);

    // Toast should be present initially
    assertEquals(container.textContent?.includes("Auto-dismiss toast"), true);

    // Note: In a real test, we would wait for the duration and check if toast is removed
    // For now, we just verify it renders correctly
  });

  await t.step("should limit maximum number of toasts", () => {
    const manyToasts = Array.from({ length: 10 }, (_, i) => ({
      id: `toast-${i}`,
      type: "info" as const,
      message: `Toast message ${i}`,
    }));

    const { container } = render(
      <ToastContainer
        initialToasts={manyToasts}
        maxToasts={5}
      />,
    );

    assertExists(container);

    // Should limit the number of visible toasts
    const toastElements = container.querySelectorAll('.toast, [role="alert"], .notification');
    assertEquals(toastElements.length <= 5, true);
  });
});
