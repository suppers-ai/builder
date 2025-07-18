# JSON App Compiler Tutorial

This comprehensive tutorial will guide you through building complete applications using the JSON App Compiler. You'll learn how to create JSON configurations, understand the compilation process, and build increasingly complex applications.

## 📚 Table of Contents

1. [Getting Started](#getting-started)
2. [Your First Application](#your-first-application)
3. [Understanding Components](#understanding-components)
4. [Working with Routes](#working-with-routes)
5. [Adding API Endpoints](#adding-api-endpoints)
6. [Theming and Styling](#theming-and-styling)
7. [Advanced Features](#advanced-features)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- [Deno](https://deno.land/) 1.40.0 or later installed
- Basic knowledge of JSON, TypeScript, and web development
- A text editor or IDE with JSON support

### Installation

1. Clone the JSON App Compiler repository:

```bash
git clone <repository-url>
cd json-app-compiler
```

2. Build the project:

```bash
deno task build
```

3. Verify the installation:

```bash
deno run -A packages/compiler/src/cli.ts --version
```

## 🏗 Your First Application

Let's create a simple "Hello World" application to understand the basics.

### Step 1: Create the Configuration

Create a new file called `hello-world.json`:

```json
{
  "metadata": {
    "name": "hello-world",
    "version": "1.0.0",
    "description": "My first JSON App Compiler application"
  },
  "components": [
    {
      "id": "welcomeMessage",
      "type": "Card",
      "props": {
        "title": "Hello World!",
        "subtitle": "Welcome to JSON App Compiler",
        "padding": "lg",
        "shadow": "md"
      },
      "children": "This is my first application built with JSON App Compiler. It demonstrates the basic structure and component usage."
    }
  ],
  "routes": [
    {
      "path": "/",
      "component": "welcomeMessage",
      "meta": {
        "title": "Hello World | My App",
        "description": "A simple hello world application"
      }
    }
  ],
  "api": {
    "endpoints": []
  }
}
```

### Step 2: Compile the Application

Run the compiler to generate your application:

```bash
deno run -A packages/compiler/src/cli.ts --config hello-world.json --output ./hello-world-app
```

### Step 3: Run Your Application

Navigate to the generated application and start the development server:

```bash
cd hello-world-app
deno task dev
```

Open your browser to `http://localhost:8000` to see your application!

### What Just Happened?

The JSON App Compiler:

1. **Parsed** your JSON configuration
2. **Validated** the structure and component definitions
3. **Generated** a complete Fresh 2.0 application
4. **Created** all necessary files including routes, components, and configuration

## 🧩 Understanding Components

Components are the building blocks of your application. Let's explore the available components and their properties.

### Available Component Types

#### Button Component

```json
{
  "id": "myButton",
  "type": "Button",
  "props": {
    "variant": "primary",
    "size": "md",
    "fullWidth": false
  },
  "children": "Click Me"
}
```

**Properties:**
- `variant`: "primary" | "secondary" | "outline" | "ghost" | "danger"
- `size`: "sm" | "md" | "lg"
- `fullWidth`: boolean
- `disabled`: boolean
- `loading`: boolean

#### Input Component

```json
{
  "id": "emailInput",
  "type": "Input",
  "props": {
    "type": "email",
    "label": "Email Address",
    "placeholder": "Enter your email",
    "required": true,
    "fullWidth": true
  }
}
```

**Properties:**
- `type`: "text" | "email" | "password" | "number" | "tel" | "url"
- `label`: string
- `placeholder`: string
- `required`: boolean
- `disabled`: boolean
- `fullWidth`: boolean

#### Card Component

```json
{
  "id": "infoCard",
  "type": "Card",
  "props": {
    "title": "Information",
    "subtitle": "Important details",
    "padding": "lg",
    "shadow": "md",
    "variant": "default"
  },
  "children": [
    // nested components or text
  ]
}
```

**Properties:**
- `title`: string
- `subtitle`: string
- `padding`: "none" | "sm" | "md" | "lg" | "xl"
- `shadow`: "none" | "sm" | "md" | "lg" | "xl"
- `variant`: "default" | "outlined" | "elevated" | "filled"

#### Layout Component

```json
{
  "id": "mainLayout",
  "type": "Layout",
  "props": {
    "variant": "default",
    "direction": "column",
    "gap": "md",
    "padding": "lg",
    "maxWidth": "lg"
  },
  "children": [
    // nested components
  ]
}
```

**Properties:**
- `variant`: "default" | "centered" | "sidebar" | "header-footer" | "grid"
- `direction`: "row" | "column"
- `gap`: "none" | "xs" | "sm" | "md" | "lg" | "xl"
- `padding`: "none" | "xs" | "sm" | "md" | "lg" | "xl"
- `maxWidth`: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full"

### Component Composition

Components can be nested to create complex layouts:

```json
{
  "id": "contactForm",
  "type": "Layout",
  "props": {
    "variant": "centered",
    "maxWidth": "md",
    "padding": "lg"
  },
  "children": [
    {
      "id": "formCard",
      "type": "Card",
      "props": {
        "title": "Contact Us",
        "subtitle": "Send us a message",
        "padding": "lg",
        "shadow": "lg"
      },
      "children": [
        {
          "id": "nameInput",
          "type": "Input",
          "props": {
            "type": "text",
            "label": "Full Name",
            "placeholder": "Enter your name",
            "required": true,
            "fullWidth": true
          }
        },
        {
          "id": "emailInput",
          "type": "Input",
          "props": {
            "type": "email",
            "label": "Email Address",
            "placeholder": "Enter your email",
            "required": true,
            "fullWidth": true
          }
        },
        {
          "id": "messageInput",
          "type": "Input",
          "props": {
            "type": "text",
            "label": "Message",
            "placeholder": "Enter your message",
            "required": true,
            "fullWidth": true
          }
        },
        {
          "id": "submitButton",
          "type": "Button",
          "props": {
            "variant": "primary",
            "size": "lg",
            "fullWidth": true,
            "type": "submit"
          },
          "children": "Send Message"
        }
      ]
    }
  ]
}
```

## 🛣 Working with Routes

Routes define the pages and navigation structure of your application.

### Basic Route Structure

```json
{
  "routes": [
    {
      "path": "/",
      "component": "homeComponent",
      "meta": {
        "title": "Home | My App",
        "description": "Welcome to the home page"
      }
    },
    {
      "path": "/about",
      "component": "aboutComponent",
      "meta": {
        "title": "About | My App",
        "description": "Learn more about our application"
      }
    }
  ]
}
```

### Route Properties

- `path`: The URL path for the route
- `component`: ID of the component to render for this route
- `layout`: Optional layout component ID
- `middleware`: Array of middleware function names
- `meta`: SEO and metadata information

### Using Layouts

Layouts provide consistent structure across multiple pages:

```json
{
  "components": [
    {
      "id": "mainLayout",
      "type": "Layout",
      "props": {
        "variant": "header-footer",
        "padding": "none"
      },
      "children": [
        {
          "id": "header",
          "type": "Card",
          "props": {
            "padding": "md",
            "shadow": "sm"
          },
          "children": [
            {
              "id": "navigation",
              "type": "Layout",
              "props": {
                "direction": "row",
                "justify": "between",
                "align": "center"
              },
              "children": [
                {
                  "id": "logo",
                  "type": "Layout",
                  "props": {},
                  "children": "My App"
                },
                {
                  "id": "navLinks",
                  "type": "Layout",
                  "props": {
                    "direction": "row",
                    "gap": "md"
                  },
                  "children": [
                    {
                      "id": "homeLink",
                      "type": "Button",
                      "props": {
                        "variant": "ghost",
                        "size": "sm"
                      },
                      "children": "Home"
                    },
                    {
                      "id": "aboutLink",
                      "type": "Button",
                      "props": {
                        "variant": "ghost",
                        "size": "sm"
                      },
                      "children": "About"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "homeContent",
      "type": "Layout",
      "props": {
        "padding": "lg"
      },
      "children": [
        {
          "id": "welcomeCard",
          "type": "Card",
          "props": {
            "title": "Welcome Home",
            "padding": "lg"
          },
          "children": "This is the home page content."
        }
      ]
    }
  ],
  "routes": [
    {
      "path": "/",
      "component": "homeContent",
      "layout": "mainLayout",
      "meta": {
        "title": "Home | My App"
      }
    }
  ]
}
```

## 🔌 Adding API Endpoints

API endpoints provide backend functionality for your application.

### Basic API Configuration

```json
{
  "api": {
    "endpoints": [
      {
        "path": "/api/hello",
        "methods": ["GET"],
        "handler": "HelloHandler"
      },
      {
        "path": "/api/users",
        "methods": ["GET", "POST"],
        "handler": "UserHandler"
      }
    ]
  }
}
```

### CRUD Operations

Create a complete CRUD API for managing resources:

```json
{
  "api": {
    "endpoints": [
      {
        "path": "/api/users",
        "methods": ["GET", "POST"],
        "handler": "UserHandler",
        "validation": {
          "body": {
            "name": {
              "type": "string",
              "required": true,
              "min": 2,
              "max": 50
            },
            "email": {
              "type": "string",
              "required": true,
              "pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
            },
            "age": {
              "type": "number",
              "min": 18,
              "max": 120
            }
          }
        }
      },
      {
        "path": "/api/users/:id",
        "methods": ["GET", "PUT", "DELETE"],
        "handler": "UserDetailHandler",
        "validation": {
          "params": {
            "id": {
              "type": "string",
              "required": true,
              "pattern": "^[0-9a-fA-F]{24}$"
            }
          }
        }
      }
    ]
  }
}
```

### Request Validation

Add comprehensive validation to your API endpoints:

```json
{
  "validation": {
    "body": {
      "name": {
        "type": "string",
        "required": true,
        "min": 2,
        "max": 100
      },
      "email": {
        "type": "string",
        "required": true,
        "pattern": "^[^@]+@[^@]+\\.[^@]+$"
      },
      "password": {
        "type": "string",
        "required": true,
        "min": 8
      }
    },
    "query": {
      "page": {
        "type": "number",
        "min": 1
      },
      "limit": {
        "type": "number",
        "min": 1,
        "max": 100
      }
    }
  }
}
```

## 🎨 Theming and Styling

Customize the appearance of your application with theming.

### Basic Theme Configuration

```json
{
  "theme": {
    "primaryColor": "#3b82f6",
    "secondaryColor": "#64748b",
    "fontFamily": "Inter, system-ui, sans-serif",
    "spacing": {
      "xs": "0.5rem",
      "sm": "1rem",
      "md": "1.5rem",
      "lg": "2rem",
      "xl": "3rem"
    }
  }
}
```

### Advanced Theme Configuration

```json
{
  "theme": {
    "primaryColor": "#8b5cf6",
    "secondaryColor": "#64748b",
    "fontFamily": "Inter, system-ui, sans-serif",
    "spacing": {
      "xs": "0.25rem",
      "sm": "0.5rem",
      "md": "1rem",
      "lg": "1.5rem",
      "xl": "2rem",
      "2xl": "3rem"
    },
    "breakpoints": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px"
    },
    "customProperties": {
      "--card-border-radius": "0.75rem",
      "--input-focus-ring-color": "rgba(139, 92, 246, 0.5)",
      "--button-hover-transform": "translateY(-2px)",
      "--shadow-colored": "0 10px 25px -5px rgba(139, 92, 246, 0.1)"
    }
  }
}
```

## 🚀 Advanced Features

### Multiple Layouts

Create different layouts for different sections of your application:

```json
{
  "components": [
    {
      "id": "publicLayout",
      "type": "Layout",
      "props": {
        "variant": "header-footer"
      }
    },
    {
      "id": "dashboardLayout",
      "type": "Layout",
      "props": {
        "variant": "sidebar",
        "sidebarPosition": "left",
        "sidebarWidth": "md"
      }
    }
  ],
  "routes": [
    {
      "path": "/",
      "component": "homeContent",
      "layout": "publicLayout"
    },
    {
      "path": "/dashboard",
      "component": "dashboardContent",
      "layout": "dashboardLayout",
      "middleware": ["requireAuth"]
    }
  ]
}
```

### Authentication and Middleware

Add authentication and middleware to protect routes:

```json
{
  "api": {
    "endpoints": [
      {
        "path": "/api/auth/login",
        "methods": ["POST"],
        "handler": "AuthLoginHandler",
        "validation": {
          "body": {
            "email": {
              "type": "string",
              "required": true
            },
            "password": {
              "type": "string",
              "required": true
            }
          }
        }
      }
    ],
    "middleware": [
      {
        "name": "requireAuth",
        "config": {
          "redirectTo": "/login"
        }
      },
      {
        "name": "logRequest",
        "config": {
          "level": "info"
        }
      }
    ],
    "auth": {
      "provider": "jwt",
      "config": {
        "secret": "your-secret-key",
        "expiresIn": "1d"
      }
    }
  }
}
```

### Build Configuration

Configure the build process for different environments:

```json
{
  "build": {
    "target": "production",
    "minify": true,
    "sourceMaps": false,
    "outputDir": "./dist",
    "publicPath": "/"
  }
}
```

## 💡 Best Practices

### Configuration Organization

1. **Use meaningful IDs** - Choose descriptive component IDs
2. **Group related components** - Organize components logically
3. **Consistent naming** - Use consistent naming conventions
4. **Document complex configurations** - Add comments where helpful

### Component Design

1. **Keep components focused** - Each component should have a single responsibility
2. **Use composition** - Build complex UIs from simple components
3. **Validate props** - Always validate component properties
4. **Consider accessibility** - Ensure components are accessible

### Performance

1. **Minimize nesting** - Avoid deeply nested component structures
2. **Use appropriate layouts** - Choose the right layout variant
3. **Optimize images** - Use appropriate image formats and sizes
4. **Lazy load content** - Load content only when needed

### Security

1. **Validate all inputs** - Always validate API inputs
2. **Use HTTPS** - Ensure secure connections
3. **Implement authentication** - Protect sensitive routes
4. **Sanitize data** - Clean user inputs

## 🔧 Troubleshooting

### Common Issues

#### Configuration Validation Errors

**Problem**: JSON configuration fails validation

**Solution**: Check the error message for specific validation issues:

```bash
# Run validation only
deno run -A packages/compiler/src/cli.ts validate your-config.json
```

#### Component Not Found Errors

**Problem**: Referenced component doesn't exist

**Solution**: Ensure all component IDs are defined and referenced correctly:

```json
{
  "routes": [
    {
      "path": "/",
      "component": "homeContent", // Must match a component ID
      "layout": "mainLayout"      // Must match a component ID
    }
  ]
}
```

#### Template Processing Errors

**Problem**: Template placeholders not replaced

**Solution**: Check that all required metadata is provided:

```json
{
  "metadata": {
    "name": "my-app",        // Required
    "version": "1.0.0",      // Required
    "description": "My app"   // Required
  }
}
```

### Debugging Tips

1. **Use verbose mode** - Add `--verbose` flag for detailed output
2. **Check generated files** - Examine the generated application structure
3. **Validate step by step** - Test configuration in small increments
4. **Use dry run** - Use `--dry-run` to validate without generating files

### Getting Help

1. **Check documentation** - Review package-specific README files
2. **Examine examples** - Look at example configurations in `examples/`
3. **Run tests** - Ensure the system is working correctly
4. **Check logs** - Review compiler output for error details

## 🎯 Next Steps

Now that you've completed the tutorial, you can:

1. **Explore Examples** - Study the example configurations in the `examples/` directory
2. **Build Complex Applications** - Create multi-page applications with authentication
3. **Customize Components** - Extend the UI library with custom components
4. **Contribute** - Help improve the JSON App Compiler system

### Example Projects to Try

1. **Blog Application** - Create a blog with posts, categories, and comments
2. **E-commerce Site** - Build a product catalog with shopping cart
3. **Dashboard Application** - Create an admin dashboard with charts and data
4. **Portfolio Site** - Build a personal portfolio with projects and contact form

Happy building with JSON App Compiler! 🚀