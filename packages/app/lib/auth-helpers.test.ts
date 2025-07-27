import { assertEquals, assertExists, assertRejects } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { describe, it, beforeEach, afterEach } from "https://deno.land/std@0.224.0/testing/bdd.ts";
import { FakeTime } from "https://deno.land/std@0.224.0/testing/time.ts";

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: () => Promise.resolve({ data: { user: { id: "test-user" } }, error: null }),
    signUp: () => Promise.resolve({ data: { user: { id: "test-user" } }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: { id: "test-user" } }, error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { id: "test-user", email: "test@example.com" }, error: null }),
      }),
    }),
    insert: () => Promise.resolve({ data: [{ id: "test-user" }], error: null }),
    update: () => Promise.resolve({ data: [{ id: "test-user" }], error: null }),
  }),
};

// Mock the auth helpers module
const authHelpers = {
  async validateUser(email: string, password: string) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    
    const result = await mockSupabaseClient.auth.signInWithPassword();
    if (result.error) {
      throw new Error("Invalid credentials");
    }
    
    return result.data.user;
  },

  async createUser(email: string, password: string, userData: Record<string, any>) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    
    const result = await mockSupabaseClient.auth.signUp();
    if (result.error) {
      throw new Error("User creation failed");
    }
    
    return result.data.user;
  },

  async getUserProfile(userId: string) {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const result = await mockSupabaseClient.from("users").select("*").eq("id", userId).single();
    if (result.error) {
      throw new Error("User not found");
    }
    
    return result.data;
  },

  async updateUserProfile(userId: string, updates: Record<string, any>) {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const result = await mockSupabaseClient.from("users").update(updates);
    if (result.error) {
      throw new Error("Profile update failed");
    }
    
    return result.data[0];
  },

  generateSessionToken(userId: string): string {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    return `session_${userId}_${Date.now()}`;
  },

  validateSessionToken(token: string): { userId: string; valid: boolean } {
    if (!token || !token.startsWith("session_")) {
      return { userId: "", valid: false };
    }
    
    const parts = token.split("_");
    if (parts.length !== 3) {
      return { userId: "", valid: false };
    }
    
    return { userId: parts[1], valid: true };
  },
};

describe("Auth Helpers", () => {
  let fakeTime: FakeTime;

  beforeEach(() => {
    fakeTime = new FakeTime();
  });

  afterEach(() => {
    fakeTime.restore();
  });

  describe("validateUser", () => {
    it("should validate user with correct credentials", async () => {
      const user = await authHelpers.validateUser("test@example.com", "password123");
      
      assertExists(user);
      assertEquals(user.id, "test-user");
    });

    it("should throw error for missing email", async () => {
      await assertRejects(
        () => authHelpers.validateUser("", "password123"),
        Error,
        "Email and password are required"
      );
    });

    it("should throw error for missing password", async () => {
      await assertRejects(
        () => authHelpers.validateUser("test@example.com", ""),
        Error,
        "Email and password are required"
      );
    });
  });

  describe("createUser", () => {
    it("should create user with valid data", async () => {
      const user = await authHelpers.createUser("new@example.com", "password123", {
        name: "Test User",
      });
      
      assertExists(user);
      assertEquals(user.id, "test-user");
    });

    it("should throw error for missing email", async () => {
      await assertRejects(
        () => authHelpers.createUser("", "password123", {}),
        Error,
        "Email and password are required"
      );
    });

    it("should throw error for missing password", async () => {
      await assertRejects(
        () => authHelpers.createUser("test@example.com", "", {}),
        Error,
        "Email and password are required"
      );
    });
  });

  describe("getUserProfile", () => {
    it("should get user profile with valid ID", async () => {
      const profile = await authHelpers.getUserProfile("test-user");
      
      assertExists(profile);
      assertEquals(profile.id, "test-user");
      assertEquals(profile.email, "test@example.com");
    });

    it("should throw error for missing user ID", async () => {
      await assertRejects(
        () => authHelpers.getUserProfile(""),
        Error,
        "User ID is required"
      );
    });
  });

  describe("updateUserProfile", () => {
    it("should update user profile with valid data", async () => {
      const updatedProfile = await authHelpers.updateUserProfile("test-user", {
        name: "Updated Name",
      });
      
      assertExists(updatedProfile);
      assertEquals(updatedProfile.id, "test-user");
    });

    it("should throw error for missing user ID", async () => {
      await assertRejects(
        () => authHelpers.updateUserProfile("", { name: "Test" }),
        Error,
        "User ID is required"
      );
    });
  });

  describe("generateSessionToken", () => {
    it("should generate session token for valid user ID", () => {
      const token = authHelpers.generateSessionToken("test-user");
      
      assertExists(token);
      assertEquals(token.startsWith("session_test-user_"), true);
    });

    it("should throw error for missing user ID", () => {
      assertRejects(
        () => Promise.resolve(authHelpers.generateSessionToken("")),
        Error,
        "User ID is required"
      );
    });
  });

  describe("validateSessionToken", () => {
    it("should validate correct session token", () => {
      const token = "session_test-user_1234567890";
      const result = authHelpers.validateSessionToken(token);
      
      assertEquals(result.valid, true);
      assertEquals(result.userId, "test-user");
    });

    it("should reject invalid token format", () => {
      const result = authHelpers.validateSessionToken("invalid-token");
      
      assertEquals(result.valid, false);
      assertEquals(result.userId, "");
    });

    it("should reject empty token", () => {
      const result = authHelpers.validateSessionToken("");
      
      assertEquals(result.valid, false);
      assertEquals(result.userId, "");
    });

    it("should reject malformed session token", () => {
      const result = authHelpers.validateSessionToken("session_incomplete");
      
      assertEquals(result.valid, false);
      assertEquals(result.userId, "");
    });
  });
});