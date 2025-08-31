#!/bin/bash

echo "Testing Settings UI Page..."
echo "=========================="

# Get auth token
TOKEN=$(curl -s -X POST http://localhost:8092/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Test123456789!"}' | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Failed to login"
  exit 1
fi

echo "✓ Logged in successfully"

# Test that the settings page loads
echo -n "Checking settings page HTML... "
HTML=$(curl -s http://localhost:8092/settings)
if echo "$HTML" | grep -q "Settings" && echo "$HTML" | grep -q "General Settings"; then
  echo "✓ Settings page loads correctly"
else
  echo "✗ Settings page failed to load"
fi

# Test the settings API endpoints from the UI perspective
echo -n "Testing settings API from UI context... "
SETTINGS=$(curl -s http://localhost:8092/api/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

if echo "$SETTINGS" | jq -e '.app_name' >/dev/null 2>&1; then
  echo "✓ API returns valid settings structure"
  
  # Display some key settings
  echo ""
  echo "Current Settings:"
  echo "  App Name: $(echo "$SETTINGS" | jq -r '.app_name')"
  echo "  Storage Provider: $(echo "$SETTINGS" | jq -r '.storage_provider')"
  echo "  Allow Signup: $(echo "$SETTINGS" | jq -r '.allow_signup')"
  echo "  Debug Mode: $(echo "$SETTINGS" | jq -r '.enable_debug_mode')"
  echo "  Maintenance Mode: $(echo "$SETTINGS" | jq -r '.maintenance_mode')"
else
  echo "✗ API failed to return settings"
fi

echo ""
echo "Settings UI test complete!"
echo ""
echo "You can now access the settings page at: http://localhost:8092/settings"
echo "Login with: admin@example.com / Test123456789!"