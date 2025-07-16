import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  processTemplate,
  validateTemplate,
  extractVariables,
  shouldProcessFile,
  processTemplates,
  type TemplateContext,
} from "./template-engine.ts";

Deno.test("processTemplate - basic variable replacement", () => {
  const template = "Hello {{name}}, welcome to {{app.name}}!";
  const context: TemplateContext = {
    name: "John",
    app: { name: "MyApp" }
  };
  
  const result = processTemplate(template, context);
  assertEquals(result, "Hello John, welcome to MyApp!");
});

Deno.test("processTemplate - nested object properties", () => {
  const template = "{{user.profile.firstName}} {{user.profile.lastName}}";
  const context: TemplateContext = {
    user: {
      profile: {
        firstName: "Jane",
        lastName: "Doe"
      }
    }
  };
  
  const result = processTemplate(template, context);
  assertEquals(result, "Jane Doe");
});

Deno.test("processTemplate - undefined variables in non-strict mode", () => {
  const template = "Hello {{name}}, your score is {{score}}";
  const context: TemplateContext = { name: "Alice" };
  
  const result = processTemplate(template, context);
  assertEquals(result, "Hello Alice, your score is {{score}}");
});

Deno.test("processTemplate - undefined variables in strict mode", () => {
  const template = "Hello {{name}}, your score is {{score}}";
  const context: TemplateContext = { name: "Alice" };
  
  assertThrows(
    () => processTemplate(template, context, { strict: true }),
    Error,
    "Undefined template variable: score"
  );
});

Deno.test("processTemplate - conditional inclusion", () => {
  const template = `
    Base content
    {{#if hasFeature}}
    Feature-specific content
    {{/if}}
    End content
  `;
  
  const context: TemplateContext = {};
  const conditionals = { hasFeature: true };
  
  const result = processTemplate(template, context, { conditionals });
  assertEquals(result.includes("Feature-specific content"), true);
  
  const resultWithoutFeature = processTemplate(template, context, { 
    conditionals: { hasFeature: false } 
  });
  assertEquals(resultWithoutFeature.includes("Feature-specific content"), false);
});

Deno.test("processTemplate - multiple conditional blocks", () => {
  const template = `
    {{#if auth}}
    Authentication enabled
    {{/if}}
    {{#if database}}
    Database configured
    {{/if}}
    {{#if cache}}
    Caching enabled
    {{/if}}
  `;
  
  const context: TemplateContext = {};
  const conditionals = { auth: true, database: false, cache: true };
  
  const result = processTemplate(template, context, { conditionals });
  assertEquals(result.includes("Authentication enabled"), true);
  assertEquals(result.includes("Database configured"), false);
  assertEquals(result.includes("Caching enabled"), true);
});

Deno.test("processTemplate - mixed variables and conditionals", () => {
  const template = `
    App: {{app.name}}
    {{#if hasAuth}}
    Auth provider: {{auth.provider}}
    {{/if}}
    Version: {{app.version}}
  `;
  
  const context: TemplateContext = {
    app: { name: "TestApp", version: "1.0.0" },
    auth: { provider: "OAuth2" }
  };
  const conditionals = { hasAuth: true };
  
  const result = processTemplate(template, context, { conditionals });
  assertEquals(result.includes("App: TestApp"), true);
  assertEquals(result.includes("Auth provider: OAuth2"), true);
  assertEquals(result.includes("Version: 1.0.0"), true);
});

Deno.test("validateTemplate - valid template", () => {
  const template = "Hello {{name}}, {{#if premium}}you have premium access{{/if}}";
  const errors = validateTemplate(template);
  assertEquals(errors.length, 0);
});

Deno.test("validateTemplate - malformed placeholders", () => {
  const template = "Hello {name}, welcome to {{app}";
  const errors = validateTemplate(template);
  assertEquals(errors.length > 0, true);
  assertEquals(errors[0].includes("Malformed placeholders"), true);
});

