// Tests for the JSON configuration parser and validator
import { assertEquals, assertNotEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { ConfigParser, ConfigParseError } from "./config-parser.ts";

// Create a test instance
const parser = new ConfigParser();

// Valid minimal configuration
const validMinimalConfig = {
  metadata: {
    name: "test-app",
    version: "1.0.0"
  },
  components: [],
  routes: [
    {
      path: "/",
      component: "HomePage"
    }
  ],
  api: {
    endpoints: []
  }
};

// Valid complete configuration
const validCompleteConfig = {
  metadata: {
    name: "test-app",
    version: "1.0.0",
    description: "Test application",
    author: "Test Author",
    license: "MIT"
  },
  components: [
    {
      id: "header",
      type: "Header",
      props: {
        title: "Test App"
      }
    },
    {
      id: "footer",
      type: "Footer",
      props: {
        copyright: "2025"
      }
    }
  ],
  routes: [
    {
      path: "/",
      component: "HomePage",
      layout: "MainLayout",
      middleware: ["auth"],
      meta: {
        title: "Home",
        description: "Home page"
      }
    },
    {
      path: "/about",
      component: "AboutPage"
    }
  ],
  api: {
    endpoints: [
      {
        path: "/api/users",
        methods: ["GET", "POST"],
        handler: "UserHandler"
      }
    ],
    middleware: [
      {
        name: "cors",
        config: {
          origin: "*"
        }
      }
    ]
  },
  theme: {
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
    fontFamily: "Arial, sans-serif"
  },
  build: {
    target: "production",
    minify: true,
    sourceMaps: false
  }
};

// Invalid configuration - missing required fields
const invalidMissingFieldsConfig = {
  metadata: {
    name: "test-app"
    // Missing version
  },
  components: [],
  // Missing routes
  api: {
    endpoints: []
  }
};

// Invalid configuration - wrong types
const invalidTypesConfig = {
  metadata: {
    name: 123, // Should be string
    version: "1.0.0"
  },
  components: "not-an-array", // Should be array
  routes: [
    {
      path: "/",
      component: 456 // Should be string
    }
  ],
  api: {
    endpoints: []
  }
};

// Invalid configuration - JSON syntax error
const invalidJsonSyntax = `{
  "metadata": {
    "name": "test-app",
    "version": "1.0.0"
  },
  "components": [],
  "routes": [
    {
      "path": "/",
      "component": "HomePage"
    }
  ],
  "api": {
    "endpoints": []
  }
  "invalid-json": true
}`;

Deno.test("ConfigParser - Parse valid minimal configuration", () => {
  const result = parser.parseString(JSON.stringify(validMinimalConfig));
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  assertNotEquals(result.config, null);
});

Deno.test("ConfigParser - Parse valid complete configuration", () => {
  const result = parser.parseString(JSON.stringify(validCompleteConfig));
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  assertNotEquals(result.config, null);
});

Deno.test("ConfigParser - Detect missing required fields", () => {
  const result = parser.parseString(JSON.stringify(invalidMissingFieldsConfig));
  assertEquals(result.success, false);
  assertNotEquals(result.errors.length, 0);
  
  // Check for specific error messages
  const errorMessages = result.errors.map(e => e.message);
  const hasMissingVersionError = errorMessages.some(msg => 
    msg.includes("Missing required property") && msg.includes("version")
  );
  const hasMissingRoutesError = errorMessages.some(msg => 
    msg.includes("Missing required property") && msg.includes("routes")
  );
  
  assertEquals(hasMissingVersionError, true);
  assertEquals(hasMissingRoutesError, true);
});

Deno.test("ConfigParser - Detect wrong types", () => {
  const result = parser.parseString(JSON.stringify(invalidTypesConfig));
  assertEquals(result.success, false);
  assertNotEquals(result.errors.length, 0);
  
  // Check for specific error messages
  const errorMessages = result.errors.map(e => e.message);
  const hasNameTypeError = errorMessages.some(msg => 
    msg.includes("Expected type string") && msg.includes("number")
  );
  const hasComponentsTypeError = errorMessages.some(msg => 
    msg.includes("Expected type array") && msg.includes("string")
  );
  const hasComponentTypeError = errorMessages.some(msg => 
    msg.includes("Expected type string") && msg.includes("number")
  );
  
  assertEquals(hasNameTypeError, true);
  assertEquals(hasComponentsTypeError, true);
  assertEquals(hasComponentTypeError, true);
});

Deno.test("ConfigParser - Detect JSON syntax errors", () => {
  const result = parser.parseString(invalidJsonSyntax);
  assertEquals(result.success, false);
  assertNotEquals(result.errors.length, 0);
  
  // Check for specific error messages
  const errorMessages = result.errors.map(e => e.message);
  const hasSyntaxError = errorMessages.some(msg => 
    msg.includes("JSON syntax error")
  );
  
  assertEquals(hasSyntaxError, true);
});

Deno.test("ConfigParser - Throw error when requested", () => {
  assertThrows(
    () => parser.parseString(JSON.stringify(invalidMissingFieldsConfig), { throwOnError: true }),
    ConfigParseError,
    "Configuration validation failed"
  );
});

Deno.test("ConfigParser - Generate suggestions for errors", () => {
  const result = parser.parseString(JSON.stringify(invalidMissingFieldsConfig));
  
  // Get suggestions for the first error
  const suggestions = parser.generateSuggestions(result.errors[0]);
  
  assertNotEquals(suggestions, undefined);
  assertEquals(suggestions && suggestions.length > 0, true);
});

Deno.test("ConfigParser - Include line numbers in errors", () => {
  const jsonWithLineBreaks = `{
  "metadata": {
    "name": "test-app",
    "version": "1.0.0"
  },
  "components": [
    {
      "id": "invalid-component",
      "type": 123,
      "props": {}
    }
  ],
  "routes": [
    {
      "path": "/",
      "component": "HomePage"
    }
  ],
  "api": {
    "endpoints": []
  }
}`;

  const result = parser.parseString(jsonWithLineBreaks, { includeLineNumbers: true });
  
  // Find the error for the invalid type
  const typeError = result.errors.find(e => 
    e.message.includes("Expected type string") && e.message.includes("number")
  );
  
  assertNotEquals(typeError, undefined);
  assertNotEquals(typeError?.location, undefined);
  assertNotEquals(typeError?.location?.line, undefined);
  assertNotEquals(typeError?.location?.column, undefined);
});

// Mock file system for testing file parsing
// Note: This is a simplified mock for demonstration purposes
// In a real implementation, you would use a more robust mocking approach
const mockFileSystem = new Map<string, string>();

// Mock Deno.readTextFile
const originalReadTextFile = Deno.readTextFile;
Deno.readTextFile = async (path: string | URL): Promise<string> => {
  const pathStr = path.toString();
  if (mockFileSystem.has(pathStr)) {
    return mockFileSystem.get(pathStr)!;
  }
  throw new Deno.errors.NotFound(`File not found: ${pathStr}`);
};

Deno.test("ConfigParser - Parse file", async () => {
  // Setup mock file
  const filePath = "/mock/config.json";
  mockFileSystem.set(filePath, JSON.stringify(validMinimalConfig));
  
  // Parse the file
  const result = await parser.parseFile(filePath);
  
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  assertNotEquals(result.config, null);
  
  // Clean up
  mockFileSystem.delete(filePath);
});

Deno.test("ConfigParser - Handle file not found", async () => {
  const filePath = "/mock/nonexistent.json";
  
  // Parse the file
  const result = await parser.parseFile(filePath);
  
  assertEquals(result.success, false);
  assertEquals(result.errors.length, 1);
  assertEquals(result.config, null);
  assertEquals(result.errors[0].type, "file");
  assertEquals(result.errors[0].message.includes("not found"), true);
});

// Restore original Deno.readTextFile
Deno.test({
  name: "Cleanup",
  fn: () => {
    Deno.readTextFile = originalReadTextFile;
  },
  sanitizeResources: false,
  sanitizeOps: false
});