// Tests for the CLI interface
import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.170.0/testing/asserts.ts";
import { fs } from "../../shared/src/utils.ts";

// Test helper to run CLI with arguments
async function runCli(args: string[]): Promise<{ stdout: string; stderr: string; status: number }> {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-read", "--allow-write", "--allow-env", "packages/compiler/src/cli.ts", ...args],
    stdout: "piped",
    stderr: "piped",
  });
  
  const { stdout, stderr, code } = await command.output();
  
  return {
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
    status: code
  };
}

// Create a temporary directory for testing
async function createTempDir(): Promise<string> {
  const tempDir = await Deno.makeTempDir({ prefix: "cli-test-" });
  return tempDir;
}

// Create a sample config file for testing
async function createSampleConfig(dir: string): Promise<string> {
  const configPath = fs.joinPath(dir, "app-config.json");
  
  const sampleConfig = {
    "metadata": {
      "name": "test-app",
      "version": "1.0.0",
      "description": "Test application"
    },
    "components": [],
    "routes": [
      {
        "path": "/",
        "component": "main"
      }
    ],
    "api": {
      "endpoints": []
    }
  };
  
  await Deno.writeTextFile(configPath, JSON.stringify(sampleConfig, null, 2));
  return configPath;
}

// Create a sample template directory for testing
async function createSampleTemplates(dir: string): Promise<string> {
  const templateDir = fs.joinPath(dir, "templates");
  
  // Create base template structure
  await Deno.mkdir(fs.joinPath(templateDir, "base"), { recursive: true });
  await Deno.mkdir(fs.joinPath(templateDir, "base/routes"), { recursive: true });
  
  // Create sample template files
  await Deno.writeTextFile(
    fs.joinPath(templateDir, "base/deno.json"),
    JSON.stringify({
      "name": "{{app.name}}",
      "version": "{{app.version}}"
    }, null, 2)
  );
  
  return templateDir;
}

// Clean up test directories
async function cleanupTestDir(dir: string): Promise<void> {
  try {
    await Deno.remove(dir, { recursive: true });
  } catch (e) {
    // Ignore errors during cleanup
    console.warn(`Failed to clean up test directory: ${e.message}`);
  }
}

// Test CLI help output
Deno.test({
  name: "CLI - Help output",
  async fn() {
    const { stdout, stderr, status } = await runCli(["--help"]);
    
    assertEquals(status, 0, "CLI should exit with status 0");
    assertStringIncludes(stdout, "JSON App Compiler", "Help output should include title");
    assertStringIncludes(stdout, "USAGE:", "Help output should include usage section");
    assertStringIncludes(stdout, "OPTIONS:", "Help output should include options section");
    assertStringIncludes(stdout, "EXAMPLES:", "Help output should include examples section");
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test CLI version output
Deno.test({
  name: "CLI - Version output",
  async fn() {
    const { stdout, stderr, status } = await runCli(["--version"]);
    
    assertEquals(status, 0, "CLI should exit with status 0");
    assertStringIncludes(stdout, "JSON App Compiler v", "Version output should include version");
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test CLI missing required options
Deno.test({
  name: "CLI - Missing required options",
  async fn() {
    const { stdout, stderr, status } = await runCli([]);
    
    assertEquals(status, 1, "CLI should exit with status 1");
    assertStringIncludes(stderr, "Missing required option", "Error should mention missing option");
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test CLI with invalid config file
Deno.test({
  name: "CLI - Invalid config file",
  async fn() {
    const testDir = await createTempDir();
    const outputDir = fs.joinPath(testDir, "output");
    const templateDir = await createSampleTemplates(testDir);
    
    try {
      const { stdout, stderr, status } = await runCli([
        "--config", "non-existent-config.json",
        "--output", outputDir,
        "--template", templateDir
      ]);
      
      assertEquals(status, 1, "CLI should exit with status 1");
      assertStringIncludes(stderr, "Config file not found", "Error should mention missing config file");
    } finally {
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test CLI with invalid template directory
Deno.test({
  name: "CLI - Invalid template directory",
  async fn() {
    const testDir = await createTempDir();
    const configPath = await createSampleConfig(testDir);
    const outputDir = fs.joinPath(testDir, "output");
    
    try {
      const { stdout, stderr, status } = await runCli([
        "--config", configPath,
        "--output", outputDir,
        "--template", "non-existent-templates"
      ]);
      
      assertEquals(status, 1, "CLI should exit with status 1");
      assertStringIncludes(stderr, "Template directory not found", "Error should mention missing template directory");
    } finally {
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test CLI with dry run option
Deno.test({
  name: "CLI - Dry run",
  async fn() {
    const testDir = await createTempDir();
    const configPath = await createSampleConfig(testDir);
    const outputDir = fs.joinPath(testDir, "output");
    const templateDir = await createSampleTemplates(testDir);
    
    try {
      const { stdout, stderr, status } = await runCli([
        "--config", configPath,
        "--output", outputDir,
        "--template", templateDir,
        "--dry-run"
      ]);
      
      // Note: This test might fail if the compiler implementation doesn't handle dry run correctly
      // We're testing the CLI interface, not the compiler itself
      assertStringIncludes(stdout, "Compiling", "Output should mention compilation");
    } finally {
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test CLI with verbose option
Deno.test({
  name: "CLI - Verbose output",
  async fn() {
    const testDir = await createTempDir();
    const configPath = await createSampleConfig(testDir);
    const outputDir = fs.joinPath(testDir, "output");
    const templateDir = await createSampleTemplates(testDir);
    
    try {
      const { stdout, stderr } = await runCli([
        "--config", configPath,
        "--output", outputDir,
        "--template", templateDir,
        "--verbose",
        "--dry-run" // Use dry run to avoid actual file operations
      ]);
      
      // Combined output should contain verbose information
      const combinedOutput = stdout + stderr;
      assertStringIncludes(combinedOutput, "Compiling", "Output should mention compilation");
    } finally {
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});