# Formula Pricing Site - Deployment Guide

This guide covers all deployment options for the Formula Pricing Site Go application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Go 1.23.0+**: For building the application
- **Docker**: For containerized deployment
- **Docker Compose**: For multi-service deployment
- **templ CLI**: For template generation

### Installing Prerequisites

#### Install Go
```bash
# Download and install Go 1.23.0+
wget https://go.dev/dl/go1.23.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
```

#### Install templ CLI
```bash
go install github.com/a-h/templ/cmd/templ@latest
```

#### Install Docker and Docker Compose
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER
```

## Environment Variables

The application uses the following environment variables:

### Core Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `ENVIRONMENT` | `development` | Environment mode (development/production) |
| `LOG_LEVEL` | `INFO` | Logging level (DEBUG/INFO/WARN/ERROR/FATAL) |
| `STATIC_PATH` | `./static` | Path to static assets directory |

### Performance Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `READ_TIMEOUT` | `15` | Server read timeout in seconds |
| `WRITE_TIMEOUT` | `15` | Server write timeout in seconds |
| `IDLE_TIMEOUT` | `60` | Server idle timeout in seconds |
| `MAX_HEADER_BYTES` | `1048576` | Maximum header size in bytes (1MB) |
| `REQUEST_TIMEOUT` | `30` | Request timeout in seconds |

### Monitoring

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_METRICS` | `true` | Enable metrics collection |

### Environment File Example

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=8080
ENVIRONMENT=production
LOG_LEVEL=INFO
STATIC_PATH=./static

# Performance Settings
READ_TIMEOUT=15
WRITE_TIMEOUT=15
IDLE_TIMEOUT=60
MAX_HEADER_BYTES=1048576
REQUEST_TIMEOUT=30

# Monitoring
ENABLE_METRICS=true
```

## Local Development

### Quick Start

1. **Clone and setup**:
```bash
git clone <repository-url>
cd formulapricing-site
```

2. **Install dependencies**:
```bash
go mod tidy
```

3. **Generate templates**:
```bash
templ generate
```

4. **Run the application**:
```bash
go run main.go
```

The application will be available at `http://localhost:8080`

### Development with Auto-reload

For development with automatic reloading, use the provided script:

```bash
./dev.sh
```

This script will:
- Generate templates
- Build and run the application
- Watch for file changes (if using a file watcher)

## Docker Deployment

### Using the Deployment Script (Recommended)

The project includes a comprehensive deployment script that handles all aspects of Docker deployment:

```bash
# Build and deploy with Docker Compose
./deploy.sh deploy

# Deploy standalone Docker container
./deploy.sh deploy-docker

# Build Docker image only
./deploy.sh docker

# Run tests
./deploy.sh test

# Clean up Docker resources
./deploy.sh clean

# Show logs
./deploy.sh logs

# Check health
./deploy.sh health
```

### Manual Docker Commands

#### Build Docker Image

```bash
# Generate templates first
templ generate

# Build the Docker image
docker build -t formulapricing-site:latest .
```

#### Run Docker Container

```bash
docker run -d \
  --name formulapricing_site \
  -p 8080:8080 \
  -e PORT=8080 \
  -e ENVIRONMENT=production \
  -e LOG_LEVEL=INFO \
  --restart unless-stopped \
  formulapricing-site:latest
```

#### Using Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Health Checks

The Docker setup includes health checks that verify the application is responding:

```bash
# Check container health
docker ps

# View health check logs
docker inspect formulapricing_site | grep -A 10 Health
```

## Production Deployment

### Single Binary Deployment

For production deployment without Docker:

1. **Build for production**:
```bash
./deploy.sh production
```

Or manually:
```bash
templ generate
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
  -ldflags="-w -s" \
  -a -installsuffix cgo \
  -o formulapricing-site .
```

2. **Create systemd service** (`/etc/systemd/system/formulapricing-site.service`):
```ini
[Unit]
Description=Formula Pricing Site
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/formulapricing-site
ExecStart=/opt/formulapricing-site/formulapricing-site
Restart=always
RestartSec=5
EnvironmentFile=/opt/formulapricing-site/.env

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/formulapricing-site

[Install]
WantedBy=multi-user.target
```

3. **Deploy and start**:
```bash
# Copy files to production server
sudo mkdir -p /opt/formulapricing-site
sudo cp formulapricing-site /opt/formulapricing-site/
sudo cp -r static /opt/formulapricing-site/
sudo cp -r templates /opt/formulapricing-site/
sudo cp .env /opt/formulapricing-site/

# Set permissions
sudo chown -R www-data:www-data /opt/formulapricing-site
sudo chmod +x /opt/formulapricing-site/formulapricing-site

# Enable and start service
sudo systemctl enable formulapricing-site
sudo systemctl start formulapricing-site
sudo systemctl status formulapricing-site
```

### Reverse Proxy Setup (Nginx)

For production, use a reverse proxy like Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Static assets with long cache
    location /static/ {
        proxy_pass http://localhost:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:8080;
        access_log off;
    }
}
```

## Cloud Deployment

### Google Cloud Run

1. **Build and push to Container Registry**:
```bash
# Build for Cloud Run
docker build -t gcr.io/YOUR_PROJECT_ID/formulapricing-site .

