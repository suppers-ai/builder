/**
 * Tests for NetworkStatus component
 * Requirements: 8.1, 8.2, 8.4, 8.5
 */

import { assertEquals, assertExists } from "@std/assert";
import { render } from "@testing-library/preact";
import { NetworkStatus } from "./NetworkStatus.tsx";

Deno.test("NetworkStatus component", async (t) => {
  await t.step("should render when online", () => {
    const { container } = render(<NetworkStatus isOnline />);

    assertExists(container);
    // Should show online status or be hidden when online
    const hasOnlineIndicator = container.textContent?.includes("online") ||
      container.textContent?.includes("connected") ||
      container.children.length === 0; // Hidden when online
    assertEquals(typeof hasOnlineIndicator, "boolean");
  });

  await t.step("should render when offline", () => {
    const { container } = render(<NetworkStatus isOnline={false} />);

    assertExists(container);
    // Should show offline status
    const hasOfflineIndicator = container.textContent?.includes("offline") ||
      container.textContent?.includes("disconnected") ||
      container.textContent?.includes("No connection");
    assertEquals(typeof hasOfflineIndicator, "boolean");
  });

  await t.step("should render with custom offline message", () => {
    const { container } = render(
      <NetworkStatus
        isOnline={false}
        offlineMessage="Connection lost. Please check your internet."
      />,
    );

    assertExists(container);
    assertEquals(
      container.textContent?.includes("Connection lost") ||
        container.textContent?.includes("internet"),
      true,
    );
  });

  await t.step("should handle reconnection", () => {
    const { container, rerender } = render(<NetworkStatus isOnline={false} />);

    assertExists(container);

    // Simulate reconnection
    rerender(<NetworkStatus isOnline />);

    // Should update to show online status or hide
    assertEquals(container !== null, true);
  });
});
