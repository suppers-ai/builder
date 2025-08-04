import {
  assertEquals,
  assertExists,
  assertRejects,
} from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { FakeTime } from "@std/testing/time";

// Mock application specification
interface MockApplicationSpec {
  name: string;
  description: string;
  template: string;
  features: string[];
  routes: Array<{
    path: string;
    component: string;
  }>;
  styling: {
    theme: string;
    primaryColor: string;
  };
}

// Mock generation result
interface MockGenerationResult {
  id: string;
  status: "pending" | "generating" | "completed" | "failed";
  outputPath?: string;
  downloadUrl?: string;
  errors?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mock compiler service
const compilerService = {
  async generateApplication(spec: MockApplicationSpec): Promise<MockGenerationResult> {
    // Validate specification
    if (!spec.name || spec.name.trim() === "") {
      throw new Error("Application name is required");
    }

    if (!spec.template) {
      throw new Error("Template is required");
    }

    if (!spec.routes || spec.routes.length === 0) {
      throw new Error("At least one route is required");
    }

    // Simulate generation process
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const outputPath = `./apps/generated/${spec.name.toLowerCase().replace(/\s+/g, "-")}`;

    return {
      id: generationId,
      status: "completed",
      outputPath,
      downloadUrl: `/api/download/${generationId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async validateSpec(spec: MockApplicationSpec): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!spec.name || spec.name.trim() === "") {
      errors.push("Application name is required");
    }

    if (!spec.template) {
      errors.push("Template is required");
    }

    if (!spec.routes || spec.routes.length === 0) {
      errors.push("At least one route is required");
    }

    // Route validation
    if (spec.routes) {
      spec.routes.forEach((route, index) => {
        if (!route.path) {
          errors.push(`Route ${index + 1}: Path is required`);
        }

        if (!route.component) {
          errors.push(`Route ${index + 1}: Component is required`);
        }

        if (route.path && !route.path.startsWith("/")) {
          warnings.push(`Route ${index + 1}: Path should start with /`);
        }
      });
    }

    // Feature validation
    if (spec.features && spec.features.includes("database") && !spec.features.includes("api")) {
      warnings.push("Database feature typically requires API feature");
    }

    // Name validation
    if (spec.name && spec.name.length > 50) {
      warnings.push("Application name is quite long, consider shortening it");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  async getGenerationStatus(id: string): Promise<MockGenerationResult | null> {
    if (!id || !id.startsWith("gen_")) {
      return null;
    }

    // Simulate different statuses based on ID
    if (id.includes("failed")) {
      return {
        id,
        status: "failed",
        errors: ["Template not found", "Invalid route configuration"],
        createdAt: new Date(Date.now() - 60000),
        updatedAt: new Date(),
      };
    }

    if (id.includes("generating")) {
      return {
        id,
        status: "generating",
        createdAt: new Date(Date.now() - 30000),
        updatedAt: new Date(),
      };
    }

    return {
      id,
      status: "completed",
      outputPath: `./apps/generated/test-app`,
      downloadUrl: `/api/download/${id}`,
      createdAt: new Date(Date.now() - 120000),
      updatedAt: new Date(Date.now() - 60000),
    };
  },

  async getAvailableTemplates(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      features: string[];
      complexity: string;
    }>
  > {
    return [
      {
        id: "fresh-basic",
        name: "Fresh Basic",
        description: "A basic Fresh application template",
        category: "web",
        features: ["routing", "static-files"],
        complexity: "beginner",
      },
      {
        id: "business-app",
        name: "Business Application",
        description: "A complete business application with authentication and database",
        category: "business",
        features: ["authentication", "database", "api", "admin-panel"],
        complexity: "advanced",
      },
      {
        id: "portfolio",
        name: "Portfolio Site",
        description: "A personal portfolio website template",
        category: "portfolio",
        features: ["blog", "contact-form", "gallery"],
        complexity: "intermediate",
      },
    ];
  },

  async downloadApplication(id: string): Promise<Blob> {
    if (!id || !id.startsWith("gen_")) {
      throw new Error("Invalid generation ID");
    }

    // Simulate ZIP file creation
    const zipContent = new TextEncoder().encode(`Mock ZIP content for ${id}`);
    return new Blob([zipContent], { type: "application/zip" });
  },

  async deleteApplication(id: string): Promise<boolean> {
    if (!id || !id.startsWith("gen_")) {
      return false;
    }

    // Simulate deletion
    return true;
  },

  async getApplicationMetadata(id: string): Promise<
    {
      id: string;
      name: string;
      description: string;
      template: string;
      features: string[];
      size: number;
      createdAt: Date;
    } | null
  > {
    if (!id || !id.startsWith("gen_")) {
      return null;
    }

    return {
      id,
      name: "Test Application",
      description: "A test application generated by the compiler",
      template: "fresh-basic",
      features: ["routing", "static-files"],
      size: 1024 * 1024, // 1MB
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    };
  },
};

describe("Compiler Service", () => {
  let fakeTime: FakeTime;

  beforeEach(() => {
    fakeTime = new FakeTime();
  });

  afterEach(() => {
    fakeTime.restore();
  });

  describe("generateApplication", () => {
    it("should generate application with valid specification", async () => {
      const spec: MockApplicationSpec = {
        name: "Test App",
        description: "A test application",
        template: "fresh-basic",
        features: ["routing"],
        routes: [
          { path: "/", component: "HomePage" },
          { path: "/about", component: "AboutPage" },
        ],
        styling: {
          theme: "default",
          primaryColor: "#3b82f6",
        },
      };

      const result = await compilerService.generateApplication(spec);

      assertExists(result);
      assertExists(result.id);
      assertEquals(result.status, "completed");
      assertExists(result.outputPath);
      assertExists(result.downloadUrl);
    });

    it("should throw error for missing application name", async () => {
      const spec: MockApplicationSpec = {
        name: "",
        description: "A test application",
        template: "fresh-basic",
        features: ["routing"],
        routes: [{ path: "/", component: "HomePage" }],
        styling: { theme: "default", primaryColor: "#3b82f6" },
      };

      await assertRejects(
        () => compilerService.generateApplication(spec),
        Error,
        "Application name is required",
      );
    });

    it("should throw error for missing template", async () => {
      const spec: MockApplicationSpec = {
        name: "Test App",
        description: "A test application",
        template: "",
        features: ["routing"],
        routes: [{ path: "/", component: "HomePage" }],
        styling: { theme: "default", primaryColor: "#3b82f6" },
      };

      await assertRejects(
        () => compilerService.generateApplication(spec),
        Error,
        "Template is required",
      );
    });

    it("should throw error for missing routes", async () => {
      const spec: MockApplicationSpec = {
        name: "Test App",
        description: "A test application",
        template: "fresh-basic",
        features: ["routing"],
        routes: [],
        styling: { theme: "default", primaryColor: "#3b82f6" },
      };

      await assertRejects(
        () => compilerService.generateApplication(spec),
        Error,
        "At least one route is required",
      );
    });
  });

  describe("validateSpec", () => {
    it("should validate correct specification", async () => {
      const spec: MockApplicationSpec = {
        name: "Test App",
        description: "A test application",
        template: "fresh-basic",
        features: ["routing"],
        routes: [{ path: "/", component: "HomePage" }],
        styling: { theme: "default", primaryColor: "#3b82f6" },
      };

      const result = await compilerService.validateSpec(spec);

      assertEquals(result.valid, true);
      assertEquals(result.errors.length, 0);
    });

    it("should return errors for invalid specification", async () => {
      const spec: MockApplicationSpec = {
        name: "",
        description: "A test application",
        template: "",
        features: ["routing"],
        routes: [],
        styling: { theme: "default", primaryColor: "#3b82f6" },
      };

      const result = await compilerService.validateSpec(spec);

      assertEquals(result.valid, false);
      assertEquals(result.errors.length, 3);
      assertEquals(result.errors.includes("Application name is required"), true);
      assertEquals(result.errors.includes("Template is required"), true);
      assertEquals(result.errors.includes("At least one route is required"), true);
    });

    it("should return warnings for potential issues", async () => {
      const spec: MockApplicationSpec = {
        name: "Test App",
        description: "A test application",
        template: "fresh-basic",
        features: ["database"], // Database without API
        routes: [{ path: "home", component: "HomePage" }], // Path without leading slash
        styling: { theme: "default", primaryColor: "#3b82f6" },
      };

      const result = await compilerService.validateSpec(spec);

      assertEquals(result.valid, true);
      assertEquals(result.warnings.length, 2);
      assertEquals(
        result.warnings.includes("Database feature typically requires API feature"),
        true,
      );
      assertEquals(result.warnings.includes("Route 1: Path should start with /"), true);
    });
  });

  describe("getGenerationStatus", () => {
    it("should return status for valid generation ID", async () => {
      const status = await compilerService.getGenerationStatus("gen_1234567890_abcdef123");

      assertExists(status);
      assertEquals(status.id, "gen_1234567890_abcdef123");
      assertEquals(status.status, "completed");
    });

    it("should return null for invalid generation ID", async () => {
      const status = await compilerService.getGenerationStatus("invalid-id");

      assertEquals(status, null);
    });

    it("should return failed status for failed generation", async () => {
      const status = await compilerService.getGenerationStatus("gen_failed_12345");

      assertExists(status);
      assertEquals(status.status, "failed");
      assertExists(status.errors);
      assertEquals(status.errors!.length > 0, true);
    });

    it("should return generating status for in-progress generation", async () => {
      const status = await compilerService.getGenerationStatus("gen_generating_12345");

      assertExists(status);
      assertEquals(status.status, "generating");
    });
  });

  describe("getAvailableTemplates", () => {
    it("should return list of available templates", async () => {
      const templates = await compilerService.getAvailableTemplates();

      assertExists(templates);
      assertEquals(templates.length > 0, true);

      const basicTemplate = templates.find((t) => t.id === "fresh-basic");
      assertExists(basicTemplate);
      assertEquals(basicTemplate.name, "Fresh Basic");
      assertEquals(basicTemplate.complexity, "beginner");
    });
  });

  describe("downloadApplication", () => {
    it("should download application with valid ID", async () => {
      const blob = await compilerService.downloadApplication("gen_1234567890_abcdef123");

      assertExists(blob);
      assertEquals(blob.type, "application/zip");
    });

    it("should throw error for invalid ID", async () => {
      await assertRejects(
        () => compilerService.downloadApplication("invalid-id"),
        Error,
        "Invalid generation ID",
      );
    });
  });

  describe("deleteApplication", () => {
    it("should delete application with valid ID", async () => {
      const result = await compilerService.deleteApplication("gen_1234567890_abcdef123");

      assertEquals(result, true);
    });

    it("should return false for invalid ID", async () => {
      const result = await compilerService.deleteApplication("invalid-id");

      assertEquals(result, false);
    });
  });

  describe("getApplicationMetadata", () => {
    it("should return metadata for valid application ID", async () => {
      const metadata = await compilerService.getApplicationMetadata("gen_1234567890_abcdef123");

      assertExists(metadata);
      assertEquals(metadata.id, "gen_1234567890_abcdef123");
      assertEquals(metadata.name, "Test Application");
      assertExists(metadata.createdAt);
    });

    it("should return null for invalid application ID", async () => {
      const metadata = await compilerService.getApplicationMetadata("invalid-id");

      assertEquals(metadata, null);
    });
  });
});
