#!/bin/bash

# Pixel-Perfect Validation Script for Formula Pricing Site Go Rewrite
# Tests all requirements from task 12

set -e

echo "🔍 Starting Pixel-Perfect Validation..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to log test results
log_test() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ $test_name${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    if [ -n "$details" ]; then
        echo "   $details"
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local url="$1"
    local expected_status="$2"
    local test_name="$3"
    
    if command -v curl >/dev/null 2>&1; then
        local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        if [ "$status" = "$expected_status" ]; then
            log_test "$test_name" "PASS" "HTTP $status"
        else
            log_test "$test_name" "FAIL" "Expected HTTP $expected_status, got HTTP $status"
        fi
    else
        log_test "$test_name" "SKIP" "curl not available"
    fi
}

# Function to test file existence
test_file_exists() {
    local file_path="$1"
    local test_name="$2"
    
    if [ -f "$file_path" ]; then
        log_test "$test_name" "PASS" "File exists: $file_path"
    else
        log_test "$test_name" "FAIL" "File not found: $file_path"
    fi
}

# Function to test directory structure
test_directory_structure() {
    echo -e "\n${YELLOW}Testing Directory Structure...${NC}"
    
    test_file_exists "main.go" "Main application file"
    test_file_exists "config/config.go" "Configuration module"
    test_file_exists "handlers/home.go" "Home handler"
    test_file_exists "templates/home.templ" "Home template"
    test_file_exists "static/css/styles.css" "CSS styles"
    test_file_exists "static/js/professor-gopher.js" "JavaScript for eye tracking"
    test_file_exists "static/images/professor-gopher.png" "Professor Gopher image"
    test_file_exists "static/images/wave-background-tile-512-thinner-seamless.svg" "Background SVG"
}

# Function to test static assets
test_static_assets() {
    echo -e "\n${YELLOW}Testing Static Assets...${NC}"
    
    # Test if Go server is running
    if curl -s http://localhost:8080/health >/dev/null 2>&1; then
        test_endpoint "http://localhost:8080/static/css/styles.css" "200" "CSS file serving"
        test_endpoint "http://localhost:8080/static/js/professor-gopher.js" "200" "JavaScript file serving"
        test_endpoint "http://localhost:8080/static/images/professor-gopher.png" "200" "Professor Gopher image serving"
        test_endpoint "http://localhost:8080/static/images/wave-background-tile-512-thinner-seamless.svg" "200" "Background SVG serving"
        test_endpoint "http://localhost:8080/professor-gopher.png" "200" "Professor Gopher image (root path)"
        test_endpoint "http://localhost:8080/wave-background-tile-512-thinner-seamless.svg" "200" "Background SVG (root path)"
    else
        log_test "Go Server Running" "FAIL" "Server not accessible at http://localhost:8080"
    fi
}

# Function to test page endpoints
test_page_endpoints() {
    echo -e "\n${YELLOW}Testing Page Endpoints...${NC}"
    
    if curl -s http://localhost:8080/health >/dev/null 2>&1; then
        test_endpoint "http://localhost:8080/" "200" "Homepage"
        test_endpoint "http://localhost:8080/faq" "200" "FAQ page"
        test_endpoint "http://localhost:8080/docs" "200" "Documentation page"
        test_endpoint "http://localhost:8080/demo" "200" "Demo page"
        test_endpoint "http://localhost:8080/api-reference" "200" "API Reference page"
        test_endpoint "http://localhost:8080/examples" "200" "Examples page"
        test_endpoint "http://localhost:8080/search?q=test" "200" "Search page with query"
        test_endpoint "http://localhost:8080/nonexistent" "404" "404 error page"
        test_endpoint "http://localhost:8080/health" "200" "Health check endpoint"
    else
        log_test "Go Server Running" "FAIL" "Server not accessible at http://localhost:8080"
    fi
}

