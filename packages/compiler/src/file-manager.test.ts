// Tests for the file system operations
import { assertEquals, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import { FileManager, type DirectoryStructure } from "./file-manager.ts";
import type { AppConfig } from "../../shared/src/types.ts";

// Create a test instance
const fileManager = new FileManager();

// Test directory paths
const testDir = "./test-temp";
const testSubDir = "./test-temp/subdir";
const testFile = "./test-temp/test.txt";
const testFileContent = "Test file content";
const testCopyFile = "./test-temp/test-copy.txt";
const testBinaryFile = "./test-temp/test.bin";
const testBinaryContent = new Uint8Array([0x01, 0x02, 0x03, 0x04]);

// Test directory structure
const testStructure: DirectoryStructure = {
  name: "project",
  directories: [
    {
      name: "src",
      directories: [
        { name: "components" },
        { name: "utils" }
      ],
      files: [
        { name: "index.ts", content: "export * from './components';" },
        { name: "types.ts", content: "export type AppProps = {};" }
      ]
    },
    {
      name: "public",
      files: [
        { name: "index.html", content: "<!DOCTYPE html><html><body>Hello</body></html>" }
      ]
    }
  ],
  files: [
    { name: "README.md", content: "# Test Project" },
    { name: "deno.json", content: "{}" }
  ]
};

// Test app config
const testAppConfig: AppConfig = {
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
    }
  ],
  routes: [
    {
      path: "/",
      component: "HomePage"
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
    ]
  }
};

