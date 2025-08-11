#!/bin/bash

# Check deployment status for all Suppers applications
# Usage: ./scripts/check-deployments.sh <environment> <project-id>
# Example: ./scripts/check-deployments.sh staging my-project-id

set -e

ENVIRONMENT=${1:-staging}
PROJECT_ID=${2:-}
REGION="us-central1"

# List of all applications
APPS=("store" "profile" "cdn" "docs" "dashboard")

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: Project ID is required"
    echo "Usage: $0 <environment> <project-id>"
    echo "Example: $0 staging my-project-id"
    exit 1
fi

echo "🔍 Checking deployments for environment: $ENVIRONMENT"
echo "📍 Project: $PROJECT_ID"
echo "🌍 Region: $REGION"
echo ""

# Function to check service status
check_service() {
    local app=$1
    local service_name="suppers-${app}-${ENVIRONMENT}"
    
    echo "📦 Checking $app..."
    
    # Check if service exists
    if ! gcloud run services describe "$service_name" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
        echo "  ❌ Service not found: $service_name"
        return 1
    fi
    
    # Get service details
    local url=$(gcloud run services describe "$service_name" --region="$REGION" --project="$PROJECT_ID" --format='value(status.url)' 2>/dev/null)
    local ready=$(gcloud run services describe "$service_name" --region="$REGION" --project="$PROJECT_ID" --format='value(status.conditions[0].status)' 2>/dev/null)
    local traffic=$(gcloud run services describe "$service_name" --region="$REGION" --project="$PROJECT_ID" --format='value(status.traffic[0].percent)' 2>/dev/null)
    
    if [ "$ready" = "True" ]; then
        echo "  ✅ Status: Ready"
        echo "  🌐 URL: $url"
        echo "  📊 Traffic: ${traffic}%"
        
        # Quick health check
        if curl -s --max-time 10 "$url" > /dev/null 2>&1; then
            echo "  💚 Health: OK"
        else
            echo "  ⚠️  Health: Not responding"
        fi
    else
        echo "  ❌ Status: Not Ready"
        echo "  🌐 URL: $url"
    fi
    
    echo ""
}

# Check all applications
for app in "${APPS[@]}"; do
    check_service "$app"
done

echo "✅ Deployment check complete!"
echo ""
echo "💡 To view logs for a specific service:"
echo "   gcloud logs read \"resource.type=cloud_run_revision AND resource.labels.service_name=suppers-<app>-$ENVIRONMENT\" --limit 50 --project=$PROJECT_ID"
echo ""
echo "🔧 To redeploy a service:"
echo "   Use GitHub Actions or run: gcloud run deploy suppers-<app>-$ENVIRONMENT --source . --region=$REGION --project=$PROJECT_ID"