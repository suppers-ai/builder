# Complex Application Example

This directory contains a complex JSON configuration example for the JSON App Compiler.

## Purpose

This example demonstrates an advanced application with multiple layouts, API integration, authentication, and complex component composition. It showcases the full capabilities of the JSON App Compiler.

## Features Demonstrated

- Comprehensive metadata configuration
- Multiple layout types (main layout, dashboard layout with sidebar)
- Complex component hierarchy and nesting
- Advanced routing with middleware integration
- Complete API configuration with authentication, validation, and CORS
- Detailed theme configuration with custom properties
- Production build settings

## Components

- Main layout with header and footer
- Dashboard layout with sidebar navigation
- Home page with hero section and feature cards
- Dashboard page with statistics cards
- Login form with validation

## Routes

- `/` - Home page with main layout
- `/dashboard` - Dashboard page with sidebar layout (requires authentication)
- `/login` - Login form

## API Endpoints

- `/api/users` - User management endpoints with validation
- `/api/users/:id` - User detail endpoints with parameter validation
- `/api/auth/login` - Authentication login endpoint
- `/api/auth/register` - User registration endpoint

## Middleware

- `logRequest` - Request logging middleware
- `validateRequest` - Request validation middleware
- `requireAuth` - Authentication middleware
- `guestOnly` - Guest-only access middleware

## Authentication

- JWT authentication provider
- Role-based access control
- Protected routes

## Usage

To compile this example into a Fresh application:

```bash
deno run -A packages/compiler/mod.ts compile examples/complex/app-config.json
```

This will generate a complete Fresh 2.0 application based on the configuration.