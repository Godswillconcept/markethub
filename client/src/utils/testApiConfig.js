// API Configuration Test Utility
// This file helps verify that the CORS solution is working correctly

import axios from 'axios';
import { isCORSError, getCORSErrorMessage, isCORSProneEnvironment, getAppropriateApiUrl } from './corsHandler.js';

/**
 * Tests the API configuration and connectivity
 * @returns {Object} Test results
 */
export const testApiConfiguration = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      apiUrl: import.meta.env.VITE_API_URL,
      appropriateApiUrl: getAppropriateApiUrl(),
      isCORSProne: isCORSProneEnvironment()
    },
    tests: []
  };

  try {
    // Test 1: Basic connectivity to API base URL
    const testUrl = `${getAppropriateApiUrl()}/health`;
    console.log('Testing API connectivity to:', testUrl);
    
    const response = await axios.get(testUrl, {
      timeout: 5000,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    results.tests.push({
      name: 'API Connectivity',
      status: 'PASS',
      url: testUrl,
      statusCode: response.status,
      message: 'Successfully connected to API'
    });
    
  } catch (error) {
    const testUrl = `${getAppropriateApiUrl()}/health`;
    results.tests.push({
      name: 'API Connectivity',
      status: 'FAIL',
      url: testUrl,
      error: error.message,
      isCORS: isCORSError(error),
      userMessage: getCORSErrorMessage(error)
    });
  }

  try {
    // Test 2: Test journals endpoint specifically
    const journalsUrl = `${getAppropriateApiUrl()}/journals?limit=1`;
    console.log('Testing journals endpoint:', journalsUrl);
    
    const response = await axios.get(journalsUrl, {
      timeout: 5000,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    results.tests.push({
      name: 'Journals Endpoint',
      status: 'PASS',
      url: journalsUrl,
      statusCode: response.status,
      message: 'Journals endpoint accessible',
      dataLength: response.data?.data?.length || 0
    });
    
  } catch (error) {
    const journalsUrl = `${getAppropriateApiUrl()}/journals?limit=1`;
    results.tests.push({
      name: 'Journals Endpoint',
      status: 'FAIL',
      url: journalsUrl,
      error: error.message,
      isCORS: isCORSError(error),
      userMessage: getCORSErrorMessage(error)
    });
  }

  return results;
};

/**
 * Logs test results in a formatted way
 * @param {Object} results - Test results from testApiConfiguration
 */
export const logTestResults = (results) => {
  console.group('🔧 API Configuration Test Results');
  
  console.log('📋 Environment Info:');
  console.table(results.environment);
  
  console.log('🧪 Test Results:');
  results.tests.forEach((test) => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.status}`);
    
    if (test.status === 'FAIL') {
      console.error(`   Error: ${test.error}`);
      if (test.isCORS) {
        console.warn(`   ⚠️  CORS Issue Detected: ${test.userMessage}`);
      }
    } else {
      console.log(`   ✅ Success: ${test.message}`);
    }
  });
  
  console.groupEnd();
};

/**
 * Runs the test and logs results
 */
export const runApiConfigTest = async () => {
  console.log('🚀 Starting API Configuration Test...');
  const results = await testApiConfiguration();
  logTestResults(results);
  return results;
};

// Auto-run test if this file is imported directly (for debugging)
if (typeof window !== 'undefined' && window.location) {
  // Only run in browser environment
  window.testApiConfig = runApiConfigTest;
}