const cors = require('cors');

/**
 * Comprehensive CORS Configuration for Stylay Application
 * Handles multiple deployment scenarios:
 * - Development: localhost:5173 (client) → localhost:5000 or ngrok (server)
 * - Production: Clever Cloud deployment
 * - Ngrok tunneling for both development and production testing
 */

// Helper function to get allowed origins based on environment
const getAllowedOrigins = () => {
  const baseOrigins = [
    // Development origins - always allowed
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:4173', // Vite preview mode
    'http://127.0.0.1:4173',
  ];

  const productionOrigins = [
    'https://stylay.cleverapps.io', // Clever Cloud production
    'https://unflaking-actionable-man.ngrok-free.dev'
  ];

  // Current ngrok URL (update this when ngrok URL changes)
  const ngrokOrigins = [
    'https://unflaking-actionable-man.ngrok-free.dev',
    'https://unflaking-actionable-man.ngrok-free.app',
  ];

  // Parse additional origins from environment variable
  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [];

  return [...baseOrigins, ...productionOrigins, ...ngrokOrigins, ...envOrigins];
};

// Regex patterns for dynamic origins (ngrok, netlify, etc.)
const dynamicOriginPatterns = [
  /^https?:\/\/.*\.ngrok\.io$/,
  /^https?:\/\/.*\.ngrok\.app$/,
  /^https?:\/\/.*\.ngrok-free\.app$/,
  /^https?:\/\/.*\.ngrok-free\.dev$/,
  /^https?:\/\/.*\.netlify\.app$/,
  /^https?:\/\/.*\.vercel\.app$/,
  /^https?:\/\/.*\.cleverapps\.io$/,
];

// CORS configuration function
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    // In development mode, allow all origins for easier testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CORS] ✅ Development mode - Allowing origin: ${origin}`);
      return callback(null, true);
    }

    // Get allowed origins
    const allowedOrigins = getAllowedOrigins();

    // Check if origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] ✅ Origin allowed (exact match): ${origin}`);
      return callback(null, true);
    }

    // Check if origin matches any dynamic pattern
    const matchesPattern = dynamicOriginPatterns.some(pattern => pattern.test(origin));
    if (matchesPattern) {
      console.log(`[CORS] ✅ Origin allowed (pattern match): ${origin}`);
      return callback(null, true);
    }

    // Origin not allowed
    console.error(`[CORS] ❌ Origin blocked: ${origin}`);
    console.error(`[CORS] NODE_ENV: ${process.env.NODE_ENV}`);
    console.error(`[CORS] Allowed origins:`, allowedOrigins);
    
    callback(new Error('Not allowed by CORS'));
  },

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'ngrok-skip-browser-warning', // Special header for ngrok
    'x-session-id', // Session ID header for authentication
  ],

  // Exposed headers (headers that the client can access)
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count',
    'X-Request-ID',
  ],

  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours

  // Success status for legacy browsers
  optionsSuccessStatus: 200,

  // Preflight continue
  preflightContinue: false,
};

// Create and export the CORS middleware
const corsMiddleware = cors(corsOptions);

// Export both the middleware and a utility function to add origins dynamically
module.exports = corsMiddleware;

// Export additional utility for custom CORS handling if needed
module.exports.addCorsHeaders = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  // Check if origin is allowed
  if (!origin || allowedOrigins.includes(origin) || 
      dynamicOriginPatterns.some(pattern => pattern.test(origin)) ||
      process.env.NODE_ENV === 'development') {
    
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, ngrok-skip-browser-warning');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

// Export origins getter for debugging
module.exports.getAllowedOrigins = getAllowedOrigins;
