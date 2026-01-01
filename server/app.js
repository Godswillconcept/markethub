const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Secure environment check (removed sensitive data logging)
console.log("🔍 Debug: Environment configuration check...");
console.log("🔍 Current directory:", process.cwd());
console.log("🔍 __dirname:", __dirname);
console.log("🔍 Looking for .env at:", path.join(__dirname, ".env"));
console.log("🌍 NODE_ENV:", process.env.NODE_ENV || "undefined");
console.log("🏷️ APP_NAME:", process.env.APP_NAME || "undefined");
console.log("🌐 CORS_ORIGIN:", process.env.CORS_ORIGIN || "undefined");
console.log("🗄️ Database:", process.env.DATABASE_URL ? "✅ Configured" : "❌ Missing");

const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const xss = require("xss");
const hpp = require("hpp");
const morgan = require("morgan");
const compression = require("compression");
const passport = require("passport");
const redis = require("redis");
const { v4: uuidv4 } = require("uuid");

// Import CORS middleware
const corsMiddleware = require("./src/middlewares/cors");

const logger = require("./src/utils/logger");
const { errorHandler } = require("./src/middlewares/error");
const { sequelize, connectDB } = require("./src/config/database");
const { initializePassport } = require("./src/config/passport");
const { checkPermission } = require("./src/middlewares/checkPermission");
const { setUser } = require("./src/middlewares/auth");
const checkBlacklist = require("./src/middlewares/check-blacklist");
const {
  httpRequestDurationMiddleware,
  initializePerformanceTracking,
  metricsRoute,
} = require("./src/utils/performance");

// Import routes
const authRoutes = require("./src/routes/auth.route");
const userRoutes = require("./src/routes/user.route");
const roleRoutes = require("./src/routes/role.route");
const vendorRoutes = require("./src/routes/vendor.route");
const categoryRoutes = require("./src/routes/category.route");
const collectionRoutes = require("./src/routes/collection.route");
const productRoutes = require("./src/routes/product.route");
const filterRoutes = require("./src/routes/filter.route");
const supplyRoutes = require("./src/routes/supply.route");
const inventoryRoutes = require("./src/routes/inventory.route");
const journalRoutes = require("./src/routes/journal.route");
const addressRoutes = require("./src/routes/address.route");
const cartRoutes = require("./src/routes/cart.route");
const orderRoutes = require("./src/routes/order.route");
const webhookRoutes = require("./src/routes/webhook.route");
const dashboardRoutes = require("./src/routes/dashboard.route");
const reviewRoutes = require("./src/routes/review.route");
const variantRoutes = require("./src/routes/variant.route");
const wishlistRoutes = require("./src/routes/wishlist.route");
const suggestionRoutes = require("./src/routes/suggestion.route");
const adminRoutes = require("./src/routes/admin");
const supportFeedbackRoutes = require("./src/routes/support-feedback.route");
const vendorMessageRoutes = require("./src/routes/vendor-message.route");
const payoutRoutes = require("./src/routes/payout.route");

// Initialize express app
const app = express();

// Trust first proxy (for rate limiting behind load balancer)
app.set("trust proxy", 1);

// Connect to database and initialize properly
const initializeApp = async () => {
  try {
    await connectDB();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Failed to connect to database:", error);
  }
};

const db = sequelize;

// Initialize app for serverless
initializeApp();

// Initialize Redis client
let redisClient;

// Check if we're in a test environment
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID;

// Use Redis only in production or if explicitly enabled via REDIS_ENABLED (and not in test)
if (!isTestEnvironment && (process.env.NODE_ENV === "production" || process.env.REDIS_HOST)) {
  redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
    },
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisClient.on("error", (err) => {
    logger.error(`Redis Client Error: ${err}`);
  });

  redisClient.on("connect", () => {
    logger.info("Connected to Redis");
  });

  redisClient.connect().catch(console.error);
} else {
  const mockRedis = {
    get: async (key) => null,
    set: async (key, value, mode, duration) => true,
    setex: async (key, duration, value) => true,
    del: async (key) => true,
    quit: async () => true,
  };
  redisClient = mockRedis;
}

// Initialize performance tracking
initializePerformanceTracking(db);

// Initialize Passport
initializePassport(passport);

// ============================================
// SCHEDULED CLEANUP JOBS
// ============================================
// Start cleanup jobs for expired tokens and sessions
if (process.env.NODE_ENV !== 'test') {
  const cleanupJob = require('./src/jobs/cleanup.job');
  cleanupJob.start();
  logger.info('Scheduled cleanup jobs initialized');
}

// ============================================
// SECURITY HEADERS WITH HELMET
// ============================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "http://localhost:*",
          "https://localhost:*",
          "https://*.ngrok.io",
          "https://*.ngrok.app",
          "https://*.ngrok-free.app",
          "https://*.ngrok-free.dev",
          "https://*.cleverapps.io",
          "https://*.netlify.app",
          "https://placehold.co",
          "https://via.placeholder.com",
          "https://picsum.photos",
          "https://fastly.picsum.photos",
          "https://ui-avatars.com",
          "https://purecatamphetamine.github.io",
          "https://cdn.jsdelivr.net",
          "https://images.unsplash.com",
        ],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          "http://localhost:*",
          "https://*.ngrok.io",
          "https://*.ngrok.app",
          "https://*.ngrok-free.app",
          "https://*.ngrok-free.dev",
          "https://*.cleverapps.io",
        ],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ============================================
