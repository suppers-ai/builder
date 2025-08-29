#!/bin/bash
cd /home/joris/Projects/suppers-ai/builder/go/dufflebagbase

# Generate extension registrations
echo "Discovering extensions..."
go run tools/generate-extensions.go

# Build the application
echo "Building DuffleBag..."
go build -o dufflebag 2>&1