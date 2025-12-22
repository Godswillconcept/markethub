#!/usr/bin/env node
/* eslint-disable */

/**
 * Environment Mismatch Fix Script
 * 
 * This script helps identify and fix server-client environment mismatches
 * that can cause CORS issues and other connectivity problems.
 * 
 * Run with: node fix-environment-mismatch.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Environment Mismatch Fix Script');
console.log('==================================\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readEnvFile(filePath) {
  if (!checkFileExists(filePath)) return {};
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join('=');
      }
    }
  });
  
  return env;
}

function analyzeEnvironments() {
  log('📋 Analyzing Environment Files...', 'blue');
  
  const clientEnv = readEnvFile('./.env');
  const clientDevEnv = readEnvFile('./.env.development');
  const clientProdEnv = readEnvFile('./.env.production');
  
  const serverEnv = readEnvFile('../server/.env');
  const serverProdEnv = readEnvFile('../server/.env.production');
  
  console.log('\n🔍 CLIENT ENVIRONMENT ANALYSIS:');
  console.log('===============================');
  log(`Client .env: ${clientEnv.VITE_API_URL || 'Not found'}`, clientEnv.VITE_API_URL ? 'green' : 'red');
  log(`Client .env.development: ${clientDevEnv.VITE_API_URL || 'Not found'}`, clientDevEnv.VITE_API_URL ? 'green' : 'red');
  log(`Client .env.production: ${clientProdEnv.VITE_API_URL || 'Not found'}`, clientProdEnv.VITE_API_URL ? 'green' : 'red');
  
  console.log('\n🔍 SERVER ENVIRONMENT ANALYSIS:');
  console.log('================================');
  log(`Server .env NODE_ENV: ${serverEnv.NODE_ENV || 'Not found'}`, serverEnv.NODE_ENV === 'production' ? 'yellow' : 'green');
  log(`Server .env CORS_ORIGIN: ${serverEnv.CORS_ORIGIN || 'Not found'}`, serverEnv.CORS_ORIGIN ? 'green' : 'red');
  log(`Server .env.production CORS_ORIGIN: ${serverProdEnv.CORS_ORIGIN || 'Not found'}`, serverProdEnv.CORS_ORIGIN ? 'green' : 'red');
  
  // Detect mismatches
  const mismatches = [];
  
  // Check if server is in production but using development CORS
  if (serverEnv.NODE_ENV === 'production' && serverEnv.CORS_ORIGIN?.includes('localhost')) {
    mismatches.push({
      type: 'CRITICAL',
      message: 'Server running in production mode but CORS_ORIGIN points to localhost',
      server: serverEnv.CORS_ORIGIN,
      shouldBe: 'Production domain or ngrok URL'
    });
  }
  
  // Check if client and server URLs align
  const serverCors = serverEnv.CORS_ORIGIN;
  const clientApi = clientProdEnv.VITE_API_URL;
  
  if (serverCors && clientApi) {
    const serverDomain = new URL(serverCors).origin;
    const clientApiDomain = new URL(clientApi).origin;
    
    if (serverDomain !== clientApiDomain) {
      mismatches.push({
        type: 'WARNING',
        message: 'Server CORS origin and client API URL domains don\'t match',
        server: serverDomain,
        client: clientApiDomain
      });
    }
  }
  
  return { mismatches, clientEnv, serverEnv, serverProdEnv };
}

function suggestFixes(analysis) {
  const { mismatches, serverEnv, serverProdEnv } = analysis;
  
  if (mismatches.length === 0) {
    log('✅ No environment mismatches detected!', 'green');
    return;
  }
  
  log('\n⚠️  ENVIRONMENT MISMATCHES DETECTED:', 'red');
  console.log('=====================================\n');
  
  mismatches.forEach((mismatch, index) => {
    log(`${index + 1}. ${mismatch.type}: ${mismatch.message}`, 'yellow');
    
    if (mismatch.type === 'CRITICAL') {
      log(`   Current: ${mismatch.server}`, 'red');
      log(`   Should be: ${mismatch.shouldBe}`, 'green');
    } else if (mismatch.type === 'WARNING') {
      log(`   Server expects: ${mismatch.server}`, 'red');
      log(`   Client provides: ${mismatch.client}`, 'red');
    }
    console.log('');
  });
  
  log('🔧 RECOMMENDED FIXES:', 'blue');
  console.log('====================\n');
  
  mismatches.forEach((mismatch, index) => {
    log(`${index + 1}. ${mismatch.type} Fix:`, 'bright');
    
    if (mismatch.message.includes('production mode but CORS_ORIGIN points to localhost')) {
      console.log('   Option A: Use correct production environment file');
      console.log('   ```bash');
      console.log('   cd server');
      console.log('   NODE_ENV=production node app.js --env-file=.env.production');
      console.log('   ```\n');
      
      console.log('   Option B: Update server/.env with production values');
      console.log('   ```env');
      console.log('   NODE_ENV=production');
      console.log('   CORS_ORIGIN=https://unflaking-actionable-man.ngrok-free.dev');
      console.log('   FRONTEND_URL=https://unflaking-actionable-man.ngrok-free.dev');
      console.log('   ```\n');
    }
    
    if (mismatch.message.includes('domains don\'t match')) {
      console.log('   Align server and client URLs:');
      console.log('   - Update server CORS_ORIGIN to match client domain');
      console.log('   - Or update client API URL to match server expectations\n');
    }
  });
}

function createQuickFix() {
  log('🛠️  Creating Quick Fix...', 'blue');
  
  // Create a fixed server .env file
  const fixedServerEnv = `# Fixed Environment Configuration
# This file corrects the CORS settings for production mode
NODE_ENV=production
PORT=5000

# Application Name
APP_NAME=Stylay

# Database Configuration (keep your existing values)
DATABASE_URL=${readEnvFile('../server/.env').DATABASE_URL || 'mysql://root@localhost:3306/stylay_db'}

# JWT Configuration (keep your existing values)
JWT_SECRET=${readEnvFile('../server/.env').JWT_SECRET || 'your-secret-key'}
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# CORS Configuration (FIXED: Use ngrok URL for production)
CORS_ORIGIN=https://unflaking-actionable-man.ngrok-free.dev

# Frontend URLs (FIXED: Use ngrok URL for production)
FRONTEND_URL=https://unflaking-actionable-man.ngrok-free.dev
ADMIN_URL=https://unflaking-actionable-man.ngrok-free.dev/admin
VENDOR_PORTAL_URL=https://unflaking-actionable-man.ngrok-free.dev/vendor

# Other configurations (keep your existing values)
RATE_LIMIT_MAX=1000
LOG_LEVEL=info
SUPPORT_EMAIL=support@stylay.com

# Add any other necessary configurations from your original .env file
`;
  
  const fixPath = '../server/.env.fixed';
  fs.writeFileSync(fixPath, fixedServerEnv);
  log(`✅ Fixed environment file created: ${fixPath}`, 'green');
  
  console.log('\n🚀 TO APPLY THE FIX:');
  console.log('==================');
  console.log('1. Backup your current server/.env:');
  console.log('   cp server/.env server/.env.backup');
  console.log('');
  console.log('2. Use the fixed environment file:');
  console.log('   cd server');
  console.log('   cp .env.fixed .env');
  console.log('');
  console.log('3. Or run with the fixed file directly:');
  console.log('   NODE_ENV=production node app.js --env-file=.env.fixed');
  console.log('');
  
  log('⚠️  IMPORTANT: Review the fixed file and add any missing configurations!', 'yellow');
}

// Main execution
try {
  const analysis = analyzeEnvironments();
  suggestFixes(analysis);
  
  // Ask user if they want to create a quick fix
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\n❓ Would you like to create a quick fix file? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      createQuickFix();
    }
    
    rl.close();
    console.log('\n✨ Environment analysis complete!');
  });
  
} catch (error) {
  log(`❌ Error analyzing environments: ${error.message}`, 'red');
  process.exit(1);
}