// Setup and cleanup
Deno.test({
  name: "FileManager - Setup",
  fn: async () => {
    // Clean up any existing test directory
    try {
      await Deno.remove(testDir, { recursive: true });
    } catch (error) {
      // Ignore errors if directory doesn't exist
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

Deno.test("FileManager - Create directory", async () => {
  const result = await fileManager.createDirectory(testDir);
  assertEquals(result.success, true);
  
  // Verify directory exists
  const stat = await Deno.stat(testDir);
  assertEquals(stat.isDirectory, true);
});

Deno.test("FileManager - Create nested directory", async () => {
  const result = await fileManager.createDirectory(testSubDir);
  assertEquals(result.success, true);
  
  // Verify directory exists
  const stat = await Deno.stat(testSubDir);
  assertEquals(stat.isDirectory, true);
});

Deno.test("FileManager - Create file", async () => {
  const result = await fileManager.createFile(testFile, testFileContent);
  assertEquals(result.success, true);
  
  // Verify file exists and has correct content
  const content = await Deno.readTextFile(testFile);
  assertEquals(content, testFileContent);
});

Deno.test("FileManager - Create binary file", async () => {
  const result = await fileManager.createFile(testBinaryFile, testBinaryContent);
  assertEquals(result.success, true);
  
  // Verify file exists and has correct content
  const content = await Deno.readFile(testBinaryFile);
  assertEquals(content, testBinaryContent);
});

Deno.test("FileManager - File exists", async () => {
  const exists = await fileManager.fileExists(testFile);
  assertEquals(exists, true);
  
  const notExists = await fileManager.fileExists("./test-temp/nonexistent.txt");
  assertEquals(notExists, false);
});

Deno.test("FileManager - Directory exists", async () => {
  const exists = await fileManager.directoryExists(testDir);
  assertEquals(exists, true);
  
  const notExists = await fileManager.directoryExists("./test-temp/nonexistent");
  assertEquals(notExists, false);
});

Deno.test("FileManager - Copy file", async () => {
  const result = await fileManager.copyFile(testFile, testCopyFile);
  assertEquals(result.success, true);
  
  // Verify file exists and has correct content
  const content = await Deno.readTextFile(testCopyFile);
  assertEquals(content, testFileContent);
});

Deno.test("FileManager - Copy directory", async () => {
  const copyDir = "./test-temp/copy-dir";
  
  // Create some files in the test directory
  await fileManager.createFile(`${testSubDir}/file1.txt`, "File 1 content");
  await fileManager.createFile(`${testSubDir}/file2.txt`, "File 2 content");
  
  const results = await fileManager.copyDirectory(testSubDir, copyDir);
  
  // Check all operations were successful
  const allSuccess = results.every(r => r.success);
  assertEquals(allSuccess, true);
  
  // Verify directory and files exist
  const dirExists = await fileManager.directoryExists(copyDir);
  assertEquals(dirExists, true);
  
  const file1Exists = await fileManager.fileExists(`${copyDir}/file1.txt`);
  assertEquals(file1Exists, true);
  
  const file2Exists = await fileManager.fileExists(`${copyDir}/file2.txt`);
  assertEquals(file2Exists, true);
  
  // Verify file contents
  const file1Content = await Deno.readTextFile(`${copyDir}/file1.txt`);
  assertEquals(file1Content, "File 1 content");
  
  const file2Content = await Deno.readTextFile(`${copyDir}/file2.txt`);
  assertEquals(file2Content, "File 2 content");
});

Deno.test("FileManager - Delete file", async () => {
  const result = await fileManager.deleteFile(testCopyFile);
  assertEquals(result.success, true);
  
  // Verify file no longer exists
  const exists = await fileManager.fileExists(testCopyFile);
  assertEquals(exists, false);
});

Deno.test("FileManager - Delete directory", async () => {
  const result = await fileManager.deleteDirectory(testSubDir);
  assertEquals(result.success, true);
  
  // Verify directory no longer exists
  const exists = await fileManager.directoryExists(testSubDir);
  assertEquals(exists, false);
});

Deno.test("FileManager - Dry run operations", async () => {
  const dryRunFile = "./test-temp/dry-run.txt";
  
  // Create file with dry run
  const createResult = await fileManager.createFile(dryRunFile, "Dry run content", { dryRun: true });
  assertEquals(createResult.success, true);
  
  // Verify file doesn't actually exist
  const exists = await fileManager.fileExists(dryRunFile);
  assertEquals(exists, false);
});

Deno.test("FileManager - Handle existing files", async () => {
  // Try to create file without overwrite
  const result1 = await fileManager.createFile(testFile, "New content", { overwrite: false });
  assertEquals(result1.success, false);
  
  // Verify content hasn't changed
  const content1 = await Deno.readTextFile(testFile);
  assertEquals(content1, testFileContent);
  
  // Create file with overwrite
  const result2 = await fileManager.createFile(testFile, "New content", { overwrite: true });
  assertEquals(result2.success, true);
  
  // Verify content has changed
  const content2 = await Deno.readTextFile(testFile);
  assertEquals(content2, "New content");
});

Deno.test("FileManager - Generate directory structure", async () => {
  const structureDir = "./test-temp/structure";
  
  // Generate the directory structure
  const result = await fileManager.generateDirectoryStructure(structureDir, testStructure);
  
  // Check if the operation was successful
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  
  // Verify root directory exists
  const rootExists = await fileManager.directoryExists(`${structureDir}/project`);
  assertEquals(rootExists, true);
  
  // Verify subdirectories exist
  const srcExists = await fileManager.directoryExists(`${structureDir}/project/src`);
  assertEquals(srcExists, true);
  
  const componentsExists = await fileManager.directoryExists(`${structureDir}/project/src/components`);
  assertEquals(componentsExists, true);
  
  const utilsExists = await fileManager.directoryExists(`${structureDir}/project/src/utils`);
  assertEquals(utilsExists, true);
  
  const publicExists = await fileManager.directoryExists(`${structureDir}/project/public`);
  assertEquals(publicExists, true);
  
  // Verify files exist and have correct content
  const readmeExists = await fileManager.fileExists(`${structureDir}/project/README.md`);
  assertEquals(readmeExists, true);
  
  const readmeContent = await Deno.readTextFile(`${structureDir}/project/README.md`);
  assertEquals(readmeContent, "# Test Project");
  
  const indexExists = await fileManager.fileExists(`${structureDir}/project/src/index.ts`);
  assertEquals(indexExists, true);
  
  const indexContent = await Deno.readTextFile(`${structureDir}/project/src/index.ts`);
  assertEquals(indexContent, "export * from './components';");
  
  const htmlExists = await fileManager.fileExists(`${structureDir}/project/public/index.html`);
  assertEquals(htmlExists, true);
  
  const htmlContent = await Deno.readTextFile(`${structureDir}/project/public/index.html`);
  assertEquals(htmlContent, "<!DOCTYPE html><html><body>Hello</body></html>");
});

Deno.test("FileManager - Generate project structure", async () => {
  // Create a template directory for testing
  const templateDir = "./test-temp/templates";
  const baseTemplateDir = `${templateDir}/base`;
  
  await fileManager.createDirectory(baseTemplateDir);
  await fileManager.createFile(`${baseTemplateDir}/deno.json`, '{"name": "{{app.name}}"}');
  await fileManager.createFile(`${baseTemplateDir}/README.md`, '# {{app.name}}\n\n{{app.description}}');
  
  // Generate the project structure
  const outputDir = "./test-temp/output";
  const result = await fileManager.generateProjectStructure(
    outputDir,
    testAppConfig,
    templateDir
  );
  
  // Check if the operation was successful
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  
  // Verify project directory exists
  const projectExists = await fileManager.directoryExists(`${outputDir}/test-app`);
  assertEquals(projectExists, true);
  
  // Verify standard directories exist
  const routesExists = await fileManager.directoryExists(`${outputDir}/test-app/routes`);
  assertEquals(routesExists, true);
  
  const islandsExists = await fileManager.directoryExists(`${outputDir}/test-app/islands`);
  assertEquals(islandsExists, true);
  
  const componentsExists = await fileManager.directoryExists(`${outputDir}/test-app/components`);
  assertEquals(componentsExists, true);
  
  const staticExists = await fileManager.directoryExists(`${outputDir}/test-app/static`);
  assertEquals(staticExists, true);
  
  // Verify API directory exists (since API endpoints are defined)
  const apiExists = await fileManager.directoryExists(`${outputDir}/test-app/routes/api`);
  assertEquals(apiExists, true);
  
  // Verify component type directories exist
  const headerExists = await fileManager.directoryExists(`${outputDir}/test-app/components/Header`);
  assertEquals(headerExists, true);
  
  // Verify template files were copied
  const denoJsonExists = await fileManager.fileExists(`${outputDir}/test-app/deno.json`);
  assertEquals(denoJsonExists, true);
  
  const readmeExists = await fileManager.fileExists(`${outputDir}/test-app/README.md`);
  assertEquals(readmeExists, true);
});

Deno.test({
  name: "FileManager - Cleanup",
  fn: async () => {
    // Clean up test directory
    await Deno.remove(testDir, { recursive: true });
  },
  sanitizeResources: false,
  sanitizeOps: false
});