// ADDITIONAL SECURITY HEADERS
// ============================================
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  
  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");
  
  next();
});

// ============================================
// CORS CONFIGURATION - MOST IMPORTANT
// ============================================

// Apply CORS middleware EARLY and handle preflight
app.use(corsMiddleware);

// Explicit OPTIONS handler for preflight requests
app.options("*", corsMiddleware);

// Additional CORS headers for specific routes
app.use("/products", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// ============================================
// REQUEST TRACKING AND LOGGING
// ============================================

// Enhanced request tracking and logging
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader("X-Request-ID", req.id);
  
  // Add user context if authenticated
  if (req.user) {
    req.userId = req.user.id;
  }
  
  // Log request with context
  logger.info(`${req.method} ${req.originalUrl}`, {
    requestId: req.id,
    userId: req.userId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  next();
});

// Performance monitoring middleware
app.use(httpRequestDurationMiddleware);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(
    morgan("dev", {
      stream: { write: (message) => logger.http(message.trim()) },
    })
  );

  // Filter and log only Ngrok tunnel requests
  app.use((req, res, next) => {
    const host = req.get("host");
    const origin = req.get("origin");
    
    if ((host && host.includes("ngrok")) || (origin && origin.includes("ngrok"))) {
      const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
      console.log(
        `\x1b[35m[NGROK] ${timestamp} | \x1b[36m${req.method}\x1b[0m ${req.originalUrl} | Origin: ${origin}`
      );
    }
    next();
  });
}

// Initialize Passport
app.use(passport.initialize());

// ============================================
// STATIC FILE SERVING
// ============================================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "src/public")));
  app.use("/products", express.static(path.join(__dirname, "src", "products")));
  app.use(express.static(path.join(__dirname, "../client/dist")));
} else {
  app.use("/uploads", express.static(path.join(__dirname, "src/public", "Upload")));
  app.use("/products", express.static(path.join(__dirname, "src", "products")));
  
  // Logo endpoint
  app.get("/logo", (req, res) => {
    res.sendFile(path.join(__dirname, "src/public", "logo.png"));
  });
}

// ============================================
// FILE UPLOAD MIDDLEWARE
// ============================================
const fileUpload = require("express-fileupload");
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp/",
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached (max 10MB)",
    safeFileNames: true,
    preserveExtension: 4,
    debug: process.env.NODE_ENV === "development",
    parseNested: true,
  })
);

// ============================================
// RATE LIMITING
// ============================================
const limiter = rateLimit({
  max: process.env.RATE_LIMIT_MAX || 1000,
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again later!",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Dashboard-specific rate limiting
const dashboardLimiter = rateLimit({
  max: 20,
  windowMs: 60 * 1000,
  message: "Too many dashboard requests, please try again in 1 minute!",
  keyGenerator: (req) => {
    return req.user ? `user:${req.user.id}` : req.ip;
  },
});
app.use("/api/v1/admin/dashboard", dashboardLimiter);

// ============================================
// CACHE MIDDLEWARE
// ============================================
const cache = (duration) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      const originalJson = res.json;
      res.json = function (obj) {
        redisClient.set(key, JSON.stringify(obj), "EX", duration);
        return originalJson.call(this, obj);
      };

      next();
    } catch (error) {
      logger.error(`Cache error: ${error.message}`);
      next();
    }
  };
};

// ============================================
// BODY PARSING AND SECURITY
// ============================================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against XSS
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') return xss.filterXSS(obj);
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[xss.filterXSS(key)] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
});

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// Compress responses
app.use(compression());

// ============================================
// HEALTH CHECK AND METRICS
// ============================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      configured: !!process.env.CORS_ORIGIN,
      origins: process.env.CORS_ORIGIN,
    },
  });
});

app.get("/metrics", metricsRoute);

// ============================================
// API ROUTES
// ============================================

// Apply authentication and permission middleware to all API routes
app.use("/api/v1", setUser, checkBlacklist, checkPermission);

// Mount all routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/vendors", vendorRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/collections", collectionRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/filters", filterRoutes);
app.use("/api/v1/supplies", supplyRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/journals", journalRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/webhooks", webhookRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/suggestions", suggestionRoutes);
app.use("/api/v1/dashboard", cache(300), dashboardRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/variants", variantRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/feedbacks", supportFeedbackRoutes);
app.use("/api/v1/messages", vendorMessageRoutes);
app.use("/api/v1/payouts", payoutRoutes);

// ============================================
// ERROR HANDLING
// ============================================
app.use(errorHandler);


// Export for serverless
module.exports = app;

// Start server for local development
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
    console.log(`🌐 CORS Origins:`, process.env.CORS_ORIGIN);
  });
}