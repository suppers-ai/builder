// Tests for the route generation system
import { assertEquals, assertStringIncludes, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { describe, it, beforeEach, afterEach } from "https://deno.land/std/testing/bdd.ts";
import { RouteGenerator, createRouteGenerator } from "./route-generator.ts";
import { ComponentResolver, createComponentResolver } from "./component-resolver.ts";
import { ComponentImportGenerator, createImportGenerator } from "./component-import-generator.ts";
import { fileManager } from "./file-manager.ts";
import { fs } from "../../shared/src/utils.ts";
import type { RouteDefinition, ComponentDefinition, ComponentRegistry, RouteMeta } from "../../shared/src/types.ts";

// Mock component registry for testing
const mockRegistry: ComponentRegistry = {
  "HomePage": {
    component: {},
    schema: {},
    dependencies: ["Button", "Card"],
    category: "pages"
  },
  "AboutPage": {
    component: {},
    schema: {},
    dependencies: ["Card"],
    category: "pages"
  },
  "Button": {
    component: { __fresh_island: true },
    schema: {},
    dependencies: [],
    category: "ui"
  },
  "Card": {
    component: {},
    schema: {},
    dependencies: [],
    category: "ui"
  },
  "MainLayout": {
    component: {},
    schema: {},
    dependencies: ["Header", "Footer"],
    category: "layouts"
  },
  "Header": {
    component: {},
    schema: {},
    dependencies: ["Navigation"],
    category: "ui"
  },
  "Footer": {
    component: {},
    schema: {},
    dependencies: [],
    category: "ui"
  },
  "Navigation": {
    component: { __fresh_island: true },
    schema: {},
    dependencies: [],
    category: "ui"
  }
};

// Mock components for testing
const mockComponents: ComponentDefinition[] = [
  {
    id: "home",
    type: "HomePage",
    props: {
      title: "Welcome to the Home Page",
      showFeatures: true
    }
  },
  {
    id: "about",
    type: "AboutPage",
    props: {
      title: "About Us",
      description: "Learn more about our company"
    }
  },
  {
    id: "mainLayout",
    type: "MainLayout",
    props: {
      showHeader: true,
      showFooter: true
    }
  }
];

// Mock routes for testing
const mockRoutes: RouteDefinition[] = [
  {
    path: "/",
    component: "home",
    layout: "mainLayout",
    meta: {
      title: "Home Page",
      description: "Welcome to our website"
    }
  },
  {
    path: "/about",
    component: "about",
    layout: "mainLayout",
    meta: {
      title: "About Us",
      description: "Learn more about our company"
    }
  },
  {
    path: "/users/:id",
    component: "home",
    middleware: ["auth", "logger"],
    props: {
      showUserDetails: true
    }
  },
  {
    path: "/dashboard",
    component: "home",
    layout: "mainLayout",
    meta: {
      title: "Dashboard",
      description: "User dashboard",
      requiresAuth: true,
      dataHandler: true
    }
  },
  {
    path: "/products/:category/:id",
    component: "home",
    meta: {
      title: "Product Details",
      cacheControl: "max-age=3600"
    }
  }
];

describe("RouteGenerator", () => {
  let tempDir: string;
  let resolver: ComponentResolver;
  let importGenerator: ComponentImportGenerator;
  let routeGenerator: RouteGenerator;
  
  beforeEach(async () => {
    // Create a temporary directory for test files
    tempDir = await Deno.makeTempDir();
    
    // Create resolver and generators
    resolver = createComponentResolver(mockRegistry);
    importGenerator = createImportGenerator(resolver);
    routeGenerator = createRouteGenerator(resolver, importGenerator);
  });
  
  afterEach(async () => {
    // Clean up temporary directory
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  });
  
  it("should normalize route paths correctly", () => {
    // Access private method for testing
    const normalizeRoutePath = (routeGenerator as any).normalizeRoutePath.bind(routeGenerator);
    
    assertEquals(normalizeRoutePath("/"), "index");
    assertEquals(normalizeRoutePath(""), "index");
    assertEquals(normalizeRoutePath("/about"), "about");
    assertEquals(normalizeRoutePath("/users/:id"), "users/[id]");
    assertEquals(normalizeRoutePath("/posts/:postId/comments/:commentId"), "posts/[postId]/comments/[commentId]");
    assertEquals(normalizeRoutePath("/files/*"), "files/[...path]");
    assertEquals(normalizeRoutePath("/products/:id?"), "products/[id]");
  });
  
  it("should generate route component names correctly", () => {
    // Access private method for testing
    const getRouteComponentName = (routeGenerator as any).getRouteComponentName.bind(routeGenerator);
    
    assertEquals(getRouteComponentName("/"), "HomePage");
    assertEquals(getRouteComponentName("/about"), "AboutPage");
    assertEquals(getRouteComponentName("/users/:id"), "UsersIdPage");
    assertEquals(getRouteComponentName("/blog/posts"), "BlogPostsPage");
  });
  
  it("should generate a route file for the home page", async () => {
    const route = mockRoutes[0]; // Home page route
    const result = await routeGenerator.generateRoute(tempDir, route, mockComponents);
    
    // Check result
    assertEquals(result.success, true);
    assertEquals(result.errors.length, 0);
    
    // Check file exists
    const routeFilePath = fs.joinPath(tempDir, "routes", "index.tsx");
    const fileExists = await fileManager.fileExists(routeFilePath);
    assertEquals(fileExists, true);
    
    // Check file content
    const content = await Deno.readTextFile(routeFilePath);
    assertStringIncludes(content, "import { PageProps } from \"$fresh/server.ts\";");
    assertStringIncludes(content, "import { Head } from \"$fresh/runtime.ts\";");
    assertStringIncludes(content, "HomePage");
    assertStringIncludes(content, "MainLayout");
    assertStringIncludes(content, "export default function HomePage(props: PageProps)");
    assertStringIncludes(content, "<title>Home Page</title>");
    assertStringIncludes(content, "<meta name=\"description\" content=\"Welcome to our website\" />");
  });
  
  it("should generate a route file with parameters", async () => {
    const route = mockRoutes[2]; // Users route with parameters
    const result = await routeGenerator.generateRoute(tempDir, route, mockComponents);
    
    // Check result
    assertEquals(result.success, true);
    assertEquals(result.errors.length, 0);
    
    // Check file exists
    const routeFilePath = fs.joinPath(tempDir, "routes", "users", "[id].tsx");
    const fileExists = await fileManager.fileExists(routeFilePath);
    assertEquals(fileExists, true);
    
    // Check file content
    const content = await Deno.readTextFile(routeFilePath);
    assertStringIncludes(content, "export default function UsersIdPage(props: PageProps)");
    assertStringIncludes(content, "showUserDetails");
    
    // Check middleware file exists
    const middlewareFilePath = fs.joinPath(tempDir, "routes", "users", "_middleware.ts");
    const middlewareExists = await fileManager.fileExists(middlewareFilePath);
    assertEquals(middlewareExists, true);
    
    // Check middleware content
    const middlewareContent = await Deno.readTextFile(middlewareFilePath);
    assertStringIncludes(middlewareContent, "import { MiddlewareHandler } from \"$fresh/server.ts\";");
    assertStringIncludes(middlewareContent, "import { auth } from \"../../middleware/auth.ts\";");
    assertStringIncludes(middlewareContent, "import { logger } from \"../../middleware/logger.ts\";");
    assertStringIncludes(middlewareContent, "export const middleware: MiddlewareHandler[] = [");
    assertStringIncludes(middlewareContent, "auth,");
    assertStringIncludes(middlewareContent, "logger,");
  });
  
  it("should generate multiple routes", async () => {
    const results = await routeGenerator.generateRoutes(tempDir, mockRoutes, mockComponents);
    
    // Check results
    assertEquals(results.length, mockRoutes.length);
    assertEquals(results.filter(r => r.success).length, mockRoutes.length);
    
    // Check files exist
    const homeFilePath = fs.joinPath(tempDir, "routes", "index.tsx");
    const aboutFilePath = fs.joinPath(tempDir, "routes", "about.tsx");
    const usersFilePath = fs.joinPath(tempDir, "routes", "users", "[id].tsx");
    
    const homeExists = await fileManager.fileExists(homeFilePath);
    const aboutExists = await fileManager.fileExists(aboutFilePath);
    const usersExists = await fileManager.fileExists(usersFilePath);
    
    assertEquals(homeExists, true);
    assertEquals(aboutExists, true);
    assertEquals(usersExists, true);
  });
  
  it("should handle missing components gracefully", async () => {
    const route: RouteDefinition = {
      path: "/missing",
      component: "nonexistent",
      layout: "mainLayout"
    };
    
    const result = await routeGenerator.generateRoute(tempDir, route, mockComponents);
    
    // Check result
    assertEquals(result.success, false);
    assertEquals(result.errors.length, 1);
    assertStringIncludes(result.errors[0].message, "not found for route");
  });
  
  it("should handle missing layouts gracefully", async () => {
    const route: RouteDefinition = {
      path: "/missing-layout",
      component: "home",
      layout: "nonexistentLayout"
    };
    
    const result = await routeGenerator.generateRoute(tempDir, route, mockComponents);
    
    // Check result
    assertEquals(result.success, false);
    assertEquals(result.errors.length, 1);
    assertStringIncludes(result.errors[0].message, "Layout component");
  });
  
  it("should generate a route with data handler for dynamic routes", async () => {
    const route = mockRoutes[2]; // Users route with parameters
    const result = await routeGenerator.generateRoute(tempDir, route, mockComponents);
    
    // Check result
    assertEquals(result.success, true);
    
    // Check file content
    const routeFilePath = fs.joinPath(tempDir, "routes", "users", "[id].tsx");
    const content = await Deno.readTextFile(routeFilePath);
    
    // Should include data handler for dynamic route
    assertStringIncludes(content, "export const handler = {");
    assertStringIncludes(content, "async GET(req: Request, ctx: PageProps[\"params\"])");
    assertStringIncludes(content, "const params = ctx;");
    assertStringIncludes(content, "return Response.json(");
  });
  
  it("should generate route config for routes with auth requirements", async () => {
    const route = mockRoutes[3]; // Dashboard route with requiresAuth
    const result = await routeGenerator.generateRoute(tempDir, route, mockComponents);
    
    // Check result
    assertEquals(result.success, true);
    
    // Check file content
    const routeFilePath = fs.joinPath(tempDir, "routes", "dashboard.tsx");
    const content = await Deno.readTextFile(routeFilePath);
    
    // Should include route config with auth requirement
    assertStringIncludes(content, "export const config = {");
    assertStringIncludes(content, "authRequired: true");
  });
  
  it("should generate route with cache control settings", async () => {
    const route = mockRoutes[4]; // Products route with cacheControl
    const result = await routeGenerator.generateRoute(tempDir, route, mockComponents);
    
    // Check result
    assertEquals(result.success, true);
    
    // Check file content
    const routeFilePath = fs.joinPath(tempDir, "routes", "products", "[category]", "[id].tsx");
    const content = await Deno.readTextFile(routeFilePath);
    
    // Should include route config with cache control
    assertStringIncludes(content, "export const config = {");
    assertStringIncludes(content, "cacheControl: \"max-age=3600\"");
  });
  
  it("should handle nested route parameters correctly", async () => {
    const route = mockRoutes[4]; // Products route with nested parameters
    const result = await routeGenerator.generateRoute(tempDir, route, mockComponents);
    
    // Check result
    assertEquals(result.success, true);
    
    // Check file path is correctly generated
    const routeFilePath = fs.joinPath(tempDir, "routes", "products", "[category]", "[id].tsx");
    const fileExists = await fileManager.fileExists(routeFilePath);
    assertEquals(fileExists, true);
    
    // Check content has correct component name
    const content = await Deno.readTextFile(routeFilePath);
    assertStringIncludes(content, "export default function ProductsCategoryIdPage(props: PageProps)");
  });
  
  it("should generate layout files for routes with layouts", async () => {
    const route = mockRoutes[0]; // Home route with layout
    const result = await routeGenerator.generateRoute(tempDir, route, mockComponents, { generateLayouts: true });
    
    // Check result
    assertEquals(result.success, true);
    
    // Check layout file exists
    const layoutFilePath = fs.joinPath(tempDir, "routes", "_layout.tsx");
    const layoutExists = await fileManager.fileExists(layoutFilePath);
    assertEquals(layoutExists, true);
    
    // Check layout content
    const content = await Deno.readTextFile(layoutFilePath);
    assertStringIncludes(content, "export default function Layout({ Component, state }: PageProps)");
    assertStringIncludes(content, "<MainLayout");
    assertStringIncludes(content, "<Component />");
  });
  
  it("should sort routes by hierarchy when generating multiple routes", async () => {
    // Create routes with different nesting levels
    const nestedRoutes: RouteDefinition[] = [
      {
        path: "/products/:id/reviews",
        component: "home"
      },
      {
        path: "/",
        component: "home"
      },
      {
        path: "/products",
        component: "home"
      },
      {
        path: "/products/:id",
        component: "home"
      }
    ];
    
    // Access private method for testing
    const sortRoutesByHierarchy = (routeGenerator as any).sortRoutesByHierarchy.bind(routeGenerator);
    const sortedRoutes = sortRoutesByHierarchy(nestedRoutes);
    
    // Check sorting order
    assertEquals(sortedRoutes[0].path, "/");
    assertEquals(sortedRoutes[1].path, "/products");
    assertEquals(sortedRoutes[2].path, "/products/:id");
    assertEquals(sortedRoutes[3].path, "/products/:id/reviews");
  });
});