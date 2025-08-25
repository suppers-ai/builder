import { assertEquals, assertExists } from "@std/assert";
import { 
  withTimeoutReject, 
  logError, 
  logInfo, 
  logWarning,
  isValidEmail,
  isValidPassword,
  sanitizeUserInput,
  handleSupabaseError
} from "./utils.ts";

Deno.test("Utils - Timeout Promise", async (t) => {
  await t.step("should resolve when promise completes within timeout", async () => {
    const fastPromise = Promise.resolve("success");
    const result = await withTimeoutReject(fastPromise, 1000);
    assertEquals(result, "success");
  });

  await t.step("should reject when promise times out", async () => {
    const slowPromise = new Promise(resolve => setTimeout(() => resolve("late"), 2000));
    
    try {
      await withTimeoutReject(slowPromise, 500);
    } catch (error) {
      assertEquals((error as Error).message.includes("timed out"), true);
    }
  });

  await t.step("should reject when original promise rejects", async () => {
    const failingPromise = Promise.reject(new Error("Original error"));
    
    try {
      await withTimeoutReject(failingPromise, 1000);
    } catch (error) {
      assertEquals((error as Error).message, "Original error");
    }
  });

  await t.step("should use custom timeout message", async () => {
    const slowPromise = new Promise(resolve => setTimeout(() => resolve("late"), 2000));
    
    try {
      await withTimeoutReject(slowPromise, 500, "Custom timeout message");
    } catch (error) {
      assertEquals((error as Error).message.includes("Custom timeout message"), true);
    }
  });
});

Deno.test("Utils - Logging Functions", async (t) => {
  // Mock console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  let logMessages: string[] = [];
  let warnMessages: string[] = [];
  let errorMessages: string[] = [];

  console.log = (...args) => logMessages.push(args.join(" "));
  console.warn = (...args) => warnMessages.push(args.join(" "));
  console.error = (...args) => errorMessages.push(args.join(" "));

  await t.step("should log info messages", () => {
    logInfo("TestModule", "Test message", { data: "test" });
    assertEquals(logMessages.length, 1);
    assertEquals(logMessages[0].includes("TestModule"), true);
    assertEquals(logMessages[0].includes("Test message"), true);
  });

  await t.step("should log warning messages", () => {
    logWarning("TestModule", "Warning message");
    assertEquals(warnMessages.length, 1);
    assertEquals(warnMessages[0].includes("TestModule"), true);
    assertEquals(warnMessages[0].includes("Warning message"), true);
  });

  await t.step("should log error messages", () => {
    logError("TestModule", "Error message", { error: new Error("Test error") });
    assertEquals(errorMessages.length, 1);
    assertEquals(errorMessages[0].includes("TestModule"), true);
    assertEquals(errorMessages[0].includes("Error message"), true);
  });

  await t.step("should handle logging without context", () => {
    logInfo("TestModule", "Simple message");
    logWarning("TestModule", "Simple warning");
    logError("TestModule", "Simple error");
    
    // Should not throw and should add to message arrays
    assertEquals(logMessages.length, 2);
    assertEquals(warnMessages.length, 2);
    assertEquals(errorMessages.length, 2);
  });

  // Restore console methods
  console.log = originalLog;
  console.warn = originalWarn;
  console.error = originalError;
});

Deno.test("Utils - Email Validation", async (t) => {
  await t.step("should validate correct email addresses", () => {
    assertEquals(isValidEmail("test@example.com"), true);
    assertEquals(isValidEmail("user.name@domain.co.uk"), true);
    assertEquals(isValidEmail("user+tag@example.org"), true);
    assertEquals(isValidEmail("123@example.com"), true);
  });

  await t.step("should reject invalid email addresses", () => {
    assertEquals(isValidEmail(""), false);
    assertEquals(isValidEmail("invalid"), false);
    assertEquals(isValidEmail("@example.com"), false);
    assertEquals(isValidEmail("test@"), false);
    assertEquals(isValidEmail("test.example.com"), false);
    assertEquals(isValidEmail("test@.com"), false);
    assertEquals(isValidEmail("test@example."), false);
  });

  await t.step("should handle edge cases", () => {
    assertEquals(isValidEmail("a@b.co"), true); // Minimum valid email
    assertEquals(isValidEmail("test@example-domain.com"), true); // Hyphen in domain
    assertEquals(isValidEmail("test@sub.example.com"), true); // Subdomain
    assertEquals(isValidEmail("test..test@example.com"), false); // Double dots
    assertEquals(isValidEmail("test@example..com"), false); // Double dots in domain
  });
});

