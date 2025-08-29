#!/bin/bash

# Development script for Formula Pricing Site

echo "Generating templates..."
~/go/bin/templ generate

echo "Building application..."
go build -o formulapricing-site main.go

echo "Starting server..."
./formulapricing-site