# Environment Variables

This document describes all environment variables used by the Formula Pricing Site application.

## Core Configuration

### PORT
- **Description**: The port number on which the server will listen
- **Type**: String (numeric)
- **Default**: `8080`
- **Example**: `PORT=3000`
- **Required**: No

### ENVIRONMENT
- **Description**: The environment mode for the application
- **Type**: String
- **Default**: `development`
- **Valid Values**: `development`, `production`, `staging`, `test`
- **Example**: `ENVIRONMENT=production`
- **Required**: No

### LOG_LEVEL
- **Description**: The logging level for the application
- **Type**: String
- **Default**: `INFO`
- **Valid Values**: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`
- **Example**: `LOG_LEVEL=DEBUG`
- **Required**: No

### STATIC_PATH
- **Description**: Path to the static assets directory
- **Type**: String
- **Default**: `./static`
- **Example**: `STATIC_PATH=/app/static`
- **Required**: No

## Performance Settings

### READ_TIMEOUT
- **Description**: Server read timeout in seconds
- **Type**: String (numeric)
- **Default**: `15`
- **Example**: `READ_TIMEOUT=30`
- **Required**: No

### WRITE_TIMEOUT
- **Description**: Server write timeout in seconds
- **Type**: String (numeric)
- **Default**: `15`
- **Example**: `WRITE_TIMEOUT=30`
- **Required**: No

### IDLE_TIMEOUT
- **Description**: Server idle timeout in seconds
- **Type**: String (numeric)
- **Default**: `60`
- **Example**: `IDLE_TIMEOUT=120`
- **Required**: No

### MAX_HEADER_BYTES
- **Description**: Maximum header size in bytes
- **Type**: String (numeric)
- **Default**: `1048576` (1MB)
- **Example**: `MAX_HEADER_BYTES=2097152`
- **Required**: No

### REQUEST_TIMEOUT
- **Description**: Request timeout in seconds
- **Type**: String (numeric)
- **Default**: `30`
- **Example**: `REQUEST_TIMEOUT=60`
- **Required**: No

## Monitoring

### ENABLE_METRICS
- **Description**: Enable metrics collection
- **Type**: String (boolean)
- **Default**: `true`
- **Valid Values**: `true`, `false`
- **Example**: `ENABLE_METRICS=false`
- **Required**: No

## Environment File Examples

### Development (.env.development)
```env
# Development Configuration
PORT=8080
ENVIRONMENT=development
LOG_LEVEL=DEBUG
STATIC_PATH=./static

# Performance Settings (relaxed for development)
READ_TIMEOUT=30
WRITE_TIMEOUT=30
IDLE_TIMEOUT=120
MAX_HEADER_BYTES=1048576
REQUEST_TIMEOUT=60

# Monitoring
ENABLE_METRICS=true
```

### Production (.env.production)
```env
# Production Configuration
PORT=8080
ENVIRONMENT=production
LOG_LEVEL=INFO
STATIC_PATH=./static

# Performance Settings (optimized for production)
READ_TIMEOUT=15
WRITE_TIMEOUT=15
IDLE_TIMEOUT=60
MAX_HEADER_BYTES=1048576
REQUEST_TIMEOUT=30

# Monitoring
ENABLE_METRICS=true
```

### Testing (.env.test)
```env
# Test Configuration
PORT=8081
ENVIRONMENT=test
LOG_LEVEL=WARN
STATIC_PATH=./static

# Performance Settings (fast for testing)
READ_TIMEOUT=5
WRITE_TIMEOUT=5
IDLE_TIMEOUT=30
MAX_HEADER_BYTES=524288
REQUEST_TIMEOUT=10

# Monitoring
ENABLE_METRICS=false
```

## Docker Environment Variables

When running in Docker, you can set environment variables using:

### Docker Run
```bash
docker run -d \
  -e PORT=8080 \
  -e ENVIRONMENT=production \
  -e LOG_LEVEL=INFO \
  -p 8080:8080 \
  formulapricing-site:latest
