# Simple Application Example

This directory contains a simple JSON configuration example for the JSON App Compiler.

## Purpose

This example demonstrates a basic application with minimal components and routes. It's designed to showcase the core functionality of the JSON App Compiler without complex features.

## Features Demonstrated

- Basic metadata configuration
- Simple component hierarchy with Layout, Card, Button, and Input components
- Basic routing with three routes (home, about, contact)
- Simple API endpoint
- Basic theme configuration

## Components

- Header layout with navigation buttons
- Home page with welcome card and counter button
- About page with information card
- Contact form with input fields and submit button

## Routes

- `/` - Home page
- `/about` - About page
- `/contact` - Contact form

## API Endpoints

- `/api/hello` - Simple GET endpoint

## Usage

To compile this example into a Fresh application:

```bash
deno run -A packages/compiler/mod.ts compile examples/simple/app-config.json
```

This will generate a complete Fresh 2.0 application based on the configuration.