import {
  assertEquals,
  assertExists,
  assertRejects,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { afterEach, beforeEach, describe, it } from "https://deno.land/std@0.224.0/testing/bdd.ts";
import { FakeTime } from "https://deno.land/std@0.224.0/testing/time.ts";

// Mock database types
interface MockOAuthClient {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  name: string;
}

interface MockOAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at: Date;
  user_id: string;
  client_id: string;
  scope: string;
}

// Mock OAuth service
const oauthService = {
  async validateClient(clientId: string, clientSecret?: string): Promise<MockOAuthClient | null> {
    if (clientId === "valid-client") {
      return {
        client_id: "valid-client",
        client_secret: "valid-secret",
        redirect_uris: ["http://localhost:3000/callback"],
        name: "Test Client",
      };
    }
    return null;
  },

  generateAuthorizationCode(clientId: string, userId: string, scope: string): string {
    return `auth_code_${clientId}_${userId}_${Date.now()}`;
  },

  async validateAuthorizationCode(code: string): Promise<
    {
      client_id: string;
      user_id: string;
      scope: string;
      expires_at: Date;
    } | null
  > {
    if (code.startsWith("auth_code_")) {
      const parts = code.split("_");
      return {
        client_id: parts[2],
        user_id: parts[3],
        scope: "openid profile email",
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      };
    }
    return null;
  },

  async generateTokens(clientId: string, userId: string, scope: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    const accessToken = `access_${clientId}_${userId}_${Date.now()}`;
    const refreshToken = `refresh_${clientId}_${userId}_${Date.now()}`;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600, // 1 hour
      token_type: "Bearer",
    };
  },

  async validateAccessToken(token: string): Promise<{
    user_id: string;
    client_id: string;
    scope: string;
    valid: boolean;
  }> {
    if (token.startsWith("access_")) {
      const parts = token.split("_");
      return {
        user_id: parts[2],
        client_id: parts[1],
        scope: "openid profile email",
        valid: true,
      };
    }

    return {
      user_id: "",
      client_id: "",
      scope: "",
      valid: false,
    };
  },

  async refreshAccessToken(refreshToken: string): Promise<
    {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    } | null
  > {
    if (refreshToken.startsWith("refresh_")) {
      const parts = refreshToken.split("_");
      const newAccessToken = `access_${parts[1]}_${parts[2]}_${Date.now()}`;
      const newRefreshToken = `refresh_${parts[1]}_${parts[2]}_${Date.now()}`;

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 3600,
      };
    }

    return null;
  },

  generateAuthorizationUrl(params: {
    client_id: string;
    redirect_uri: string;
    scope: string;
    state: string;
    response_type: string;
  }): string {
    const url = new URL("http://localhost:8001/oauth/authorize");
    url.searchParams.set("client_id", params.client_id);
    url.searchParams.set("redirect_uri", params.redirect_uri);
    url.searchParams.set("scope", params.scope);
    url.searchParams.set("state", params.state);
    url.searchParams.set("response_type", params.response_type);

    return url.toString();
  },

  validateRedirectUri(clientId: string, redirectUri: string): boolean {
    if (clientId === "valid-client") {
      return redirectUri === "http://localhost:3000/callback";
    }
    return false;
  },

  validateScope(scope: string): boolean {
    const validScopes = ["openid", "profile", "email"];
    const requestedScopes = scope.split(" ");

    return requestedScopes.every((s) => validScopes.includes(s));
  },
};