Deno.test("validateTemplate - unmatched conditional blocks", () => {
  const template = "{{#if condition}}content{{#if another}}more content{{/if}}";
  const errors = validateTemplate(template);
  assertEquals(errors.length > 0, true);
  assertEquals(errors[0].includes("Unmatched conditional blocks"), true);
});

Deno.test("extractVariables - simple variables", () => {
  const template = "Hello {{name}}, welcome to {{app.name}}!";
  const variables = extractVariables(template);
  assertEquals(variables.sort(), ["app.name", "name"]);
});

Deno.test("extractVariables - with conditionals", () => {
  const template = `
    {{title}}
    {{#if hasAuth}}
    {{auth.provider}}
    {{/if}}
  `;
  const variables = extractVariables(template);
  assertEquals(variables.sort(), ["#hasAuth", "auth.provider", "title"]);
});

Deno.test("shouldProcessFile - processable extensions", () => {
  assertEquals(shouldProcessFile("component.tsx"), true);
  assertEquals(shouldProcessFile("config.json"), true);
  assertEquals(shouldProcessFile("README.md"), true);
  assertEquals(shouldProcessFile("styles.css"), true);
});

Deno.test("shouldProcessFile - non-processable extensions", () => {
  assertEquals(shouldProcessFile("image.png"), false);
  assertEquals(shouldProcessFile("binary.exe"), false);
  assertEquals(shouldProcessFile("archive.zip"), false);
});

Deno.test("shouldProcessFile - custom extensions", () => {
  const options = { extensions: [".custom", ".special"] };
  assertEquals(shouldProcessFile("file.custom", options), true);
  assertEquals(shouldProcessFile("file.tsx", options), false);
});

Deno.test("shouldProcessFile - process binary option", () => {
  const options = { processBinary: true };
  assertEquals(shouldProcessFile("image.png", options), true);
  assertEquals(shouldProcessFile("binary.exe", options), true);
});

Deno.test("processTemplates - batch processing", () => {
  const templates = {
    greeting: "Hello {{name}}!",
    farewell: "Goodbye {{name}}, see you at {{event}}!",
    info: "App: {{app.name}} v{{app.version}}"
  };
  
  const context: TemplateContext = {
    name: "Alice",
    event: "DevCon",
    app: { name: "MyApp", version: "2.0.0" }
  };
  
  const results = processTemplates(templates, context);
  
  assertEquals(results.greeting, "Hello Alice!");
  assertEquals(results.farewell, "Goodbye Alice, see you at DevCon!");
  assertEquals(results.info, "App: MyApp v2.0.0");
});

Deno.test("processTemplate - edge cases", () => {
  // Empty template
  assertEquals(processTemplate("", {}), "");
  
  // No placeholders
  assertEquals(processTemplate("Plain text", {}), "Plain text");
  
  // Empty context
  assertEquals(processTemplate("{{missing}}", {}), "{{missing}}");
  
  // Whitespace in placeholders
  assertEquals(processTemplate("{{ name }}", { name: "Test" }), "Test");
  
  // Special characters in values
  const context = { special: "Hello & <world> \"quotes\"" };
  assertEquals(processTemplate("{{special}}", context), "Hello & <world> \"quotes\"");
});

Deno.test("processTemplate - numeric and boolean values", () => {
  const context: TemplateContext = {
    count: 42,
    price: 19.99,
    enabled: true,
    disabled: false
  };
  
  const template = "Count: {{count}}, Price: ${{price}}, Enabled: {{enabled}}, Disabled: {{disabled}}";
  const result = processTemplate(template, context);
  
  assertEquals(result, "Count: 42, Price: $19.99, Enabled: true, Disabled: false");
});

Deno.test("processTemplate - array values", () => {
  const context: TemplateContext = {
    tags: ["typescript", "deno", "fresh"],
    numbers: [1, 2, 3]
  };
  
  const template = "Tags: {{tags}}, Numbers: {{numbers}}";
  const result = processTemplate(template, context);
  
  assertEquals(result, "Tags: typescript,deno,fresh, Numbers: 1,2,3");
});