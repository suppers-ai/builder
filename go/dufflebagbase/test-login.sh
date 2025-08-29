#!/bin/bash

echo "Testing login with admin@example.com"
curl -X POST http://localhost:8091/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@example.com&password=AdminSecurePass2024!" \
  -v