import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { processTemplate, type TemplateContext } from "./template-engine.ts";

Deno.test("integration - process base template files", async () => {
  // Test processing the base template deno.json
  const denoJsonTemplate = await Deno.readTextFile("base/deno.json");
  
  const context: TemplateContext = {
    app: {
      name: "test-app",
      version: "1.0.0"
    }
  };
  
  const processedDenoJson = processTemplate(denoJsonTemplate, context);
  
  // Verify placeholders were replaced
  assertEquals(processedDenoJson.includes('"test-app"'), true);
  assertEquals(processedDenoJson.includes('"1.0.0"'), true);
  assertEquals(processedDenoJson.includes('{{app.name}}'), false);
  assertEquals(processedDenoJson.includes('{{app.version}}'), false);
});

Deno.test("integration - process layout template", async () => {
  const layoutTemplate = await Deno.readTextFile("base/routes/_layout.tsx");
  
  const context: TemplateContext = {
    app: {
      name: "My Test App"
    }
  };
  
  const processedLayout = processTemplate(layoutTemplate, context);
  
  // Verify placeholders were replaced
  assertEquals(processedLayout.includes('<title>My Test App</title>'), true);
  assertEquals(processedLayout.includes('<h1 class="text-xl font-semibold text-gray-900">My Test App</h1>'), true);
  assertEquals(processedLayout.includes('{{app.name}}'), false);
});

Deno.test("integration - process index page template", async () => {
  const indexTemplate = await Deno.readTextFile("base/routes/index.tsx");
  
  const context: TemplateContext = {
    app: {
      name: "My Test App",
      description: "A test application generated from JSON"
    }
  };
  
  const processedIndex = processTemplate(indexTemplate, context);
  
  // Verify placeholders were replaced
  assertEquals(processedIndex.includes('Welcome to My Test App'), true);
  assertEquals(processedIndex.includes('A test application generated from JSON'), true);
  assertEquals(processedIndex.includes('{{app.name}}'), false);
  assertEquals(processedIndex.includes('{{app.description}}'), false);
});

Deno.test("integration - process README template", async () => {
  const readmeTemplate = await Deno.readTextFile("base/README.md");
  
  const context: TemplateContext = {
    app: {
      name: "my-awesome-app",
      description: "An awesome application built with Fresh 2.0"
    }
  };
  
  const processedReadme = processTemplate(readmeTemplate, context);
  
  // Verify placeholders were replaced
  assertEquals(processedReadme.includes('# my-awesome-app'), true);
  assertEquals(processedReadme.includes('An awesome application built with Fresh 2.0'), true);
  assertEquals(processedReadme.includes('my-awesome-app/'), true);
  assertEquals(processedReadme.includes('{{app.name}}'), false);
  assertEquals(processedReadme.includes('{{app.description}}'), false);
});