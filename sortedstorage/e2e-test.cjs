#!/usr/bin/env node

/**
 * Comprehensive End-to-End Testing Script for SortedStorage
 * This script tests all major functionality of the application
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api';

// Test utilities
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  log(`\n🧪 Testing: ${name}`, 'cyan');
}

function logSuccess(message) {
  testResults.passed++;
  log(`  ✅ ${message}`, 'green');
}

function logError(message, error = null) {
  testResults.failed++;
  const errorMsg = `  ❌ ${message}`;
  log(errorMsg, 'red');
  if (error) {
    log(`     Error: ${error}`, 'red');
    testResults.errors.push({ test: message, error: error.toString() });
  }
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test functions
async function testHomePage() {
  logTest('Home Page');
  
  try {
    const response = await makeRequest(BASE_URL);
    
    if (response.statusCode === 200) {
      logSuccess('Home page loads successfully');
      
      // Check for essential elements
      if (response.body.includes('SortedStorage')) {
        logSuccess('Application title present');
      } else {
        logError('Application title missing');
      }
      
      if (response.body.includes('login') || response.body.includes('Login')) {
        logSuccess('Login link/button present');
      } else {
        logError('Login link/button missing');
      }
    } else {
      logError(`Home page returned status ${response.statusCode}`);
    }
  } catch (error) {
    logError('Failed to load home page', error);
  }
}

async function testAuthPages() {
  logTest('Authentication Pages');
  
  // Test login page
  try {
    const loginResponse = await makeRequest(`${BASE_URL}/auth/login`);
    if (loginResponse.statusCode === 200) {
      logSuccess('Login page loads successfully');
      
      if (loginResponse.body.includes('email') && loginResponse.body.includes('password')) {
        logSuccess('Login form fields present');
      } else {
        logError('Login form fields missing');
      }
    } else {
      logError(`Login page returned status ${loginResponse.statusCode}`);
    }
  } catch (error) {
    logError('Failed to load login page', error);
  }
  
  // Test register page
  try {
    const registerResponse = await makeRequest(`${BASE_URL}/auth/register`);
    if (registerResponse.statusCode === 200) {
      logSuccess('Register page loads successfully');
      
      if (registerResponse.body.includes('email') && 
          registerResponse.body.includes('password') &&
          registerResponse.body.includes('name')) {
        logSuccess('Register form fields present');
      } else {
        logError('Register form fields missing');
      }
    } else {
      logError(`Register page returned status ${registerResponse.statusCode}`);
    }
  } catch (error) {
    logError('Failed to load register page', error);
  }
}

async function testProtectedPages() {
  logTest('Protected Pages (should redirect to login)');
  
  const protectedRoutes = [
    '/files',
    '/shared',
    '/activity',
    '/settings',
    '/admin/analytics'
  ];
  
  for (const route of protectedRoutes) {
    try {
      const response = await makeRequest(`${BASE_URL}${route}`);
      
      // Should redirect to login (303) or show login page
      if (response.statusCode === 303 || response.statusCode === 302) {
        logSuccess(`Protected route ${route} redirects to login`);
      } else if (response.statusCode === 200 && response.body.includes('login')) {
        logSuccess(`Protected route ${route} shows login requirement`);
      } else {
        logError(`Protected route ${route} accessible without auth`);
      }
    } catch (error) {
      logError(`Failed to test protected route ${route}`, error);
    }
  }
}

async function testAPIEndpoints() {
  logTest('API Endpoints');
  
  // Test health check endpoint
  try {
    const healthResponse = await makeRequest(`${API_URL}/health`);
    if (healthResponse.statusCode === 200) {
      logSuccess('Health check endpoint working');
    } else {
      logError(`Health check returned status ${healthResponse.statusCode}`);
    }
  } catch (error) {
    logError('Health check endpoint failed', error);
  }
  
  // Test auth endpoints without credentials (should fail)
  try {
    const loginResponse = await makeRequest(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrong' })
    });
    
    if (loginResponse.statusCode === 401 || loginResponse.statusCode === 400) {
      logSuccess('Login endpoint rejects invalid credentials');
    } else {
      logError(`Login endpoint returned unexpected status ${loginResponse.statusCode}`);
    }
  } catch (error) {
    logError('Failed to test login endpoint', error);
  }
}

async function testStaticAssets() {
  logTest('Static Assets');
  
  try {
    // Check if favicon exists
    const faviconResponse = await makeRequest(`${BASE_URL}/favicon.png`);
    if (faviconResponse.statusCode === 200) {
      logSuccess('Favicon loads successfully');
    } else {
      logError(`Favicon returned status ${faviconResponse.statusCode}`);
    }
  } catch (error) {
    logError('Failed to load favicon', error);
  }
}

async function testErrorHandling() {
  logTest('Error Handling');
  
  try {
    // Test 404 page
    const notFoundResponse = await makeRequest(`${BASE_URL}/non-existent-page-12345`);
    if (notFoundResponse.statusCode === 404) {
      logSuccess('404 error page works');
      
      if (notFoundResponse.body.includes('404') || notFoundResponse.body.includes('Not Found')) {
        logSuccess('404 page shows appropriate message');
      } else {
        logError('404 page missing error message');
      }
    } else {
      logError(`Non-existent page returned status ${notFoundResponse.statusCode}`);
    }
  } catch (error) {
    logError('Failed to test 404 page', error);
  }
}

async function testResponsiveness() {
  logTest('Responsive Design Markers');
  
  try {
    const response = await makeRequest(BASE_URL);
    
    // Check for responsive classes
    const responsiveMarkers = [
      'sm:',  // Small screens
      'md:',  // Medium screens
      'lg:',  // Large screens
      'xl:',  // Extra large screens
      'dark:' // Dark mode support
    ];
    
    for (const marker of responsiveMarkers) {
      if (response.body.includes(marker)) {
        logSuccess(`Responsive marker '${marker}' found`);
      } else {
        logError(`Responsive marker '${marker}' missing`);
      }
    }
    
    // Check for viewport meta tag
    if (response.body.includes('viewport')) {
      logSuccess('Viewport meta tag present');
    } else {
      logError('Viewport meta tag missing');
    }
  } catch (error) {
    logError('Failed to test responsiveness', error);
  }
}

async function testSEO() {
  logTest('SEO and Meta Tags');
  
  try {
    const response = await makeRequest(BASE_URL);
    
    // Check for essential meta tags
    const metaTags = [
      '<title>',
      'meta name="description"',
      'meta property="og:',
      'meta name="twitter:'
    ];
    
    for (const tag of metaTags) {
      if (response.body.includes(tag)) {
        logSuccess(`SEO tag '${tag}' found`);
      } else {
        logError(`SEO tag '${tag}' missing`);
      }
    }
  } catch (error) {
    logError('Failed to test SEO', error);
  }
}

async function testPerformance() {
  logTest('Performance Metrics');
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(BASE_URL);
    const loadTime = Date.now() - startTime;
    
    if (loadTime < 1000) {
      logSuccess(`Home page loads in ${loadTime}ms (excellent)`);
    } else if (loadTime < 3000) {
      logSuccess(`Home page loads in ${loadTime}ms (good)`);
    } else {
      logError(`Home page loads in ${loadTime}ms (slow)`);
    }
    
    // Check for performance optimizations
    if (response.body.includes('defer') || response.body.includes('async')) {
      logSuccess('Script loading optimization found');
    }
    
    if (response.body.includes('lazy')) {
      logSuccess('Lazy loading implementation found');
    }
  } catch (error) {
    logError('Failed to test performance', error);
  }
}

async function testSecurity() {
  logTest('Security Headers');
  
  try {
    const response = await makeRequest(BASE_URL);
    
    // Check security headers
    const securityHeaders = [
      'content-security-policy',
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'referrer-policy'
    ];
    
    for (const header of securityHeaders) {
      if (response.headers[header]) {
        logSuccess(`Security header '${header}' present: ${response.headers[header].substring(0, 50)}...`);
      } else {
        logError(`Security header '${header}' missing`);
      }
    }
  } catch (error) {
    logError('Failed to test security headers', error);
  }
}

async function testAccessibility() {
  logTest('Accessibility Features');
  
  try {
    const response = await makeRequest(BASE_URL);
    
    // Check for accessibility attributes
    const a11yFeatures = [
      'aria-label',
      'aria-describedby',
      'role=',
      'alt=',
      'tabindex'
    ];
    
    for (const feature of a11yFeatures) {
      if (response.body.includes(feature)) {
        logSuccess(`Accessibility feature '${feature}' found`);
      } else {
        logError(`Accessibility feature '${feature}' missing`);
      }
    }
    
    // Check for semantic HTML
    const semanticTags = ['<nav', '<main', '<header', '<footer', '<section', '<article'];
    for (const tag of semanticTags) {
      if (response.body.includes(tag)) {
        logSuccess(`Semantic HTML tag '${tag}' found`);
      }
    }
  } catch (error) {
    logError('Failed to test accessibility', error);
  }
}

// Main test runner
async function runTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🚀 SortedStorage End-to-End Testing Suite', 'blue');
  log('='.repeat(60), 'blue');
  
  // Check if server is running
  try {
    await makeRequest(BASE_URL);
  } catch (error) {
    log('\n❌ Server is not running at ' + BASE_URL, 'red');
    log('Please start the server with: npm run dev', 'yellow');
    process.exit(1);
  }
  
  // Run all tests
  await testHomePage();
  await testAuthPages();
  await testProtectedPages();
  await testAPIEndpoints();
  await testStaticAssets();
  await testErrorHandling();
  await testResponsiveness();
  await testSEO();
  await testPerformance();
  await testSecurity();
  await testAccessibility();
  
  // Print summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 Test Summary', 'blue');
  log('='.repeat(60), 'blue');
  
  log(`\n  Passed: ${testResults.passed}`, 'green');
  log(`  Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  
  if (testResults.errors.length > 0) {
    log('\n  Failed Tests:', 'red');
    testResults.errors.forEach((error, index) => {
      log(`    ${index + 1}. ${error.test}`, 'red');
      log(`       ${error.error}`, 'yellow');
    });
  }
  
  const successRate = Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100);
  log(`\n  Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
  
  if (successRate === 100) {
    log('\n🎉 All tests passed! The application is working perfectly.', 'green');
  } else if (successRate >= 80) {
    log('\n✨ Most tests passed. The application is mostly functional.', 'yellow');
  } else {
    log('\n⚠️  Many tests failed. The application needs attention.', 'red');
  }
  
  log('\n' + '='.repeat(60) + '\n', 'blue');
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  log('\n❌ Test suite crashed: ' + error.message, 'red');
  process.exit(1);
});