# Push to registry
docker push gcr.io/YOUR_PROJECT_ID/formulapricing-site
```

2. **Deploy to Cloud Run**:
```bash
gcloud run deploy formulapricing-site \
  --image gcr.io/YOUR_PROJECT_ID/formulapricing-site \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "ENVIRONMENT=production,LOG_LEVEL=INFO"
```

### AWS ECS/Fargate

1. **Create task definition** (`task-definition.json`):
```json
{
  "family": "formulapricing-site",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "formulapricing-site",
      "image": "YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/formulapricing-site:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "PORT", "value": "8080"},
        {"name": "ENVIRONMENT", "value": "production"},
        {"name": "LOG_LEVEL", "value": "INFO"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/formulapricing-site",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Digital Ocean App Platform

Create `app.yaml`:
```yaml
name: formulapricing-site
services:
- name: web
  source_dir: /
  github:
    repo: your-username/formulapricing-site
    branch: main
  run_command: ./formulapricing-site
  environment_slug: go
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8080
  envs:
  - key: PORT
    value: "8080"
  - key: ENVIRONMENT
    value: "production"
  - key: LOG_LEVEL
    value: "INFO"
```

## Monitoring and Health Checks

### Health Check Endpoint

The application provides a health check endpoint at `/health`:

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

### Metrics Endpoint

If metrics are enabled, they're available at `/metrics`:

```bash
curl http://localhost:8080/metrics
```

### Logging

The application logs to stdout in structured format:

```json
{
  "level": "info",
  "timestamp": "2024-01-01T12:00:00Z",
  "message": "Server starting",
  "port": 8080
}
```

### Monitoring with Docker

```bash
# View real-time logs
docker logs -f formulapricing_site

# Check container stats
docker stats formulapricing_site

# Check container health
docker inspect formulapricing_site | grep -A 10 Health
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 8080
sudo lsof -i :8080

# Kill the process
sudo kill -9 <PID>
```

#### Template Generation Fails
```bash
# Install templ CLI
go install github.com/a-h/templ/cmd/templ@latest

# Regenerate templates
templ generate
```

#### Docker Build Fails
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t formulapricing-site .
```

#### Static Assets Not Loading
- Verify `STATIC_PATH` environment variable
- Check file permissions
- Ensure static directory is copied to container

### Debug Mode

Enable debug logging:
```bash
export LOG_LEVEL=DEBUG
./formulapricing-site
```

### Performance Issues

1. **Check resource usage**:
```bash
# System resources
htop

# Docker container resources
docker stats
```

2. **Optimize build**:
```bash
# Use multi-stage build (already implemented)
# Enable Go build cache
export GOCACHE=/tmp/go-cache
```

3. **Profile the application**:
```bash
# Enable pprof (add to main.go in debug mode)
go tool pprof http://localhost:8080/debug/pprof/profile
```

### Getting Help

1. **Check logs**:
```bash
# Docker Compose
docker-compose logs

# Standalone container
docker logs formulapricing_site

# Systemd service
sudo journalctl -u formulapricing-site -f
```

2. **Verify configuration**:
```bash
# Check environment variables
env | grep -E "(PORT|ENVIRONMENT|LOG_LEVEL)"

# Test configuration
./formulapricing-site --config-test
```

3. **Network connectivity**:
```bash
# Test local connectivity
curl -v http://localhost:8080/health

# Test from another container
docker run --rm --network formulapricing_network alpine/curl curl http://formulapricing-site:8080/health
```

## Security Considerations

### Production Security Checklist

- [ ] Use HTTPS in production
- [ ] Set up proper firewall rules
- [ ] Use non-root user in containers
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Use secrets management for sensitive data
- [ ] Enable audit logging
- [ ] Implement rate limiting if needed
- [ ] Regular backup procedures

### Container Security

The Dockerfile implements security best practices:
- Multi-stage build to reduce attack surface
- Non-root user execution
- Minimal base image (Alpine)
- No unnecessary packages

### Network Security

- Use reverse proxy (Nginx/Apache) in production
- Enable HTTPS with proper certificates
- Configure proper CORS headers
- Implement rate limiting
- Use Web Application Firewall (WAF) if needed

## Backup and Recovery

### Application Data

The application is stateless, but you should backup:
- Configuration files (`.env`)
- Static assets (if customized)
- SSL certificates
- Deployment scripts

### Disaster Recovery

1. **Automated backups**:
```bash
#!/bin/bash
# backup-script.sh
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "formulapricing-site-backup-$DATE.tar.gz" \
  .env static/ templates/ formulapricing-site
```

2. **Recovery procedure**:
```bash
# Extract backup
tar -xzf formulapricing-site-backup-YYYYMMDD_HHMMSS.tar.gz

# Restore service
sudo systemctl stop formulapricing-site
sudo cp -r * /opt/formulapricing-site/
sudo systemctl start formulapricing-site
```

## Performance Optimization

### Build Optimization

- Use Go build flags for smaller binaries
- Enable compression in reverse proxy
- Optimize static asset delivery
- Use CDN for static assets in production

### Runtime Optimization

- Tune Go garbage collector settings
- Monitor memory usage
- Use connection pooling
- Implement caching where appropriate

### Monitoring Performance

```bash
# CPU and memory usage
docker stats formulapricing_site

# Response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/

# Load testing
ab -n 1000 -c 10 http://localhost:8080/
```

This deployment guide provides comprehensive instructions for deploying the Formula Pricing Site in various environments, from local development to production cloud deployments.