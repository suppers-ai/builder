# E-Commerce Application Example

This directory contains an e-commerce application JSON configuration example for the JSON App Compiler.

## Purpose

This example demonstrates a complete e-commerce application with product listings, shopping cart functionality, and checkout process. It showcases how to build a commerce-focused application with the JSON App Compiler.

## Features Demonstrated

- E-commerce specific components and layouts
- Product listing and detail pages
- Shopping cart functionality
- Checkout process with form validation
- API endpoints for product, cart, and order management
- Authentication integration for protected routes

## Components

- Main layout with header and footer
- Home page with featured products and categories
- Product listing page with filtering and pagination
- Product detail page with tabs for description, specifications, and reviews
- Shopping cart page with item management
- Checkout page with shipping and payment forms

## Routes

- `/` - Home page with featured products
- `/products` - Product listing page
- `/products/:id` - Individual product detail page
- `/cart` - Shopping cart page
- `/checkout` - Checkout page (requires authentication)

## API Endpoints

- `/api/products` - Product listing endpoint
- `/api/products/:id` - Individual product details
- `/api/cart` - Shopping cart management
- `/api/orders` - Order creation and history

## Expected Output

When compiled, this configuration will generate a complete e-commerce application with:

1. A responsive layout that works on mobile and desktop
2. Product browsing functionality
3. Shopping cart with add/remove/update capabilities
4. Checkout process with form validation
5. API integration for product data and order management

## Usage

To compile this example into a Fresh application:

```bash
deno run -A packages/compiler/mod.ts compile examples/ecommerce/app-config.json
```

This will generate a complete Fresh 2.0 e-commerce application based on the configuration.

## Testing

The generated application can be tested by:

1. Browsing the product catalog
2. Adding items to the cart
3. Updating quantities in the cart
4. Proceeding to checkout
5. Completing the checkout form

Note that since this is a demo application, no actual payment processing occurs.