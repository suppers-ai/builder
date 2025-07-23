/**
 * Tests for the variable substitution system
 */

import { assertEquals } from "@std/assert";
import {
  extractVariableNames,
  substituteVariables,
  substituteVariablesInString,
  validateVariableReferences,
} from "../src/utils/variables.ts";

Deno.test("Variable substitution - simple string", () => {
  const variables = { API_URL: "https://api.example.com" };
  const result = substituteVariablesInString("Connect to ${{API_URL}}/users", variables);
  assertEquals(result, "Connect to https://api.example.com/users");
});

Deno.test("Variable substitution - multiple variables", () => {
  const variables = {
    API_URL: "https://api.example.com",
    VERSION: "v1",
  };
  const result = substituteVariablesInString("${{API_URL}}/${{VERSION}}/users", variables);
  assertEquals(result, "https://api.example.com/v1/users");
});

Deno.test("Variable substitution - missing variable", () => {
  const variables = { API_URL: "https://api.example.com" };
  const result = substituteVariablesInString("Connect to ${{MISSING_VAR}}", variables);
  assertEquals(result, "Connect to ${{MISSING_VAR}}"); // Should keep original pattern
});

Deno.test("Variable substitution - object with nested values", () => {
  const variables = { API_URL: "https://api.example.com" };
  const obj = {
    data: {
      url: "${{API_URL}}",
      endpoint: "/users",
    },
    title: "Users from ${{API_URL}}",
  };

  const result = substituteVariables(obj, variables);
  assertEquals(result, {
    data: {
      url: "https://api.example.com",
      endpoint: "/users",
    },
    title: "Users from https://api.example.com",
  });
});

Deno.test("Variable substitution - array values", () => {
  const variables = { BASE_URL: "https://example.com" };
  const array = [
    "${{BASE_URL}}/page1",
    "${{BASE_URL}}/page2",
    { url: "${{BASE_URL}}/api" },
  ];

  const result = substituteVariables(array, variables);
  assertEquals(result, [
    "https://example.com/page1",
    "https://example.com/page2",
    { url: "https://example.com/api" },
  ]);
});

Deno.test("Variable validation - all valid", () => {
  const variables = { API_URL: "https://api.example.com", VERSION: "v1" };
  const obj = {
    url: "${{API_URL}}",
    version: "${{VERSION}}",
  };

  const result = validateVariableReferences(obj, variables);
  assertEquals(result.valid, true);
  assertEquals(result.missingVariables, []);
});

Deno.test("Variable validation - missing variables", () => {
  const variables = { API_URL: "https://api.example.com" };
  const obj = {
    url: "${{API_URL}}",
    missing: "${{MISSING_VAR}}",
    nested: {
      also_missing: "${{ANOTHER_MISSING}}",
    },
  };

  const result = validateVariableReferences(obj, variables);
  assertEquals(result.valid, false);
  assertEquals(result.missingVariables.sort(), ["ANOTHER_MISSING", "MISSING_VAR"]);
});

Deno.test("Extract variable names", () => {
  const obj = {
    url: "${{API_URL}}",
    version: "${{VERSION}}",
    mixed: "Connect to ${{API_URL}} version ${{VERSION}}",
    nested: {
      another: "${{NESTED_VAR}}",
    },
  };

  const result = extractVariableNames(obj);
  assertEquals(result.sort(), ["API_URL", "NESTED_VAR", "VERSION"]);
});

Deno.test("Variable extraction - no variables", () => {
  const obj = {
    url: "https://api.example.com",
    version: "v1",
  };

  const result = extractVariableNames(obj);
  assertEquals(result, []);
});

Deno.test("Variable extraction - duplicate variables", () => {
  const obj = {
    url1: "${{API_URL}}",
    url2: "${{API_URL}}",
    version: "${{VERSION}}",
  };

  const result = extractVariableNames(obj);
  assertEquals(result.sort(), ["API_URL", "VERSION"]);
});

Deno.test("Variable substitution - non-string values", () => {
  const variables = { API_URL: "https://api.example.com" };
  const obj = {
    url: "${{API_URL}}",
    count: 42,
    enabled: true,
    nothing: null,
  };

  const result = substituteVariables(obj, variables);
  assertEquals(result, {
    url: "https://api.example.com",
    count: 42,
    enabled: true,
    nothing: null,
  });
});

Deno.test("Variable substitution - environment fallback", () => {
  const variables = { API_URL: "https://api.example.com" };
  const envVars = { FALLBACK_VAR: "fallback_value" };

  const result = substituteVariablesInString(
    "${{API_URL}} and ${{FALLBACK_VAR}}",
    variables,
    envVars,
  );
  assertEquals(result, "https://api.example.com and fallback_value");
});

Deno.test("Variable substitution - complex nested structure", () => {
  const variables = {
    API_URL: "https://api.example.com",
    VERSION: "v1",
  };

  const spec = {
    application: {
      name: "test-app",
    },
    data: {
      routes: [
        {
          path: "/",
          components: [
            {
              id: "DataComponent",
              props: {
                data: {
                  url: "${{API_URL}}",
                  endpoint: "/${{VERSION}}/users",
                },
              },
            },
          ],
        },
      ],
    },
  };

  const result = substituteVariables(spec, variables);
  assertEquals(result.data.routes[0].components[0].props.data, {
    url: "https://api.example.com",
    endpoint: "/v1/users",
  });
});

Deno.test("Variable substitution - ApplicationSpec example", () => {
  const variables = {
    SUPPERS_API_URL: "https://localhost:5000/api",
    EXTERNAL_CAMPSITES_URL: "https://external-campsite-api.com/api",
  };

  const routeComponent = {
    id: "BlogPostList",
    props: {
      title: "External Blogs about cool campsites",
      data: {
        url: "${{EXTERNAL_CAMPSITES_URL}}",
        endpoint: "/data",
        method: "GET",
      },
    },
  };

  const result = substituteVariables(routeComponent, variables);
  assertEquals(result.props.data.url, "https://external-campsite-api.com/api");
});
