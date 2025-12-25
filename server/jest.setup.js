/**
 * Jest setup file for test environment configuration
 * Disables Redis and other external services during testing
 */

// Disable Redis for tests to prevent connection errors
process.env.REDIS_ENABLED = 'false';
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Reduce console noise during tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = (...args) => {
  // Only log in test environment if explicitly needed
  if (process.env.TEST_VERBOSE === 'true') {
    originalConsoleLog(...args);
  }
};

console.warn = (...args) => {
  // Suppress Redis warnings in test environment
  if (!args[0] || !args[0].toString().includes('Redis')) {
    if (process.env.TEST_VERBOSE === 'true') {
      originalConsoleWarn(...args);
    }
  }
};

console.error = (...args) => {
  // Only log actual errors, not connection warnings
  if (!args[0] || !args[0].toString().includes('Redis Client Error')) {
    originalConsoleError(...args);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

console.log('🧪 Test environment configured: Redis disabled, logging reduced');