Deno.test("Utils - Password Validation", async (t) => {
  await t.step("should validate acceptable passwords", () => {
    assertEquals(isValidPassword("Password123!").valid, true);
    assertEquals(isValidPassword("MySecure@Pass1").valid, true);
    assertEquals(isValidPassword("Complex#Pass99").valid, true);
    assertEquals(isValidPassword("simple123").valid, true); // Basic validation only checks length
  });

  await t.step("should reject short passwords", () => {
    assertEquals(isValidPassword("").valid, false);
    assertEquals(isValidPassword("short").valid, false);
    assertEquals(isValidPassword("12345").valid, false);
  });

  await t.step("should handle minimum length requirement", () => {
    assertEquals(isValidPassword("Pass1").valid, false); // Too short (5 chars)
    assertEquals(isValidPassword("Pass12").valid, true); // Minimum length (6 chars)
    assertEquals(isValidPassword("Pass123").valid, true); // Above minimum
  });

  await t.step("should provide error messages for invalid passwords", () => {
    const result = isValidPassword("short");
    assertEquals(result.valid, false);
    assertExists(result.message);
    assertEquals(result.message?.includes("6 characters"), true);
  });
});

Deno.test("Utils - User Input Sanitization", async (t) => {
  await t.step("should sanitize dangerous input", () => {
    assertEquals(sanitizeUserInput("<script>alert('xss')</script>"), "scriptalert('xss')/script");
    assertEquals(sanitizeUserInput("Hello <world>"), "Hello world");
    assertEquals(sanitizeUserInput("  trimmed  "), "trimmed");
  });

  await t.step("should preserve valid input", () => {
    assertEquals(sanitizeUserInput("Normal text"), "Normal text");
    assertEquals(sanitizeUserInput("Email@example.com"), "Email@example.com");
    assertEquals(sanitizeUserInput("User Name 123"), "User Name 123");
  });

  await t.step("should handle edge cases", () => {
    assertEquals(sanitizeUserInput(""), "");
    assertEquals(sanitizeUserInput("   "), "");
    assertEquals(sanitizeUserInput("<>"), "");
  });
});

Deno.test("Utils - Supabase Error Handling", async (t) => {
  await t.step("should handle common auth errors", () => {
    assertEquals(handleSupabaseError({ message: "Invalid login credentials" }), "Invalid email or password");
    assertEquals(handleSupabaseError({ message: "Email not confirmed" }), "Please check your email and click the confirmation link");
    assertEquals(handleSupabaseError({ message: "User already registered" }), "An account with this email already exists");
  });

  await t.step("should handle validation errors", () => {
    assertEquals(handleSupabaseError({ message: "Password should be at least 6 characters" }), "Password must be at least 6 characters long");
    assertEquals(handleSupabaseError({ message: "Invalid email format" }), "Please enter a valid email address");
  });

  await t.step("should handle network errors", () => {
    assertEquals(handleSupabaseError({ message: "Network timeout occurred" }), "Connection timeout. Please check your internet connection and try again.");
    assertEquals(handleSupabaseError({ message: "Connection failed" }), "Connection timeout. Please check your internet connection and try again.");
  });

  await t.step("should handle unknown errors", () => {
    assertEquals(handleSupabaseError(null), "An unexpected error occurred");
    assertEquals(handleSupabaseError({}), "An unexpected error occurred");
    assertEquals(handleSupabaseError({ message: "Some very long technical error message that contains pgrst and jwt tokens and other technical details that users shouldn't see" }), "An unexpected error occurred. Please try again.");
  });
});

Deno.test("Utils - Error Handling", async (t) => {
  await t.step("should handle errors in timeout promise", async () => {
    const errorPromise = Promise.reject(new Error("Network error"));
    
    try {
      await withTimeoutReject(errorPromise, 1000);
    } catch (error) {
      assertEquals((error as Error).message, "Network error");
    }
  });

  await t.step("should handle null/undefined inputs gracefully", () => {
    assertEquals(isValidEmail(null as any), false);
    assertEquals(isValidEmail(undefined as any), false);
    assertEquals(isValidPassword(null as any).valid, false);
    assertEquals(isValidPassword(undefined as any).valid, false);
    assertEquals(sanitizeUserInput(null as any), "");
    assertEquals(sanitizeUserInput(undefined as any), "");
  });

  await t.step("should handle non-string inputs", () => {
    assertEquals(isValidEmail(123 as any), false);
    assertEquals(isValidPassword(123 as any).valid, false);
    assertEquals(sanitizeUserInput(123 as any), "123");
  });
});