#!/bin/bash
# Prepare for Fly.io deployment by vendoring dependencies

cd /home/joris/Projects/suppers-ai/builder/go/solobase

# Vendor all dependencies including local packages
go mod vendor

echo "Dependencies vendored. Now you can deploy to Fly.io"
echo "Run: fly deploy --config fly-demo.toml"