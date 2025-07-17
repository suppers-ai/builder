# Blog Application Example

This directory contains a blog application JSON configuration example for the JSON App Compiler.

## Purpose

This example demonstrates a blog application with content management, commenting features, and an admin dashboard. It showcases how to build a content-focused application with the JSON App Compiler.

## Features Demonstrated

- Blog-specific components and layouts
- Post listing and detail views
- Category and tag organization
- Comment system
- Admin dashboard for content management
- Role-based access control
- Form validation for content submission

## Components

- Main layout with header and footer
- Admin layout with sidebar navigation
- Home page with featured and recent posts
- Post detail page with comments section
- Login form with validation
- Admin dashboard with statistics and activity feed

## Routes

- `/` - Home page with post listings
- `/posts/:id` - Individual post detail page
- `/login` - Login form
- `/admin` - Admin dashboard (requires authentication)

## API Endpoints

- `/api/posts` - Post management endpoints
- `/api/posts/:id` - Individual post operations
- `/api/categories` - Category management
- `/api/comments` - Comment submission and retrieval
- `/api/auth/login` - Authentication endpoint

## Usage

To compile this example into a Fresh application:

```bash
deno run -A packages/compiler/mod.ts compile examples/blog/app-config.json
```

This will generate a complete Fresh 2.0 blog application based on the configuration.