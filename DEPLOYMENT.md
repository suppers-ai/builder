# Cloud Run Deployment Guide

This guide covers deploying your Deno Fresh applications to Google Cloud Run.

## Prerequisites

1. **Google Cloud Project**: Create a project and enable the following APIs:
   - Cloud Run API
   - Artifact Registry API
   - Cloud Build API

2. **Artifact Registry Repository**: Create a Docker repository:
   ```bash
   gcloud artifacts repositories create suppers \
       --repository-format=docker \
       --location=us-central1 \
       --description="Docker repository for Suppers applications"
   ```
   
   Or create via Google Cloud Console:
   - Navigate to Artifact Registry
   - Click "CREATE REPOSITORY"
   - Name: `suppers`, Format: Docker, Region: `us-central1`

3. **Authentication**: Set up a service account with the following roles:
   - Cloud Run Developer
   - Artifact Registry Writer
   - Service Account User

4. **GitHub Secrets**: Add these secrets to your repository:
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_SA_KEY`: Base64 encoded service account key JSON

## Available Apps

- **store**: E-commerce store application
- **profile**: User profile and authentication service
- **cdn**: Content delivery network for static assets
- **docs**: Documentation and UI library showcase

## Deployment Methods

### 1. GitHub Actions (Recommended)

**Staging Deployment** (automatic on `development` branch):
- Pushes to `development` branch automatically deploy all apps to staging
- Manual trigger available in GitHub Actions tab

**Production Deployment** (automatic on `main` branch):
- Pushes to `main` branch automatically deploy all apps to production
- Manual trigger available in GitHub Actions tab

### 2. Manual Deployment (if needed)

Build and deploy a specific app using the root Dockerfile:
```bash
# Configure Docker for Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build Docker image with app name
docker build --build-arg APP_NAME=store -t us-central1-docker.pkg.dev/your-project-id/suppers/suppers-store-staging .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/your-project-id/suppers/suppers-store-staging

# Deploy to Cloud Run
gcloud run deploy suppers-store-staging \
  --image us-central1-docker.pkg.dev/your-project-id/suppers/suppers-store-staging \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

## Environment Configuration

### Staging Environment
- **Memory**: 1Gi
- **CPU**: 1
- **Min instances**: 0
- **Max instances**: 10
- **Environment**: `ENVIRONMENT=staging`

### Production Environment
- **Memory**: 2Gi
- **CPU**: 2
- **Min instances**: 1
- **Max instances**: 20
- **Environment**: `ENVIRONMENT=production`

## Service URLs

After deployment, your services will be available at:
- **Staging**: `https://suppers-{app}-staging-{hash}.a.run.app`
- **Production**: `https://suppers-{app}-production-{hash}.a.run.app`

## Environment Variables

Each app supports the following environment variables:
- `PORT`: Server port (default: 8000, Cloud Run uses 8080)
- `ENVIRONMENT`: Deployment environment (staging/production)

Add additional environment variables in the GitHub Actions workflows or deployment scripts as needed.

## Monitoring and Logs

### Check All Deployments
Use the monitoring script to check status of all apps:
```bash
# Check staging environment
./scripts/check-deployments.sh staging your-project-id

# Check production environment  
./scripts/check-deployments.sh production your-project-id
```

This script will show:
- Service status and health
- Public URLs
- Traffic allocation
- Quick health check (HTTP response)

### View Logs
View logs in Google Cloud Console:
```bash
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=suppers-store-staging" --limit 50
```

## Troubleshooting

### Common Issues

1. **Build failures**: Check that all workspace dependencies are properly cached
2. **Port binding**: Ensure apps listen on the PORT environment variable
3. **Memory limits**: Increase memory allocation if apps are being killed
4. **Cold starts**: Set min-instances > 0 for production to reduce cold start latency

### Debug Commands

```bash
# Check service status
gcloud run services describe suppers-store-staging --region=us-central1

# View recent logs
gcloud logs tail "resource.type=cloud_run_revision" --filter="resource.labels.service_name=suppers-store-staging"

# Test local Docker build
docker build --build-arg APP_NAME=docs -t test-docs .
docker run -it -p 8080:8080 -e PORT=8080 test-docs
```