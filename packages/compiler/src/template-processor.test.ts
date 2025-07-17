// Tests for the template processing engine
import { assertEquals, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import { TemplateProcessor, type TemplateFileConfig } from "./template-processor.ts";
import { FileManager } from "./file-manager.ts";
import type { AppConfig } from "../../shared/src/types.ts";

// Create test instances
const templateProcessor = new TemplateProcessor();
const fileManager = new FileManager();

// Test directory paths
const testDir = "./test-templates";
const testOutputDir = "./test-output";
const testTemplateFile = "./test-templates/test.txt";
const testTemplateContent = "Hello {{name}}! Welcome to {{app.name}} v{{app.version}}";
const testInvalidTemplateFile = "./test-templates/invalid.txt";
const testInvalidTemplateContent = "Hello {{name! This is invalid";
const testBinaryFile = "./test-templates/test.bin";
const testBinaryContent = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
const testNestedDir = "./test-templates/nested";
const testNestedFile = "./test-templates/nested/nested.txt";
const testNestedContent = "Nested file for {{name}}";

// Test file configs
const testFileConfigs: TemplateFileConfig[] = [
  {
    pattern: /\.txt$/,
    process: true,
    contextOverrides: {
      name: "Override"
    }
  },
  {
    pattern: /\.bin$/,
    process: false
  },
  {
    pattern: /\.md$/,
    process: true,
    options: {
      strict: true,
      conditionals: {
        showFeature: true
      }
    }
  }
];

// Test context
const testContext = {
  name: "User",
  app: {
    name: "TestApp",
    version: "1.0.0"
  }
};

// Test app config
const testConfig: AppConfig = {
  metadata: {
    name: "test-app",
    version: "1.0.0",
    description: "Test application",
    author: "Test Author",
    license: "MIT"
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
  },
  theme: {
    primaryColor: "#007bff"
  },
  build: {
    target: "development"
  }
};

// Setup and cleanup
Deno.test({
  name: "TemplateProcessor - Setup",
  fn: async () => {
    // Clean up any existing test directories
    try {
      await Deno.remove(testDir, { recursive: true });
    } catch (error) {
      // Ignore errors if directory doesn't exist
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
    
    try {
      await Deno.remove(testOutputDir, { recursive: true });
    } catch (error) {
      // Ignore errors if directory doesn't exist
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
    
    // Create test directories and files
    await fileManager.createDirectory(testDir);
    await fileManager.createDirectory(testNestedDir);
    await fileManager.createFile(testTemplateFile, testTemplateContent);
    await fileManager.createFile(testInvalidTemplateFile, testInvalidTemplateContent);
    await fileManager.createFile(testBinaryFile, testBinaryContent);
    await fileManager.createFile(testNestedFile, testNestedContent);
  },
  sanitizeResources: false,
  sanitizeOps: false
});

Deno.test("TemplateProcessor - Process file", async () => {
  const outputFile = "./test-output/test.txt";
  const result = await templateProcessor.processFile(testTemplateFile, outputFile, testContext);
  
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  
  // Verify file exists and has correct content
  const content = await Deno.readTextFile(outputFile);
  assertEquals(content, "Hello User! Welcome to TestApp v1.0.0");
});

Deno.test("TemplateProcessor - Process file with validation errors", async () => {
  const outputFile = "./test-output/invalid.txt";
  const result = await templateProcessor.processFile(
    testInvalidTemplateFile, 
    outputFile, 
    testContext,
    { validateTemplates: true }
  );
  
  assertEquals(result.success, false);
  assertNotEquals(result.errors.length, 0);
  
  // Verify file doesn't exist
  const exists = await fileManager.fileExists(outputFile);
  assertEquals(exists, false);
});

Deno.test("TemplateProcessor - Skip validation", async () => {
  const outputFile = "./test-output/invalid-no-validation.txt";
  const result = await templateProcessor.processFile(
    testInvalidTemplateFile, 
    outputFile, 
    testContext,
    { validateTemplates: false }
  );
  
  // Even with invalid template, it should succeed if validation is skipped
  assertEquals(result.success, true);
  
  // Verify file exists
  const exists = await fileManager.fileExists(outputFile);
  assertEquals(exists, true);
});

Deno.test("TemplateProcessor - Process binary file", async () => {
  const outputFile = "./test-output/test.bin";
  const result = await templateProcessor.processFile(testBinaryFile, outputFile, testContext);
  
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  
  // Verify file exists and has correct content
  const content = await Deno.readFile(outputFile);
  assertEquals(content, testBinaryContent);
});

Deno.test("TemplateProcessor - Process directory", async () => {
  const result = await templateProcessor.processDirectory(testDir, testOutputDir, testContext);
  
  // Check all operations were successful
  const allSuccess = result.every(r => r.success);
  assertEquals(allSuccess, true);
  
  // Verify files exist
  const mainFileExists = await fileManager.fileExists("./test-output/test.txt");
  assertEquals(mainFileExists, true);
  
  const binaryFileExists = await fileManager.fileExists("./test-output/test.bin");
  assertEquals(binaryFileExists, true);
  
  const nestedDirExists = await fileManager.directoryExists("./test-output/nested");
  assertEquals(nestedDirExists, true);
  
  const nestedFileExists = await fileManager.fileExists("./test-output/nested/nested.txt");
  assertEquals(nestedFileExists, true);
  
  // Verify content
  const nestedContent = await Deno.readTextFile("./test-output/nested/nested.txt");
  assertEquals(nestedContent, "Nested file for User");
});

Deno.test("TemplateProcessor - Skip patterns", async () => {
  const outputDir = "./test-output/skip-test";
  const result = await templateProcessor.processDirectory(
    testDir, 
    outputDir, 
    testContext,
    { skipPatterns: [/\.bin$/] }
  );
  
  // Check if binary file was skipped
  const binaryFileExists = await fileManager.fileExists(`${outputDir}/test.bin`);
  assertEquals(binaryFileExists, false);
  
  // Check if text file was processed
  const textFileExists = await fileManager.fileExists(`${outputDir}/test.txt`);
  assertEquals(textFileExists, true);
});

Deno.test("TemplateProcessor - Include patterns", async () => {
  const outputDir = "./test-output/include-test";
  const result = await templateProcessor.processDirectory(
    testDir, 
    outputDir, 
    testContext,
    { includePatterns: [/\.txt$/] }
  );
  
  // Check if binary file was skipped
  const binaryFileExists = await fileManager.fileExists(`${outputDir}/test.bin`);
  assertEquals(binaryFileExists, false);
  
  // Check if text file was processed
  const textFileExists = await fileManager.fileExists(`${outputDir}/test.txt`);
  assertEquals(textFileExists, true);
});

Deno.test("TemplateProcessor - Extract template variables", async () => {
  const variables = await templateProcessor.extractTemplateVariables(testTemplateFile);
  
  assertEquals(variables.includes("name"), true);
  assertEquals(variables.includes("app.name"), true);
  assertEquals(variables.includes("app.version"), true);
});

Deno.test("TemplateProcessor - Create context from config", () => {
  const context = templateProcessor.createContextFromConfig(testConfig);
  
  assertEquals(context.app.name, "test-app");
  assertEquals(context.app.version, "1.0.0");
  assertEquals(context.app.description, "Test application");
  assertEquals(context.app.author, "Test Author");
  assertEquals(context.app.license, "MIT");
  assertEquals(context.theme.primaryColor, "#007bff");
  assertEquals(context.build.target, "development");
});

Deno.test("TemplateProcessor - Process directory with file configs", async () => {
  // Create test files for file configs
  const configTestDir = "./test-templates/config-test";
  const configOutputDir = "./test-output/config-test";
  
  await fileManager.createDirectory(configTestDir);
  await fileManager.createFile(`${configTestDir}/test.txt`, "Hello {{name}}!");
  await fileManager.createFile(`${configTestDir}/test.bin`, new Uint8Array([0x01, 0x02]));
  await fileManager.createFile(
    `${configTestDir}/test.md`, 
    "# Title\n{{#if showFeature}}Feature content{{/if}}\nBy {{author}}"
  );
  
  // Process with file configs
  const result = await templateProcessor.processDirectoryWithFileConfigs(
    configTestDir,
    configOutputDir,
    { name: "User", author: "John Doe" },
    testFileConfigs
  );
  
  // Check all operations were successful
  const allSuccess = result.every(r => r.success);
  assertEquals(allSuccess, true);
  
  // Verify text file was processed with overridden context
  const txtExists = await fileManager.fileExists(`${configOutputDir}/test.txt`);
  assertEquals(txtExists, true);
  
  const txtContent = await Deno.readTextFile(`${configOutputDir}/test.txt`);
  assertEquals(txtContent, "Hello Override!"); // Should use overridden name
  
  // Verify binary file was copied without processing
  const binExists = await fileManager.fileExists(`${configOutputDir}/test.bin`);
  assertEquals(binExists, true);
  
  // Verify markdown file was processed with conditionals
  const mdExists = await fileManager.fileExists(`${configOutputDir}/test.md`);
  assertEquals(mdExists, true);
  
  const mdContent = await Deno.readTextFile(`${configOutputDir}/test.md`);
  assertEquals(mdContent.includes("Feature content"), true); // Conditional should be included
  assertEquals(mdContent.includes("By John Doe"), true); // Author should be replaced
});

Deno.test("TemplateProcessor - Process templates from config", async () => {
  // Create test template files
  const templateDir = "./test-templates/app-template";
  const baseDir = `${templateDir}/base`;
  const outputDir = "./test-output/app-output";
  
  await fileManager.createDirectory(baseDir);
  await fileManager.createFile(`${baseDir}/deno.json`, '{"name": "{{app.name}}"}');
  await fileManager.createFile(`${baseDir}/README.md`, '# {{app.name}}\n\n{{app.description}}');
  await fileManager.createFile(`${baseDir}/styles.css`, ':root { --primary-color: {{theme.primaryColor}}; }');
  await fileManager.createDirectory(`${baseDir}/routes`);
  await fileManager.createFile(
    `${baseDir}/routes/index.tsx`, 
    'export default function Home() { return <h1>Welcome to {{app.name}}</h1>; }'
  );
  
  // Process templates from config
  const result = await templateProcessor.processTemplatesFromConfig(
    baseDir,
    outputDir,
    testConfig
  );
  
  // Check all operations were successful
  const allSuccess = result.every(r => r.success);
  assertEquals(allSuccess, true);
  
  // Verify files were processed correctly
  const denoJsonExists = await fileManager.fileExists(`${outputDir}/deno.json`);
  assertEquals(denoJsonExists, true);
  
  const denoJsonContent = await Deno.readTextFile(`${outputDir}/deno.json`);
  assertEquals(denoJsonContent, '{"name": "test-app"}');
  
  const readmeExists = await fileManager.fileExists(`${outputDir}/README.md`);
  assertEquals(readmeExists, true);
  
  const readmeContent = await Deno.readTextFile(`${outputDir}/README.md`);
  assertEquals(readmeContent, '# test-app\n\nTest application');
  
  const cssExists = await fileManager.fileExists(`${outputDir}/styles.css`);
  assertEquals(cssExists, true);
  
  const cssContent = await Deno.readTextFile(`${outputDir}/styles.css`);
  assertEquals(cssContent, ':root { --primary-color: #007bff; }');
  
  const indexExists = await fileManager.fileExists(`${outputDir}/routes/index.tsx`);
  assertEquals(indexExists, true);
  
  const indexContent = await Deno.readTextFile(`${outputDir}/routes/index.tsx`);
  assertEquals(indexContent, 'export default function Home() { return <h1>Welcome to test-app</h1>; }');
});

Deno.test("TemplateProcessor - Generate project", async () => {
  // Create test template files
  const templateRoot = "./test-templates/project-template";
  const baseDir = `${templateRoot}/base`;
  const outputRoot = "./test-output/project-output";
  
  await fileManager.createDirectory(baseDir);
  await fileManager.createFile(`${baseDir}/deno.json`, '{"name": "{{app.name}}"}');
  await fileManager.createFile(`${baseDir}/README.md`, '# {{app.name}}\n\n{{app.description}}');
  await fileManager.createDirectory(`${baseDir}/routes`);
  await fileManager.createFile(
    `${baseDir}/routes/index.tsx`, 
    'export default function Home() { return <h1>Welcome to {{app.name}}</h1>; }'
  );
  
  // Generate project
  const result = await templateProcessor.generateProject(
    testConfig,
    templateRoot,
    outputRoot
  );
  
  // Check operations were successful
  const successCount = result.filter(r => r.success).length;
  assertNotEquals(successCount, 0);
  
  // Verify project directory was created
  const projectExists = await fileManager.directoryExists(`${outputRoot}/test-app`);
  assertEquals(projectExists, true);
  
  // Verify files were processed correctly
  const readmeExists = await fileManager.fileExists(`${outputRoot}/test-app/README.md`);
  assertEquals(readmeExists, true);
  
  const indexExists = await fileManager.fileExists(`${outputRoot}/test-app/routes/index.tsx`);
  assertEquals(indexExists, true);
  
  // Verify content was processed
  if (indexExists) {
    const indexContent = await Deno.readTextFile(`${outputRoot}/test-app/routes/index.tsx`);
    assertEquals(indexContent.includes("test-app"), true);
  }
});

Deno.test({
  name: "TemplateProcessor - Cleanup",
  fn: async () => {
    // Clean up test directories
    await Deno.remove(testDir, { recursive: true });
    await Deno.remove(testOutputDir, { recursive: true });
  },
  sanitizeResources: false,
  sanitizeOps: false
});