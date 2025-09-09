#!/bin/bash
cd /home/joris/Projects/suppers-ai/builder/go/solobase

echo "Testing CGO_ENABLED=0 build..."
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o test-binary .
if [ $? -eq 0 ]; then
    echo "✓ Build succeeded with CGO_ENABLED=0"
    file test-binary
    rm test-binary
else
    echo "✗ Build failed with CGO_ENABLED=0"
    echo "SQLite probably requires CGO. Let's try with CGO_ENABLED=1..."
    
    CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o test-binary .
    if [ $? -eq 0 ]; then
        echo "✓ Build succeeded with CGO_ENABLED=1"
        file test-binary
        rm test-binary
    else
        echo "✗ Build failed with CGO_ENABLED=1"
    fi
fi