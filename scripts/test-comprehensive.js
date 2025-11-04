#!/usr/bin/env node

/**
 * Comprehensive Testing Script for Aknan Real Estate Application
 * 
 * This script performs automated checks for:
 * - Image optimization
 * - Console.log usage
 * - Code quality
 * - Build verification
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '..', 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const APP_DIR = path.join(SRC_DIR, 'app');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function checkFile(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function getAllFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        results = results.concat(getAllFiles(filePath, extensions));
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Test 1: Check for <img> tags (should use Next.js Image)
function testImageTags() {
  logSection('Test 1: Checking for <img> tags');
  
  const files = getAllFiles(SRC_DIR);
  const violations = [];
  
  files.forEach(file => {
    const content = readFileContent(file);
    // Check for <img tags but exclude HTML strings in propertyInfoWindowContent
    const imgMatches = content.match(/<img[^>]*>/g);
    if (imgMatches) {
      // Check if it's in a string template (propertyInfoWindowContent)
      const lines = content.split('\n');
      imgMatches.forEach(match => {
        lines.forEach((line, index) => {
          if (line.includes(match) && !line.includes('propertyInfoWindowContent')) {
            violations.push({
              file: path.relative(SRC_DIR, file),
              line: index + 1,
              match,
            });
          }
        });
      });
    }
  });
  
  if (violations.length === 0) {
    log('✓ All images use Next.js Image component', 'green');
    return true;
  } else {
    log(`✗ Found ${violations.length} <img> tags:`, 'red');
    violations.forEach(v => {
      log(`  - ${v.file}:${v.line}`, 'yellow');
    });
    return false;
  }
}

// Test 2: Check for console.log in client components
function testConsoleLogs() {
  logSection('Test 2: Checking for console.log in client components');
  
  const files = getAllFiles(SRC_DIR);
  const violations = [];
  
  files.forEach(file => {
    const content = readFileContent(file);
    // Check if it's a client component
    if (content.includes("'use client'") || content.includes('"use client"')) {
      const consoleMatches = content.match(/console\.(log|error|warn|info|debug)/g);
      if (consoleMatches) {
        // Exclude logger utility file
        if (!file.includes('performance.ts')) {
          violations.push({
            file: path.relative(SRC_DIR, file),
            matches: consoleMatches.length,
          });
        }
      }
    }
  });
  
  if (violations.length === 0) {
    log('✓ No console.log found in client components', 'green');
    return true;
  } else {
    log(`✗ Found console.log in ${violations.length} client components:`, 'red');
    violations.forEach(v => {
      log(`  - ${v.file}: ${v.matches} occurrences`, 'yellow');
    });
    log('  Note: Use logger utility from @/lib/performance instead', 'yellow');
    return false;
  }
}

// Test 3: Check for Next.js Image usage
function testNextImageUsage() {
  logSection('Test 3: Checking Next.js Image component usage');
  
  const files = getAllFiles(COMPONENTS_DIR);
  const imageFiles = files.filter(f => 
    f.includes('PropertyCard') || 
    f.includes('PropertyInfoWindow') || 
    f.includes('ImageUploader') ||
    f.includes('FeaturedProperties')
  );
  
  let allGood = true;
  imageFiles.forEach(file => {
    const content = readFileContent(file);
    if (content.includes('next/image')) {
      log(`✓ ${path.basename(file)} uses Next.js Image`, 'green');
    } else {
      log(`✗ ${path.basename(file)} may not use Next.js Image`, 'red');
      allGood = false;
    }
  });
  
  return allGood;
}

// Test 4: Check for optimizeImages usage
function testImageOptimization() {
  logSection('Test 4: Checking image optimization utilities');
  
  const files = getAllFiles(SRC_DIR);
  const imageComponents = files.filter(f => 
    f.includes('PropertyCard') || 
    f.includes('PropertyInfoWindow') || 
    f.includes('ImageUploader') ||
    f.includes('FeaturedProperties') ||
    (f.includes('properties') && f.includes('[slug]'))
  );
  
  let allGood = true;
  imageComponents.forEach(file => {
    const content = readFileContent(file);
    const hasOptimize = content.includes('optimizeImages') || content.includes('optimizeImages.getOptimizedUrl');
    const hasImage = content.includes('from \'next/image\'') || content.includes('from "next/image"');
    
    if (hasImage && !hasOptimize) {
      log(`⚠ ${path.relative(SRC_DIR, file)} uses Image but may not use optimizeImages`, 'yellow');
      // Not a failure, just a warning
    } else if (hasImage && hasOptimize) {
      log(`✓ ${path.relative(SRC_DIR, file)} uses Image with optimization`, 'green');
    }
  });
  
  return allGood;
}

// Test 5: Check for React.memo usage
function testReactMemo() {
  logSection('Test 5: Checking React.memo usage');
  
  const files = getAllFiles(COMPONENTS_DIR);
  const memoCandidates = files.filter(f => 
    f.includes('PropertyCard') || 
    f.includes('FeaturedProperties')
  );
  
  let allGood = true;
  memoCandidates.forEach(file => {
    const content = readFileContent(file);
    if (content.includes('React.memo') || content.includes('memo(')) {
      log(`✓ ${path.basename(file)} uses React.memo`, 'green');
    } else {
      log(`⚠ ${path.basename(file)} could benefit from React.memo`, 'yellow');
    }
  });
  
  return allGood;
}

// Test 6: Check for blur placeholder
function testBlurPlaceholder() {
  logSection('Test 6: Checking blur placeholder usage');
  
  const files = getAllFiles(SRC_DIR);
  const imageFiles = files.filter(f => {
    const content = readFileContent(f);
    return content.includes('from \'next/image\'') || content.includes('from "next/image"');
  });
  
  let allGood = true;
  imageFiles.forEach(file => {
    const content = readFileContent(file);
    if (content.includes('placeholder="blur"')) {
      log(`✓ ${path.relative(SRC_DIR, file)} uses blur placeholder`, 'green');
    } else if (content.includes('<Image')) {
      log(`⚠ ${path.relative(SRC_DIR, file)} uses Image but may not have blur placeholder`, 'yellow');
    }
  });
  
  return allGood;
}

// Test 7: Check build output
function testBuildOutput() {
  logSection('Test 7: Checking build output');
  
  try {
    const buildOutput = execSync('npm run build', { 
      cwd: __dirname,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    if (buildOutput.includes('Compiled successfully')) {
      log('✓ Build completed successfully', 'green');
      
      // Extract bundle sizes
      const sizeMatches = buildOutput.match(/First Load JS[\s\S]*?(?=└|$)/);
      if (sizeMatches) {
        log('\nBundle Sizes:', 'cyan');
        const lines = sizeMatches[0].split('\n').filter(l => l.trim());
        lines.forEach(line => {
          if (line.includes('kB') || line.includes('MB')) {
            log(`  ${line.trim()}`, 'blue');
          }
        });
      }
      
      return true;
    } else {
      log('✗ Build failed', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Build failed with error', 'red');
    log(error.message, 'yellow');
    return false;
  }
}

// Test 8: Check for lazy loading
function testLazyLoading() {
  logSection('Test 8: Checking lazy loading implementation');
  
  const files = getAllFiles(SRC_DIR);
  const imageFiles = files.filter(f => {
    const content = readFileContent(f);
    return content.includes('<Image') || content.includes('<Image');
  });
  
  let hasPriority = false;
  let hasLazy = false;
  
  imageFiles.forEach(file => {
    const content = readFileContent(file);
    if (content.includes('priority')) {
      hasPriority = true;
    }
    if (content.includes('loading="lazy"')) {
      hasLazy = true;
    }
  });
  
  if (hasPriority) {
    log('✓ Found priority images (above the fold)', 'green');
  }
  
  if (hasLazy) {
    log('✓ Found lazy loading images', 'green');
  } else {
    log('⚠ No lazy loading found', 'yellow');
  }
  
  return true;
}

// Test 9: Check environment variables
function testEnvironmentVariables() {
  logSection('Test 9: Checking environment variables');
  
  const envFiles = ['.env.local', '.env'];
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'GOOGLE_MAPS_API_KEY',
  ];
  
  let allFound = true;
  envFiles.forEach(envFile => {
    const envPath = path.join(__dirname, '..', envFile);
    if (checkFile(envPath)) {
      const content = readFileContent(envPath);
      requiredVars.forEach(varName => {
        if (content.includes(varName)) {
          log(`✓ ${varName} found in ${envFile}`, 'green');
        } else {
          log(`✗ ${varName} not found in ${envFile}`, 'red');
          allFound = false;
        }
      });
    }
  });
  
  return allFound;
}

// Main test runner
function runAllTests() {
  log('\n🚀 Starting Comprehensive Testing Suite\n', 'cyan');
  
  const results = {
    imageTags: testImageTags(),
    consoleLogs: testConsoleLogs(),
    nextImage: testNextImageUsage(),
    imageOptimization: testImageOptimization(),
    reactMemo: testReactMemo(),
    blurPlaceholder: testBlurPlaceholder(),
    buildOutput: testBuildOutput(),
    lazyLoading: testLazyLoading(),
    envVars: testEnvironmentVariables(),
  };
  
  // Summary
  logSection('Test Summary');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✓' : '✗';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test}`, color);
  });
  
  console.log('\n' + '='.repeat(60));
  log(`Tests passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  console.log('='.repeat(60) + '\n');
  
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runAllTests();

