/**
 * Tests for the ApplicationSpec schema and validation
 */

import { assertEquals, assertThrows } from "@std/assert";
import { ApplicationSpecSchema } from "../src/types/mod.ts";
import type { ApplicationSpec } from "../src/types/mod.ts";

Deno.test("ApplicationSpec - valid minimal spec", () => {
  const spec = {
    application: {
      name: "test-app",
      version: "1.0.0",
      description: "Test application",
      id: "app_test_001",
    },
    compiler: {
      id: "fresh-deno",
      version: "1.0.0",
    },
    data: {
      routes: [
        {
          path: "/",
          type: "page",
          components: [
            {
              id: "Hero",
              props: {
                title: "Welcome",
              },
            },
          ],
        },
      ],
    },
  };

  const result = ApplicationSpecSchema.parse(spec);
  assertEquals(result.application.name, "test-app");
  assertEquals(result.data.routes.length, 1);
});

Deno.test("ApplicationSpec - with variables", () => {
  const spec = {
    application: {
      name: "test-app",
      version: "1.0.0",
      id: "app_test_001",
    },
    variables: {
      API_URL: "https://api.example.com",
      VERSION: "v1",
    },
    compiler: {
      id: "fresh-deno",
      version: "1.0.0",
    },
    data: {
      routes: [],
    },
  };

  const result = ApplicationSpecSchema.parse(spec);
  assertEquals(result.variables?.API_URL, "https://api.example.com");
  assertEquals(result.variables?.VERSION, "v1");
});

Deno.test("ApplicationSpec - with global layout", () => {
  const spec = {
    application: {
      name: "test-app",
      version: "1.0.0",
      id: "app_test_001",
    },
    compiler: {
      id: "fresh-deno",
      version: "1.0.0",
    },
    data: {
      global: {
        head: {
          meta: {
            title: "Test App",
            description: "A test application",
          },
        },
        header: {
          component: {
            id: "Header",
            props: {
              title: "My App",
            },
          },
        },
        footer: {
          component: {
            id: "Footer",
            props: {
              copyright: "© 2024 Test App",
            },
          },
        },
      },
      routes: [],
    },
  };

  const result = ApplicationSpecSchema.parse(spec);
  assertEquals(result.data.global?.head?.meta?.title, "Test App");
  assertEquals(result.data.global?.header?.component.id, "Header");
  assertEquals(result.data.global?.footer?.component.props?.copyright, "© 2024 Test App");
});

