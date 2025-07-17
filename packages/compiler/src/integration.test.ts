// Integration tests for generated applications
import { assertEquals, assertExists, assertNotEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { fs, logger, LogLevel } from "../../shared/src/utils.ts";
import { Compiler, CompilationPhase, type CompilationOptions } from "./compiler.ts";
import { createComponentRegistry } from "../../ui-library/src/registry.ts";
import { fileManager } from "./file-manager.ts";
import { configParser } from "./config-parser.ts";

// Create a temporary directory for testing
async function createTempDir(): Promise<string> {
  const tempDir = await Deno.makeTempDir({ prefix: "integration-test-" });
  return tempDir;
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

// Get the path to the example configurations
function getExamplePath(example: string): string {
  return fs.joinPath(Deno.cwd(), "examples", example, "app-config.json");
}

// Get the path to the template directory
function getTemplateDir(): string {
  return fs.joinPath(Deno.cwd(), "packages", "templates", "base");
}

// Test compilation of the simple example
Deno.test({
  name: "Integration - Compile simple example",
  async fn() {
    // Create test directories
    const testDir = await createTempDir();
    const outputDir = fs.joinPath(testDir, "output");
    const templateDir = getTemplateDir();
    const configPath = getExamplePath("simple");
    
    try {
      // Create compiler instance
      const compiler = new Compiler(createComponentRegistry());
      
      // Set compilation options
      const options: CompilationOptions = {
        templateDir,
        outputDir,
        validateProps: true,
        validateTemplates: true,
        generateLayouts: true,
        generateMiddleware: true,
        useTypeScript: true,
        optimize: true,
        logLevel: LogLevel.INFO,
        throwOnError: false,
        overwrite: true,
        verbose: true
      };
      
      // Run compilation
      const result = await compiler.compile(configPath, options);
      
      // Verify compilation result
      assertEquals(result.success, true, "Compilation should succeed");
      assertNotEquals(result.outputPath, "", "Output path should not be empty");
      assertEquals(result.phase, CompilationPhase.COMPLETE, "Compilation should complete");
      assertEquals(result.errors.length, 0, "There should be no errors");
      
      // Verify generated files
      const appDir = fs.joinPath(outputDir, "simple-app");
      const exists = await fileManager.directoryExists(appDir);
      assertEquals(exists, true, "Application directory should exist");
      
      // Check for key files
      const denoJsonExists = await fileManager.fileExists(fs.joinPath(appDir, "deno.json"));
      assertEquals(denoJsonExists, true, "deno.json should exist");
      
      const indexRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/index.tsx"));
      assertEquals(indexRouteExists, true, "index route should exist");
      
      const aboutRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/about.tsx"));
      assertEquals(aboutRouteExists, true, "about route should exist");
      
      const contactRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/contact.tsx"));
      assertEquals(contactRouteExists, true, "contact route should exist");
      
      const apiRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/api/hello.ts"));
      assertEquals(apiRouteExists, true, "API route should exist");
      
      // Check file content
      const denoJsonContent = await Deno.readTextFile(fs.joinPath(appDir, "deno.json"));
      const denoJson = JSON.parse(denoJsonContent);
      assertEquals(denoJson.name, "simple-app", "App name should be set correctly");
      assertEquals(denoJson.version, "1.0.0", "App version should be set correctly");
      
      // Check that routes reference the correct components
      const indexRouteContent = await Deno.readTextFile(fs.joinPath(appDir, "routes/index.tsx"));
      assert(indexRouteContent.includes("homeContent"), "Index route should reference homeContent component");
      
      const aboutRouteContent = await Deno.readTextFile(fs.joinPath(appDir, "routes/about.tsx"));
      assert(aboutRouteContent.includes("aboutContent"), "About route should reference aboutContent component");
      
      const contactRouteContent = await Deno.readTextFile(fs.joinPath(appDir, "routes/contact.tsx"));
      assert(contactRouteContent.includes("contactForm"), "Contact route should reference contactForm component");
      
      // Check that API route is generated correctly
      const apiRouteContent = await Deno.readTextFile(fs.joinPath(appDir, "routes/api/hello.ts"));
      assert(apiRouteContent.includes("HelloHandler"), "API route should reference HelloHandler");
      
    } finally {
      // Clean up test directories
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test compilation of the complex example
Deno.test({
  name: "Integration - Compile complex example",
  async fn() {
    // Create test directories
    const testDir = await createTempDir();
    const outputDir = fs.joinPath(testDir, "output");
    const templateDir = getTemplateDir();
    const configPath = getExamplePath("complex");
    
    try {
      // Create compiler instance
      const compiler = new Compiler(createComponentRegistry());
      
      // Set compilation options
      const options: CompilationOptions = {
        templateDir,
        outputDir,
        validateProps: true,
        validateTemplates: true,
        generateLayouts: true,
        generateMiddleware: true,
        useTypeScript: true,
        optimize: true,
        logLevel: LogLevel.INFO,
        throwOnError: false,
        overwrite: true,
        verbose: true
      };
      
      // Run compilation
      const result = await compiler.compile(configPath, options);
      
      // Verify compilation result
      assertEquals(result.success, true, "Compilation should succeed");
      assertNotEquals(result.outputPath, "", "Output path should not be empty");
      assertEquals(result.phase, CompilationPhase.COMPLETE, "Compilation should complete");
      assertEquals(result.errors.length, 0, "There should be no errors");
      
      // Verify generated files
      const appDir = fs.joinPath(outputDir, "complex-app");
      const exists = await fileManager.directoryExists(appDir);
      assertEquals(exists, true, "Application directory should exist");
      
      // Check for key files
      const denoJsonExists = await fileManager.fileExists(fs.joinPath(appDir, "deno.json"));
      assertEquals(denoJsonExists, true, "deno.json should exist");
      
      const indexRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/index.tsx"));
      assertEquals(indexRouteExists, true, "index route should exist");
      
      const dashboardRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/dashboard.tsx"));
      assertEquals(dashboardRouteExists, true, "dashboard route should exist");
      
      const loginRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/login.tsx"));
      assertEquals(loginRouteExists, true, "login route should exist");
      
      // Check API routes
      const usersApiRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/api/users.ts"));
      assertEquals(usersApiRouteExists, true, "users API route should exist");
      
      const userDetailApiRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/api/users/[id].ts"));
      assertEquals(userDetailApiRouteExists, true, "user detail API route should exist");
      
      const authLoginApiRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/api/auth/login.ts"));
      assertEquals(authLoginApiRouteExists, true, "auth login API route should exist");
      
      const authRegisterApiRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/api/auth/register.ts"));
      assertEquals(authRegisterApiRouteExists, true, "auth register API route should exist");
      
      // Check middleware
      const middlewareExists = await fileManager.fileExists(fs.joinPath(appDir, "middleware.ts"));
      assertEquals(middlewareExists, true, "middleware file should exist");
      
      // Check file content
      const denoJsonContent = await Deno.readTextFile(fs.joinPath(appDir, "deno.json"));
      const denoJson = JSON.parse(denoJsonContent);
      assertEquals(denoJson.name, "complex-app", "App name should be set correctly");
      assertEquals(denoJson.version, "1.0.0", "App version should be set correctly");
      
      // Check that routes reference the correct components
      const indexRouteContent = await Deno.readTextFile(fs.joinPath(appDir, "routes/index.tsx"));
      assert(indexRouteContent.includes("homePage"), "Index route should reference homePage component");
      assert(indexRouteContent.includes("mainLayout"), "Index route should reference mainLayout component");
      
      const dashboardRouteContent = await Deno.readTextFile(fs.joinPath(appDir, "routes/dashboard.tsx"));
      assert(dashboardRouteContent.includes("dashboardPage"), "Dashboard route should reference dashboardPage component");
      assert(dashboardRouteContent.includes("dashboardLayout"), "Dashboard route should reference dashboardLayout component");
      
      // Check that middleware is referenced correctly
      const middlewareContent = await Deno.readTextFile(fs.joinPath(appDir, "middleware.ts"));
      assert(middlewareContent.includes("logRequest"), "Middleware should include logRequest");
      assert(middlewareContent.includes("validateRequest"), "Middleware should include validateRequest");
      assert(middlewareContent.includes("requireAuth"), "Middleware should include requireAuth");
      assert(middlewareContent.includes("guestOnly"), "Middleware should include guestOnly");
      
    } finally {
      // Clean up test directories
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test compilation of the e-commerce example
Deno.test({
  name: "Integration - Compile e-commerce example",
  async fn() {
    // Create test directories
    const testDir = await createTempDir();
    const outputDir = fs.joinPath(testDir, "output");
    const templateDir = getTemplateDir();
    const configPath = getExamplePath("ecommerce");
    
    try {
      // Create compiler instance
      const compiler = new Compiler(createComponentRegistry());
      
      // Set compilation options
      const options: CompilationOptions = {
        templateDir,
        outputDir,
        validateProps: true,
        validateTemplates: true,
        generateLayouts: true,
        generateMiddleware: true,
        useTypeScript: true,
        optimize: true,
        logLevel: LogLevel.INFO,
        throwOnError: false,
        overwrite: true,
        verbose: true
      };
      
      // Run compilation
      const result = await compiler.compile(configPath, options);
      
      // Verify compilation result
      assertEquals(result.success, true, "Compilation should succeed");
      assertNotEquals(result.outputPath, "", "Output path should not be empty");
      assertEquals(result.phase, CompilationPhase.COMPLETE, "Compilation should complete");
      assertEquals(result.errors.length, 0, "There should be no errors");
      
      // Verify generated files
      const appDir = fs.joinPath(outputDir, "ecommerce-app");
      const exists = await fileManager.directoryExists(appDir);
      assertEquals(exists, true, "Application directory should exist");
      
      // Check for key files
      const denoJsonExists = await fileManager.fileExists(fs.joinPath(appDir, "deno.json"));
      assertEquals(denoJsonExists, true, "deno.json should exist");
      
      // Check routes
      const indexRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/index.tsx"));
      assertEquals(indexRouteExists, true, "index route should exist");
      
      const productsRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/products.tsx"));
      assertEquals(productsRouteExists, true, "products route should exist");
      
      const productDetailRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/products/[id].tsx"));
      assertEquals(productDetailRouteExists, true, "product detail route should exist");
      
      const cartRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/cart.tsx"));
      assertEquals(cartRouteExists, true, "cart route should exist");
      
      const checkoutRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/checkout.tsx"));
      assertEquals(checkoutRouteExists, true, "checkout route should exist");
      
      // Check API routes
      const productsApiRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/api/products.ts"));
      assertEquals(productsApiRouteExists, true, "products API route should exist");
      
      const productDetailApiRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/api/products/[id].ts"));
      assertEquals(productDetailApiRouteExists, true, "product detail API route should exist");
      
      const cartApiRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/api/cart.ts"));
      assertEquals(cartApiRouteExists, true, "cart API route should exist");
      
      const ordersApiRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/api/orders.ts"));
      assertEquals(ordersApiRouteExists, true, "orders API route should exist");
      
      // Check file content
      const denoJsonContent = await Deno.readTextFile(fs.joinPath(appDir, "deno.json"));
      const denoJson = JSON.parse(denoJsonContent);
      assertEquals(denoJson.name, "ecommerce-app", "App name should be set correctly");
      assertEquals(denoJson.version, "1.0.0", "App version should be set correctly");
      
    } finally {
      // Clean up test directories
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test validation with edge cases
Deno.test({
  name: "Integration - Validate edge cases",
  async fn() {
    const configPath = getExamplePath("edge-cases");
    
    try {
      // Parse the configuration
      const config = await configParser.parseFile(configPath);
      
      // Validate the configuration
      const validationResult = configParser.validate(config);
      
      // Verify validation result
      assertEquals(validationResult.valid, false, "Validation should fail for edge cases");
      assertNotEquals(validationResult.errors.length, 0, "There should be validation errors");
      
      // Check for specific validation errors
      const errorMessages = validationResult.errors.map(error => error.message);
      
      // Check for duplicate route error
      const hasDuplicateRouteError = errorMessages.some(message => 
        message.includes("duplicate") && message.includes("route")
      );
      assertEquals(hasDuplicateRouteError, true, "Should detect duplicate routes");
      
      // Check for invalid component error
      const hasInvalidComponentError = errorMessages.some(message => 
        message.includes("component") && message.includes("not found")
      );
      assertEquals(hasInvalidComponentError, true, "Should detect invalid component references");
      
      // Check for invalid middleware error
      const hasInvalidMiddlewareError = errorMessages.some(message => 
        message.includes("middleware") && message.includes("not found")
      );
      assertEquals(hasInvalidMiddlewareError, true, "Should detect invalid middleware references");
      
      // Check for invalid HTTP method error
      const hasInvalidMethodError = errorMessages.some(message => 
        message.includes("method") && message.includes("invalid")
      );
      assertEquals(hasInvalidMethodError, true, "Should detect invalid HTTP methods");
      
    } catch (error) {
      assert(false, `Unexpected error: ${error.message}`);
    }
  }
});

// Test advanced edge cases
Deno.test({
  name: "Integration - Validate advanced edge cases",
  async fn() {
    const configPath = fs.joinPath(Deno.cwd(), "examples", "edge-cases", "advanced-edge-cases.json");
    
    try {
      // Parse the configuration
      const config = await configParser.parseFile(configPath);
      
      // Validate the configuration
      const validationResult = configParser.validate(config);
      
      // Verify validation result
      assertEquals(validationResult.valid, false, "Validation should fail for advanced edge cases");
      assertNotEquals(validationResult.errors.length, 0, "There should be validation errors");
      
      // Check for specific validation errors
      const errorMessages = validationResult.errors.map(error => error.message);
      
      // Check for duplicate component ID error
      const hasDuplicateIdError = errorMessages.some(message => 
        message.includes("duplicate") && message.includes("id")
      );
      assertEquals(hasDuplicateIdError, true, "Should detect duplicate component IDs");
      
      // Check for empty ID error
      const hasEmptyIdError = errorMessages.some(message => 
        message.includes("empty") && message.includes("id")
      );
      assertEquals(hasEmptyIdError, true, "Should detect empty component IDs");
      
      // Check for invalid prop type error
      const hasInvalidPropError = errorMessages.some(message => 
        message.includes("prop") && message.includes("type")
      );
      assertEquals(hasInvalidPropError, true, "Should detect invalid prop types");
      
      // Check for invalid route path error
      const hasInvalidPathError = errorMessages.some(message => 
        message.includes("path") && message.includes("invalid")
      );
      assertEquals(hasInvalidPathError, true, "Should detect invalid route paths");
      
    } catch (error) {
      assert(false, `Unexpected error: ${error.message}`);
    }
  }
});

// Test compilation performance benchmarks
Deno.test({
  name: "Integration - Compilation performance benchmarks",
  async fn() {
    // Create test directories
    const testDir = await createTempDir();
    const outputDir = fs.joinPath(testDir, "output");
    const templateDir = getTemplateDir();
    
    try {
      // Create compiler instance
      const compiler = new Compiler(createComponentRegistry());
      
      // Set compilation options
      const options: CompilationOptions = {
        templateDir,
        outputDir,
        validateProps: true,
        validateTemplates: true,
        generateLayouts: true,
        generateMiddleware: true,
        useTypeScript: true,
        optimize: true,
        logLevel: LogLevel.INFO,
        throwOnError: false,
        overwrite: true,
        verbose: false
      };
      
      // Benchmark simple example
      const simpleConfigPath = getExamplePath("simple");
      const simpleStartTime = performance.now();
      const simpleResult = await compiler.compile(simpleConfigPath, options);
      const simpleEndTime = performance.now();
      const simpleCompilationTime = simpleEndTime - simpleStartTime;
      
      // Benchmark complex example
      const complexConfigPath = getExamplePath("complex");
      const complexStartTime = performance.now();
      const complexResult = await compiler.compile(complexConfigPath, options);
      const complexEndTime = performance.now();
      const complexCompilationTime = complexEndTime - complexStartTime;
      
      // Benchmark e-commerce example
      const ecommerceConfigPath = getExamplePath("ecommerce");
      const ecommerceStartTime = performance.now();
      const ecommerceResult = await compiler.compile(ecommerceConfigPath, options);
      const ecommerceEndTime = performance.now();
      const ecommerceCompilationTime = ecommerceEndTime - ecommerceStartTime;
      
      // Log benchmark results
      console.log(`\nCompilation Performance Benchmarks:`);
      console.log(`Simple example: ${simpleCompilationTime.toFixed(2)}ms`);
      console.log(`Complex example: ${complexCompilationTime.toFixed(2)}ms`);
      console.log(`E-commerce example: ${ecommerceCompilationTime.toFixed(2)}ms`);
      
      // Verify all compilations succeeded
      assertEquals(simpleResult.success, true, "Simple example compilation should succeed");
      assertEquals(complexResult.success, true, "Complex example compilation should succeed");
      assertEquals(ecommerceResult.success, true, "E-commerce example compilation should succeed");
      
      // Verify compilation times are reasonable
      assert(simpleCompilationTime > 0, "Compilation time should be positive");
      assert(complexCompilationTime > 0, "Compilation time should be positive");
      assert(ecommerceCompilationTime > 0, "Compilation time should be positive");
      
      // Complex example should take longer than simple example
      assert(complexCompilationTime > simpleCompilationTime, "Complex example should take longer to compile");
      
    } finally {
      // Clean up test directories
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test regression prevention
Deno.test({
  name: "Integration - Regression prevention",
  async fn() {
    // Create test directories
    const testDir = await createTempDir();
    const outputDir = fs.joinPath(testDir, "output");
    const templateDir = getTemplateDir();
    const configPath = getExamplePath("simple");
    
    try {
      // Create compiler instance
      const compiler = new Compiler(createComponentRegistry());
      
      // Set compilation options
      const options: CompilationOptions = {
        templateDir,
        outputDir,
        validateProps: true,
        validateTemplates: true,
        generateLayouts: true,
        generateMiddleware: true,
        useTypeScript: true,
        optimize: true,
        logLevel: LogLevel.INFO,
        throwOnError: false,
        overwrite: true,
        verbose: true
      };
      
      // First compilation
      const result1 = await compiler.compile(configPath, options);
      assertEquals(result1.success, true, "First compilation should succeed");
      
      // Second compilation (should overwrite)
      const result2 = await compiler.compile(configPath, options);
      assertEquals(result2.success, true, "Second compilation should succeed");
      
      // Verify output paths are the same
      assertEquals(result1.outputPath, result2.outputPath, "Output paths should be the same");
      
      // Modify options to disable overwrite
      const noOverwriteOptions = {
        ...options,
        overwrite: false
      };
      
      // Third compilation (should fail due to existing files)
      const result3 = await compiler.compile(configPath, noOverwriteOptions);
      assertEquals(result3.success, false, "Third compilation should fail due to existing files");
      
      // Check for specific error about existing files
      const hasExistingFilesError = result3.errors.some(error => 
        error.message.includes("already exists") || 
        error.message.includes("overwrite")
      );
      assertEquals(hasExistingFilesError, true, "Should have error about existing files");
      
    } finally {
      // Clean up test directories
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});