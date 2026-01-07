# Express.js to Vercel Serverless Functions Refactoring Guide

## Table of Contents
1. [Vercel Serverless Function Structure](#1-vercel-serverless-function-structure)
2. [Route Conversion Pattern](#2-route-conversion-pattern)
3. [Middleware Adaptation Guide](#3-middleware-adaptation-guide)
4. [Controller Refactoring Instructions](#4-controller-refactoring-instructions)
5. [Specific Route Conversion Examples](#5-specific-route-conversion-examples)
6. [Database Connection Pattern](#6-database-connection-pattern)
7. [File Upload Handling](#7-file-upload-handling)
8. [Authentication Flow Adaptation](#8-authentication-flow-adaptation)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Response Optimization](#10-response-optimization)
11. [Testing Strategy](#11-testing-strategy)
12. [Common Pitfalls & Solutions](#12-common-pitfalls--solutions)
13. [Migration Checklist](#13-migration-checklist)
14. [Code Examples](#14-code-examples)

---

## 1. Vercel Serverless Function Structure

### Proposed Directory Structure

```
api/
├── _middleware/              # Shared middleware functions
│   ├── auth.js
│   ├── cors.js
│   ├── error.js
│   └── validation.js
├── _lib/                    # Shared utilities and helpers
│   ├── db.js
│   ├── response.js
│   └── logger.js
├── _services/                # Business logic services
│   ├── auth.service.js
│   ├── product.service.js
│   └── ...
├── auth/                     # Authentication routes
│   ├── register.js
│   ├── login.js
│   ├── refresh-token.js
│   └── logout.js
├── products/                  # Product routes
│   ├── index.js
│   ├── [id].js
│   └── vendor/[id].js
├── orders/                    # Order routes
│   ├── index.js
│   ├── [id].js
│   └── create.js
├── vendors/                   # Vendor routes
│   ├── index.js
│   └── [id].js
├── users/                     # User routes
│   ├── me.js
│   └── update.js
├── categories/                # Category routes
│   └── index.js
├── collections/               # Collection routes
│   └── index.js
├── inventory/                 # Inventory routes
│   └── index.js
├── journals/                  # Journal routes
│   └── index.js
├── addresses/                 # Address routes
│   └── index.js
├── cart/                      # Cart routes
│   └── index.js
├── webhooks/                  # Webhook routes
│   ├── paystack.js
│   └── email.js
├── wishlist/                  # Wishlist routes
│   └── index.js
├── suggestions/               # Suggestion routes
│   └── index.js
├── dashboard/                 # Dashboard routes
│   └── index.js
├── reviews/                   # Review routes
│   └── index.js
├── variants/                  # Variant routes
│   └── index.js
├── admin/                     # Admin routes
│   ├── categories/
│   ├── collections/
│   ├── dashboard/
│   ├── products/
│   ├── inventory/
│   ├── journals/
│   ├── orders/
│   ├── supplies/
│   ├── webhooks/
│   └── subadmins/
├── feedbacks/                # Feedback routes
│   └── index.js
├── messages/                  # Message routes
│   └── index.js
└── payouts/                   # Payout routes
    └── index.js
```

### File Naming Conventions

**Route File Naming:**
- Use lowercase with hyphens for multi-word resources
- Use `[id].js` for dynamic routes with parameters
- Use `index.js` for the main/list endpoint

**Examples:**
- `api/auth/register.js` → `/api/auth/register`
- `api/products/[id].js` → `/api/products/:id`
- `api/products/vendor/[id].js` → `/api/products/vendor/:id`

**Route Mapping from Express to Vercel:**

| Express Route | Vercel Route | File Path |
|--------------|---------------|------------|
| `/api/v1/auth/register` | `/api/auth/register` | `api/auth/register.js` |
| `/api/v1/auth/login` | `/api/auth/login` | `api/auth/login.js` |
| `/api/v1/products` | `/api/products` | `api/products/index.js` |
| `/api/v1/products/:id` | `/api/products/[id]` | `api/products/[id].js` |
| `/api/v1/orders` | `/api/orders` | `api/orders/index.js` |
| `/api/v1/orders/:id` | `/api/orders/[id]` | `api/orders/[id].js` |
| `/api/v1/admin/products` | `/api/admin/products` | `api/admin/products/index.js` |

**Note:** Vercel removes the `/api/v1` prefix. Update client API calls accordingly or use rewrites in `vercel.json`.

### Organization Strategy

**Recommended: Group by Feature**
- Pros: Logical grouping, easier to find related routes
- Cons: Some directories may have many files
- Best for: Large applications with distinct domains

**Alternative: Group by HTTP Method**
- Pros: Clear separation of concerns
- Cons: Harder to find all routes for a resource
- Best for: RESTful APIs with consistent patterns

**Recommendation:** Use feature-based organization for MarketHub due to the number of distinct domains (auth, products, orders, vendors, etc.).

---

## 2. Route Conversion Pattern

### Standard Template for Converting Express Route to Vercel Function

**Express Route (Before):**
```javascript
// server/src/routes/product.route.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, isVendor } = require('../middlewares/auth');

router.get('/', productController.getProducts);
router.post('/', protect, isVendor, productController.createProduct);
router.get('/:id', productController.getProductByIdentifier);
router.put('/:id', protect, isVendor, productController.updateProduct);
router.delete('/:id', protect, isVendor, productController.deleteProduct);

module.exports = router;
```

**Vercel Serverless Function (After):**
```javascript
// api/products/index.js
const { protect, isVendor } = require('../../_middleware/auth');
const { getProducts, createProduct } = require('../../_services/product.service');
const { successResponse, errorResponse } = require('../../_lib/response');

module.exports = async (req, res) => {
  try {
    // Handle GET /api/products
    if (req.method === 'GET') {
      const products = await getProducts(req.query);
      return successResponse(res, products);
    }
    
    // Handle POST /api/products
    if (req.method === 'POST') {
      // Authentication check
      const authResult = await protect(req);
      if (!authResult.success) {
        return errorResponse(res, authResult.error, 401);
      }
      
      // Vendor role check
      const vendorCheck = await isVendor(req.user);
      if (!vendorCheck.success) {
        return errorResponse(res, vendorCheck.error, 403);
      }
      
      const product = await createProduct(req.body, req.user);
      return successResponse(res, product, 201);
    }
    
    return errorResponse(res, 'Method not allowed', 405);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

### Request/Response Handling Differences

| Aspect | Express.js | Vercel Serverless |
|---------|------------|-------------------|
| Request Object | `req` (Express Request) | `req` (Vercel Request - similar API) |
| Response Object | `res.status(200).json(data)` | `return { status: 200, body: data }` |
| Middleware Chain | `router.use(middleware, handler)` | Manual middleware calls in function |
| Next Function | `next()` | Return early or throw error |
| File Uploads | `req.files` | Parse from `req.body` or use FormData |

### Error Handling Patterns in Serverless Context

**Express Error Handling:**
```javascript
// Global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
```

**Vercel Error Handling:**
```javascript
// Per-function error handling
module.exports = async (req, res) => {
  try {
    // Route logic
  } catch (error) {
    // Log error
    console.error('Error in route:', error);
    
    // Return standardized error response
    return {
      status: error.statusCode || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
      },
      body: JSON.stringify({
        status: 'error',
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      })
    };
  }
};
```

---

## 3. Middleware Adaptation Guide

### Security Middleware Adaptation

**Helmet (Security Headers):**
```javascript
// Express (Before)
app.use(helmet({ contentSecurityPolicy: { ... } }));

// Vercel (After) - Apply in each function
const setSecurityHeaders = (res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
};

module.exports = async (req, res) => {
  setSecurityHeaders(res);
  // ... rest of function
};
```

**CORS:**
```javascript
// Express (Before)
const corsMiddleware = require('./src/middlewares/cors');
app.use(corsMiddleware);

// Vercel (After) - Apply in each function
const setCORSHeaders = (req, res) => {
  const origin = req.headers['origin'] || process.env.CORS_ORIGIN;
  
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      }
    };
  }
};

module.exports = async (req, res) => {
  const corsResult = setCORSHeaders(req, res);
  if (corsResult) return corsResult;
  // ... rest of function
};
```

### Authentication Middleware Adaptation

**JWT Verification:**
```javascript
// _middleware/auth.js
const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

const verifyJWT = async (req) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No token provided' };
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.APP_NAME || 'Stylay',
      audience: 'user'
    });
    
    // Load user with roles and permissions
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });
    
    if (!user || !user.is_active) {
      return { success: false, error: 'User not found or inactive' };
    }
    
    return { success: true, user };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return { success: false, error: 'Invalid token' };
    }
    if (error.name === 'TokenExpiredError') {
      return { success: false, error: 'Token expired' };
    }
    return { success: false, error: 'Authentication failed' };
  }
};

const protect = async (req, res, next) => {
  const result = await verifyJWT(req);
  if (!result.success) {
    return {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'error', message: result.error })
    };
  }
  
  req.user = result.user;
  return next ? next() : null;
};

