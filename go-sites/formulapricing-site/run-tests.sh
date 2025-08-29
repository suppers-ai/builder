#!/bin/bash

# Formula Pricing Site - Test Runner
# This script runs all tests for the Go rewrite of the Formula Pricing site

set -e

echo "🧪 Running Formula Pricing Site Test Suite"
echo "=========================================="

# Change to the project directory
cd "$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Go is installed
if ! command -v go &> /dev/null; then
    print_error "Go is not installed or not in PATH"
    exit 1
fi

print_status "Go version: $(go version)"

# Ensure we have the required dependencies
print_status "Downloading dependencies..."
go mod download
go mod tidy

# Create static directory for tests if it doesn't exist
if [ ! -d "static" ]; then
    print_status "Creating static directory for tests..."
    mkdir -p static/{css,js,images}
    
    # Create minimal test files
    echo "/* Test CSS */" > static/css/styles.css
    echo "// Test JS" > static/js/professor-gopher.js
    
    # Create a simple 1x1 PNG for testing
    echo -e '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\fIDATx\xdac\xf8\x0f\x00\x00\x01\x00\x01\\\xcd\x90\x0e\x00\x00\x00\x00IEND\xaeB`\x82' > static/images/professor-gopher.png
    
    # Create a simple SVG
    echo '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#f0f9ff"/></svg>' > static/images/wave-background-tile-512-thinner-seamless.svg
fi

# Function to run tests with coverage
run_tests() {
    local test_type=$1
    local test_path=$2
    local coverage_file=$3
    
    print_status "Running $test_type tests..."
    
    if [ -n "$coverage_file" ]; then
        go test -v -race -coverprofile="$coverage_file" -covermode=atomic "$test_path"
    else
        go test -v -race "$test_path"
    fi
    
    if [ $? -eq 0 ]; then
        print_success "$test_type tests passed"
    else
        print_error "$test_type tests failed"
        return 1
    fi
}

# Initialize test results
UNIT_TESTS_PASSED=false
INTEGRATION_TESTS_PASSED=false
VISUAL_TESTS_PASSED=false
OVERALL_SUCCESS=true

# Run unit tests
print_status "Starting unit tests..."
if run_tests "Unit" "./tests/unit/..." "coverage-unit.out"; then
    UNIT_TESTS_PASSED=true
else
    OVERALL_SUCCESS=false
fi

echo ""

# Run integration tests
print_status "Starting integration tests..."
if run_tests "Integration" "./tests/integration/..." "coverage-integration.out"; then
    INTEGRATION_TESTS_PASSED=true
else
    OVERALL_SUCCESS=false
fi

echo ""

# Run visual regression tests
print_status "Starting visual regression tests..."
if run_tests "Visual" "./tests/visual/..." "coverage-visual.out"; then
    VISUAL_TESTS_PASSED=true
else
    OVERALL_SUCCESS=false
fi

echo ""

# Generate combined coverage report if all tests passed
if [ "$OVERALL_SUCCESS" = true ]; then
    print_status "Generating combined coverage report..."
    
    # Combine coverage files
    echo "mode: atomic" > coverage-combined.out
    tail -n +2 coverage-unit.out >> coverage-combined.out 2>/dev/null || true
    tail -n +2 coverage-integration.out >> coverage-combined.out 2>/dev/null || true
    tail -n +2 coverage-visual.out >> coverage-combined.out 2>/dev/null || true
    
    # Generate HTML coverage report
    go tool cover -html=coverage-combined.out -o coverage.html
    
    # Show coverage summary
    COVERAGE=$(go tool cover -func=coverage-combined.out | grep total | awk '{print $3}')
    print_status "Total test coverage: $COVERAGE"
    
    if command -v open &> /dev/null; then
        print_status "Opening coverage report in browser..."
        open coverage.html
    elif command -v xdg-open &> /dev/null; then
        print_status "Opening coverage report in browser..."
        xdg-open coverage.html
    else
        print_status "Coverage report saved to coverage.html"
    fi
fi

# Run additional checks
echo ""
print_status "Running additional checks..."

# Check for race conditions
print_status "Checking for race conditions..."
go test -race ./... > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "No race conditions detected"
else
    print_warning "Potential race conditions detected"
fi

# Check for memory leaks (basic check)
print_status "Running memory leak detection..."
go test -memprofile=mem.prof ./tests/integration/... > /dev/null 2>&1
if [ -f mem.prof ]; then
    print_success "Memory profile generated (mem.prof)"
else
    print_warning "Could not generate memory profile"
fi

# Check for CPU profiling
print_status "Running CPU profiling..."
go test -cpuprofile=cpu.prof ./tests/integration/... > /dev/null 2>&1
if [ -f cpu.prof ]; then
    print_success "CPU profile generated (cpu.prof)"
else
    print_warning "Could not generate CPU profile"
fi

# Benchmark tests
print_status "Running benchmark tests..."
go test -bench=. -benchmem ./... > benchmark.txt 2>&1
if [ $? -eq 0 ]; then
    print_success "Benchmark tests completed (results in benchmark.txt)"
else
    print_warning "Benchmark tests failed or not available"
fi

# Test summary
echo ""
echo "=========================================="
echo "🧪 Test Summary"
echo "=========================================="

if [ "$UNIT_TESTS_PASSED" = true ]; then
    print_success "✅ Unit Tests: PASSED"
else
    print_error "❌ Unit Tests: FAILED"
fi

if [ "$INTEGRATION_TESTS_PASSED" = true ]; then
    print_success "✅ Integration Tests: PASSED"
else
    print_error "❌ Integration Tests: FAILED"
fi

if [ "$VISUAL_TESTS_PASSED" = true ]; then
    print_success "✅ Visual Regression Tests: PASSED"
else
    print_error "❌ Visual Regression Tests: FAILED"
fi

echo ""

if [ "$OVERALL_SUCCESS" = true ]; then
    print_success "🎉 All tests passed successfully!"
    echo ""
    print_status "Generated files:"
    print_status "  - coverage.html (Combined coverage report)"
    print_status "  - coverage-combined.out (Coverage data)"
    print_status "  - mem.prof (Memory profile)"
    print_status "  - cpu.prof (CPU profile)"
    print_status "  - benchmark.txt (Benchmark results)"
    echo ""
    print_status "Next steps:"
    print_status "  1. Review coverage report: open coverage.html"
    print_status "  2. Check benchmark results: cat benchmark.txt"
    print_status "  3. Analyze profiles with: go tool pprof mem.prof"
    exit 0
else
    print_error "❌ Some tests failed. Please check the output above."
    exit 1
fi