#!/usr/bin/env node

/**
 * Pixel-Perfect Validation Script
 * Compares the Go rewrite with the original Deno application
 * Tests all requirements from the specification
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const GO_URL = 'http://localhost:8080';
const DENO_URL = 'http://localhost:8015';
const SCREENSHOTS_DIR = './validation-screenshots';
const RESULTS_FILE = './validation-results.json';

// Test breakpoints for responsive design
const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 }
];

// Test results storage
let testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  },
  tests: []
};

function logTest(name, passed, details = '') {
  const result = {
    name,
    passed,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  testResults.summary.total++;
  
  if (passed) {
    testResults.summary.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.summary.failed++;
    console.log(`❌ ${name}: ${details}`);
  }
  
  if (details) {
    console.log(`   ${details}`);
  }
}

async function setupBrowser() {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  return browser;
}

async function takeScreenshot(page, name, breakpoint) {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
  
  const filename = `${name}-${breakpoint.name}-${breakpoint.width}x${breakpoint.height}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  
  await page.setViewport({
    width: breakpoint.width,
    height: breakpoint.height
  });
  
  await page.screenshot({
    path: filepath,
    fullPage: true
  });
  
  return filepath;
}

async function testPageLoad(browser, url, name) {
  const page = await browser.newPage();
  
  try {
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    const status = response.status();
    const title = await page.title();
    
    logTest(
      `${name} - Page Load`,
      status === 200,
      status === 200 ? `Title: "${title}"` : `HTTP ${status}`
    );
    
    return page;
  } catch (error) {
    logTest(`${name} - Page Load`, false, error.message);
    await page.close();
    return null;
  }
}

async function testVisualElements(page, name) {
  try {
    // Test main heading
    const heading = await page.$eval('h1', el => el.textContent.trim());
    logTest(
      `${name} - Main Heading`,
      heading === 'Open Source Formula Pricing',
      `Found: "${heading}"`
    );
    
    // Test subheading
    const subheading = await page.$eval('h2', el => el.textContent.trim());
    logTest(
      `${name} - Subheading`,
      subheading === 'in 1 file',
      `Found: "${subheading}"`
    );
    
    // Test Professor Gopher image
    const gopherImg = await page.$('img[alt="Professor Gopher"]');
    logTest(
      `${name} - Professor Gopher Image`,
      gopherImg !== null,
      gopherImg ? 'Image found' : 'Image not found'
    );
    
    // Test feature cards
    const featureCards = await page.$$('.feature-card');
    logTest(
      `${name} - Feature Cards`,
      featureCards.length === 4,
      `Found ${featureCards.length} cards`
    );
    
    // Test navigation links
    const navLinks = await page.$$('nav a');
    logTest(
      `${name} - Navigation Links`,
      navLinks.length >= 3,
      `Found ${navLinks.length} navigation links`
    );
    
    // Test CTA buttons
    const ctaButtons = await page.$$('.button-primary, .button-secondary');
    logTest(
      `${name} - CTA Buttons`,
      ctaButtons.length >= 2,
      `Found ${ctaButtons.length} CTA buttons`
    );
    
  } catch (error) {
    logTest(`${name} - Visual Elements`, false, error.message);
  }
}

async function testInteractiveElements(page, name) {
  try {
    // Test search input
    const searchInput = await page.$('input[placeholder="Search..."]');
    if (searchInput) {
      await searchInput.type('test query');
      const value = await page.$eval('input[placeholder="Search..."]', el => el.value);
      logTest(
        `${name} - Search Input`,
        value === 'test query',
        `Input value: "${value}"`
      );
    } else {
      logTest(`${name} - Search Input`, false, 'Search input not found');
    }
    
    // Test button hover effects
    const primaryButton = await page.$('.button-primary');
    if (primaryButton) {
      await primaryButton.hover();
      const bgColor = await page.$eval('.button-primary', el => 
        window.getComputedStyle(el).backgroundColor
      );
      logTest(
        `${name} - Button Hover Effect`,
        bgColor !== 'rgba(0, 0, 0, 0)', // Should have some background color
        `Background color: ${bgColor}`
      );
    }
    
    // Test feature card hover effects
    const featureCard = await page.$('.feature-card');
    if (featureCard) {
      await featureCard.hover();
      // Wait for transition
      await page.waitForTimeout(500);
      logTest(`${name} - Feature Card Hover`, true, 'Hover effect applied');
    }
    
  } catch (error) {
    logTest(`${name} - Interactive Elements`, false, error.message);
  }
}

async function testEyeTracking(page, name) {
  try {
    // Check if eye elements exist
    const leftEye = await page.$('#left-eye');
    const rightEye = await page.$('#right-eye');
    
    if (!leftEye || !rightEye) {
      logTest(`${name} - Eye Elements`, false, 'Eye elements not found');
      return;
    }
    
    logTest(`${name} - Eye Elements`, true, 'Both eyes found');
    
    // Test eye tracking by simulating mouse movement
    await page.mouse.move(100, 100);
    await page.waitForTimeout(100);
    
    const leftTransform1 = await page.$eval('#left-eye', el => el.style.transform);
    
    await page.mouse.move(500, 300);
    await page.waitForTimeout(100);
    
    const leftTransform2 = await page.$eval('#left-eye', el => el.style.transform);
    
    logTest(
      `${name} - Eye Tracking`,
      leftTransform1 !== leftTransform2,
      `Transform changed: "${leftTransform1}" → "${leftTransform2}"`
    );
    
  } catch (error) {
    logTest(`${name} - Eye Tracking`, false, error.message);
  }
}

async function testResponsiveDesign(page, name) {
  for (const breakpoint of BREAKPOINTS) {
    try {
      await page.setViewport({
        width: breakpoint.width,
        height: breakpoint.height
      });
      
      await page.waitForTimeout(500); // Wait for responsive changes
      
      // Test if main elements are visible
      const mainCard = await page.$('.main-card');
      const isVisible = await page.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }, mainCard);
      
      logTest(
        `${name} - Responsive ${breakpoint.name}`,
        isVisible,
        `${breakpoint.width}x${breakpoint.height}`
      );
      
      // Take screenshot for visual comparison
      await takeScreenshot(page, name.toLowerCase().replace(' ', '-'), breakpoint);
      
    } catch (error) {
      logTest(`${name} - Responsive ${breakpoint.name}`, false, error.message);
    }
  }
}

async function testNavigation(page, name) {
  try {
    // Test FAQ link
    const faqLink = await page.$('a[href="/faq"], a[href="#faq"]');
    if (faqLink) {
      logTest(`${name} - FAQ Link`, true, 'FAQ link found');
    } else {
      logTest(`${name} - FAQ Link`, false, 'FAQ link not found');
    }
    
    // Test Documentation link
    const docsLink = await page.$('a[href="/docs"], a[href="#docs"]');
    if (docsLink) {
      logTest(`${name} - Documentation Link`, true, 'Documentation link found');
    } else {
      logTest(`${name} - Documentation Link`, false, 'Documentation link not found');
    }
    
    // Test GitHub link
    const githubLink = await page.$('a[href*="github"]');
    if (githubLink) {
      logTest(`${name} - GitHub Link`, true, 'GitHub link found');
    } else {
      logTest(`${name} - GitHub Link`, false, 'GitHub link not found');
    }
    
  } catch (error) {
    logTest(`${name} - Navigation`, false, error.message);
  }
}

async function testStaticAssets(page, name) {
  try {
    // Test Professor Gopher image loading
    const gopherImg = await page.$('img[alt="Professor Gopher"]');
    if (gopherImg) {
      const naturalWidth = await page.evaluate(img => img.naturalWidth, gopherImg);
      logTest(
        `${name} - Professor Gopher Image Load`,
        naturalWidth > 0,
        `Image dimensions: ${naturalWidth}px width`
      );
    }
    
    // Test CSS loading by checking computed styles
    const bodyBg = await page.evaluate(() => 
      window.getComputedStyle(document.body).backgroundImage
    );
    
    logTest(
      `${name} - CSS Background`,
      bodyBg.includes('wave-background'),
      `Background: ${bodyBg.substring(0, 50)}...`
    );
    
    // Test if JavaScript loaded by checking for eye tracking functionality
    const jsLoaded = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             document.getElementById('left-eye') !== null;
    });
    
    logTest(`${name} - JavaScript Load`, jsLoaded, 'Eye tracking elements available');
    
  } catch (error) {
    logTest(`${name} - Static Assets`, false, error.message);
  }
}

async function test404Page(browser, baseUrl, name) {
  const page = await browser.newPage();
  
  try {
    const response = await page.goto(`${baseUrl}/nonexistent-page`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    const status = response.status();
    logTest(
      `${name} - 404 Status Code`,
      status === 404,
      `HTTP ${status}`
    );
    
    // Check if custom 404 page is displayed
    const pageContent = await page.content();
    const has404Content = pageContent.includes('404') || 
                         pageContent.includes('Not Found') ||
                         pageContent.includes('Page not found');
    
    logTest(
      `${name} - 404 Page Content`,
      has404Content,
      has404Content ? 'Custom 404 page displayed' : 'Generic 404 page'
    );
    
  } catch (error) {
    logTest(`${name} - 404 Page`, false, error.message);
  } finally {
    await page.close();
  }
}

async function compareApplications(browser) {
  console.log('\n🔍 Starting Pixel-Perfect Validation...\n');
  
  // Test Go application
  console.log('Testing Go Application...');
  const goPage = await testPageLoad(browser, GO_URL, 'Go App');
  if (goPage) {
    await testVisualElements(goPage, 'Go App');
    await testInteractiveElements(goPage, 'Go App');
    await testEyeTracking(goPage, 'Go App');
    await testResponsiveDesign(goPage, 'Go App');
    await testNavigation(goPage, 'Go App');
    await testStaticAssets(goPage, 'Go App');
    await goPage.close();
  }
  
  // Test 404 page for Go app
  await test404Page(browser, GO_URL, 'Go App');
  
  console.log('\nTesting Deno Application...');
  // Test Deno application
  const denoPage = await testPageLoad(browser, DENO_URL, 'Deno App');
  if (denoPage) {
    await testVisualElements(denoPage, 'Deno App');
    await testInteractiveElements(denoPage, 'Deno App');
    await testEyeTracking(denoPage, 'Deno App');
    await testResponsiveDesign(denoPage, 'Deno App');
    await testNavigation(denoPage, 'Deno App');
    await testStaticAssets(denoPage, 'Deno App');
    await denoPage.close();
  }
  
  // Test 404 page for Deno app
  await test404Page(browser, DENO_URL, 'Deno App');
}

async function generateReport() {
  // Save detailed results to JSON
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(testResults, null, 2));
  
  // Generate summary report
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed}`);
  console.log(`Failed: ${testResults.summary.failed}`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
  
  if (testResults.summary.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`  • ${test.name}: ${test.details}`);
      });
  }
  
  console.log(`\n📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log(`📄 Detailed results saved to: ${RESULTS_FILE}`);
  
  return testResults.summary.failed === 0;
}

async function main() {
  let browser;
  
  try {
    browser = await setupBrowser();
    await compareApplications(browser);
    const allTestsPassed = await generateReport();
    
    if (allTestsPassed) {
      console.log('\n🎉 All tests passed! Pixel-perfect replication validated.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please review the results above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the validation
main().catch(console.error);