```

### Docker Compose
```yaml
services:
  formulapricing-site:
    image: formulapricing-site:latest
    environment:
      PORT: "8080"
      ENVIRONMENT: "production"
      LOG_LEVEL: "INFO"
      STATIC_PATH: "./static"
      READ_TIMEOUT: "15"
      WRITE_TIMEOUT: "15"
      IDLE_TIMEOUT: "60"
      MAX_HEADER_BYTES: "1048576"
      REQUEST_TIMEOUT: "30"
      ENABLE_METRICS: "true"
```

## Cloud Platform Environment Variables

### Google Cloud Run
```bash
gcloud run deploy formulapricing-site \
  --set-env-vars "PORT=8080,ENVIRONMENT=production,LOG_LEVEL=INFO"
```

### AWS ECS Task Definition
```json
{
  "environment": [
    {"name": "PORT", "value": "8080"},
    {"name": "ENVIRONMENT", "value": "production"},
    {"name": "LOG_LEVEL", "value": "INFO"},
    {"name": "STATIC_PATH", "value": "./static"},
    {"name": "READ_TIMEOUT", "value": "15"},
    {"name": "WRITE_TIMEOUT", "value": "15"},
    {"name": "IDLE_TIMEOUT", "value": "60"},
    {"name": "MAX_HEADER_BYTES", "value": "1048576"},
    {"name": "REQUEST_TIMEOUT", "value": "30"},
    {"name": "ENABLE_METRICS", "value": "true"}
  ]
}
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: formulapricing-site
spec:
  template:
    spec:
      containers:
      - name: formulapricing-site
        image: formulapricing-site:latest
        env:
        - name: PORT
          value: "8080"
        - name: ENVIRONMENT
          value: "production"
        - name: LOG_LEVEL
          value: "INFO"
        - name: STATIC_PATH
          value: "./static"
        - name: READ_TIMEOUT
          value: "15"
        - name: WRITE_TIMEOUT
          value: "15"
        - name: IDLE_TIMEOUT
          value: "60"
        - name: MAX_HEADER_BYTES
          value: "1048576"
        - name: REQUEST_TIMEOUT
          value: "30"
        - name: ENABLE_METRICS
          value: "true"
```

## Environment Variable Validation

The application validates environment variables on startup:

1. **PORT**: Must be a valid port number (1-65535)
2. **ENVIRONMENT**: Must be one of the valid values
3. **LOG_LEVEL**: Must be one of the valid log levels
4. **Numeric values**: Must be valid integers
5. **Boolean values**: Must be "true" or "false"

Invalid values will cause the application to exit with an error message.

## Security Considerations

### Sensitive Information
- Never commit `.env` files containing sensitive information to version control
- Use secrets management systems in production (AWS Secrets Manager, Google Secret Manager, etc.)
- Rotate secrets regularly

### Environment Isolation
- Use different environment files for different deployment stages
- Validate that production environments don't use development settings
- Monitor environment variable changes in production

### Access Control
- Restrict access to environment configuration files
- Use proper file permissions (600 for .env files)
- Audit environment variable changes

## Troubleshooting

### Common Issues

#### Application Won't Start
1. Check if PORT is already in use
2. Verify all required environment variables are set
3. Check log output for validation errors

#### Performance Issues
1. Adjust timeout values based on your use case
2. Monitor resource usage and adjust accordingly
3. Consider load balancing for high traffic

#### Logging Issues
1. Verify LOG_LEVEL is set correctly
2. Check if log output is being captured properly
3. Ensure log rotation is configured in production

### Debug Commands

```bash
# Check current environment variables
env | grep -E "(PORT|ENVIRONMENT|LOG_LEVEL)"

# Test configuration
./formulapricing-site --config-test

# Validate environment file
source .env && echo "PORT=$PORT ENVIRONMENT=$ENVIRONMENT"
```

## Best Practices

1. **Use environment-specific files**: `.env.development`, `.env.production`, etc.
2. **Document all variables**: Keep this file updated when adding new variables
3. **Validate on startup**: Ensure the application validates all environment variables
4. **Use defaults**: Provide sensible defaults for non-critical settings
5. **Monitor changes**: Track environment variable changes in production
6. **Test configurations**: Test different environment configurations regularly
7. **Secure sensitive data**: Use proper secrets management for sensitive information