describe("OAuth Service", () => {
  let fakeTime: FakeTime;

  beforeEach(() => {
    fakeTime = new FakeTime();
  });

  afterEach(() => {
    fakeTime.restore();
  });

  describe("validateClient", () => {
    it("should validate existing client", async () => {
      const client = await oauthService.validateClient("valid-client");

      assertExists(client);
      assertEquals(client.client_id, "valid-client");
      assertEquals(client.name, "Test Client");
    });

    it("should return null for invalid client", async () => {
      const client = await oauthService.validateClient("invalid-client");

      assertEquals(client, null);
    });

    it("should validate client with secret", async () => {
      const client = await oauthService.validateClient("valid-client", "valid-secret");

      assertExists(client);
      assertEquals(client.client_id, "valid-client");
    });
  });

  describe("generateAuthorizationCode", () => {
    it("should generate authorization code", () => {
      const code = oauthService.generateAuthorizationCode("test-client", "test-user", "openid");

      assertExists(code);
      assertEquals(code.startsWith("auth_code_test-client_test-user_"), true);
    });
  });

  describe("validateAuthorizationCode", () => {
    it("should validate correct authorization code", async () => {
      const code = "auth_code_test-client_test-user_1234567890";
      const result = await oauthService.validateAuthorizationCode(code);

      assertExists(result);
      assertEquals(result.client_id, "test-client");
      assertEquals(result.user_id, "test-user");
      assertEquals(result.scope, "openid profile email");
    });

    it("should return null for invalid code", async () => {
      const result = await oauthService.validateAuthorizationCode("invalid-code");

      assertEquals(result, null);
    });
  });

  describe("generateTokens", () => {
    it("should generate access and refresh tokens", async () => {
      const tokens = await oauthService.generateTokens("test-client", "test-user", "openid");

      assertExists(tokens.access_token);
      assertExists(tokens.refresh_token);
      assertEquals(tokens.token_type, "Bearer");
      assertEquals(tokens.expires_in, 3600);
    });
  });

  describe("validateAccessToken", () => {
    it("should validate correct access token", async () => {
      const token = "access_test-client_test-user_1234567890";
      const result = await oauthService.validateAccessToken(token);

      assertEquals(result.valid, true);
      assertEquals(result.client_id, "test-client");
      assertEquals(result.user_id, "test-user");
      assertEquals(result.scope, "openid profile email");
    });

    it("should reject invalid access token", async () => {
      const result = await oauthService.validateAccessToken("invalid-token");

      assertEquals(result.valid, false);
      assertEquals(result.user_id, "");
      assertEquals(result.client_id, "");
    });
  });

  describe("refreshAccessToken", () => {
    it("should refresh access token with valid refresh token", async () => {
      const refreshToken = "refresh_test-client_test-user_1234567890";
      const result = await oauthService.refreshAccessToken(refreshToken);

      assertExists(result);
      assertExists(result.access_token);
      assertExists(result.refresh_token);
      assertEquals(result.expires_in, 3600);
    });

    it("should return null for invalid refresh token", async () => {
      const result = await oauthService.refreshAccessToken("invalid-refresh-token");

      assertEquals(result, null);
    });
  });

  describe("generateAuthorizationUrl", () => {
    it("should generate correct authorization URL", () => {
      const url = oauthService.generateAuthorizationUrl({
        client_id: "test-client",
        redirect_uri: "http://localhost:3000/callback",
        scope: "openid profile",
        state: "random-state",
        response_type: "code",
      });

      const parsedUrl = new URL(url);
      assertEquals(parsedUrl.pathname, "/oauth/authorize");
      assertEquals(parsedUrl.searchParams.get("client_id"), "test-client");
      assertEquals(parsedUrl.searchParams.get("redirect_uri"), "http://localhost:3000/callback");
      assertEquals(parsedUrl.searchParams.get("scope"), "openid profile");
      assertEquals(parsedUrl.searchParams.get("state"), "random-state");
      assertEquals(parsedUrl.searchParams.get("response_type"), "code");
    });
  });

  describe("validateRedirectUri", () => {
    it("should validate correct redirect URI for client", () => {
      const isValid = oauthService.validateRedirectUri(
        "valid-client",
        "http://localhost:3000/callback",
      );

      assertEquals(isValid, true);
    });

    it("should reject invalid redirect URI", () => {
      const isValid = oauthService.validateRedirectUri(
        "valid-client",
        "http://malicious.com/callback",
      );

      assertEquals(isValid, false);
    });

    it("should reject redirect URI for invalid client", () => {
      const isValid = oauthService.validateRedirectUri(
        "invalid-client",
        "http://localhost:3000/callback",
      );

      assertEquals(isValid, false);
    });
  });

  describe("validateScope", () => {
    it("should validate correct scopes", () => {
      const isValid = oauthService.validateScope("openid profile email");

      assertEquals(isValid, true);
    });

    it("should validate single scope", () => {
      const isValid = oauthService.validateScope("openid");

      assertEquals(isValid, true);
    });

    it("should reject invalid scope", () => {
      const isValid = oauthService.validateScope("invalid-scope");

      assertEquals(isValid, false);
    });

    it("should reject mixed valid and invalid scopes", () => {
      const isValid = oauthService.validateScope("openid invalid-scope");

      assertEquals(isValid, false);
    });
  });
});