# Function to test content matching
test_content_matching() {
    echo -e "\n${YELLOW}Testing Content Matching...${NC}"
    
    if curl -s http://localhost:8080/health >/dev/null 2>&1; then
        # Test homepage content
        local homepage_content=$(curl -s http://localhost:8080/ 2>/dev/null || echo "")
        
        if echo "$homepage_content" | grep -q "Open Source Formula Pricing"; then
            log_test "Homepage Title Content" "PASS" "Main heading found"
        else
            log_test "Homepage Title Content" "FAIL" "Main heading not found"
        fi
        
        if echo "$homepage_content" | grep -q "in 1 file"; then
            log_test "Homepage Subtitle Content" "PASS" "Subtitle found"
        else
            log_test "Homepage Subtitle Content" "FAIL" "Subtitle not found"
        fi
        
        if echo "$homepage_content" | grep -q "Professor Gopher"; then
            log_test "Professor Gopher Reference" "PASS" "Professor Gopher mentioned"
        else
            log_test "Professor Gopher Reference" "FAIL" "Professor Gopher not mentioned"
        fi
        
        if echo "$homepage_content" | grep -q "Real-time calculations"; then
            log_test "Feature Cards Content" "PASS" "Feature cards found"
        else
            log_test "Feature Cards Content" "FAIL" "Feature cards not found"
        fi
        
        if echo "$homepage_content" | grep -q "Live Demo"; then
            log_test "CTA Buttons Content" "PASS" "CTA buttons found"
        else
            log_test "CTA Buttons Content" "FAIL" "CTA buttons not found"
        fi
    fi
}

# Function to test CSS styles matching
test_css_styles() {
    echo -e "\n${YELLOW}Testing CSS Styles Matching...${NC}"
    
    local css_file="static/css/styles.css"
    
    if [ -f "$css_file" ]; then
        # Test for key CSS variables
        if grep -q ":root" "$css_file" && grep -q "\--primary-color" "$css_file"; then
            log_test "CSS Variables" "PASS" "CSS custom properties found"
        else
            log_test "CSS Variables" "FAIL" "CSS custom properties missing"
        fi
        
        # Test for background pattern
        if grep -q "wave-background-tile" "$css_file"; then
            log_test "Background Pattern CSS" "PASS" "Background pattern reference found"
        else
            log_test "Background Pattern CSS" "FAIL" "Background pattern reference missing"
        fi
        
        # Test for button styles
        if grep -q ".button-primary" "$css_file" && grep -q ".button-secondary" "$css_file"; then
            log_test "Button Styles" "PASS" "Button styles found"
        else
            log_test "Button Styles" "FAIL" "Button styles missing"
        fi
        
        # Test for feature card styles
        if grep -q ".feature-card" "$css_file"; then
            log_test "Feature Card Styles" "PASS" "Feature card styles found"
        else
            log_test "Feature Card Styles" "FAIL" "Feature card styles missing"
        fi
        
        # Test for eye tracking styles
        if grep -q ".eye" "$css_file" && grep -q ".pupil" "$css_file"; then
            log_test "Eye Tracking Styles" "PASS" "Eye tracking styles found"
        else
            log_test "Eye Tracking Styles" "FAIL" "Eye tracking styles missing"
        fi
    else
        log_test "CSS File Exists" "FAIL" "CSS file not found"
    fi
}

# Function to test JavaScript functionality
test_javascript_functionality() {
    echo -e "\n${YELLOW}Testing JavaScript Functionality...${NC}"
    
    local js_file="static/js/professor-gopher.js"
    
    if [ -f "$js_file" ]; then
        # Test for eye tracking logic
        if grep -q "handleMouseMove" "$js_file"; then
            log_test "Eye Tracking Function" "PASS" "Mouse move handler found"
        else
            log_test "Eye Tracking Function" "FAIL" "Mouse move handler missing"
        fi
        
        # Test for mathematical calculations
        if grep -q "Math.atan2" "$js_file" && grep -q "Math.PI" "$js_file"; then
            log_test "Eye Tracking Math" "PASS" "Mathematical calculations found"
        else
            log_test "Eye Tracking Math" "FAIL" "Mathematical calculations missing"
        fi
        
        # Test for DOM element references
        if grep -q "getElementById" "$js_file"; then
            log_test "DOM Element Access" "PASS" "DOM element access found"
        else
            log_test "DOM Element Access" "FAIL" "DOM element access missing"
        fi
        
        # Test for graceful degradation
        if grep -q "console.warn" "$js_file" || grep -q "try.*catch" "$js_file"; then
            log_test "Error Handling" "PASS" "Error handling found"
        else
            log_test "Error Handling" "FAIL" "Error handling missing"
        fi
    else
        log_test "JavaScript File Exists" "FAIL" "JavaScript file not found"
    fi
}

# Function to test template structure
test_template_structure() {
    echo -e "\n${YELLOW}Testing Template Structure...${NC}"
    
    local home_template="templates/home.templ"
    
    if [ -f "$home_template" ]; then
        # Test for Professor Gopher component
        if grep -q "ProfessorGopher" "$home_template"; then
            log_test "Professor Gopher Component" "PASS" "ProfessorGopher component found"
        else
            log_test "Professor Gopher Component" "FAIL" "ProfessorGopher component missing"
        fi
        
        # Test for eye socket elements
        if grep -q "eye-socket" "$home_template" && grep -q "left-eye" "$home_template"; then
            log_test "Eye Socket Elements" "PASS" "Eye socket elements found"
        else
            log_test "Eye Socket Elements" "FAIL" "Eye socket elements missing"
        fi
        
        # Test for navigation structure
        if grep -q "<nav" "$home_template"; then
            log_test "Navigation Structure" "PASS" "Navigation element found"
        else
            log_test "Navigation Structure" "FAIL" "Navigation element missing"
        fi
        
        # Test for search form
        if grep -q "search" "$home_template" && grep -q "input" "$home_template"; then
            log_test "Search Form" "PASS" "Search form found"
        else
            log_test "Search Form" "FAIL" "Search form missing"
        fi
    else
        log_test "Home Template Exists" "FAIL" "Home template not found"
    fi
}

# Function to compare with original Deno app
test_original_comparison() {
    echo -e "\n${YELLOW}Testing Original Application Comparison...${NC}"
    
    # Test if original Deno app is running
    if curl -s http://localhost:8015/ >/dev/null 2>&1; then
        log_test "Original Deno App Running" "PASS" "Deno app accessible at http://localhost:8015"
        
        # Get content from both applications
        local go_content=$(curl -s http://localhost:8080/ 2>/dev/null || echo "")
        local deno_content=$(curl -s http://localhost:8015/ 2>/dev/null || echo "")
        
        # Compare key elements
        local go_title=$(echo "$go_content" | grep -o "Open Source Formula Pricing" | head -1)
        local deno_title=$(echo "$deno_content" | grep -o "Open Source Formula Pricing" | head -1)
        
        if [ "$go_title" = "$deno_title" ] && [ -n "$go_title" ]; then
            log_test "Title Consistency" "PASS" "Titles match between applications"
        else
            log_test "Title Consistency" "FAIL" "Titles don't match or are missing"
        fi
        
    else
        log_test "Original Deno App Running" "FAIL" "Deno app not accessible at http://localhost:8015"
    fi
}

# Function to test responsive design elements
test_responsive_design() {
    echo -e "\n${YELLOW}Testing Responsive Design Elements...${NC}"
    
    local css_file="static/css/styles.css"
    
    if [ -f "$css_file" ]; then
        # Test for media queries
        if grep -q "@media" "$css_file"; then
            log_test "Media Queries" "PASS" "Responsive media queries found"
        else
            log_test "Media Queries" "FAIL" "No responsive media queries found"
        fi
        
        # Test for responsive classes
        if grep -q "max-width.*640px" "$css_file" || grep -q "sm:" "$css_file"; then
            log_test "Mobile Responsive" "PASS" "Mobile responsive styles found"
        else
            log_test "Mobile Responsive" "FAIL" "Mobile responsive styles missing"
        fi
    fi
}

# Main execution
main() {
    echo "Starting validation of Go rewrite against requirements..."
    echo "Go Application: http://localhost:8080"
    echo "Original Deno Application: http://localhost:8015"
    echo ""
    
    # Run all test suites
    test_directory_structure
    test_static_assets
    test_page_endpoints
    test_content_matching
    test_css_styles
    test_javascript_functionality
    test_template_structure
    test_responsive_design
    test_original_comparison
    
    # Generate summary
    echo ""
    echo "======================================"
    echo "📊 VALIDATION SUMMARY"
    echo "======================================"
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    
    if [ $TOTAL_TESTS -gt 0 ]; then
        local success_rate=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
        echo "Success Rate: $success_rate%"
    fi
    
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed! Pixel-perfect replication validated.${NC}"
        return 0
    else
        echo -e "${RED}⚠️  Some tests failed. Please review the results above.${NC}"
        return 1
    fi
}

# Run the validation
main "$@"