module.exports = { protect, verifyJWT };
```

### Rate Limiting Middleware

**Express Rate Limiting:**
```javascript
// Express (Before)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests'
});
app.use('/api', limiter);
```

**Vercel Rate Limiting (Redis-based):**
```javascript
// _middleware/rateLimit.js
const redis = require('../_lib/redis');

const checkRateLimit = async (identifier, limit, windowMs) => {
  const key = `ratelimit:${identifier}`;
  const current = await redis.get(key);
  
  if (current && parseInt(current) >= limit) {
    return { success: false, error: 'Rate limit exceeded' };
  }
  
  const newCount = current ? parseInt(current) + 1 : 1;
  await redis.set(key, newCount, 'PX', windowMs);
  
  return { success: true };
};

const rateLimiter = (limit, windowMs) => {
  return async (req, res, next) => {
    const identifier = req.user?.id || req.ip;
    const result = await checkRateLimit(identifier, limit, windowMs);
    
    if (!result.success) {
      return {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(windowMs / 1000)
        },
        body: JSON.stringify({
          status: 'error',
          message: result.error
        })
      };
    }
    
    return next ? next() : null;
  };
};

module.exports = { rateLimiter };
```

### Cache Middleware

```javascript
// _middleware/cache.js
const redis = require('../_lib/redis');

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next ? next() : null;
    }
    
    const key = `cache:${req.url}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT'
        },
        body: cached
      };
    }
    
    // Capture response to cache it
    const originalJson = res.json;
    res.json = function(data) {
      redis.set(key, JSON.stringify(data), 'EX', duration);
      return originalJson.call(this, data);
    };
    
    return next ? next() : null;
  };
};

module.exports = { cacheMiddleware };
```

### Middleware Summary

| Middleware Type | Keep | Modify | Remove | Vercel Alternative |
|---------------|------|--------|--------|-------------------|
| Helmet | ❌ | ✅ | Manual header setting | Security headers in response |
| CORS | ❌ | ✅ | Manual header setting | CORS headers in response |
| Passport JWT | ✅ | ✅ | - | Manual JWT verification |
| Rate Limiting | ❌ | ✅ | - | Redis-based rate limiting |
| File Upload (express-fileupload) | ❌ | - | ✅ | Vercel Blob Storage / AWS S3 |
| XSS Protection | ✅ | ✅ | - | Keep input sanitization |
| HPP (Parameter Pollution) | ✅ | ✅ | - | Keep whitelist logic |
| Compression | ❌ | ✅ | - | Vercel auto-compresses |
| Error Handler | ✅ | ✅ | - | Per-function error handling |

---

## 4. Controller Refactoring Instructions

### Extracting Controller Logic from Express Routes

**Current Pattern (Express):**
```javascript
// server/src/routes/product.route.js
const productController = require('../controllers/product.controller');

router.get('/', productController.getProducts);
router.post('/', protect, isVendor, productController.createProduct);
```

**Refactored Pattern (Vercel):**
```javascript
// api/products/index.js
const { getProducts, createProduct } = require('../../_services/product.service');
const { protect, isVendor } = require('../../_middleware/auth');
const { successResponse, errorResponse } = require('../../_lib/response');

module.exports = async (req, res) => {
  try {
    // Route based on HTTP method
    if (req.method === 'GET') {
      const products = await getProducts(req.query);
      return successResponse(res, products);
    }
    
    if (req.method === 'POST') {
      // Apply authentication middleware
      const authResult = await protect(req);
      if (!authResult.success) {
        return errorResponse(res, authResult.error, 401);
      }
      
      // Apply role-based authorization
      const vendorCheck = await isVendor(req.user);
      if (!vendorCheck.success) {
        return errorResponse(res, vendorCheck.error, 403);
      }
      
      const product = await createProduct(req.body, req.user);
      return successResponse(res, product, 201);
    }
    
    return errorResponse(res, 'Method not allowed', 405);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

### Service Layer Integration Pattern

**Create service functions that are independent of Express:**

```javascript
// _services/product.service.js
const { Product, Category, Vendor } = require('../models');

/**
 * Get products with filtering and pagination
 */
const getProducts = async (query = {}) => {
  const { page = 1, limit = 12, category, vendor, search } = query;
  const offset = (page - 1) * limit;
  
  const whereClause = {};
  
  // Build filters
  if (category) whereClause.category_id = category;
  if (vendor) whereClause.vendor_id = vendor;
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }
  
  const { count, rows: products } = await Product.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      { model: Category, as: 'category' },
      { model: Vendor, as: 'vendor' }
    ],
    order: [['created_at', 'DESC']]
  });
  
  return {
    success: true,
    count: products.length,
    total: count,
    data: products
  };
};

/**
 * Create a new product
 */
const createProduct = async (productData, user) => {
  // Validate vendor
  const vendor = await Vendor.findOne({
    where: { user_id: user.id }
  });
  
  if (!vendor || vendor.status !== 'approved') {
    throw new Error('Vendor not approved');
  }
  
  // Create product
  const product = await Product.create({
    ...productData,
    vendor_id: vendor.id,
    status: 'active'
  });
  
  return product;
};

module.exports = { getProducts, createProduct };
```

### Dependency Injection for Database Connections

**Pattern: Pass database connection to services**

```javascript
// _lib/db.js
const { Sequelize } = require('sequelize');

let sequelize = null;

const getDB = async () => {
  if (!sequelize) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
      logging: false
    });
    await sequelize.authenticate();
  }
  return sequelize;
};

const closeDB = async () => {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
  }
};

module.exports = { getDB, closeDB };
```

**Usage in services:**
```javascript
// _services/product.service.js
const { getDB } = require('../_lib/db');