Deno.test("ApplicationSpec - with nested components", () => {
  const spec = {
    application: {
      name: "test-app",
      version: "1.0.0",
      id: "app_test_001",
    },
    compiler: {
      id: "fresh-deno",
      version: "1.0.0",
    },
    data: {
      routes: [
        {
          path: "/",
          type: "page",
          components: [
            {
              id: "Container",
              props: {
                className: "max-w-4xl mx-auto",
              },
              components: [
                {
                  id: "Hero",
                  props: {
                    title: "Welcome",
                  },
                },
                {
                  id: "Card",
                  props: {
                    title: "Featured Content",
                  },
                  components: [
                    {
                      id: "Button",
                      props: {
                        text: "Learn More",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };

  const result = ApplicationSpecSchema.parse(spec);
  const container = result.data.routes[0].components![0];
  assertEquals(container.id, "Container");
  assertEquals(container.components!.length, 2);
  assertEquals(container.components![1].components![0].id, "Button");
});

Deno.test("ApplicationSpec - with permissions", () => {
  const spec = {
    application: {
      name: "test-app",
      version: "1.0.0",
      id: "app_test_001",
    },
    compiler: {
      id: "fresh-deno",
      version: "1.0.0",
    },
    data: {
      routes: [
        {
          path: "/admin",
          type: "page",
          permissions: ["admin"],
          components: [
            {
              id: "AdminPanel",
              props: {
                title: "Admin Dashboard",
              },
            },
          ],
        },
      ],
    },
  };

  const result = ApplicationSpecSchema.parse(spec);
  assertEquals(result.data.routes[0].permissions, ["admin"]);
});

Deno.test("ApplicationSpec - with route overrides", () => {
  const spec = {
    application: {
      name: "test-app",
      version: "1.0.0",
      id: "app_test_001",
    },
    compiler: {
      id: "fresh-deno",
      version: "1.0.0",
    },
    data: {
      routes: [
        {
          path: "/about",
          type: "page",
          override: {
            head: {
              meta: {
                title: "About Us",
                description: "Learn more about our company",
              },
            },
          },
          components: [
            {
              id: "About",
              props: {
                content: "About us content",
              },
            },
          ],
        },
      ],
    },
  };

  const result = ApplicationSpecSchema.parse(spec);
  assertEquals(result.data.routes[0].override?.head?.meta?.title, "About Us");
});

Deno.test("ApplicationSpec - with custom source", () => {
  const spec = {
    application: {
      name: "test-app",
      version: "1.0.0",
      id: "app_test_001",
    },
    compiler: {
      id: "fresh-deno",
      version: "1.0.0",
    },
    data: {
      routes: [
        {
          path: "/privacy",
          type: "page",
          source: "./static-pages/privacy",
        },
      ],
    },
  };

  const result = ApplicationSpecSchema.parse(spec);
  assertEquals(result.data.routes[0].source, "./static-pages/privacy");
});

Deno.test("ApplicationSpec - with data configuration", () => {
  const spec = {
    application: {
      name: "test-app",
      version: "1.0.0",
      id: "app_test_001",
    },
    compiler: {
      id: "fresh-deno",
      version: "1.0.0",
    },
    data: {
      routes: [
        {
          path: "/",
          type: "page",
          components: [
            {
              id: "BlogPostList",
              props: {
                title: "Latest Posts",
                data: {
                  url: "https://api.example.com",
                  endpoint: "/posts",
                  method: "GET",
                },
              },
            },
          ],
        },
      ],
    },
  };

  const result = ApplicationSpecSchema.parse(spec);
  const component = result.data.routes[0].components![0];
  assertEquals(component.props?.data?.url, "https://api.example.com");
  assertEquals(component.props?.data?.endpoint, "/posts");
  assertEquals(component.props?.data?.method, "GET");
});

Deno.test("ApplicationSpec - validation errors", () => {
  // Missing required fields
  assertThrows(() => {
    ApplicationSpecSchema.parse({
      application: {
        name: "test-app",
        // missing version and id
      },
      compiler: {
        id: "fresh-deno",
        version: "1.0.0",
      },
      data: {
        routes: [],
      },
    });
  });

  // Invalid route type
  assertThrows(() => {
    ApplicationSpecSchema.parse({
      application: {
        name: "test-app",
        version: "1.0.0",
        id: "app_test_001",
      },
      compiler: {
        id: "fresh-deno",
        version: "1.0.0",
      },
      data: {
        routes: [
          {
            path: "/",
            type: "invalid-type", // should be "page"
            components: [],
          },
        ],
      },
    });
  });

  // Invalid HTTP method
  assertThrows(() => {
    ApplicationSpecSchema.parse({
      application: {
        name: "test-app",
        version: "1.0.0",
        id: "app_test_001",
      },
      compiler: {
        id: "fresh-deno",
        version: "1.0.0",
      },
      data: {
        routes: [
          {
            path: "/",
            type: "page",
            components: [
              {
                id: "Component",
                props: {
                  data: {
                    endpoint: "/api",
                    method: "INVALID", // should be GET, POST, etc.
                  },
                },
              },
            ],
          },
        ],
      },
    });
  });
});

Deno.test("ApplicationSpec - complete example", () => {
  const spec: ApplicationSpec = {
    application: {
      name: "my-blog",
      version: "1.0.0",
      description: "Personal blog with authentication",
      id: "app_blog_001",
    },
    variables: {
      SUPPERS_API_URL: "https://localhost:5000/api",
      EXTERNAL_CAMPSITES_URL: "https://external-campsite-api.com/api",
    },
    compiler: {
      id: "fresh-deno",
      version: "1.0.0",
    },
    data: {
      global: {
        head: {
          meta: {
            title: "My Blog",
            description: "A personal blog about technology",
          },
        },
        header: {
          component: {
            id: "Header",
            props: {
              title: "My Blog",
            },
          },
        },
        footer: {
          component: {
            id: "Footer",
            props: {
              copyright: "© 2024 My Blog",
            },
          },
        },
      },
      routes: [
        {
          path: "/",
          type: "page",
          override: {
            head: {
              meta: {
                title: "Home - My Blog",
                description: "Welcome to my personal blog",
              },
            },
          },
          components: [
            {
              id: "Hero",
              props: {
                title: "Welcome to My Blog",
                subtitle: "Thoughts on technology and life",
              },
            },
            {
              id: "BlogPostList",
              props: {
                title: "Latest Posts",
                limit: 5,
                data: {
                  endpoint: "/posts",
                  method: "GET",
                },
              },
            },
          ],
        },
        {
          path: "/admin",
          type: "page",
          permissions: ["admin"],
          components: [
            {
              id: "PostEditor",
              props: {
                title: "Create New Post",
              },
            },
          ],
        },
      ],
    },
  };

  const result = ApplicationSpecSchema.parse(spec);
  assertEquals(result.application.name, "my-blog");
  assertEquals(result.data.routes.length, 2);
  assertEquals(result.data.routes[1].permissions, ["admin"]);
});
