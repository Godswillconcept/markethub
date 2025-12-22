// Error handling utilities for cart operations

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  OFFLINE: 'OFFLINE_ERROR',
};

// Error class
export class CartError extends Error {
  constructor(type, message, originalError = null, retryable = false) {
    super(message);
    this.name = 'CartError';
    this.type = type;
    this.originalError = originalError;
    this.retryable = retryable;
    this.timestamp = new Date().toISOString();
  }
}

// Helper function to classify errors
export const classifyError = (error) => {
  if (!navigator.onLine) {
    return new CartError(ERROR_TYPES.OFFLINE, 'You appear to be offline. Changes will be saved when connection is restored.', error, true);
  }

  if (error?.response) {
    const { status, data } = error.response;

    if (status === 401 || status === 403) {
      return new CartError(ERROR_TYPES.AUTHENTICATION, 'Please log in to continue.', error, false);
    }

    if (status === 429) {
      return new CartError(ERROR_TYPES.RATE_LIMIT, 'Too many requests. Please wait a moment and try again.', error, true);
    }

    if (status >= 400 && status < 500) {
      const message = data?.message || data?.error || 'Invalid request. Please check your input.';
      return new CartError(ERROR_TYPES.VALIDATION, message, error, false);
    }

    if (status >= 500) {
      return new CartError(ERROR_TYPES.SERVER, 'Server error. Please try again later.', error, true);
    }
  }

  if (error?.request) {
    return new CartError(ERROR_TYPES.NETWORK, 'Network error. Please check your connection and try again.', error, true);
  }

  return new CartError(ERROR_TYPES.NETWORK, 'An unexpected error occurred. Please try again.', error, true);
};

// Retry configuration
export const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

// Exponential backoff calculator
export const calculateBackoffDelay = (attempt, config = RETRY_CONFIG) => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

// Retry function with exponential backoff
export const retryWithBackoff = async (fn, config = RETRY_CONFIG) => {
  let lastError;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const cartError = classifyError(error);

      if (!cartError.retryable || attempt === config.maxAttempts) {
        throw cartError;
      }

      const delay = calculateBackoffDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// User-friendly error messages and recovery actions
export const getErrorDisplay = (error) => {
  const messages = {
    [ERROR_TYPES.NETWORK]: {
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection.',
      action: 'Retry',
      actionType: 'retry',
    },
    [ERROR_TYPES.SERVER]: {
      title: 'Server Issue',
      message: 'Our servers are experiencing issues. This usually resolves quickly.',
      action: 'Retry',
      actionType: 'retry',
    },
    [ERROR_TYPES.VALIDATION]: {
      title: 'Invalid Request',
      message: error.message,
      action: 'Try Again',
      actionType: 'dismiss',
    },
    [ERROR_TYPES.AUTHENTICATION]: {
      title: 'Authentication Required',
      message: 'Please log in to manage your cart.',
      action: 'Login',
      actionType: 'login',
    },
    [ERROR_TYPES.RATE_LIMIT]: {
      title: 'Too Many Requests',
      message: 'Please wait a moment before trying again.',
      action: 'Wait & Retry',
      actionType: 'retry',
    },
    [ERROR_TYPES.OFFLINE]: {
      title: 'Offline',
      message: 'Changes will be saved when you\'re back online.',
      action: 'OK',
      actionType: 'dismiss',
    },
  };

  return messages[error.type] || {
    title: 'Error',
    message: error.message,
    action: 'OK',
    actionType: 'dismiss',
  };
};

// Analytics tracking for error patterns
export const trackError = (error, operation, context = {}) => {
  // In a real app, this would send to analytics service
  console.log('Cart Error Tracked:', {
    type: error.type,
    message: error.message,
    operation,
    timestamp: error.timestamp,
    retryable: error.retryable,
    context,
  });

  // Example of how you might integrate with an analytics service
  // analytics.track('cart_error', {
  //   error_type: error.type,
  //   operation,
  //   user_id: context.userId,
  //   timestamp: error.timestamp,
  // });
};