const getProducts = async (query = {}) => {
  const db = await getDB();
  const { Product } = require('../models');
  
  const products = await Product.findAll({ sequelize: db });
  
  // Don't close connection - let it be reused
  return products;
};
```

### Async/Await Patterns for Serverless

**DO:**
```javascript
// Good - Use async/await consistently
module.exports = async (req, res) => {
  try {
    const result = await someAsyncOperation();
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

**DON'T:**
```javascript
// Bad - Mixing callbacks with async/await
module.exports = (req, res) => {
  someAsyncOperation((err, result) => {
    if (err) {
      return errorResponse(res, err.message, 500);
    }
    return successResponse(res, result);
  });
};
```

### Response Formatting Standardization

**Create response helpers:**
```javascript
// _lib/response.js
const successResponse = (res, data, statusCode = 200) => {
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
    },
    body: JSON.stringify({
      status: 'success',
      data: data
    })
  };
};

const errorResponse = (res, message, statusCode = 500, code = null) => {
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
    },
    body: JSON.stringify({
      status: 'error',
      message: message,
      ...(code && { code })
    })
  };
};

const paginatedResponse = (res, data, pagination) => {
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
    },
    body: JSON.stringify({
      status: 'success',
      count: data.length,
      total: pagination.total,
      ...pagination,
      data: data
    })
  };
};

module.exports = { successResponse, errorResponse, paginatedResponse };
```

---

## 5. Specific Route Conversion Examples

### Authentication Routes

#### Register Route

**Express Route:**
```javascript
// server/src/routes/auth.route.js
router.post('/register', registerValidation, validate, authController.register);
```

**Vercel Function:**
```javascript
// api/auth/register.js
const { register } = require('../../_services/auth.service');
const { validateRegistration } = require('../../_validators/auth.validator');
const { successResponse, errorResponse } = require('../../_lib/response');

module.exports = async (req, res) => {
  try {
    // Validate request
    const validation = validateRegistration(req.body);
    if (!validation.valid) {
      return errorResponse(res, validation.errors.join(', '), 400);
    }
    
    // Register user
    const result = await register(req.body);
    
    return successResponse(res, result, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

#### Login Route

**Express Route:**
```javascript
router.post('/login', loginValidation, validate, localAuth(), authController.login);
```

**Vercel Function:**
```javascript
// api/auth/login.js
const { login } = require('../../_services/auth.service');
const { validateLogin } = require('../../_validators/auth.validator');
const { successResponse, errorResponse } = require('../../_lib/response');
const { rateLimiter } = require('../../_middleware/rateLimit');

module.exports = async (req, res) => {
  try {
    // Apply rate limiting
    const rateCheck = await rateLimiter(100, 15 * 60 * 1000)(req, res);
    if (rateCheck) return rateCheck;
    
    // Validate request
    const validation = validateLogin(req.body);
    if (!validation.valid) {
      return errorResponse(res, validation.errors.join(', '), 400);
    }
    
    // Login user
    const result = await login(req.body);
    
    return successResponse(res, result, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

#### Refresh Token Route

**Express Route:**
```javascript
router.post('/refresh', refreshTokenValidation, validate, authController.refreshToken);
```

**Vercel Function:**
```javascript
// api/auth/refresh-token.js
const { refreshToken } = require('../../_services/auth.service');
const { validateRefreshToken } = require('../../_validators/auth.validator');
const { successResponse, errorResponse } = require('../../_lib/response');

module.exports = async (req, res) => {
  try {
    // Validate request
    const validation = validateRefreshToken(req.body);
    if (!validation.valid) {
      return errorResponse(res, validation.errors.join(', '), 400);
    }
    
    // Refresh token
    const result = await refreshToken(req.body);
    
    return successResponse(res, result, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

### Product Routes

#### List Products (Simple CRUD)

**Express Route:**
```javascript
router.get('/', getProductsValidation, validate, productController.getProducts);
```

**Vercel Function:**
```javascript
// api/products/index.js
const { getProducts } = require('../../_services/product.service');
const { validateGetProducts } = require('../../_validators/product.validator');
const { successResponse, errorResponse, paginatedResponse } = require('../../_lib/response');
const { cacheMiddleware } = require('../../_middleware/cache');

module.exports = async (req, res) => {
  try {
    // Apply cache for GET requests (5 minutes)
    const cacheCheck = await cacheMiddleware(300)(req, res);
    if (cacheCheck) return cacheCheck;
    
    // Validate request
    const validation = validateGetProducts(req.query);
    if (!validation.valid) {
      return errorResponse(res, validation.errors.join(', '), 400);
    }
    
    // Get products
    const result = await getProducts(req.query);
    
    return paginatedResponse(res, result.data, {
      total: result.total,
      page: req.query.page || 1,
      limit: req.query.limit || 12
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

#### Get Product by ID

**Express Route:**
```javascript
router.get('/:identifier', getProductByIdentifierValidation, validate, productController.getProductByIdentifier);
```

**Vercel Function:**
```javascript
// api/products/[id].js
const { getProductByIdentifier } = require('../../_services/product.service');
const { successResponse, errorResponse } = require('../../_lib/response');

module.exports = async (req, res) => {
  try {
    const { id } = req.query; // Vercel uses query params for dynamic routes
    
    if (!id) {
      return errorResponse(res, 'Product ID is required', 400);
    }
    
    const product = await getProductByIdentifier(id);
    
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }
    
    return successResponse(res, product, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

#### Create Product (Authenticated Route)

**Express Route:**
```javascript
router.post('/', protect, isVendor, createProductValidation, validate, productController.createProduct);
```

**Vercel Function:**
```javascript
// api/products/index.js (POST handler)
const { createProduct } = require('../../_services/product.service');
const { validateCreateProduct } = require('../../_validators/product.validator');
const { successResponse, errorResponse } = require('../../_lib/response');
const { protect, isVendor } = require('../../_middleware/auth');

module.exports = async (req, res) => {
  try {
    // Apply authentication
    const authResult = await protect(req);
    if (!authResult.success) {
      return errorResponse(res, authResult.error, 401);
    }
    
    // Apply vendor role check
    const vendorCheck = await isVendor(req.user);
    if (!vendorCheck.success) {
      return errorResponse(res, vendorCheck.error, 403);
    }
    
    // Validate request
    const validation = validateCreateProduct(req.body);
    if (!validation.valid) {
      return errorResponse(res, validation.errors.join(', '), 400);
    }
    
    // Create product
    const product = await createProduct(req.body, req.user);
    
    return successResponse(res, product, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

### Order Routes

#### Create Order

**Express Route:**
```javascript
router.post('/', protect, orderController.createOrder);
```

**Vercel Function:**
```javascript
// api/orders/index.js
const { createOrder } = require('../../_services/order.service');
const { validateCreateOrder } = require('../../_validators/order.validator');
const { successResponse, errorResponse } = require('../../_lib/response');
const { protect } = require('../../_middleware/auth');

module.exports = async (req, res) => {
  try {
    // Apply authentication
    const authResult = await protect(req);
    if (!authResult.success) {
      return errorResponse(res, authResult.error, 401);
    }
    
    // Validate request
    const validation = validateCreateOrder(req.body);
    if (!validation.valid) {
      return errorResponse(res, validation.errors.join(', '), 400);
    }
    
    // Create order
    const order = await createOrder(req.body, req.user);
    
    return successResponse(res, order, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

#### Get Order Details

**Express Route:**
```javascript
router.get('/:id', protect, orderController.getOrder);
```

**Vercel Function:**
```javascript
// api/orders/[id].js
const { getOrder } = require('../../_services/order.service');
const { successResponse, errorResponse } = require('../../_lib/response');
const { protect } = require('../../_middleware/auth');

module.exports = async (req, res) => {
  try {
    // Apply authentication
    const authResult = await protect(req);
    if (!authResult.success) {
      return errorResponse(res, authResult.error, 401);
    }
    
    const { id } = req.query;
    
    const order = await getOrder(id, req.user);
    
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }
    
    return successResponse(res, order, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

### Vendor Routes

#### List Vendors

**Express Route:**
```javascript
router.get('/', vendorController.getVendors);
```

**Vercel Function:**
```javascript
// api/vendors/index.js
const { getVendors } = require('../../_services/vendor.service');
const { successResponse, paginatedResponse } = require('../../_lib/response');
const { cacheMiddleware } = require('../../_middleware/cache');

module.exports = async (req, res) => {
  try {
    // Apply cache (10 minutes)
    const cacheCheck = await cacheMiddleware(600)(req, res);
    if (cacheCheck) return cacheCheck;
    
    const result = await getVendors(req.query);
    
    return paginatedResponse(res, result.data, {
      total: result.total,
      page: req.query.page || 1,
      limit: req.query.limit || 12
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

#### Vendor Dashboard

**Express Route:**
```javascript
router.get('/dashboard', protect, isVendor, vendorController.getDashboard);
```

**Vercel Function:**
```javascript
// api/vendors/dashboard.js
const { getVendorDashboard } = require('../../_services/vendor.service');
const { successResponse, errorResponse } = require('../../_lib/response');
const { protect, isVendor } = require('../../_middleware/auth');

module.exports = async (req, res) => {
  try {
    // Apply authentication and authorization
    const authResult = await protect(req);
    if (!authResult.success) {
      return errorResponse(res, authResult.error, 401);
    }
    
    const vendorCheck = await isVendor(req.user);
    if (!vendorCheck.success) {
      return errorResponse(res, vendorCheck.error, 403);
    }
    
    const dashboard = await getVendorDashboard(req.user.id);
    
    return successResponse(res, dashboard, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

### File Upload Routes

#### Upload Product Images

**Express Route:**
```javascript
router.post('/', protect, isVendor, uploadFiles('images', 10, 'products'), productController.createProduct);
```

**Vercel Function:**
```javascript
// api/products/upload.js
const { uploadToBlob } = require('../../_lib/storage');
const { successResponse, errorResponse } = require('../../_lib/response');
const { protect, isVendor } = require('../../_middleware/auth');

module.exports = async (req, res) => {
  try {
    // Apply authentication
    const authResult = await protect(req);
    if (!authResult.success) {
      return errorResponse(res, authResult.error, 401);
    }
    
    const vendorCheck = await isVendor(req.user);
    if (!vendorCheck.success) {
      return errorResponse(res, vendorCheck.error, 403);
    }
    
    // Parse multipart form data
    const formData = await parseMultipartFormData(req);
    
    if (!formData.files || formData.files.length === 0) {
      return errorResponse(res, 'No files uploaded', 400);
    }
    
    // Upload files to Vercel Blob Storage
    const uploadResults = await Promise.all(
      formData.files.map(file => uploadToBlob(file, 'product-images'))
    );
    
    const imageUrls = uploadResults.map(result => result.url);
    
    return successResponse(res, { urls: imageUrls }, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
```

### Webhook Routes

#### PayStack Webhook

**Express Route:**
```javascript
router.post('/paystack', webhookController.handlePayStackWebhook);
```

**Vercel Function:**
```javascript
// api/webhooks/paystack.js
const { handlePayStackWebhook } = require('../../_services/webhook.service');
const { successResponse, errorResponse } = require('../../_lib/response');

module.exports = async (req, res) => {
  try {
    // Verify PayStack signature
    const signature = req.headers['x-paystack-signature'];
    const payload = req.body;
    
    if (!verifyPayStackSignature(payload, signature)) {
      return errorResponse(res, 'Invalid signature', 401);
    }
    
    // Process webhook
    const result = await handlePayStackWebhook(payload);
    
    // Return 200 immediately (webhooks expect quick response)
    return successResponse(res, { received: true }, 200);
  } catch (error) {
    // Still return 200 for webhooks to avoid retries
    return successResponse(res, { processed: false, error: error.message }, 200);
  }
};
```

---

## 6. Database Connection Pattern

### Establish Database Connection Per Request

**Pattern: Singleton Connection with Reuse**

```javascript
// _lib/db.js
const { Sequelize } = require('sequelize');

let sequelize = null;
let connectionPromise = null;

const getDB = async () => {
  // Return existing connection if available
  if (sequelize) {
    return sequelize;
  }
  
  // Create new connection
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  });
  
  await sequelize.authenticate();
  return sequelize;
};

const testConnection = async () => {
  const db = await getDB();
  try {
    await db.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = { getDB, testConnection };
```

### Connection Lifecycle Management

**Warm Connection Pattern:**

```javascript
// api/products/index.js
const { getDB } = require('../../_lib/db');
const { Product } = require('../../models');

module.exports = async (req, res) => {
  let db;
  try {
    // Get database connection
    db = await getDB();
    
    // Use connection for queries
    const products = await Product.findAll({ sequelize: db });
    
    return successResponse(res, products);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  } finally {
    // Don't close connection - let it be reused
    // Connection will be closed by Vercel after function execution
  }
};
```

### Connection Pooling for Serverless

**Configuration:**

```javascript
// _lib/db.js
const getDB = async () => {
  if (sequelize) {
    return sequelize;
  }
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    
    // Serverless-optimized pool settings
    pool: {
      max: 5,              // Max connections in pool
      min: 0,              // Min connections to maintain
      acquire: 10000,        // Max time to get connection (ms)
      idle: 10000,          // Max time connection can be idle (ms)
      evict: 10000,         // Check for idle connections every 10s
    },
    
    // Connection timeout settings
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      },
      statement_timeout: 9000,  // Statement timeout (9s)
      idle_in_transaction_session_timeout: 9000
    },
    
    logging: false
  });
  
  await sequelize.authenticate();
  return sequelize;
};
```

### Error Handling for Database Failures

```javascript
// _lib/db.js
const getDBWithRetry = async (retries = 3) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const db = await getDB();
      await db.query('SELECT 1');
      return db;
    } catch (error) {
      lastError = error;
      
      // Log retry attempt
      console.error(`DB connection attempt ${i + 1} failed:`, error.message);
      
      // Wait before retry (exponential backoff)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw new Error(`Failed to connect to database after ${retries} attempts: ${lastError.message}`);
};

module.exports = { getDB, getDBWithRetry };
```

### Transaction Management in Serverless

```javascript
// _services/order.service.js
const { getDB } = require('../_lib/db');
const { Order, OrderItem, Product } = require('../models');

const createOrder = async (orderData, user) => {
  const db = await getDB();
  
  let order;
  try {
    // Start transaction
    order = await db.transaction(async (t) => {
      // Create order
      const newOrder = await Order.create({
        user_id: user.id,
        status: 'pending',
        total: orderData.total
      }, { transaction: t });
      
      // Create order items
      const orderItems = await Promise.all(
        orderData.items.map(item => 
          OrderItem.create({
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          }, { transaction: t })
        )
      );
      
      // Update product stock
      await Promise.all(
        orderItems.map(item =>
          Product.increment('sold_units', {
            by: item.quantity,
            where: { id: item.product_id },
            transaction: t
          })
        )
      );
      
      return newOrder;
    });
    
    return order;
  } catch (error) {
    // Transaction automatically rolled back on error
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

module.exports = { createOrder };
```

---

## 7. File Upload Handling

### Converting express-fileupload to Serverless-Compatible Approach

**Express Approach (Before):**
```javascript
// server/app.js
const fileUpload = require('express-fileupload');
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './tmp/',
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 }
}));

// In route
router.post('/upload', (req, res) => {
  const files = req.files.images;
  // Process files...
});
```

**Vercel Approach (After) - Vercel Blob Storage:**
```javascript
// _lib/storage.js
const { put } = require('@vercel/blob');

const uploadToBlob = async (file, folder = 'uploads') => {
  try {
    // Convert file to buffer
    const buffer = file.buffer;
    
    // Generate unique filename
    const filename = `${Date.now()}-${file.originalname}`;
    const pathname = `${folder}/${filename}`;
    
    // Upload to Vercel Blob Storage
    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: file.mimetype
    });
    
    // Get public URL
    const url = blob.url;
    
    return {
      url,
      pathname,
      filename
    };
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

const deleteFromBlob = async (pathname) => {
  try {
    await del(pathname);
    return true;
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

module.exports = { uploadToBlob, deleteFromBlob };
```

### Multipart Form Data Handling

**Parse multipart without express-fileupload:**

```javascript
// _lib/multipart.js
const { Readable } = require('stream');

const parseMultipartFormData = async (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      try {
        // Parse multipart form data
        const boundary = req.headers['content-type'].split('boundary=')[1];
        const buffer = Buffer.concat(chunks);
        
        // Simple parsing - for production, use a library like busboy
        const formData = parseSimpleMultipart(buffer, boundary);
        
        resolve(formData);
      } catch (error) {
        reject(error);
      }
    });
    
    req.on('error', reject);
  });
};

module.exports = { parseMultipartFormData };
```

### File Validation and Virus Scanning

```javascript
// _lib/fileValidation.js
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const validateFile = (file) => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error(`Invalid file type: ${file.mimetype}`);
  }
  
  // Check file size
  if (file.size > MAX_SIZE) {
    throw new Error(`File too large: ${file.size} bytes (max ${MAX_SIZE})`);
  }
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    throw new Error(`Invalid file extension: ${extension}`);
  }
  
  return { valid: true };
};

// Virus scanning (placeholder - integrate with actual service)
const scanForViruses = async (fileBuffer) => {
  // Integrate with ClamAV or similar service
  // For now, just validate file structure
  return { clean: true };
};

module.exports = { validateFile, scanForViruses };
```

### URL Generation for Uploaded Files

```javascript
// _lib/storage.js (continued)
const uploadToBlob = async (file, folder = 'uploads') => {
  // ... upload code ...
  
  // Return public URL
  const url = `${process.env.BLOB_BASE_URL || 'https://your-blob-store.vercel-storage.com'}/${pathname}`;
  
  return {
    url,
    pathname,
    filename,
    // Include metadata for tracking
    uploadedAt: new Date().toISOString(),
    size: file.size,
    mimetype: file.mimetype
  };
};
```

---

## 8. Authentication Flow Adaptation

### JWT Verification in Serverless Functions

```javascript
// _middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyJWT = async (req) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No token provided' };
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.APP_NAME || 'Stylay',
      audience: 'user'
    });
    
    // Load user with roles
    const { User, Role, Permission } = require('../models');
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });
    
    if (!user || !user.is_active) {
      return { success: false, error: 'User not found or inactive' };
    }
    
    return { success: true, user };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return { success: false, error: 'Invalid token' };
    }
    if (error.name === 'TokenExpiredError') {
      return { success: false, error: 'Token expired' };
    }
    return { success: false, error: 'Authentication failed' };
  }
};

module.exports = { verifyJWT };
```

### Refresh Token Handling

```javascript
// _services/auth.service.js
const jwt = require('jsonwebtoken');
const { RefreshToken, UserSession } = require('../models');

const createRefreshToken = async (userId, req) => {
  // Generate refresh token (30 days)
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  // Create session
  const session = await UserSession.create({
    user_id: userId,
    device_info: {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    },
    last_activity: new Date(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  
  // Store refresh token
  await RefreshToken.create({
    token: refreshToken,
    user_id: userId,
    session_id: session.id,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  
  return {
    token: refreshToken,
    sessionId: session.id
  };
};

const validateRefreshToken = async (refreshToken, sessionId) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Check if token exists in database
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken, is_revoked: false }
    });
    
    if (!tokenRecord) {
      return { valid: false, error: 'Invalid refresh token' };
    }
    
    // Check if session is valid
    const session = await UserSession.findOne({
      where: { id: sessionId, is_revoked: false }
    });
    
    if (!session || !session.isValid()) {
      return { valid: false, error: 'Invalid session' };
    }
    
    return { valid: true, userId: decoded.userId };
  } catch (error) {
    return { valid: false, error: 'Invalid refresh token' };
  }
};

module.exports = { createRefreshToken, validateRefreshToken };
```

### Session Management Alternatives

**Token-based approach (recommended for serverless):**

```javascript
// Store session in database, not memory
const createSession = async (userId, req) => {
  const { UserSession } = require('../models');
  
  const session = await UserSession.create({
    user_id: userId,
    device_info: {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    },
    last_activity: new Date(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });
  
  return session;
};

const updateSessionActivity = async (sessionId) => {
  const { UserSession } = require('../models');
  
  await UserSession.update(
    { last_activity: new Date() },
    { where: { id: sessionId } }
  );
};

module.exports = { createSession, updateSessionActivity };
```

### Permission Checking

```javascript
// _middleware/auth.js
const { PermissionService } = require('../services/permission.service');

const checkPermission = (user, permission) => {
  // Check if user has admin role
  if (user.roles.some(role => role.name === 'admin')) {
    return { success: true };
  }
  
  // Check specific permission
  const hasPermission = user.roles.some(role =>
    role.permissions.some(perm => perm.name === permission)
  );
  
  if (!hasPermission) {
    return { success: false, error: `Permission required: ${permission}` };
  }
  
  return { success: true };
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    const authResult = await verifyJWT(req);
    if (!authResult.success) {
      return {
        status: 401,
        body: JSON.stringify({ status: 'error', message: authResult.error })
      };
    }
    
    const permCheck = checkPermission(authResult.user, permission);
    if (!permCheck.success) {
      return {
        status: 403,
        body: JSON.stringify({ status: 'error', message: permCheck.error })
      };
    }
    
    req.user = authResult.user;
    return next ? next() : null;
  };
};

module.exports = { checkPermission, requirePermission };
```

### Token Blacklist Checking

```javascript
// _services/tokenBlacklist.service.js
const { TokenBlacklist } = require('../models');

const isTokenBlacklisted = async (token) => {
  const blacklisted = await TokenBlacklist.findOne({
    where: { token, expires_at: { [Op.gt]: new Date() } }
  });
  
  return !!blacklisted;
};

const blacklistToken = async (token, reason = 'logout', userId = null) => {
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);
  
  await TokenBlacklist.create({
    token,
    reason,
    user_id: userId,
    expires_at: expiresAt
  });
  
  // Cleanup expired tokens
  await TokenBlacklist.destroy({
    where: { expires_at: { [Op.lt]: new Date() } }
  });
};

module.exports = { isTokenBlacklisted, blacklistToken };
```

---

## 9. Error Handling Strategy

### Standardized Error Response Format

```javascript
// _lib/error.js
class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

const errorResponse = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
    },
    body: JSON.stringify({
      status: 'error',
      message,
      ...(error.code && { code }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  };
};

module.exports = { AppError, errorResponse };
```

### HTTP Status Code Mapping

```javascript
// _lib/error.js
const errorCodes = {
  // 4xx Client Errors
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  
  // 5xx Server Errors
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout'
};

const getStatusCode = (errorType) => {
  const statusMap = {
    'ValidationError': 400,
    'AuthenticationError': 401,
    'AuthorizationError': 403,
    'NotFoundError': 404,
    'ConflictError': 409,
    'RateLimitError': 429,
    'DatabaseError': 500,
    'ExternalServiceError': 502
  };
  
  return statusMap[errorType] || 500;
};
```

### Error Logging in Serverless

```javascript
// _lib/logger.js
const logError = (error, context = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: error.message,
    stack: error.stack,
    context: {
      ...context,
      requestId: context.requestId,
      userId: context.userId,
      route: context.route,
      method: context.method
    }
  };
  
  // In production, send to logging service (e.g., Datadog, LogRocket)
  if (process.env.NODE_ENV === 'production') {
    // Send to external logging service
    console.error(JSON.stringify(logEntry));
  } else {
    // In development, log to console with colors
    console.error(`\x1b[31mERROR\x1b[0m:`, error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
};

module.exports = { logError };
```

### Client-Friendly Error Messages

```javascript
// _lib/error.js
const getErrorMessage = (error) => {
  // Don't expose internal implementation details
  const safeMessages = {
    'ValidationError': 'Please check your input and try again',
    'AuthenticationError': 'Please log in to continue',
    'AuthorizationError': 'You do not have permission to perform this action',
    'NotFoundError': 'The requested resource was not found',
    'ConflictError': 'This resource already exists or has been modified',
    'RateLimitError': 'Too many requests. Please try again later',
    'DatabaseError': 'An error occurred. Please try again',
    'ExternalServiceError': 'A service error occurred. Please try again'
  };
  
  return safeMessages[error.type] || 'An error occurred. Please try again';
};
```

### Error Boundary Implementation

```javascript
// Wrap all route handlers with error boundary
const withErrorHandling = (handler) => {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      // Log error
      const { logError } = require('./logger');
      logError(error, {
        requestId: req.headers['x-request-id'],
        route: req.url,
        method: req.method
      });
      
      // Return error response
      const { errorResponse } = require('./response');
      return errorResponse(res, error);
    }
  };
};

// Usage
module.exports = withErrorHandling(async (req, res) => {
  // Route logic here
});
```

---

## 10. Response Optimization

### Response Compression

**Vercel automatically compresses responses**, but you can optimize:

```javascript
// Minify JSON responses
const minifyJSON = (obj) => {
  return JSON.stringify(obj)
    .replace(/\s+/g, ' ')  // Remove extra spaces
    .replace(/:\s+/g, ':')   // Remove space after colons
    .replace(/{\s+/g, '{')  // Remove space after opening brace
    .replace(/}\s+/g, '}')  // Remove space before closing brace
    .replace(/,\s+/g, ',');  // Remove space after commas
};

const successResponse = (res, data, statusCode = 200) => {
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip',  // Vercel will handle compression
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
    },
    body: minifyJSON({
      status: 'success',
      data
    })
  };
};
```

### Caching Headers

```javascript
// _lib/cache.js
const setCacheHeaders = (res, maxAge = 300) => {
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
  res.setHeader('ETag', generateETag(req.url));
};

const generateETag = (url) => {
  // Simple ETag generation
  const crypto = require('crypto');
  return crypto.createHash('md5').update(url).digest('hex');
};
```

### CORS Configuration

```javascript
// _lib/cors.js
const setCORSHeaders = (req, res) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');
  const origin = req.headers['origin'];
  
  // Check if origin is allowed
  const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-ID, X-Request-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID, X-Request-ID',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      }
    };
  }
  
  return null; // Continue processing
};
```

### JSON Response Formatting

```javascript
// _lib/response.js
const formatResponse = (status, data, meta = {}) => {
  return {
    status,
    data,
    ...meta
  };
};

const successResponse = (res, data, statusCode = 200, meta = {}) => {
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'X-Response-Time': Date.now().toString()
    },
    body: JSON.stringify(formatResponse('success', data, meta))
  };
};

const paginatedResponse = (res, data, pagination) => {
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
    },
    body: JSON.stringify(formatResponse('success', data, pagination))
  };
};
```

### Pagination Patterns

```javascript
// _services/product.service.js
const getPaginatedResults = async (model, query = {}) => {
  const { page = 1, limit = 12 } = query;
  const offset = (page - 1) * limit;
  
  const { count, rows: data } = await model.findAndCountAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    distinct: true
  });
  
  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
      hasNext: offset + limit < count,
      hasPrev: page > 1
    }
  };
};

module.exports = { getPaginatedResults };
```

---

## 11. Testing Strategy

### Testing Converted Routes Locally

**Using Vercel CLI:**

```bash
# Install Vercel CLI
npm i -g vercel

# Test locally
vercel dev

# Test specific route
vercel dev --listen-port 3000
curl http://localhost:3000/api/products
```

**Using Node.js directly:**

```javascript
// tests/local-test.js
const handler = require('../api/products/index');

const mockReq = {
  method: 'GET',
  url: '/api/products',
  query: { page: 1, limit: 10 },
  headers: {
    'authorization': 'Bearer test-token',
    'content-type': 'application/json'
  }
};

const mockRes = {
  status: null,
  headers: {},
  body: null
};

const result = await handler(mockReq, mockRes);
console.log('Response:', result);
```

### Unit Testing Patterns

```javascript
// tests/products.test.js
const { getProducts } = require('../_services/product.service');
const { successResponse } = require('../_lib/response');

describe('Product Service', () => {
  test('should get products with pagination', async () => {
    const query = { page: 1, limit: 10 };
    const result = await getProducts(query);
    
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('data');
    expect(result.data).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
  });
  
  test('should filter products by category', async () => {
    const query = { category: 1 };
    const result = await getProducts(query);
    
    expect(result.data.every(p => p.category_id === 1)).toBe(true);
  });
});
```

### Integration Testing Approach

```javascript
// tests/integration/products.test.js
const { getDB } = require('../_lib/db');
const handler = require('../api/products/index');

describe('Products API Integration', () => {
  beforeAll(async () => {
    // Setup test database
    await getDB();
  });
  
  test('GET /api/products should return products', async () => {
    const req = {
      method: 'GET',
      url: '/api/products',
      query: { page: 1, limit: 10 },
      headers: {}
    };
    
    const res = {
      status: null,
      headers: {},
      body: null
    };
    
    await handler(req, res);
    
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('success');
    expect(body.data).toBeInstanceOf(Array);
  });
  
  afterAll(async () => {
    // Cleanup
    // await cleanupDatabase();
  });
});
```

### Mocking Database Connections

```javascript
// tests/__mocks__/db.js
const mockDB = {
  query: jest.fn(),
  authenticate: jest.fn(),
  transaction: jest.fn((callback) => callback({}))
};

jest.mock('../_lib/db', () => ({
  getDB: () => mockDB
}));

// Usage in tests
const { getDB } = require('../_lib/db');
const db = await getDB();
expect(db).toBe(mockDB);
```

### Testing Authentication Flows

```javascript
// tests/auth.test.js
const { verifyJWT } = require('../_middleware/auth');
const jwt = require('jsonwebtoken');

describe('Authentication Middleware', () => {
  test('should verify valid JWT', async () => {
    const token = jwt.sign({ id: 1 }, 'test-secret');
    const req = {
      headers: { authorization: `Bearer ${token}` }
    };
    
    const result = await verifyJWT(req);
    
    expect(result.success).toBe(true);
    expect(result.user).toHaveProperty('id', 1);
  });
  
  test('should reject expired JWT', async () => {
    const token = jwt.sign({ id: 1 }, 'test-secret', { expiresIn: '-1s' });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for expiry
    
    const req = {
      headers: { authorization: `Bearer ${token}` }
    };
    
    const result = await verifyJWT(req);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('expired');
  });
});
```

---

## 12. Common Pitfalls & Solutions

### Cold Start Issues and Mitigation

**Problem:** First request to a serverless function takes longer due to initialization.

**Solutions:**
1. **Keep functions small and focused**
   ```javascript
   // Good: Single purpose function
   module.exports = async (req, res) => {
     // Only handle one route
   };
   
   // Bad: Multiple routes in one function
   module.exports = async (req, res) => {
     if (req.url.includes('/products')) { /* ... */ }
     if (req.url.includes('/orders')) { /* ... */ }
   };
   ```

2. **Use warm-up functions (Vercel feature)**
   ```json
   // vercel.json
   {
     "functions": {
       "api/products/index.js": {
         "maxDuration": 10
       }
     }
   }
   ```

3. **Preload connections in global scope**
   ```javascript
   // _lib/db.js
   let dbConnection = null;
   
   const getDB = async () => {
     if (!dbConnection) {
       dbConnection = await createConnection();
     }
     return dbConnection;
   };
   ```

### Request Timeout Handling (Vercel 10s Limit)

**Problem:** Long-running operations exceed Vercel's 10-second timeout.

**Solutions:**
1. **Optimize database queries**
   ```javascript
   // Bad: N+1 queries
   const products = [];
   for (const id of productIds) {
     products.push(await Product.findByPk(id));
   }
   
   // Good: Single query with IN clause
   const products = await Product.findAll({
     where: { id: { [Op.in]: productIds } }
   });
   ```

2. **Use async operations efficiently**
   ```javascript
   // Bad: Sequential operations
   for (const item of items) {
     await processItem(item);
   }
   
   // Good: Parallel operations
   await Promise.all(items.map(item => processItem(item)));
   ```

3. **Implement timeout handling**
   ```javascript
   const withTimeout = (promise, ms) => {
     return Promise.race([
       promise,
       new Promise((_, reject) => 
         setTimeout(() => reject(new Error('Timeout')), ms)
       )
     ]);
   };
   
   module.exports = async (req, res) => {
     try {
       const result = await withTimeout(someOperation(), 9000);
       return successResponse(res, result);
     } catch (error) {
       if (error.message === 'Timeout') {
         return errorResponse(res, 'Request timeout', 504);
       }
       throw error;
     }
   };
   ```

### Memory Limitations

**Problem:** Vercel functions have memory limits (default 1024MB, can be increased).

**Solutions:**
1. **Stream large datasets instead of loading all into memory**
   ```javascript
   // Bad: Load all into memory
   const allProducts = await Product.findAll();
   const processed = allProducts.map(p => heavyProcessing(p));
   
   // Good: Stream and process in batches
   let processed = 0;
   await Product.findAll({
     // Use cursor-based pagination
     limit: 100
   }).then(products => {
     processed += processBatch(products);
   });
   ```

2. **Clean up resources**
   ```javascript
   module.exports = async (req, res) => {
     let largeData;
     try {
       largeData = await getLargeDataset();
       // Process data
       return successResponse(res, result);
     } finally {
       // Clean up
       largeData = null;
     }
   };
   ```

3. **Use connection pooling efficiently**
   ```javascript
   // Configure pool to limit connections
   const db = new Sequelize(DATABASE_URL, {
     pool: {
       max: 5,  // Limit concurrent connections
       min: 0
     }
   });
   ```

### State Management Challenges

**Problem:** Serverless functions are stateless - no in-memory state between requests.

**Solutions:**
1. **Use external storage for state**
   ```javascript
   // Store state in Redis or database
   const setState = async (key, value) => {
     await redis.set(`state:${key}`, JSON.stringify(value), 'EX', 3600);
   };
   
   const getState = async (key) => {
     const value = await redis.get(`state:${key}`);
     return value ? JSON.parse(value) : null;
   };
   ```

2. **Design stateless APIs**
   ```javascript
   // Pass all required data in request
   module.exports = async (req, res) => {
     // Bad: Rely on in-memory state
     if (!global.cart[req.user.id]) {
       global.cart[req.user.id] = [];
     }
     
     // Good: Load from database
     const cart = await Cart.findOne({
       where: { user_id: req.user.id }
     });
   };
   ```

3. **Use idempotent operations**
   ```javascript
   // Design operations that can be safely retried
   const createOrder = async (orderData) => {
     // Generate idempotency key
     const key = `order:${orderData.user_id}:${Date.now()}`;
     
     // Check if already processed
     const existing = await Order.findOne({ where: { idempotency_key: key } });
     if (existing) {
       return existing;
     }
     
     // Create new order
     return await Order.create({ ...orderData, idempotency_key: key });
   };
   ```

### Async Operation Handling

**Problem:** Not properly awaiting async operations causes race conditions.

**Solutions:**
1. **Always await async operations**
   ```javascript
   // Bad: Fire and forget
   sendEmail(user.email);
   return successResponse(res, { sent: true });
   
   // Good: Await the operation
   await sendEmail(user.email);
   return successResponse(res, { sent: true });
   ```

2. **Use Promise.all for parallel operations**
   ```javascript
   // Good: Parallel independent operations
   const [user, orders, products] = await Promise.all([
     getUser(userId),
     getOrders(userId),
     getProducts(userId)
   ]);
   ```

3. **Handle errors in Promise.all**
   ```javascript
   // Use Promise.allSettled to handle partial failures
   const results = await Promise.allSettled([
     operation1(),
     operation2(),
     operation3()
   ]);
   
   const errors = results.filter(r => r.status === 'rejected');
   if (errors.length > 0) {
     // Handle errors
   }
   ```

---

## 13. Migration Checklist

### Step-by-Step Checklist for Converting Each Route

#### Phase 1: Preparation
- [ ] Review existing Express route and identify all endpoints
- [ ] Document route parameters, query parameters, and request body structure
- [ ] Identify middleware used (auth, validation, file upload, etc.)
- [ ] List all dependencies (models, services, utilities)
- [ ] Create corresponding directory structure in `api/` folder
- [ ] Set up Vercel project configuration (`vercel.json`)

#### Phase 2: Infrastructure Setup
- [ ] Create `_lib/` folder with shared utilities
  - [ ] `db.js` - Database connection management
  - [ ] `response.js` - Response formatting helpers
  - [ ] `logger.js` - Logging utility
  - [ ] `error.js` - Error handling utilities
- [ ] Create `_middleware/` folder
  - [ ] `auth.js` - Authentication middleware
  - [ ] `cors.js` - CORS handling
  - [ ] `rateLimit.js` - Rate limiting
  - [ ] `cache.js` - Caching middleware
- [ ] Create `_services/` folder and migrate business logic
- [ ] Configure environment variables in Vercel dashboard

#### Phase 3: Route Conversion
- [ ] Convert GET endpoints (public routes)
  - [ ] Extract controller logic to service function
  - [ ] Create serverless function file
  - [ ] Implement request validation
  - [ ] Add error handling
  - [ ] Test locally
- [ ] Convert POST endpoints (authenticated routes)
  - [ ] Add authentication middleware
  - [ ] Extract controller logic to service function
  - [ ] Create serverless function file
  - [ ] Implement request validation
  - [ ] Add error handling
  - [ ] Test locally
- [ ] Convert PUT/PATCH endpoints
  - [ ] Add authentication and authorization middleware
  - [ ] Extract controller logic to service function
  - [ ] Create serverless function file
  - [ ] Implement request validation
  - [ ] Add error handling
  - [ ] Test locally
- [ ] Convert DELETE endpoints
  - [ ] Add authentication and authorization middleware
  - [ ] Extract controller logic to service function
  - [ ] Create serverless function file
  - [ ] Implement request validation
  - [ ] Add error handling
  - [ ] Test locally

#### Phase 4: File Upload Migration
- [ ] Identify all file upload endpoints
- [ ] Choose storage solution (Vercel Blob Storage or AWS S3)
- [ ] Create `_lib/storage.js` with upload/delete functions
- [ ] Update file upload routes to use new storage
- [ ] Implement file validation (type, size, virus scanning)
- [ ] Test file upload functionality
- [ ] Update database to store file URLs instead of paths

#### Phase 5: Authentication Migration
- [ ] Convert JWT verification middleware
- [ ] Convert refresh token logic
- [ ] Convert session management
- [ ] Convert permission checking
- [ ] Convert token blacklist logic
- [ ] Test all authentication flows
- [ ] Update client to handle new auth responses

#### Phase 6: Database Optimization
- [ ] Update database connection pattern for serverless
- [ ] Configure connection pooling for optimal performance
- [ ] Add connection retry logic
- [ ] Optimize database queries (avoid N+1)
- [ ] Implement transaction management
- [ ] Add query timeouts
- [ ] Test database operations under load

#### Phase 7: Testing & Validation
- [ ] Write unit tests for service functions
- [ ] Write integration tests for API endpoints
- [ ] Test error handling scenarios
- [ ] Test authentication and authorization
- [ ] Test file upload functionality
- [ ] Test database transactions
- [ ] Load test with concurrent requests
- [ ] Test rate limiting
- [ ] Test caching behavior

#### Phase 8: Deployment Preparation
- [ ] Update `vercel.json` configuration
- [ ] Set environment variables in Vercel dashboard
- [ ] Configure custom domains (if needed)
- [ ] Set up monitoring and logging
- [ ] Create deployment documentation
- [ ] Test deployment to preview environment
- [ ] Test deployment to production environment
- [ ] Monitor initial performance metrics

#### Phase 9: Client Updates
- [ ] Update API base URL in client configuration
- [ ] Update authentication flow in client
- [ ] Update file upload logic in client
- [ ] Test client-server integration
- [ ] Update error handling in client
- [ ] Update caching strategy in client
- [ ] Document API changes for client developers

#### Phase 10: Monitoring & Maintenance
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure performance monitoring
- [ ] Set up log aggregation
- [ ] Create alerts for error rates
- [ ] Monitor cold start times
- [ ] Monitor function execution times
- [ ] Monitor database connection health
- [ ] Create runbook for common issues

### Validation Criteria for Completed Conversion

**Function-Level Validation:**
- [ ] Function exports a default async function
- [ ] Function handles appropriate HTTP methods (GET, POST, PUT, DELETE)
- [ ] Request validation is implemented
- [ ] Authentication middleware is applied where needed
- [ ] Authorization checks are implemented where needed
- [ ] Error handling wraps all logic
- [ ] Response format matches API specification
- [ ] CORS headers are set correctly
- [ ] Function completes within Vercel timeout (10s)
- [ ] Database connections are properly managed
- [ ] No memory leaks or uncleaned resources

**Integration-Level Validation:**
- [ ] All routes from Express app are converted
- [ ] Authentication flow works end-to-end
- [ ] File upload functionality works correctly
- [ ] Database transactions are atomic
- [ ] Error responses are consistent
- [ ] Rate limiting prevents abuse
- [ ] Caching improves performance
- [ ] Client can successfully call all endpoints

### Testing Requirements

**Unit Tests:**
- [ ] Each service function has unit tests
- [ ] Tests cover happy path scenarios
- [ ] Tests cover error scenarios
- [ ] Tests cover edge cases
- [ ] Mock database connections appropriately
- [ ] Tests run in CI/CD pipeline
- [ ] Code coverage is > 80%

**Integration Tests:**
- [ ] Each API endpoint has integration test
- [ ] Tests use test database
- [ ] Tests verify request/response cycle
- [ ] Tests verify authentication flows
- [ ] Tests verify file uploads
- [ ] Tests verify database transactions
- [ ] Tests verify error handling
- [ ] Tests run in CI/CD pipeline

**Load Tests:**
- [ ] Test with 10 concurrent users
- [ ] Test with 100 concurrent requests
- [ ] Monitor response times
- [ ] Monitor error rates
- [ ] Verify no race conditions
- [ ] Verify database connection pool handling

### Deployment Verification Steps

**Pre-Deployment:**
- [ ] All tests pass locally
- [ ] Environment variables are configured
- [ ] Database connection works in production
- [ ] File storage is configured
- [ ] CORS origins are set correctly
- [ ] Rate limiting is configured
- [ ] Logging is set up
- [ ] Error tracking is configured

**Post-Deployment:**
- [ ] Deploy to Vercel preview environment
- [ ] Test all endpoints in preview
- [ ] Monitor logs for errors
- [ ] Verify performance metrics
- [ ] Test with production client
- [ ] Deploy to production
- [ ] Monitor production logs
- [ ] Verify all endpoints work
- [ ] Check error rates
- [ ] Monitor cold start times
- [ ] Document any issues and solutions

---

## 14. Code Examples

### Complete Example of a Converted Route

**File: `api/products/[id].js`**

```javascript
const { getProductByIdentifier } = require('../../_services/product.service');
const { successResponse, errorResponse } = require('../../_lib/response');
const { getDB } = require('../../_lib/db');

module.exports = async (req, res) => {
  let db;
  try {
    // Get database connection
    db = await getDB();
    
    // Extract product ID from query params
    const { id } = req.query;
    
    if (!id) {
      return errorResponse(res, 'Product ID is required', 400);
    }
    
    // Get product
    const product = await getProductByIdentifier(id);
    
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }
    
    return successResponse(res, product, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  } finally {
    // Connection cleanup handled by getDB singleton
  }
};
```

### Shared Utility Functions

**File: `_lib/response.js`**

```javascript
const successResponse = (res, data, statusCode = 200, meta = {}) => {
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'X-Request-ID': generateRequestId(),
      'X-Response-Time': Date.now().toString()
    },
    body: JSON.stringify({
      status: 'success',
      data,
      ...meta
    })
  };
};

const errorResponse = (res, error, statusCode = 500) => {
  const message = error.message || 'Internal server error';
  
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'X-Request-ID': generateRequestId()
    },
    body: JSON.stringify({
      status: 'error',
      message,
      ...(error.code && { code }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  };
};

const paginatedResponse = (res, data, pagination) => {
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
    },
    body: JSON.stringify({
      status: 'success',
      count: data.length,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      data
    })
  };
};

const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

module.exports = { successResponse, errorResponse, paginatedResponse, generateRequestId };
```

### Middleware Wrapper Functions

**File: `_middleware/auth.js`**

```javascript
const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

const verifyJWT = async (req) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No token provided' };
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.APP_NAME || 'Stylay',
      audience: 'user'
    });
    
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });
    
    if (!user || !user.is_active) {
      return { success: false, error: 'User not found or inactive' };
    }
    
    return { success: true, user };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return { success: false, error: 'Invalid token' };
    }
    if (error.name === 'TokenExpiredError') {
      return { success: false, error: 'Token expired' };
    }
    return { success: false, error: 'Authentication failed' };
  }
};

const protect = async (req, res, next) => {
  const result = await verifyJWT(req);
  if (!result.success) {
    return {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'error', message: result.error })
    };
  }
  
  req.user = result.user;
  return next ? next() : null;
};

const isVendor = async (req, res, next) => {
  if (!req.user) {
    return {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'error', message: 'Authentication required' })
    };
  }
  
  const hasVendorRole = req.user.roles.some(role => role.name === 'vendor');
  if (!hasVendorRole) {
    return {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'error', message: 'Vendor role required' })
    };
  }
  
  return next ? next() : null;
};

module.exports = { protect, isVendor };
```

### Database Connection Helper

**File: `_lib/db.js`**

```javascript
const { Sequelize } = require('sequelize');

let sequelize = null;
let connectionPromise = null;

const getDB = async () => {
  // Return existing connection if available
  if (sequelize) {
    return sequelize;
  }
  
  // Create new connection
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    }
  });
  
  await sequelize.authenticate();
  return sequelize;
};

const testConnection = async () => {
  const db = await getDB();
  try {
    await db.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

const closeDB = async () => {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
  }
};

module.exports = { getDB, testConnection, closeDB };
```

### Response Helper Functions

**File: `_lib/response.js` (Additional)**

```javascript
const setCacheHeaders = (res, maxAge = 300) => {
  const now = new Date();
  const expires = new Date(now.getTime() + maxAge * 1000);
  
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  res.setHeader('Expires', expires.toUTCString());
  res.setHeader('ETag', generateETag(req.url || ''));
};

const generateETag = (url) => {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(url).digest('hex');
};

const setCORSHeaders = (req, res) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');
  const origin = req.headers['origin'];
  
  const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-ID, X-Request-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID, X-Request-ID',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      }
    };
  }
  
  return null;
};

const withErrorHandling = (handler) => {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('Error in route:', error);
      
      return {
        status: error.statusCode || 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
        },
        body: JSON.stringify({
          status: 'error',
          message: error.message || 'Internal server error',
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        })
      };
    }
  };
};

module.exports = { setCacheHeaders, generateETag, setCORSHeaders, withErrorHandling };
```

---

## Additional Resources

### Vercel Configuration Example

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "api/**/*.js",
      "dest": "/api"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret",
    "CORS_ORIGIN": "@cors-origin",
    "REDIS_URL": "@redis-url",
    "BLOB_READ_WRITE_TOKEN": "@blob-token"
  },
  "functions": {
    "api/products/index.js": {
      "maxDuration": 10
    }
  }
}
```

### Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DB_DIALECT=postgres

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://yourdomain.com,https://vercel.app

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=your-blob-token

# Redis (for caching and rate limiting)
REDIS_URL=redis://user:password@host:6379

# Application
NODE_ENV=production
APP_NAME=Stylay
```

### Client API Updates Required

**Update base URL:**
```javascript
// Before: const API_BASE_URL = 'http://localhost:5000/api/v1';
// After: const API_BASE_URL = 'https://your-api.vercel.app/api';
```

**Update authentication headers:**
```javascript
// Ensure Authorization header is sent with Bearer token
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

---

## Conclusion

This refactoring guide provides comprehensive instructions for converting the MarketHub Express.js application to Vercel serverless functions. Key takeaways:

1. **Structure**: Organize routes by feature in `api/` directory with clear naming conventions
2. **Middleware**: Adapt Express middleware to work with Vercel's request/response model
3. **Services**: Extract business logic from controllers into reusable service functions
4. **Database**: Use connection pooling and proper lifecycle management for serverless
5. **File Upload**: Replace `express-fileupload` with Vercel Blob Storage or AWS S3
6. **Authentication**: Implement JWT verification and session management for stateless functions
7. **Error Handling**: Use standardized error responses and proper logging
8. **Testing**: Implement comprehensive unit, integration, and load testing
9. **Deployment**: Configure Vercel properly with environment variables and monitoring

Follow the migration checklist systematically to ensure all aspects are covered. Test thoroughly at each phase before proceeding to the next.
