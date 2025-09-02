# Extension Lifecycle Management

This document describes how extensions are managed in the solobase system.

## Extension Registration Process

1. **Discovery**: Extensions are discovered by scanning the `extensions/official/`, `extensions/community/`, and `extensions/custom/` directories
2. **Generation**: The `tools/generate-extensions.go` script generates the `extensions_generated.go` file with registration code
3. **Registration**: Extensions are registered with the `ExtensionRegistry` during application startup
4. **Configuration**: Extension settings are loaded from `extensions/config.json`
5. **Initialization**: Enabled extensions are initialized with their configuration
6. **Startup**: Extensions are started and begin processing requests

## Configuration Management

Extensions are configured through the `extensions/config.json` file:

```json
{
  "extensions": {
    "hugo": {
      "enabled": true,
      "config": {
        "hugo_binary_path": "hugo",
        "max_sites_per_user": 10,
        "max_site_size": 1073741824,
        "build_timeout": "10m",
        "allowed_themes": ["default", "blog", "portfolio"],
        "default_theme": "default",
        "storage_bucket": "hugo-sites"
      }
    }
  }
}
```

## Extension States

- **Registered**: Extension is known to the system but not active
- **Enabled**: Extension is active and processing requests
- **Disabled**: Extension is temporarily stopped
- **Failed**: Extension encountered an error and was disabled

## Default Settings

Default configuration for extensions is stored in `extensions/defaults/{extension-name}.json` files.

## Schema Validation

Extension configuration is validated against the schema defined in `extensions/schema.json`.

## Lifecycle Hooks

Extensions can register hooks for various lifecycle events:
- Application startup
- Request processing
- Authentication
- Error handling
- Application shutdown

## Security

- Extensions run with limited permissions
- Database access is schema-isolated
- File system access is restricted
- Resource usage is monitored and limited

## Monitoring

Extension health and performance metrics are collected and exposed through:
- Health check endpoints
- Prometheus metrics
- Application logs
- Error tracking