import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { afterEach, beforeEach, describe, it } from "https://deno.land/std@0.224.0/testing/bdd.ts";
import { getPackageUrl } from "./test-urls.ts";

// Mock HTTP client for cross-package communication
class MockHttpClient {
  private responses: Map<string, any> = new Map();

  setMockResponse(url: string, response: any) {
    this.responses.set(url, response);
  }

  async fetch(url: string, options?: RequestInit): Promise<Response> {
    const mockResponse = this.responses.get(url);

    if (!mockResponse) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Mock authentication service integration
const authServiceIntegration = {
  async validateUserToken(token: string): Promise<{
    valid: boolean;
    user?: { id: string; email: string; name: string };
    error?: string;
  }> {
    const httpClient = new MockHttpClient();

    // Mock successful token validation
    httpClient.setMockResponse(getPackageUrl("PROFILE", "/oauth/validate"), {
      valid: true,
      user: {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      },
    });

    try {
      const response = await httpClient.fetch(getPackageUrl("PROFILE", "/oauth/validate"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { valid: false, error: data.error || "Token validation failed" };
      }

      return data;
    } catch (error) {
      return { valid: false, error: "Authentication service unavailable" };
    }
  },

  async getUserInfo(token: string): Promise<
    {
      id: string;
      email: string;
      name: string;
      avatar?: string;
    } | null
  > {
    const httpClient = new MockHttpClient();

    // Mock user info response
    httpClient.setMockResponse(getPackageUrl("PROFILE", "/oauth/userinfo"), {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      avatar: "https://example.com/avatar.jpg",
    });

    try {
      const response = await httpClient.fetch(getPackageUrl("PROFILE", "/oauth/userinfo"), {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      return null;
    }
  },

  generateLoginUrl(redirectUri: string, state?: string): string {
    const url = new URL(getPackageUrl("PROFILE", "/oauth/authorize"));
    url.searchParams.set("client_id", "store-client");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", "openid profile email");

    if (state) {
      url.searchParams.set("state", state);
    }

    return url.toString();
  },
};

// Mock store service that requires authentication
const storeService = {
  async createApplication(spec: any, userToken: string): Promise<{
    success: boolean;
    generationId?: string;
    error?: string;
  }> {
    // Validate user token first
    const tokenValidation = await authServiceIntegration.validateUserToken(userToken);

    if (!tokenValidation.valid) {
      return {
        success: false,
        error: tokenValidation.error || "Invalid authentication",
      };
    }

    // Simulate application creation
    return {
      success: true,
      generationId: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  },

  async getUserApplications(userToken: string): Promise<{
    success: boolean;
    applications?: Array<{
      id: string;
      name: string;
      status: string;
      createdAt: Date;
    }>;
    error?: string;
  }> {
    // Validate user token first
    const tokenValidation = await authServiceIntegration.validateUserToken(userToken);

    if (!tokenValidation.valid) {
      return {
        success: false,
        error: tokenValidation.error || "Invalid authentication",
      };
    }

    // Return mock applications for the user
    return {
      success: true,
      applications: [
        {
          id: "gen_123_abc",
          name: "My Portfolio",
          status: "completed",
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
        },
        {
          id: "gen_456_def",
          name: "Business App",
          status: "generating",
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        },
      ],
    };
  },

  async requireAuthentication(request: Request): Promise<{
    authenticated: boolean;
    user?: { id: string; email: string; name: string };
    redirectUrl?: string;
  }> {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        authenticated: false,
        redirectUrl: authServiceIntegration.generateLoginUrl(
          getPackageUrl("STORE", "/auth/callback"),
          "random-state-123",
        ),
      };
    }

    const token = authHeader.substring(7);
    const tokenValidation = await authServiceIntegration.validateUserToken(token);

    if (!tokenValidation.valid) {
      return {
        authenticated: false,
        redirectUrl: authServiceIntegration.generateLoginUrl(
          getPackageUrl("STORE", "/auth/callback"),
          "random-state-123",
        ),
      };
    }

    return {
      authenticated: true,
      user: tokenValidation.user,
    };
  },
};

describe("Cross-Package Integration", () => {
  describe("Authentication Service Integration", () => {
    it("should validate user token successfully", async () => {
      const result = await authServiceIntegration.validateUserToken("valid-token-123");

      assertEquals(result.valid, true);
      assertExists(result.user);
      assertEquals(result.user!.id, "user-123");
      assertEquals(result.user!.email, "test@example.com");
    });

    it("should get user info with valid token", async () => {
      const userInfo = await authServiceIntegration.getUserInfo("valid-token-123");

      assertExists(userInfo);
      assertEquals(userInfo.id, "user-123");
      assertEquals(userInfo.email, "test@example.com");
      assertEquals(userInfo.name, "Test User");
    });

    it("should generate correct login URL", () => {
      const loginUrl = authServiceIntegration.generateLoginUrl(
        getPackageUrl("STORE", "/auth/callback"),
        "test-state",
      );

      const url = new URL(loginUrl);
      assertEquals(url.hostname, "localhost");
      assertEquals(url.port, "8001");
      assertEquals(url.pathname, "/oauth/authorize");
      assertEquals(url.searchParams.get("client_id"), "store-client");
      assertEquals(url.searchParams.get("redirect_uri"), "http://localhost:8000/auth/callback");
      assertEquals(url.searchParams.get("state"), "test-state");
    });
  });

  describe("Store Service with Authentication", () => {
    it("should create application with valid authentication", async () => {
      const spec = {
        name: "Test App",
        template: "fresh-basic",
        features: ["routing"],
      };

      const result = await storeService.createApplication(spec, "valid-token-123");

      assertEquals(result.success, true);
      assertExists(result.generationId);
      assertEquals(result.generationId!.startsWith("gen_"), true);
    });

    it("should reject application creation with invalid token", async () => {
      const spec = {
        name: "Test App",
        template: "fresh-basic",
        features: ["routing"],
      };

      const result = await storeService.createApplication(spec, "invalid-token");

      assertEquals(result.success, false);
      assertExists(result.error);
    });

    it("should get user applications with valid authentication", async () => {
      const result = await storeService.getUserApplications("valid-token-123");

      assertEquals(result.success, true);
      assertExists(result.applications);
      assertEquals(result.applications!.length, 2);
      assertEquals(result.applications![0].name, "My Portfolio");
      assertEquals(result.applications![1].name, "Business App");
    });

    it("should reject getting applications with invalid token", async () => {
      const result = await storeService.getUserApplications("invalid-token");

      assertEquals(result.success, false);
      assertExists(result.error);
    });
  });

  describe("Authentication Middleware", () => {
    it("should authenticate request with valid bearer token", async () => {
      const request = new Request(getPackageUrl("STORE", "/api/applications"), {
        headers: {
          "Authorization": "Bearer valid-token-123",
        },
      });

      const result = await storeService.requireAuthentication(request);

      assertEquals(result.authenticated, true);
      assertExists(result.user);
      assertEquals(result.user!.id, "user-123");
    });

    it("should redirect unauthenticated request", async () => {
      const request = new Request(getPackageUrl("STORE", "/api/applications"));

      const result = await storeService.requireAuthentication(request);

      assertEquals(result.authenticated, false);
      assertExists(result.redirectUrl);
      assertEquals(result.redirectUrl!.includes(getPackageUrl("PROFILE").replace("http://", "")), true);
      assertEquals(result.redirectUrl!.includes("/oauth/authorize"), true);
    });

    it("should redirect request with invalid token", async () => {
      const request = new Request(getPackageUrl("STORE", "/api/applications"), {
        headers: {
          "Authorization": "Bearer invalid-token",
        },
      });

      const result = await storeService.requireAuthentication(request);

      assertEquals(result.authenticated, false);
      assertExists(result.redirectUrl);
    });

    it("should redirect request with malformed authorization header", async () => {
      const request = new Request(getPackageUrl("STORE", "/api/applications"), {
        headers: {
          "Authorization": "InvalidFormat token-123",
        },
      });

      const result = await storeService.requireAuthentication(request);

      assertEquals(result.authenticated, false);
      assertExists(result.redirectUrl);
    });
  });

  describe("OAuth Flow Integration", () => {
    it("should handle complete OAuth flow between packages", async () => {
      // Step 1: Generate authorization URL
      const authUrl = authServiceIntegration.generateLoginUrl(
        getPackageUrl("STORE", "/auth/callback"),
        "oauth-state-123",
      );

      assertExists(authUrl);
      assertEquals(authUrl.includes(getPackageUrl("PROFILE").replace("http://", "")), true);

      // Step 2: Simulate successful authentication (would happen in app package)
      const mockAuthCode = "auth_code_123";

      // Step 3: Simulate token exchange (would happen in store package callback)
      const mockTokenResponse = {
        access_token: "access_token_123",
        refresh_token: "refresh_token_123",
        expires_in: 3600,
        token_type: "Bearer",
      };

      // Step 4: Validate token and get user info
      const userInfo = await authServiceIntegration.getUserInfo(mockTokenResponse.access_token);

      assertExists(userInfo);
      assertEquals(userInfo.id, "user-123");

      // Step 5: Use token for authenticated store operations
      const applications = await storeService.getUserApplications(mockTokenResponse.access_token);

      assertEquals(applications.success, true);
      assertExists(applications.applications);
    });
  });
});
