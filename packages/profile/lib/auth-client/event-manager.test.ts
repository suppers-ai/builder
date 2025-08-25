import { assertEquals, assertThrows } from "@std/assert";
import { EventManager } from "./event-manager.ts";
import type { AuthEventType, AuthEventCallback } from "@suppers/shared/types";

Deno.test("EventManager - Basic functionality", async (t) => {
  await t.step("should add and remove event listeners", () => {
    const eventManager = new EventManager();
    const callback: AuthEventCallback = () => {};

    // Initially no listeners
    assertEquals(eventManager.getListenerCount("login"), 0);
    assertEquals(eventManager.hasListeners("login"), false);

    // Add listener
    eventManager.addEventListener("login", callback);
    assertEquals(eventManager.getListenerCount("login"), 1);
    assertEquals(eventManager.hasListeners("login"), true);

    // Remove listener
    eventManager.removeEventListener("login", callback);
    assertEquals(eventManager.getListenerCount("login"), 0);
    assertEquals(eventManager.hasListeners("login"), false);
  });

  await t.step("should prevent duplicate callbacks", () => {
    const eventManager = new EventManager();
    const callback: AuthEventCallback = () => {};

    eventManager.addEventListener("login", callback);
    eventManager.addEventListener("login", callback);
    
    // Should only have one callback
    assertEquals(eventManager.getListenerCount("login"), 1);
  });

  await t.step("should emit events to all listeners", () => {
    const eventManager = new EventManager();
    let callCount = 0;
    let receivedEvent: AuthEventType | null = null;
    let receivedData: any = null;

    const callback1: AuthEventCallback = (event, data) => {
      callCount++;
      receivedEvent = event;
      receivedData = data;
    };

    const callback2: AuthEventCallback = () => {
      callCount++;
    };

    eventManager.addEventListener("login", callback1);
    eventManager.addEventListener("login", callback2);

    const testData = { session: { access_token: "test-token" } };
    eventManager.emitEvent("login", testData);

    assertEquals(callCount, 2);
    assertEquals(receivedEvent, "login");
    assertEquals(receivedData, testData);
  });

  await t.step("should handle callback errors gracefully", () => {
    const eventManager = new EventManager();
    let successCallbackCalled = false;

    const errorCallback: AuthEventCallback = () => {
      throw new Error("Test error");
    };

    const successCallback: AuthEventCallback = () => {
      successCallbackCalled = true;
    };

    eventManager.addEventListener("login", errorCallback);
    eventManager.addEventListener("login", successCallback);

    // Should not throw and should continue executing other callbacks
    eventManager.emitEvent("login");
    assertEquals(successCallbackCalled, true);
  });

  await t.step("should clean up empty callback arrays", () => {
    const eventManager = new EventManager();
    const callback: AuthEventCallback = () => {};

    eventManager.addEventListener("login", callback);
    assertEquals(eventManager.getRegisteredEvents().length, 1);

    eventManager.removeEventListener("login", callback);
    assertEquals(eventManager.getRegisteredEvents().length, 0);
  });

  await t.step("should remove all listeners", () => {
    const eventManager = new EventManager();
    const callback1: AuthEventCallback = () => {};
    const callback2: AuthEventCallback = () => {};

    eventManager.addEventListener("login", callback1);
    eventManager.addEventListener("logout", callback2);
    
    assertEquals(eventManager.getRegisteredEvents().length, 2);

    eventManager.removeAllListeners("login");
    assertEquals(eventManager.getListenerCount("login"), 0);
    assertEquals(eventManager.getListenerCount("logout"), 1);

    eventManager.removeAllListeners();
    assertEquals(eventManager.getRegisteredEvents().length, 0);
  });

  await t.step("should destroy cleanly", () => {
    const eventManager = new EventManager();
    const callback: AuthEventCallback = () => {};

    eventManager.addEventListener("login", callback);
    eventManager.addEventListener("logout", callback);
    
    assertEquals(eventManager.getRegisteredEvents().length, 2);

    eventManager.destroy();
    assertEquals(eventManager.getRegisteredEvents().length, 0);
  });
});

Deno.test("EventManager - Edge cases", async (t) => {
  await t.step("should handle removing non-existent callback", () => {
    const eventManager = new EventManager();
    const callback: AuthEventCallback = () => {};

    // Should not throw when removing non-existent callback
    eventManager.removeEventListener("login", callback);
    assertEquals(eventManager.getListenerCount("login"), 0);
  });

  await t.step("should handle emitting to non-existent event", () => {
    const eventManager = new EventManager();

    // Should not throw when emitting to event with no listeners
    eventManager.emitEvent("login");
    assertEquals(eventManager.getListenerCount("login"), 0);
  });

  await t.step("should handle multiple event types", () => {
    const eventManager = new EventManager();
    const loginCallback: AuthEventCallback = () => {};
    const logoutCallback: AuthEventCallback = () => {};

    eventManager.addEventListener("login", loginCallback);
    eventManager.addEventListener("logout", logoutCallback);
    eventManager.addEventListener("USER_UPDATED", loginCallback);

    assertEquals(eventManager.getRegisteredEvents().length, 3);
    assertEquals(eventManager.getListenerCount("login"), 1);
    assertEquals(eventManager.getListenerCount("logout"), 1);
    assertEquals(eventManager.getListenerCount("USER_UPDATED"), 1);
  });
});