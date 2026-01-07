# MarketHub: Vercel Serverless Migration Roadmap

## Executive Summary

This document provides a comprehensive architectural roadmap for migrating the MarketHub e-commerce platform from its current Express.js + PM2 + Docker setup to Vercel Serverless Functions. The migration addresses critical incompatibilities while maintaining business continuity and improving scalability.

**Current Stack:**
- Backend: Express.js 4.21.2 with PM2 process management
- Database: MySQL with Sequelize ORM (connection pooling)
- Authentication: JWT with refresh tokens, token blacklisting
- Storage: Local disk + AWS S3 option
- Background Jobs: node-cron for scheduled tasks
- Caching: Redis (optional)
- Frontend: React + Vite (already on Vercel)

**Target Stack:**
- Backend: Vercel Serverless Functions (Node.js)
- Database: PostgreSQL with connection-per-request pattern
- Authentication: Stateless JWT with serverless-compatible refresh tokens
- Storage: AWS S3 (primary) with CDN
- Background Jobs: Vercel Cron Jobs + Queue system
- Caching: Serverless-compatible caching (Upstash Redis or Vercel KV)
- Frontend: React + Vite (remains on Vercel)

---

## 1. High-Level Migration Architecture

### 1.1 Overall System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend<br/>Vercel Edge]
    end

    subgraph "API Layer - Vercel Serverless"
        B1[Auth Functions]
        B2[Product Functions]
        B3[Order Functions]
        B4[User Functions]
        B5[Admin Functions]
        B6[Vendor Functions]
    end

    subgraph "Background Processing"
        C1[Vercel Cron Jobs]
        C2[Queue System<br/>SQS/Upstash]
    end

    subgraph "Data Layer"
        D1[(PostgreSQL<br/>Neon/Supabase)]
        D2[(Redis Cache<br/>Upstash/Vercel KV)]
    end

    subgraph "Storage Layer"
        E1[AWS S3<br/>Primary Storage]
        E2[CloudFront CDN<br/>Global Distribution]
    end

    subgraph "External Services"
        F1[Paystack<br/>Payments]
        F2[Email Service<br/>SendGrid/SES]
        F3[SMS Service]
    end

    A --> B1
    A --> B2
    A --> B3
    A --> B4
    A --> B5
    A --> B6

    B1 --> D1
    B2 --> D1
    B3 --> D1
    B4 --> D1
    B5 --> D1
    B6 --> D1

    B1 --> D2
    B2 --> D2
    B3 --> D2
    B4 --> D2

    B1 --> E1
    B2 --> E1
    B4 --> E1

    C1 --> D1
    C1 --> D2
    C2 --> C1

    B3 --> F1
    B1 --> F2
    B5 --> F3

    E1 --> E2
```

### 1.2 Component Mapping

| Current Component | Target Component | Migration Strategy |
|-----------------|------------------|-------------------|
| Express.js App | Vercel Serverless Functions | Convert routes to individual functions |
| PM2 Process Manager | Vercel's Serverless Execution | Remove PM2, rely on Vercel's scaling |
| MySQL + Connection Pooling | PostgreSQL + Connection-per-request | Migrate to Neon/Supabase, implement singleton pattern |
| Local Disk Storage | AWS S3 + CloudFront CDN | Migrate all files, update upload logic |
| node-cron Jobs | Vercel Cron Jobs | Convert cron schedules to Vercel format |
| Redis (optional) | Upstash Redis / Vercel KV | Use serverless-compatible Redis |
| Sequelize Models | Sequelize (PostgreSQL dialect) | Update dialect, maintain models |
| JWT + Refresh Tokens | Stateless JWT + Database-backed refresh | Keep JWT, move refresh tokens to DB |
| File Upload (express-fileupload) | AWS SDK multipart upload | Replace with S3 direct upload |
| Email (nodemailer) | SendGrid / AWS SES | Use API-based email service |

### 1.3 Data Flow Diagrams

#### 1.3.1 Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant VercelFunction
    participant Database
    participant Cache
    participant EmailService

    Client->>VercelFunction: POST /api/auth/login
    VercelFunction->>Database: Query user
    Database-->>VercelFunction: User data
    VercelFunction->>VercelFunction: Verify password
    VercelFunction->>VercelFunction: Generate JWT access token
    VercelFunction->>Database: Store refresh token
    VercelFunction->>Cache: Cache user permissions (5min TTL)
    VercelFunction-->>Client: { access_token, refresh_token, session_id }
    VercelFunction->>EmailService: Send login notification (optional)

    Note over Client,EmailService: Subsequent requests use access token
    Client->>VercelFunction: GET /api/products (with access_token)
    VercelFunction->>Cache: Check permissions
    Cache-->>VercelFunction: Permissions (cached)
    VercelFunction->>Database: Query products
    Database-->>VercelFunction: Products data
    VercelFunction-->>Client: Products data

    Note over Client,EmailService: Token refresh flow
    Client->>VercelFunction: POST /api/auth/refresh
    VercelFunction->>Database: Validate refresh token
    Database-->>VercelFunction: Token valid
    VercelFunction->>VercelFunction: Generate new access token
    VercelFunction->>Database: Update refresh token (rotation)
    VercelFunction-->>Client: { new_access_token, new_refresh_token }
```

#### 1.3.2 Product Upload Flow

```mermaid
sequenceDiagram
    participant Admin
    participant VercelFunction
    participant S3
    participant CloudFront
    participant Database

    Admin->>VercelFunction: POST /api/products (with images)
    VercelFunction->>S3: Generate presigned URLs
    S3-->>VercelFunction: Presigned URLs
    VercelFunction-->>Admin: { upload_urls }
    Admin->>S3: Upload images directly (parallel)
    S3->>CloudFront: Distribute to edge
    Admin->>VercelFunction: POST /api/products/confirm (with S3 keys)
    VercelFunction->>Database: Create product record
    VercelFunction->>Database: Create image records
    Database-->>VercelFunction: Product created
    VercelFunction-->>Admin: Product created with CDN URLs
```

#### 1.3.3 Order Processing Flow

```mermaid
sequenceDiagram
    participant Customer
    participant VercelFunction
    participant Database
    participant Cache
    participant Paystack
    participant EmailService
    participant CronJob

    Customer->>VercelFunction: POST /api/orders
    VercelFunction->>Cache: Validate cart
    Cache-->>VercelFunction: Cart valid
    VercelFunction->>Database: Create order (pending)
    VercelFunction->>Paystack: Initialize payment
    Paystack-->>VercelFunction: Payment URL
    VercelFunction-->>Customer: Redirect to payment

    Customer->>Paystack: Complete payment
    Paystack->>VercelFunction: Webhook: payment.success
    VercelFunction->>Database: Update order (paid)
    VercelFunction->>Database: Update inventory
    VercelFunction->>Cache: Invalidate product cache
    VercelFunction->>EmailService: Send confirmation
    VercelFunction->>EmailService: Send vendor notification

    Note over Customer,CronJob: Background processing
    CronJob->>Database: Query orders for fulfillment
    CronJob->>EmailService: Send shipping notifications
```

### 1.4 Service Dependencies

```mermaid
graph LR
    A[Auth Functions] --> B[(PostgreSQL)]
    A --> C[(Upstash Redis)]
    A --> D[Email Service]

    E[Product Functions] --> B
    E --> C
    E --> F[AWS S3]
    E --> G[CloudFront CDN]

    H[Order Functions] --> B
    H --> C
    H --> I[Paystack API]
    H --> D

    J[Admin Functions] --> B
    J --> C
    J --> F

    K[Cron Jobs] --> B
    K --> C
    K --> D
```

---

## 2. Detailed Migration Phases

### Phase 1: Database Migration Strategy (MySQL → PostgreSQL)

**Objective:** Migrate from MySQL to PostgreSQL with connection-per-request pattern optimized for serverless.

**Duration:** 2-3 weeks

#### 1.1 Infrastructure Changes

**Database Provider Selection:**

| Provider | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Neon** | Serverless-native, auto-scaling, branching, generous free tier | Newer ecosystem | **PRIMARY CHOICE** |
| Supabase | Full-featured, real-time, good documentation | Connection limits on free tier | ALTERNATIVE |
| PlanetScale | MySQL-compatible, serverless | Not PostgreSQL | NOT SUITABLE |

**Selected Provider: Neon Database**

**Reasons:**
- Built for serverless from the ground up
- Connection pooling with pgBouncer included
- Auto-scaling based on demand
- Branching for development/testing
- Generous free tier (512MB storage, 3 compute hours)
- Vercel integration available

#### 1.2 Database Schema Migration

**Migration Steps:**

1. **Export MySQL Schema**
   ```bash
   # Export schema and data
   mysqldump -u root -p stylay_db > mysql_dump.sql
   ```

2. **Convert to PostgreSQL**
   - Use `pgloader` or manual conversion
   - Update data types:
     - `TINYINT` → `SMALLINT`
     - `DATETIME` → `TIMESTAMP`
     - `TEXT` → `TEXT` (no changes needed)
     - `ENUM` → `TEXT` with check constraint
   - Update auto-increment to `SERIAL` or `BIGSERIAL`
   - Update foreign key constraints syntax

3. **Create Neon Database**
   ```bash
   # Using Neon CLI
   npx neonctl create-database markethub
   ```

4. **Import to PostgreSQL**
   ```bash
   psql -h xxx.neon.tech -U markethub_owner -d markethub < postgres_dump.sql
   ```

5. **Update Sequelize Configuration**
   ```javascript
   // server/config/database.js (new)
   const { Sequelize } = require('sequelize');

   const sequelize = new Sequelize(process.env.DATABASE_URL, {
     dialect: 'postgres',
     dialectModule: require('pg'),
     logging: process.env.NODE_ENV === 'development',
     define: {
       timestamps: true,
       underscored: true,
       createdAt: 'created_at',
       updatedAt: 'updated_at'
     },
     pool: {
       max: 1,  // Serverless: single connection per function
       min: 0,
       acquire: 30000,
       idle: 10000
     },
     dialectOptions: {
       ssl: {
         require: true,
         rejectUnauthorized: false
       }
     }
   });
   ```

#### 1.3 Connection-per-Request Pattern

**Implementation:**

```javascript
// lib/db.js (singleton pattern)
let sequelizeInstance = null;

function getSequelize() {
  if (!sequelizeInstance) {
    const { Sequelize } = require('sequelize');
    sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectModule: require('pg'),
      logging: false,
      pool: {
        max: 1,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }
  return sequelizeInstance;
}

async function closeConnection() {
  if (sequelizeInstance) {
    await sequelizeInstance.close();
    sequelizeInstance = null;
  }
}

module.exports = { getSequelize, closeConnection };
```

**Usage in Serverless Functions:**

```javascript
// api/auth/login.js
import { getSequelize, closeConnection } from '../../lib/db.js';
import { User } from '../../models/index.js';

export default async function handler(req, res) {
  const sequelize = getSequelize();

  try {
    // Your logic here
    const user = await User.findOne({ where: { email: req.body.email } });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await closeConnection();
  }
}
```

#### 1.4 Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | HIGH | Full backup, test migration on staging |
| Schema incompatibilities | MEDIUM | Use pgloader, manual review of converted schema |
| Performance regression | MEDIUM | Benchmark queries, add indexes as needed |
| Connection pool exhaustion | HIGH | Implement singleton pattern, monitor connections |
| Downtime | MEDIUM | Plan migration during low-traffic period |

#### 1.5 Rollback Procedure

1. **Before Migration:**
   - Create full MySQL backup
   - Document current database state
   - Prepare rollback script

2. **Rollback Steps:**
   ```bash
   # Stop new deployments
   # Switch traffic back to MySQL
   # Restore from backup if needed
   # Verify data integrity
   ```

---

### Phase 2: Storage Migration (Local → Cloud Storage)

**Objective:** Migrate all local file storage to AWS S3 with CDN integration.

**Duration:** 1-2 weeks

#### 2.1 Infrastructure Changes

**Storage Architecture:**

```
AWS S3 Buckets:
- markethub-products (product images)
- markethub-avatars (user avatars)
- markethub-journals (journal images)
- markethub-support (support attachments)
- markethub-vendor (vendor assets)

CloudFront Distribution:
- markethub-cdn (CDN for all S3 buckets)
```

**S3 Configuration:**

```javascript
// lib/s3.js
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export async function uploadFile(buffer, key, contentType, bucket) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType
  });

  await s3Client.send(command);
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function getFileUrl(key, bucket) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}
```

#### 2.2 File Migration Strategy

**Migration Steps:**

1. **Audit Existing Files**
   ```javascript
   // scripts/migrate-files.js
   const fs = require('fs');
   const path = require('path');
   const { uploadFile } = require('../lib/s3');

   const localDirs = [
     'public/Upload/product-images',
     'public/Upload/user-avatars',
     'public/Upload/journal-images',
     'public/Upload/support-attachments',
     'public/Upload/vendor-assets'
   ];

   async function migrateFiles() {
     for (const dir of localDirs) {
       const files = fs.readdirSync(dir);
       for (const file of files) {
         const filePath = path.join(dir, file);
         const buffer = fs.readFileSync(filePath);
         const key = file;

         const bucket = dir.split('/').pop();
         const url = await uploadFile(buffer, key, 'image/jpeg', `markethub-${bucket}`);

         console.log(`Migrated: ${file} → ${url}`);
       }
     }
   }
   ```

2. **Update Database Records**
   ```sql
   UPDATE product_images
   SET image_url = REPLACE(image_url, '/uploads/product-images/', 'https://cdn.markethub.com/products/');

   UPDATE users
   SET profile_image = REPLACE(profile_image, '/uploads/user-avatars/', 'https://cdn.markethub.com/avatars/');
   ```

3. **Update Application Code**
   - Replace local file paths with S3 URLs
   - Update upload middleware to use S3
   - Remove local file serving middleware

#### 2.3 Upload Handling in Serverless

**Direct S3 Upload (Recommended):**

```javascript
// api/products/upload.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileName, fileType } = req.body;
  const key = `products/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: 'markethub-products',
    Key: key,
    ContentType: fileType
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  res.status(200).json({
    uploadUrl,
    key,
    publicUrl: `https://cdn.markethub.com/products/${key}`
  });
}
```

**Client-Side Upload:**

```javascript
// Client upload logic
async function uploadImage(file) {
  const response = await fetch('/api/products/upload', {
    method: 'POST',
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type
    })
  });

  const { uploadUrl, publicUrl } = await response.json();

  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  });

  return publicUrl;
}
```

#### 2.4 CDN Integration

**CloudFront Configuration:**

```javascript
// vercel.json
{
  "rewrites": [
    {
      "source": "/cdn/:path*",
      "destination": "https://cdn.markethub.com/:path*"
    }
  ]
}
```

**Cache Headers:**

```javascript
// S3 upload with cache headers
const command = new PutObjectCommand({
  Bucket: bucket,
  Key: key,
  Body: buffer,
  ContentType: contentType,
  CacheControl: 'public, max-age=31536000, immutable' // 1 year
});
```

#### 2.5 Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| File corruption during migration | HIGH | Verify checksums, keep backups |
| Broken image links | MEDIUM | Update database records, test thoroughly |
| S3 cost overruns | LOW | Set up billing alerts, use lifecycle policies |
| Upload failures | MEDIUM | Implement retry logic, error handling |
| CDN cache issues | LOW | Configure cache invalidation, test propagation |

#### 2.6 Rollback Procedure

1. **Keep local files as backup**
2. **Database backup before URL updates**
3. **Quick rollback:**
   ```sql
   -- Revert URLs
   UPDATE product_images
   SET image_url = REPLACE(image_url, 'https://cdn.markethub.com/', '/uploads/');

   -- Switch back to local storage
   UPDATE storage SET driver = 'local';
   ```

---

### Phase 3: API Routes Conversion (Express → Vercel Serverless Functions)

**Objective:** Convert all Express routes to Vercel Serverless Functions.

**Duration:** 3-4 weeks

#### 3.1 Vercel Serverless Function Structure

**Proposed Directory Structure:**

```
api/
├── auth/
│   ├── login.js
│   ├── register.js
│   ├── logout.js
│   ├── refresh.js
│   ├── verify-email.js
│   └── forgot-password.js
├── products/
│   ├── index.js (list, create)
│   ├── [id].js (get, update, delete)
│   ├── upload.js
│   └── search.js
├── orders/
│   ├── index.js
│   ├── [id].js
│   └── webhook.js
├── users/
│   ├── index.js
│   ├── me.js
│   └── [id].js
├── vendors/
│   ├── index.js
│   ├── [id].js
│   └── apply.js
├── admin/
│   ├── dashboard.js
│   ├── users.js
│   └── vendors.js
├── middleware/
│   ├── auth.js
│   ├── permissions.js
│   └── validation.js
├── lib/
│   ├── db.js
│   ├── s3.js
│   ├── cache.js
│   └── email.js
└── models/
    └── index.js
```

#### 3.2 Function Organization Strategy

**By Feature (Recommended):**

- **Pros:** Logical grouping, easier to maintain, clear boundaries
- **Cons:** May have duplicate code across features

**By HTTP Method:**

- **Pros:** Consistent patterns, easier to understand
- **Cons:** More files, harder to navigate

**Decision:** Use **by feature** organization with clear separation of concerns.

#### 3.3 Route Conversion Pattern

**Express Route (Current):**

```javascript
// server/src/routes/auth.route.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;
```

**Vercel Serverless Function (Target):**

```javascript
// api/auth/login.js
import { getSequelize, closeConnection } from '../../lib/db.js';
import { User } from '../../models/index.js';
import { generateTokens } from '../../lib/auth.js';
import { validateLogin } from '../../middleware/validation.js';

export default async function handler(req, res) {
  // Validate input
  const validation = validateLogin(req.body);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const sequelize = getSequelize();

  try {
    // Find user
    const user = await User.findOne({
      where: { email: req.body.email },
      include: ['roles']
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const tokens = await generateTokens(user);

    res.status(200).json({
      user: user.toJSON(),
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await closeConnection();
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};
```

#### 3.4 Middleware Adaptation

**Authentication Middleware:**

```javascript
// middleware/auth.js
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      include: ['roles', 'permissions']
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Wrapper for serverless functions
export function withAuth(handler) {
  return async (req, res) => {
    const authResult = await protect(req, res, () => {});
    if (authResult) {
      return authResult; // Error response
    }
    return handler(req, res);
  };
}
```

**Usage:**

```javascript
// api/users/me.js
import { withAuth } from '../../middleware/auth.js';

export default withAuth(async function handler(req, res) {
  res.status(200).json({ user: req.user });
});
```

#### 3.5 Shared Code Organization

**lib/ Directory:**

```
lib/
├── db.js (database connection)
├── auth.js (JWT, token generation)
├── cache.js (Redis/Upstash)
├── email.js (email service)
├── s3.js (S3 operations)
├── logger.js (logging)
└── utils.js (helper functions)
```

**models/ Directory:**

```javascript
// models/index.js
import { Sequelize } from 'sequelize';
import { getSequelize } from '../lib/db.js';

// Import all models
import User from './user.model.js';
import Product from './product.model.js';
import Order from './order.model.js';
// ... other models

// Initialize associations
User.hasMany(Order);
Order.belongsTo(User);
// ... other associations

export {
  User,
  Product,
  Order
  // ... other models
};
```

#### 3.6 Configuration Files

**vercel.json:**

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
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret",
    "AWS_ACCESS_KEY_ID": "@aws-access-key-id",
    "AWS_SECRET_ACCESS_KEY": "@aws-secret-access-key",
    "REDIS_URL": "@redis-url"
  }
}
```

**package.json:**

```json
{
  "name": "markethub-api",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vercel dev",
    "build": "vercel build",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.0.0",
    "@aws-sdk/s3-request-presigner": "^3.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "pg": "^8.11.0",
    "sequelize": "^6.35.0",
    "ioredis": "^5.3.0",
    "nodemailer": "^6.9.0"
  }
}
```

#### 3.7 Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Route logic errors | HIGH | Comprehensive testing, gradual rollout |
| Middleware incompatibility | MEDIUM | Test each middleware independently |
| Performance degradation | MEDIUM | Monitor response times, optimize queries |
| Breaking changes for clients | HIGH | Maintain API compatibility, version if needed |
| Cold start latency | MEDIUM | Optimize function size, use edge functions |

#### 3.8 Rollback Procedure

1. **Keep Express server running in parallel**
2. **Use feature flags to route traffic**
3. **Quick rollback:**
   ```bash
   # Switch traffic back to Express
   vercel alias set express-deployment markethub-api
   ```

---

### Phase 4: Background Jobs Migration (node-cron → Vercel Cron Jobs)

**Objective:** Migrate scheduled tasks to Vercel Cron Jobs with queue system for async tasks.

**Duration:** 1-2 weeks

#### 4.1 Vercel Cron Jobs Configuration

**Current Cron Jobs:**

```javascript
// server/src/jobs/cleanup.job.js
cron.schedule('0 * * * *', async () => {
  // Hourly cleanup
  await cleanupService.cleanupExpiredTokens();
});

cron.schedule('0 2 * * *', async () => {
  // Daily comprehensive cleanup
  await cleanupService.runComprehensiveCleanup(30);
});
```

**Vercel Cron Jobs (vercel.json):**

```json
{
  "crons": [
    {
      "path": "/api/cron/hourly-cleanup",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/daily-cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/inventory-check",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/vendor-payouts",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

#### 4.2 Cron Job Implementation

**Hourly Cleanup:**

```javascript
// api/cron/hourly-cleanup.js
import { getSequelize, closeConnection } from '../../lib/db.js';
import { RefreshToken, TokenBlacklist, UserSession } from '../../models/index.js';

export default async function handler(req, res) {
  // Security: Verify cron secret
  const authHeader = req.headers['x-vercel-cron-secret'];
  if (authHeader !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sequelize = getSequelize();

  try {
    // Cleanup expired refresh tokens
    const expiredTokens = await RefreshToken.destroy({
      where: {
        expires_at: {
          [Op.lt]: new Date()
        }
      }
    });

    // Cleanup expired blacklist entries
    const expiredBlacklist = await TokenBlacklist.destroy({
      where: {
        expires_at: {
          [Op.lt]: new Date()
        }
      }
    });

    // Cleanup expired sessions
    const expiredSessions = await UserSession.destroy({
      where: {
        expires_at: {
          [Op.lt]: new Date()
        }
      }
    });

    console.log(`Hourly cleanup completed: ${expiredTokens} tokens, ${expiredBlacklist} blacklist entries, ${expiredSessions} sessions`);

    res.status(200).json({
      success: true,
      expiredTokens,
      expiredBlacklist,
      expiredSessions
    });
  } catch (error) {
    console.error('Hourly cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  } finally {
    await closeConnection();
  }
}
```

**Daily Comprehensive Cleanup:**

```javascript
// api/cron/daily-cleanup.js
import { getSequelize, closeConnection } from '../../lib/db.js';
import { Op } from 'sequelize';
import { RefreshToken, TokenBlacklist, UserSession, UserProductView, SuggestedProduct } from '../../models/index.js';

export default async function handler(req, res) {
  const authHeader = req.headers['x-vercel-cron-secret'];
  if (authHeader !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sequelize = getSequelize();

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Cleanup old recently viewed products
    const oldViews = await UserProductView.destroy({
      where: {
        viewed_at: {
          [Op.lt]: thirtyDaysAgo
        }
      }
    });

    // Cleanup old suggested products
    const oldSuggestions = await SuggestedProduct.destroy({
      where: {
        created_at: {
          [Op.lt]: thirtyDaysAgo
        }
      }
    });

    // Cleanup orphaned records
    // ... additional cleanup logic

    console.log(`Daily cleanup completed: ${oldViews} views, ${oldSuggestions} suggestions`);

    res.status(200).json({
      success: true,
      oldViews,
      oldSuggestions
    });
  } catch (error) {
    console.error('Daily cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  } finally {
    await closeConnection();
  }
}
```

#### 4.3 Queue System for Async Tasks

**Queue Provider Options:**

| Provider | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **AWS SQS** | Reliable, scalable, integrates with AWS | More complex setup | **PRIMARY CHOICE** |
| Upstash QStash | Serverless-native, simple | Newer, smaller ecosystem | ALTERNATIVE |
| Redis Queue | Simple, familiar | Not serverless-native | NOT SUITABLE |

**Selected: AWS SQS**

**Queue Implementation:**

```javascript
// lib/queue.js
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const QUEUE_URL = process.env.SQS_QUEUE_URL;

export async function enqueueJob(jobType, payload) {
  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({
      type: jobType,
      payload,
      timestamp: new Date().toISOString()
    })
  });

  await sqsClient.send(command);
  console.log(`Enqueued job: ${jobType}`);
}

export async function processJobs() {
  const command = new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20
  });

  const response = await sqsClient.send(command);

  if (response.Messages) {
    for (const message of response.Messages) {
      const { type, payload } = JSON.parse(message.Body);

      try {
        await processJob(type, payload);

        // Delete processed message
        const deleteCommand = new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle
        });
        await sqsClient.send(deleteCommand);
      } catch (error) {
        console.error(`Job processing failed: ${type}`, error);
        // Message stays in queue for retry
      }
    }
  }
}

async function processJob(type, payload) {
  switch (type) {
    case 'send-email':
      await sendEmail(payload);
      break;
    case 'update-inventory':
      await updateInventory(payload);
      break;
    case 'generate-report':
      await generateReport(payload);
      break;
    default:
      console.error(`Unknown job type: ${type}`);
  }
}
```

**Worker Function:**

```javascript
// api/worker/index.js
import { processJobs } from '../../lib/queue.js';

export default async function handler(req, res) {
  const authHeader = req.headers['x-vercel-cron-secret'];
  if (authHeader !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await processJobs();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Worker error:', error);
    res.status(500).json({ error: 'Worker failed' });
  }
}
```

**Cron Schedule for Worker:**

```json
{
  "crons": [
    {
      "path": "/api/worker",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

#### 4.4 Job Failure Handling

**Retry Strategy:**

```javascript
// lib/queue.js
export async function enqueueJob(jobType, payload, maxRetries = 3) {
  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({
      type: jobType,
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0,
      maxRetries
    }),
    DelaySeconds: 0,
    MessageAttributes: {
      MaxRetries: {
        DataType: 'Number',
        StringValue: maxRetries.toString()
      }
    }
  });

  await sqsClient.send(command);
}
```

**Dead Letter Queue (DLQ):**

```javascript
// Create DLQ for failed jobs
const DLQ_URL = process.env.SQS_DLQ_URL;

async function moveToDLQ(message, error) {
  const command = new SendMessageCommand({
    QueueUrl: DLQ_URL,
    MessageBody: JSON.stringify({
      originalMessage: message,
      error: error.message,
      failedAt: new Date().toISOString()
    })
  });

  await sqsClient.send(command);
}
```

#### 4.5 Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cron job failures | HIGH | Implement DLQ, monitoring, alerts |
| Queue processing delays | MEDIUM | Scale workers, monitor queue depth |
| Job duplication | LOW | Use idempotent operations |
| Resource exhaustion | MEDIUM | Set limits, monitor usage |

#### 4.6 Rollback Procedure

1. **Disable Vercel cron jobs**
2. **Re-enable node-cron on Express server**
3. **Process any queued jobs manually**

---

### Phase 5: Caching Strategy (Redis → Serverless-compatible Alternatives)

**Objective:** Implement serverless-compatible caching strategy.

**Duration:** 1 week

#### 5.1 Cache Provider Selection

| Provider | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Upstash Redis** | Serverless-native, fast, generous free tier | Newer | **PRIMARY CHOICE** |
| Vercel KV | Built-in, simple | Limited features | ALTERNATIVE |
| Cloudflare KV | Global, fast | Not Redis-compatible | NOT SUITABLE |

**Selected: Upstash Redis**

**Reasons:**
- Serverless-native, auto-scaling
- Redis-compatible API
- Edge caching
- Generous free tier (10K commands/day)
- Vercel integration available

#### 5.2 Cache Implementation

**Cache Library:**

```javascript
// lib/cache.js
import { Redis } from 'ioredis';

let redisClient = null;

function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      retryStrategy: (times) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 50, 500);
      }
    });

    redisClient.on('error', (error) => {
      console.error('Redis error:', error);
    });
  }
  return redisClient;
}

export async function get(key) {
  const redis = getRedisClient();
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function set(key, value, ttl = 300) {
  const redis = getRedisClient();
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

export async function del(key) {
  const redis = getRedisClient();
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

export async function invalidatePattern(pattern) {
  const redis = getRedisClient();
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return keys.length;
  } catch (error) {
    console.error('Cache invalidate error:', error);
    return 0;
  }
}
```

#### 5.3 Cache Strategies

**1. Response Caching:**

```javascript
// middleware/cache.js
import { get, set } from '../lib/cache.js';

export function cacheResponse(ttl = 300) {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `response:${req.originalUrl}:${req.user?.id || 'anonymous'}`;

    // Try cache
    const cached = await get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Override res.json to cache response
    const originalJson = res.json;
    res.json = function (data) {
      set(cacheKey, data, ttl);
      return originalJson.call(this, data);
    };

    next();
  };
}
```

**2. Query Caching:**

```javascript
// lib/query-cache.js
import { get, set, invalidatePattern } from './cache.js';

export async function cachedQuery(model, options, ttl = 300) {
  const cacheKey = `query:${model.name}:${JSON.stringify(options)}`;

  const cached = await get(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await model.findAll(options);
  await set(cacheKey, result, ttl);
  return result;
}

export async function invalidateModelCache(modelName) {
  return invalidatePattern(`query:${modelName}:*`);
}
```

**3. Session Caching:**

```javascript
// lib/session-cache.js
import { get, set, del } from './cache.js';

export async function getSession(sessionId) {
  return get(`session:${sessionId}`);
}

export async function setSession(sessionId, sessionData, ttl = 3600) {
  return set(`session:${sessionId}`, sessionData, ttl);
}

export async function deleteSession(sessionId) {
  return del(`session:${sessionId}`);
}
```

#### 5.4 Cache Invalidation Strategy

**Automatic Invalidation:**

```javascript
// After database updates
export async function invalidateProductCache(productId) {
  await invalidatePattern(`query:Product:*`);
  await invalidatePattern(`response:/api/products*`);
  await invalidatePattern(`response:/api/products/${productId}*`);
}

// Usage in product update
await product.update(updateData);
await invalidateProductCache(product.id);
```

**Time-Based Invalidation:**

```javascript
// Set TTL based on data volatility
const CACHE_TTL = {
  STATIC: 3600,      // 1 hour - rarely changes
  DYNAMIC: 300,      // 5 minutes - changes frequently
  REALTIME: 60       // 1 minute - very dynamic
};
```

#### 5.5 Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cache inconsistency | MEDIUM | Proper invalidation, TTL strategy |
| Cache stampede | LOW | Use cache locking, backoff |
| Redis connection issues | MEDIUM | Fallback to no cache, graceful degradation |
| Increased costs | LOW | Monitor usage, set limits |

#### 5.6 Rollback Procedure

1. **Disable cache middleware**
2. **Clear cache**
3. **Continue without caching**

---

### Phase 6: Testing & Deployment Strategy

**Objective:** Comprehensive testing and phased deployment.

**Duration:** 2-3 weeks

#### 6.1 Testing Strategy

**1. Unit Testing:**

```javascript
// tests/auth.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { generateTokens, verifyToken } from '../lib/auth.js';

describe('Auth Functions', () => {
  it('should generate valid tokens', async () => {
    const user = { id: 1, email: 'test@example.com' };
    const tokens = await generateTokens(user);

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('should verify valid tokens', async () => {
    const user = { id: 1, email: 'test@example.com' };
    const { accessToken } = await generateTokens(user);

    const decoded = verifyToken(accessToken);
    expect(decoded.id).toBe(1);
  });
});
```

**2. Integration Testing:**

```javascript
// tests/api/auth.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { handler as loginHandler } from '../api/auth/login.js';

describe('Auth API', () => {
  let server;

  beforeAll(() => {
    server = createServer((req, res) => {
      loginHandler(req, res);
    });
  });

  afterAll(() => {
    server.close();
  });

  it('should login with valid credentials', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.accessToken).toBeDefined();
  });
});
```

**3. End-to-End Testing:**

```javascript
// tests/e2e/order-flow.test.js
import { describe, it, expect } from 'vitest';

describe('Order Flow E2E', () => {
  it('should complete full order flow', async () => {
    // 1. Login
    const loginRes = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', password: 'password' })
    });
    const { accessToken } = await loginRes.json();

    // 2. Add to cart
    await fetch('/api/cart', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ productId: 1, quantity: 2 })
    });

    // 3. Create order
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ shippingAddress: {...} })
    });

    expect(orderRes.status).toBe(201);
    const order = await orderRes.json();
    expect(order.id).toBeDefined();
  });
});
```

#### 6.2 Deployment Strategy

**1. Canary Deployment:**

```bash
# Deploy to canary environment
vercel deploy --prebuilt --target canary

# Test canary
# If successful, promote to production
vercel alias set canary-deployment markethub-api
```

**2. Blue-Green Deployment:**

```bash
# Deploy to green environment
vercel deploy --prebuilt --target green

# Switch traffic
vercel alias set green-deployment markethub-api

# Keep blue as rollback
```

**3. Feature Flags:**

```javascript
// lib/features.js
const FEATURES = {
  SERVERLESS_API: process.env.FEATURE_SERVERLESS_API === 'true',
  NEW_PAYMENT_FLOW: process.env.FEATURE_NEW_PAYMENT_FLOW === 'true'
};

export function isFeatureEnabled(feature) {
  return FEATURES[feature] || false;
}
```

#### 6.3 Monitoring Setup

**1. Vercel Analytics:**

```javascript
// lib/analytics.js
export function trackEvent(eventName, properties) {
  if (typeof window !== 'undefined') {
    // Client-side tracking
    window.va?.track(eventName, properties);
  } else {
    // Server-side tracking
    console.log(`[Analytics] ${eventName}:`, properties);
  }
}
```

**2. Error Tracking:**

```javascript
// lib/error-tracking.js
export function trackError(error, context) {
  console.error('[Error Tracking]', {
    message: error.message,
    stack: error.stack,
    context
  });

  // Send to error tracking service (Sentry, etc.)
}
```

**3. Performance Monitoring:**

```javascript
// middleware/performance.js
export function trackPerformance(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Performance] ${req.method} ${req.path} - ${duration}ms`);

    // Track slow requests
    if (duration > 1000) {
      console.warn(`[Slow Request] ${req.method} ${req.path} - ${duration}ms`);
    }
  });

  next();
}
```

#### 6.4 Rollback Plan

**1. Pre-Migration Checklist:**
- [ ] Full database backup
- [ ] All tests passing
- [ ] Monitoring configured
- [ ] Rollback procedure documented
- [ ] Team notified

**2. Rollback Triggers:**
- Error rate > 5%
- Response time > 2s (p95)
- Database connection failures
- Critical functionality broken

**3. Rollback Steps:**
```bash
# 1. Stop canary deployment
vercel alias remove markethub-api canary-deployment

# 2. Switch to previous version
vercel alias set previous-deployment markethub-api

# 3. Verify health
curl https://api.markethub.com/health

# 4. Notify team
```

---

## 3. Technical Specifications for Each Phase

### 3.1 Phase 1: Database Migration

**Infrastructure Requirements:**
- Neon Database account
- PostgreSQL 14+ compatible
- Connection pooling enabled
- SSL/TLS enabled

**Code Refactoring Requirements:**
- Update Sequelize dialect from mysql to postgres
- Modify connection pool configuration
- Update data type mappings
- Convert ENUM types to TEXT with constraints
- Update auto-increment to SERIAL/BIGSERIAL

**Configuration Changes:**
```javascript
// .env
DATABASE_URL=postgres://user:pass@host/dbname
DB_DIALECT=postgres
```

**Risk Mitigation:**
- Perform migration on staging first
- Use database snapshots
- Implement dual-write during migration
- Test all queries on new database

**Rollback Procedure:**
1. Restore MySQL from backup
2. Update DATABASE_URL to point to MySQL
3. Redeploy application
4. Verify data integrity

### 3.2 Phase 2: Storage Migration

**Infrastructure Requirements:**
- AWS account with S3 access
- CloudFront distribution
- IAM roles/policies
- SSL certificates

**Code Refactoring Requirements:**
- Replace local file operations with S3 SDK
- Implement presigned URL generation
- Update file upload middleware
- Remove static file serving
- Update image URLs in database

**Configuration Changes:**
```javascript
// .env
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_BUCKET=markethub-products
CLOUDFRONT_DOMAIN=cdn.markethub.com
```

**Risk Mitigation:**
- Keep local files as backup
- Verify all uploads work
- Test CDN propagation
- Monitor S3 costs

**Rollback Procedure:**
1. Revert database URLs to local paths
2. Switch storage configuration back to local
3. Redeploy application

### 3.3 Phase 3: API Routes Conversion

**Infrastructure Requirements:**
- Vercel account
- Vercel CLI installed
- Environment variables configured

**Code Refactoring Requirements:**
- Convert Express routes to Vercel functions
- Adapt middleware for serverless
- Implement connection-per-request
- Remove Express-specific code
- Update error handling

**Configuration Changes:**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ]
}
```

**Risk Mitigation:**
- Test each function independently
- Use feature flags
- Monitor error rates
- Gradual traffic shift

**Rollback Procedure:**
1. Switch DNS to Express server
2. Disable Vercel deployment
3. Verify functionality

### 3.4 Phase 4: Background Jobs Migration

**Infrastructure Requirements:**
- Vercel Cron Jobs enabled
- AWS SQS queue
- IAM permissions for SQS

**Code Refactoring Requirements:**
- Convert cron schedules to Vercel format
- Implement queue system
- Add job processing logic
- Implement retry mechanism
- Add DLQ for failed jobs

**Configuration Changes:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/hourly-cleanup",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Risk Mitigation:**
- Test cron jobs manually
- Monitor job execution
- Implement DLQ monitoring
- Set up alerts for failures

**Rollback Procedure:**
1. Disable Vercel cron jobs
2. Re-enable node-cron on Express
3. Process queued jobs

### 3.5 Phase 5: Caching Strategy

**Infrastructure Requirements:**
- Upstash Redis account
- Redis connection URL
- Vercel integration (optional)

**Code Refactoring Requirements:**
- Implement Redis client
- Add cache middleware
- Implement cache invalidation
- Update query caching logic
- Add fallback for cache failures

**Configuration Changes:**
```javascript
// .env
REDIS_URL=redis://xxx.upstash.io:6379
CACHE_ENABLED=true
CACHE_TTL=300
```

**Risk Mitigation:**
- Implement cache fallback
- Monitor cache hit rate
- Set appropriate TTLs
- Test cache invalidation

**Rollback Procedure:**
1. Disable cache middleware
2. Clear Redis cache
3. Continue without caching

### 3.6 Phase 6: Testing & Deployment

**Infrastructure Requirements:**
- Test environment
- CI/CD pipeline
- Monitoring tools
- Error tracking service

**Code Refactoring Requirements:**
- Add test coverage
- Implement monitoring
- Add error tracking
- Create deployment scripts

**Configuration Changes:**
```javascript
// .env.test
NODE_ENV=test
DATABASE_URL=postgres://test-db
REDIS_URL=redis://test-redis
```

**Risk Mitigation:**
- Comprehensive testing
- Canary deployments
- Real-time monitoring
- Quick rollback capability

**Rollback Procedure:**
1. Switch to previous deployment
2. Investigate issues
3. Fix and redeploy

---

## 4. Vercel Serverless Function Structure

### 4.1 Proposed Directory Structure

```
markethub/
├── api/
│   ├── auth/
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── logout.js
│   │   ├── refresh.js
│   │   ├── verify-email.js
│   │   ├── forgot-password.js
│   │   ├── reset-password.js
│   │   ├── sessions.js
│   │   └── token-stats.js
│   ├── products/
│   │   ├── index.js (GET list, POST create)
│   │   ├── [id].js (GET, PATCH, DELETE)
│   │   ├── upload.js
│   │   ├── search.js
│   │   ├── categories.js
│   │   └── variants.js
│   ├── orders/
│   │   ├── index.js
│   │   ├── [id].js
│   │   ├── webhook.js
│   │   └── stats.js
│   ├── users/
│   │   ├── index.js
│   │   ├── me.js
│   │   ├── [id].js
│   │   └── addresses.js
│   ├── vendors/
│   │   ├── index.js
│   │   ├── [id].js
│   │   ├── apply.js
│   │   ├── products.js
│   │   └── earnings.js
│   ├── admin/
│   │   ├── dashboard.js
│   │   ├── users.js
│   │   ├── vendors.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── reports.js
│   │   └── settings.js
│   ├── cart/
│   │   ├── index.js
│   │   ├── [id].js
│   │   └── sync.js
│   ├── wishlist/
│   │   ├── index.js
│   │   └── [id].js
│   ├── reviews/
│   │   ├── index.js
│   │   ├── [id].js
│   │   └── product.js
│   ├── journals/
│   │   ├── index.js
│   │   ├── [id].js
│   │   └── upload.js
│   ├── support/
│   │   ├── index.js
│   │   ├── [id].js
│   │   └── upload.js
│   ├── cron/
│   │   ├── hourly-cleanup.js
│   │   ├── daily-cleanup.js
│   │   ├── inventory-check.js
│   │   └── vendor-payouts.js
│   ├── worker/
│   │   └── index.js
│   ├── health.js
│   └── middleware/
│       ├── auth.js
│       ├── permissions.js
│       ├── validation.js
│       ├── cache.js
│       ├── rate-limit.js
│       └── error.js
├── lib/
│   ├── db.js
│   ├── auth.js
│   ├── cache.js
│   ├── s3.js
│   ├── email.js
│   ├── queue.js
│   ├── logger.js
│   └── utils.js
├── models/
│   ├── index.js
│   ├── user.model.js
│   ├── product.model.js
│   ├── order.model.js
│   ├── vendor.model.js
│   └── ... (all models)
├── validators/
│   ├── auth.validator.js
│   ├── product.validator.js
│   ├── order.validator.js
│   └── ... (all validators)
├── services/
│   ├── email.service.js
│   ├── payment.service.js
│   ├── permission.service.js
│   └── ... (all services)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── vercel.json
├── package.json
└── .env.example
```

### 4.2 Function Organization Strategy

**By Feature (Recommended):**

**Advantages:**
- Logical grouping of related endpoints
- Easier to understand feature boundaries
- Better code organization
- Easier to test features independently

**Disadvantages:**
- May have duplicate code across features
- Larger feature directories

**By HTTP Method:**

**Advantages:**
- Consistent patterns across all functions
- Easier to understand request/response flow
- Smaller, focused files

**Disadvantages:**
- More files to manage
- Harder to navigate
- Less logical grouping

**Decision:** Use **by feature** organization with clear separation of concerns.

### 4.3 Shared Code Organization

**lib/ Directory:**

```javascript
// lib/db.js
// Database connection management
export { getSequelize, closeConnection };

// lib/auth.js
// JWT token generation and verification
export { generateTokens, verifyToken, hashPassword };

// lib/cache.js
// Redis cache operations
export { get, set, del, invalidatePattern };

// lib/s3.js
// AWS S3 operations
export { uploadFile, getFileUrl, deleteFile, generatePresignedUrl };

// lib/email.js
// Email service
export { sendEmail, sendTemplate };

// lib/queue.js
// Queue operations
export { enqueueJob, processJobs };

// lib/logger.js
// Logging utility
export { log, error, warn, info };

// lib/utils.js
// Helper functions
export { formatDate, formatCurrency, slugify };
```

**models/ Directory:**

```javascript
// models/index.js
import { Sequelize } from 'sequelize';
import { getSequelize } from '../lib/db.js';

const sequelize = getSequelize();

// Import all models
import User from './user.model.js';
import Product from './product.model.js';
import Order from './order.model.js';
import Vendor from './vendor.model.js';
import Cart from './cart.model.js';
import Wishlist from './wishlist.model.js';
import Review from './review.model.js';
import Journal from './journal.model.js';
import SupportFeedback from './support-feedback.model.js';
// ... other models

// Define associations
User.hasMany(Order);
Order.belongsTo(User);

User.hasOne(Cart);
Cart.belongsTo(User);

User.hasMany(Wishlist);
Wishlist.belongsTo(User);

Vendor.hasMany(Product);
Product.belongsTo(Vendor);

Order.hasMany(Cart);
Cart.belongsTo(Order);

User.hasMany(Review);
Review.belongsTo(User);

Product.hasMany(Review);
Review.belongsTo(Product);

// ... other associations

export {
  sequelize,
  User,
  Product,
  Order,
  Vendor,
  Cart,
  Wishlist,
  Review,
  Journal,
  SupportFeedback
  // ... other models
};
```

### 4.4 Middleware Adaptation Strategy

**Authentication Middleware:**

```javascript
// middleware/auth.js
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      include: ['roles', 'permissions']
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function withAuth(handler) {
  return async (req, res) => {
    const authResult = await protect(req, res, () => {});
    if (authResult) {
      return authResult;
    }
    return handler(req, res);
  };
}
```

**Permission Middleware:**

```javascript
// middleware/permissions.js
import { Permission } from '../models/index.js';

export async function requirePermission(permission) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hasPermission = await checkPermission(req.user, permission);

    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

async function checkPermission(user, permission) {
  // Admin has all permissions
  if (user.roles.some(role => role.name === 'admin')) {
    return true;
  }

  // Check specific permission
  const userPermissions = user.roles.flatMap(role =>
    role.permissions.map(p => p.name)
  );

  return userPermissions.includes(permission);
}
```

**Validation Middleware:**

```javascript
// middleware/validation.js
import { body, param, query, validationResult } from 'express-validator';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export function validateLogin() {
  return [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ];
}

export function validateProduct() {
  return [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('vendor_id').isInt().withMessage('Vendor ID must be an integer')
  ];
}
```

**Cache Middleware:**

```javascript
// middleware/cache.js
import { get, set } from '../lib/cache.js';

export function cacheResponse(ttl = 300) {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `response:${req.originalUrl}:${req.user?.id || 'anonymous'}`;

    const cached = await get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const originalJson = res.json;
    res.json = function (data) {
      set(cacheKey, data, ttl);
      return originalJson.call(this, data);
    };

    next();
  };
}
```

---

## 5. Database Connection Strategy

### 5.1 Connection-per-Request Implementation Pattern

**Singleton Pattern:**

```javascript
// lib/db.js
let sequelizeInstance = null;

function getSequelize() {
  if (!sequelizeInstance) {
    const { Sequelize } = require('sequelize');

    sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectModule: require('pg'),
      logging: process.env.NODE_ENV === 'development',
      pool: {
        max: 1,  // Serverless: single connection per function
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  }
  return sequelizeInstance;
}

async function closeConnection() {
  if (sequelizeInstance) {
    await sequelizeInstance.close();
    sequelizeInstance = null;
  }
}

export { getSequelize, closeConnection };
```

**Usage Pattern:**

```javascript
// api/products/index.js
import { getSequelize, closeConnection } from '../../lib/db.js';
import { Product } from '../../models/index.js';

export default async function handler(req, res) {
  const sequelize = getSequelize();

  try {
    const products = await Product.findAll({
      limit: 20,
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  } finally {
    await closeConnection();
  }
}
```

### 5.2 Connection Pooling Optimization for Serverless

**Optimized Pool Configuration:**

```javascript
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: require('pg'),
  pool: {
    max: 1,        // Single connection per function instance
    min: 0,        // Don't maintain idle connections
    acquire: 30000, // 30 seconds to acquire connection
    idle: 10000     // Close idle connections after 10s
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    statement_timeout: 10000,  // 10 second query timeout
    query_timeout: 10000
  }
});
```

**Connection Reuse Strategy:**

```javascript
// lib/db.js
let sequelizeInstance = null;
let connectionCount = 0;

function getSequelize() {
  if (!sequelizeInstance) {
    const { Sequelize } = require('sequelize');
    sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
      // ... config
    });
    connectionCount = 0;
  }

  connectionCount++;
  return sequelizeInstance;
}

async function closeConnection() {
  connectionCount--;

  // Only close when no more references
  if (connectionCount <= 0 && sequelizeInstance) {
    await sequelizeInstance.close();
    sequelizeInstance = null;
    connectionCount = 0;
  }
}
```

### 5.3 Recommended Database Providers

**Neon Database (Primary Choice):**

**Pros:**
- Serverless-native architecture
- Auto-scaling compute
- Connection pooling included (pgBouncer)
- Branching for development/testing
- Generous free tier
- Vercel integration available
- PostgreSQL 14+

**Pricing:**
- Free: 512MB storage, 3 compute hours/month
- Pro: $19/month for 8GB storage, 100 compute hours
- Scale: Auto-scales based on demand

**Setup:**
```bash
# Install Neon CLI
npm install -g neonctl

# Create database
neonctl create-database markethub

# Get connection string
neonctl connection-string
```

**Supabase (Alternative):**

**Pros:**
- Full-featured platform
- Real-time capabilities
- Built-in authentication
- Good documentation
- PostgreSQL 14+

**Cons:**
- Connection limits on free tier
- Less serverless-optimized

**Pricing:**
- Free: 500MB storage, 2 connections
- Pro: $25/month for 8GB storage, unlimited connections

### 5.4 Migration Strategy for Existing Data

**Step 1: Export MySQL Data**

```bash
# Export schema and data
mysqldump -u root -p stylay_db \
  --single-transaction \
  --quick \
  --lock-tables=false \
  > mysql_dump.sql
```

**Step 2: Convert to PostgreSQL**

```bash
# Using pgloader
pgloader mysql://root:password@localhost/stylay_db \
  postgresql://user:password@localhost/markethub

# Or use online converter
# https://www.sqlines.com/online
```

**Step 3: Manual Schema Adjustments**

```sql
-- Update auto-increment
ALTER TABLE products ALTER COLUMN id SET DEFAULT nextval('products_id_seq');

-- Update ENUM types
ALTER TABLE users ALTER COLUMN status TYPE TEXT;
ALTER TABLE users ADD CONSTRAINT check_status
  CHECK (status IN ('active', 'inactive', 'pending'));

-- Update foreign keys (if needed)
ALTER TABLE orders ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id) REFERENCES users(id);
```

**Step 4: Import to PostgreSQL**

```bash
psql -h xxx.neon.tech -U markethub_owner -d markethub < postgres_dump.sql
```

**Step 5: Verify Data Integrity**

```sql
-- Check row counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;

-- Check foreign keys
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public';
```

**Step 6: Update Application Configuration**

```javascript
// .env
DATABASE_URL=postgres://user:pass@host/dbname
DB_DIALECT=postgres
```

---

## 6. File Storage Architecture

### 6.1 Complete Migration to AWS S3

**S3 Bucket Structure:**

```
markethub-products/          # Product images
  ├── thumbnails/
  ├── medium/
  └── full-size/

markethub-avatars/          # User avatars
markethub-journals/         # Journal images
markethub-support/          # Support attachments
markethub-vendor/          # Vendor assets
markethub-temp/            # Temporary uploads
```

**S3 Configuration:**

```javascript
// lib/s3.js
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKETS = {
  PRODUCTS: 'markethub-products',
  AVATARS: 'markethub-avatars',
  JOURNALS: 'markethub-journals',
  SUPPORT: 'markethub-support',
  VENDOR: 'markethub-vendor',
  TEMP: 'markethub-temp'
};

export async function uploadFile(buffer, key, contentType, bucket) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable'
  });

  await s3Client.send(command);

  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function uploadPublicFile(buffer, key, contentType, bucket) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000, immutable'
  });

  await s3Client.send(command);

  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function generatePresignedUploadUrl(key, contentType, bucket, expiresIn = 300) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return {
    uploadUrl,
    key,
    publicUrl: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  };
}

export async function deleteFile(key, bucket) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key
  });

  await s3Client.send(command);
}

export async function getFileUrl(key, bucket, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}
```

### 6.2 Upload Handling in Serverless Context

**Direct Upload Strategy (Recommended):**

```javascript
// api/products/upload.js
import { generatePresignedUploadUrl } from '../../lib/s3.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileName, fileType, fileSize } = req.body;

  // Validate file
  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'File name and type required' });
  }

  if (fileSize > 10 * 1024 * 1024) {
    return res.status(400).json({ error: 'File size exceeds 10MB limit' });
  }

  // Generate unique key
  const key = `products/${Date.now()}-${fileName}`;

  // Generate presigned URL
  const { uploadUrl, publicUrl } = await generatePresignedUploadUrl(
    key,
    fileType,
    'markethub-products'
  );

  res.status(200).json({
    uploadUrl,
    key,
    publicUrl
  });
}
```

**Client-Side Upload:**

```javascript
// Client upload utility
async function uploadImage(file, onProgress) {
  // Step 1: Get presigned URL
  const response = await fetch('/api/products/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })
  });

  const { uploadUrl, publicUrl } = await response.json();

  // Step 2: Upload directly to S3
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', uploadUrl);
  xhr.upload.onprogress = (e) => {
    if (onProgress) {
      onProgress((e.loaded / e.total) * 100);
    }
  };

  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(publicUrl);
      } else {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Upload error'));
    xhr.send(file);
  });
}
```

**Multi-File Upload:**

```javascript
// api/products/upload-multiple.js
import { generatePresignedUploadUrl } from '../../lib/s3.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { files } = req.body;

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: 'Files array required' });
  }

  if (files.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 files allowed' });
  }

  // Generate presigned URLs for all files
  const uploads = await Promise.all(
    files.map(file =>
      generatePresignedUploadUrl(
        `products/${Date.now()}-${file.fileName}`,
        file.fileType,
        'markethub-products'
      )
    )
  );

  res.status(200).json({
    uploads: uploads.map((upload, index) => ({
      fileName: files[index].fileName,
      ...upload
    }))
  });
}
```

### 6.3 CDN Integration Strategy

**CloudFront Distribution:**

```javascript
// lib/cdn.js
export function getCDNUrl(path) {
  return `https://cdn.markethub.com/${path}`;
}

export function getProductImageUrl(key, size = 'medium') {
  const sizePath = size === 'thumbnail' ? 'thumbnails' : size;
  return getCDNUrl(`products/${sizePath}/${key}`);
}
```

**Cache Configuration:**

```javascript
// S3 upload with CDN cache headers
const command = new PutObjectCommand({
  Bucket: bucket,
  Key: key,
  Body: buffer,
  ContentType: contentType,
  CacheControl: 'public, max-age=31536000, immutable',
  Metadata: {
    'Cache-Control': 'public, max-age=31536000, immutable'
  }
});
```

**Vercel Rewrites:**

```json
{
  "rewrites": [
    {
      "source": "/cdn/:path*",
      "destination": "https://cdn.markethub.com/:path*"
    }
  ]
}
```

### 6.4 Existing File Migration Plan

**Migration Script:**

```javascript
// scripts/migrate-to-s3.js
import fs from 'fs';
import path from 'path';
import { uploadFile } from '../lib/s3.js';

const MIGRATION_MAP = {
  'public/Upload/product-images': 'markethub-products',
  'public/Upload/user-avatars': 'markethub-avatars',
  'public/Upload/journal-images': 'markethub-journals',
  'public/Upload/support-attachments': 'markethub-support',
  'public/Upload/vendor-assets': 'markethub-vendor'
};

async function migrateDirectory(localDir, bucket) {
  const files = fs.readdirSync(localDir);
  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(localDir, file);
      const buffer = fs.readFileSync(filePath);
      const key = file;

      await uploadFile(buffer, key, 'image/jpeg', bucket);

      console.log(`✓ Migrated: ${file}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed: ${file}`, error.message);
      failCount++;
    }
  }

  console.log(`\nMigration complete: ${successCount} success, ${failCount} failed`);
}

async function main() {
  for (const [localDir, bucket] of Object.entries(MIGRATION_MAP)) {
    console.log(`\nMigrating ${localDir} → ${bucket}`);
    await migrateDirectory(localDir, bucket);
  }
}

main();
```

**Database URL Updates:**

```sql
-- Update product image URLs
UPDATE product_images
SET image_url = REPLACE(
  image_url,
  '/uploads/product-images/',
  'https://cdn.markethub.com/products/'
);

-- Update user avatar URLs
UPDATE users
SET profile_image = REPLACE(
  profile_image,
  '/uploads/user-avatars/',
  'https://cdn.markethub.com/avatars/'
);

-- Update journal image URLs
UPDATE journals
SET cover_image = REPLACE(
  cover_image,
  '/uploads/journal-images/',
  'https://cdn.markethub.com/journals/'
);
```

---

## 7. Session & Authentication Strategy

### 7.1 Stateless JWT Implementation

**JWT Configuration:**

```javascript
// lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
  issuer: process.env.APP_NAME || 'markethub',
  audience: 'markethub-users'
};

export function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles?.map(r => r.name) || []
    },
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.accessTokenExpiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }
  );
}

export function generateRefreshToken(user, sessionId) {
  return jwt.sign(
    {
      id: user.id,
      sessionId,
      type: 'refresh'
    },
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.refreshTokenExpiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_CONFIG.secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

**Token Generation:**

```javascript
// api/auth/login.js
import { generateAccessToken, generateRefreshToken } from '../../lib/auth.js';
import { User, RefreshToken, UserSession } from '../../models/index.js';

export default async function handler(req, res) {
  // ... authentication logic

  // Generate session
  const session = await UserSession.create({
    user_id: user.id,
    device_info: req.headers['user-agent'],
    ip_address: req.ip,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, session.id);

  // Store refresh token in database
  await RefreshToken.create({
    user_id: user.id,
    session_id: session.id,
    token: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    is_revoked: false
  });

  res.status(200).json({
    user: user.toJSON(),
    accessToken,
    refreshToken,
    sessionId: session.id,
    expiresIn: 900 // 15 minutes
  });
}
```

### 7.2 Refresh Token Management in Serverless

**Refresh Token Storage:**

```javascript
// models/refresh-token.model.js
import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'user_sessions',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['session_id'] },
      { fields: ['token'] },
      { fields: ['expires_at'] }
    ]
  });

  return RefreshToken;
}
```

**Token Refresh Endpoint:**

```javascript
// api/auth/refresh.js
import { verifyToken, generateAccessToken, generateRefreshToken } from '../../lib/auth.js';
import { RefreshToken, UserSession, User } from '../../models/index.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refreshToken, sessionId } = req.body;

  if (!refreshToken || !sessionId) {
    return res.status(400).json({ error: 'Refresh token and session ID required' });
  }

  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    // Find refresh token in database
    const tokenRecord = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        is_revoked: false,
        expires_at: {
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: UserSession,
          where: { id: sessionId }
        }
      ]
    });

    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Get user
    const user = await User.findByPk(decoded.id, {
      include: ['roles']
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Generate new tokens (token rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user, sessionId);

    // Revoke old refresh token
    await tokenRecord.update({ is_revoked: true });

    // Store new refresh token
    await RefreshToken.create({
      user_id: user.id,
      session_id: sessionId,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      is_revoked: false
    });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Failed to refresh token' });
  }
}
```

### 7.3 Token Rotation Strategy

**Rotation Logic:**

```javascript
// lib/auth.js
export async function rotateRefreshToken(oldRefreshToken, sessionId) {
  // Verify old token
  const decoded = verifyToken(oldRefreshToken);

  // Find and revoke old token
  const oldTokenRecord = await RefreshToken.findOne({
    where: { token: oldRefreshToken }
  });

  if (oldTokenRecord) {
    await oldTokenRecord.update({ is_revoked: true });
  }

  // Generate new refresh token
  const newRefreshToken = generateRefreshToken(
    { id: decoded.id },
    sessionId
  );

  // Store new token
  await RefreshToken.create({
    user_id: decoded.id,
    session_id: sessionId,
    token: newRefreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    is_revoked: false
  });

  return newRefreshToken;
}
```

### 7.4 Session Alternatives for Stateful Requirements

**Session Storage in Database:**

```javascript
// models/user-session.model.js
import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const UserSession = sequelize.define('UserSession', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    device_info: {
      type: DataTypes.TEXT
    },
    ip_address: {
      type: DataTypes.STRING
    },
    user_agent: {
      type: DataTypes.TEXT
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    last_activity_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_sessions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['expires_at'] },
      { fields: ['is_revoked'] }
    ]
  });

  UserSession.prototype.updateActivity = async function() {
    this.last_activity_at = new Date();
    await this.save();
  };

  UserSession.prototype.isValid = function() {
    return !this.is_revoked && new Date() < this.expires_at;
  };

  return UserSession;
}
```

**Session Management:**

```javascript
// api/auth/sessions.js
import { UserSession, RefreshToken } from '../../models/index.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessions = await UserSession.findAll({
    where: {
      user_id: req.user.id,
      expires_at: {
        [Op.gt]: new Date()
      },
      is_revoked: false
    },
    order: [['last_activity_at', 'DESC']]
  });

  res.status(200).json({
    sessions: sessions.map(session => ({
      id: session.id,
      device_info: session.device_info,
      ip_address: session.ip_address,
      last_activity_at: session.last_activity_at,
      created_at: session.created_at,
      is_current: session.id === req.session?.id
    }))
  });
}
```

**Revoke Session:**

```javascript
// api/auth/revoke-session.js
import { UserSession, RefreshToken } from '../../models/index.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.params;

  // Revoke session
  await UserSession.update(
    { is_revoked: true },
    { where: { id: sessionId, user_id: req.user.id } }
  );

  // Revoke all refresh tokens for this session
  await RefreshToken.update(
    { is_revoked: true },
    { where: { session_id: sessionId } }
  );

  res.status(200).json({ success: true });
}
```

---

## 8. Background Task Architecture

### 8.1 Vercel Cron Jobs Configuration

**vercel.json Configuration:**

```json
{
  "crons": [
    {
      "path": "/api/cron/hourly-cleanup",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/daily-cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/inventory-check",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/vendor-payouts",
      "schedule": "0 0 * * 0"
    },
    {
      "path": "/api/cron/email-digest",
      "schedule": "0 9 * * 1"
    },
    {
      "path": "/api/worker",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

**Cron Security:**

```javascript
// middleware/cron-auth.js
export function requireCronAuth(req, res, next) {
  const authHeader = req.headers['x-vercel-cron-secret'];

  if (authHeader !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
```

### 8.2 Queue System for Async Tasks

**AWS SQS Implementation:**

```javascript
// lib/queue.js
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, ChangeMessageVisibilityCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const QUEUE_URL = process.env.SQS_QUEUE_URL;
const DLQ_URL = process.env.SQS_DLQ_URL;

export async function enqueueJob(jobType, payload, options = {}) {
  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({
      type: jobType,
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0,
      maxRetries: options.maxRetries || 3,
      priority: options.priority || 'normal'
    }),
    DelaySeconds: options.delay || 0,
    MessageAttributes: {
      JobType: {
        DataType: 'String',
        StringValue: jobType
      },
      Priority: {
        DataType: 'String',
        StringValue: options.priority || 'normal'
      }
    }
  });

  const result = await sqsClient.send(command);
  console.log(`Enqueued job: ${jobType} (MessageId: ${result.MessageId})`);

  return result.MessageId;
}

export async function processJobs() {
  const command = new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
    VisibilityTimeout: 300,
    AttributeNames: ['ApproximateReceiveCount']
  });

  const response = await sqsClient.send(command);

  if (response.Messages) {
    for (const message of response.Messages) {
      const body = JSON.parse(message.Body);
      const receiveCount = parseInt(message.Attributes.ApproximateReceiveCount);

      try {
        await processJob(body.type, body.payload);

        // Delete successfully processed message
        const deleteCommand = new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle
        });
        await sqsClient.send(deleteCommand);

        console.log(`Processed job: ${body.type}`);
      } catch (error) {
        console.error(`Job processing failed: ${body.type}`, error);

        // Move to DLQ after max retries
        if (receiveCount >= body.maxRetries) {
          await moveToDLQ(message, error);

          // Delete from main queue
          const deleteCommand = new DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle
          });
          await sqsClient.send(deleteCommand);
        }
      }
    }
  }
}

async function processJob(type, payload) {
  switch (type) {
    case 'send-email':
      await sendEmail(payload);
      break;
    case 'update-inventory':
      await updateInventory(payload);
      break;
    case 'generate-report':
      await generateReport(payload);
      break;
    case 'process-payment':
      await processPayment(payload);
      break;
    case 'send-notification':
      await sendNotification(payload);
      break;
    default:
      console.error(`Unknown job type: ${type}`);
  }
}

async function moveToDLQ(message, error) {
  const command = new SendMessageCommand({
    QueueUrl: DLQ_URL,
    MessageBody: JSON.stringify({
      originalMessage: message.Body,
      error: error.message,
      failedAt: new Date().toISOString()
    })
  });

  await sqsClient.send(command);
  console.error(`Moved job to DLQ: ${message.MessageId}`);
}
```

### 8.3 Worker Function Design

**Worker Endpoint:**

```javascript
// api/worker/index.js
import { processJobs } from '../../lib/queue.js';
import { requireCronAuth } from '../../middleware/cron-auth.js';

export default async function handler(req, res) {
  // Security check
  const authResult = await requireCronAuth(req, res, () => {});
  if (authResult) {
    return authResult;
  }

  try {
    const startTime = Date.now();
    const jobsProcessed = await processJobs();
    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      jobsProcessed,
      duration: `${duration}ms`
    });
  } catch (error) {
    console.error('Worker error:', error);
    res.status(500).json({ error: 'Worker failed' });
  }
}
```

**Job Types:**

```javascript
// jobs/email.job.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendEmail({ to, subject, html, text }) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text
  });
}
```

```javascript
// jobs/inventory.job.js
import { Product, InventoryHistory } from '../../models/index.js';

export async function updateInventory({ productId, quantity, type, reason }) {
  const product = await Product.findByPk(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  // Update inventory
  const newQuantity = type === 'add'
    ? product.stock_quantity + quantity
    : product.stock_quantity - quantity;

  await product.update({ stock_quantity: newQuantity });

  // Log inventory change
  await InventoryHistory.create({
    product_id: productId,
    quantity_change: type === 'add' ? quantity : -quantity,
    previous_quantity: product.stock_quantity,
    new_quantity: newQuantity,
    reason
  });
}
```

### 8.4 Job Failure Handling

**Retry Strategy:**

```javascript
// lib/queue.js
export async function enqueueJob(jobType, payload, options = {}) {
  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({
      type: jobType,
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0,
      maxRetries: options.maxRetries || 3,
      backoff: options.backoff || 'exponential'
    }),
    DelaySeconds: options.delay || 0,
    MessageAttributes: {
      MaxRetries: {
        DataType: 'Number',
        StringValue: (options.maxRetries || 3).toString()
      }
    }
  });

  await sqsClient.send(command);
}

export async function retryJob(message, error) {
  const body = JSON.parse(message.Body);
  const receiveCount = parseInt(message.Attributes.ApproximateReceiveCount);

  if (receiveCount < body.maxRetries) {
    // Calculate backoff delay
    const delay = calculateBackoff(receiveCount, body.backoff);

    // Change visibility to retry later
    const command = new ChangeMessageVisibilityCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: message.ReceiptHandle,
      VisibilityTimeout: delay
    });

    await sqsClient.send(command);
    console.log(`Retrying job: ${body.type} (attempt ${receiveCount + 1})`);
  } else {
    // Move to DLQ
    await moveToDLQ(message, error);
  }
}

function calculateBackoff(attempt, strategy = 'exponential') {
  switch (strategy) {
    case 'exponential':
      return Math.min(Math.pow(2, attempt) * 60, 3600); // Max 1 hour
    case 'linear':
      return Math.min(attempt * 300, 3600);
    case 'fixed':
      return 300; // 5 minutes
    default:
      return 300;
  }
}
```

**Dead Letter Queue Monitoring:**

```javascript
// api/cron/check-dlq.js
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { sendEmail } from '../../jobs/email.job.js';

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export default async function handler(req, res) {
  const authResult = await requireCronAuth(req, res, () => {});
  if (authResult) {
    return authResult;
  }

  const command = new ReceiveMessageCommand({
    QueueUrl: process.env.SQS_DLQ_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20
  });

  const response = await sqsClient.send(command);

  if (response.Messages) {
    const failedJobs = response.Messages.map(msg => JSON.parse(msg.Body));

    // Send alert email
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'Failed Jobs Alert',
      html: `
        <h2>Failed Jobs Detected</h2>
        <p>${failedJobs.length} jobs have failed and moved to DLQ:</p>
        <ul>
          ${failedJobs.map(job => `<li>${job.originalMessage.type}: ${job.error}</li>`).join('')}
        </ul>
      `
    });

    // Delete messages after alerting
    for (const message of response.Messages) {
      await sqsClient.send(new DeleteMessageCommand({
        QueueUrl: process.env.SQS_DLQ_URL,
        ReceiptHandle: message.ReceiptHandle
      }));
    }
  }

  res.status(200).json({ success: true });
}
```

---

## 9. Performance Optimization Strategy

### 9.1 Cold Start Mitigation

**Optimization Techniques:**

1. **Minimize Function Size:**

```javascript
// Use ES modules tree-shaking
import { generateTokens } from '../../lib/auth.js';
// Instead of
import * as auth from '../../lib/auth.js';
```

2. **Lazy Loading:**

```javascript
// Load heavy dependencies only when needed
export async function processPayment(payload) {
  const { PaymentService } = await import('../../services/payment.service.js');
  return PaymentService.process(payload);
}
```

3. **Keep Functions Warm:**

```javascript
// api/keep-warm.js
export default async function handler(req, res) {
  res.status(200).json({ status: 'warm' });
}

// Cron job to keep functions warm
// vercel.json
{
  "crons": [
    {
      "path": "/api/keep-warm",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

4. **Use Edge Functions for Static Content:**

```javascript
// Edge function for static responses
export const config = {
  runtime: 'edge'
};

export default function handler(req) {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 9.2 Response Caching Strategy

**Cache Middleware:**

```javascript
// middleware/cache.js
import { get, set } from '../lib/cache.js';

export function cacheResponse(ttl = 300) {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `response:${req.originalUrl}:${req.user?.id || 'anonymous'}`;

    // Try cache
    const cached = await get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }

    res.setHeader('X-Cache', 'MISS');

    // Override res.json to cache response
    const originalJson = res.json;
    res.json = function (data) {
      set(cacheKey, data, ttl);
      return originalJson.call(this, data);
    };

    next();
  };
}
```

**Cache Key Strategy:**

```javascript
// lib/cache-keys.js
export function getCacheKey(prefix, params, userContext) {
  const paramsStr = JSON.stringify(params);
  const userStr = userContext ? `user:${userContext.id}` : 'anonymous';
  return `${prefix}:${userStr}:${paramsStr}`;
}

// Usage
const cacheKey = getCacheKey('products', {
  category: 'clothing',
  page: 1
}, req.user);
```

**Cache Invalidation:**

```javascript
// lib/cache-invalidation.js
import { invalidatePattern } from './cache.js';

export async function invalidateProductCache(productId) {
  await invalidatePattern(`response:/api/products*`);
  await invalidatePattern(`response:/api/products/${productId}*`);
  await invalidatePattern(`query:Product:*`);
}

export async function invalidateUserCache(userId) {
  await invalidatePattern(`response:*:user:${userId}*`);
  await invalidatePattern(`query:User:*`);
}

// Usage after updates
await product.update(updateData);
await invalidateProductCache(product.id);
```

### 9.3 Database Query Optimization

**Query Optimization Techniques:**

1. **Use Selective Fields:**

```javascript
// Bad: Fetches all fields
const products = await Product.findAll();

// Good: Fetches only needed fields
const products = await Product.findAll({
  attributes: ['id', 'name', 'price', 'thumbnail_url']
});
```

2. **Use Pagination:**

```javascript
const products = await Product.findAll({
  limit: 20,
  offset: (page - 1) * 20,
  order: [['created_at', 'DESC']]
});
```

3. **Use Indexes:**

```javascript
// models/product.model.js
export default function (sequelize) {
  const Product = sequelize.define('Product', {
    // ... fields
  }, {
    indexes: [
      { fields: ['vendor_id'] },
      { fields: ['category_id'] },
      { fields: ['price'] },
      { fields: ['created_at'] },
      { fields: ['is_active'] }
    ]
  });

  return Product;
}
```

4. **Use Eager Loading:**

```javascript
// Bad: N+1 query problem
const orders = await Order.findAll();
for (const order of orders) {
  const user = await order.getUser(); // N queries
}

// Good: Eager loading
const orders = await Order.findAll({
  include: [{ model: User, as: 'user' }]
});
```

5. **Use Raw Queries for Complex Operations:**

```javascript
const results = await sequelize.query(`
  SELECT
    p.id,
    p.name,
    p.price,
    COUNT(oi.id) as order_count
  FROM products p
  LEFT JOIN order_items oi ON p.id = oi.product_id
  WHERE p.vendor_id = :vendorId
  GROUP BY p.id
  ORDER BY order_count DESC
  LIMIT 10
`, {
  replacements: { vendorId },
  type: Sequelize.QueryTypes.SELECT
});
```

### 9.4 Edge Function Utilization

**Use Cases for Edge Functions:**

1. **Static Responses:**

```javascript
// edge/health.js
export const config = {
  runtime: 'edge'
};

export default function handler(req) {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60'
    }
  });
}
```

2. **Request Routing:**

```javascript
// edge/router.js
export const config = {
  runtime: 'edge'
};

export default function handler(req) {
  const url = new URL(req.url);

  if (url.pathname.startsWith('/api/health')) {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Route to serverless functions
  return fetch(req);
}
```

3. **Response Headers:**

```javascript
// edge/headers.js
export const config = {
  runtime: 'edge'
};

export default function handler(req) {
  const response = await fetch(req);

  // Add security headers
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');

  return new Response(response.body, {
    status: response.status,
    headers
  });
}
```

---

## 10. Monitoring & Observability

### 10.1 Logging Strategy

**Structured Logging:**

```javascript
// lib/logger.js
export function log(level, message, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  };

  console.log(JSON.stringify(logEntry));
}

export function info(message, context) {
  log('info', message, context);
}

export function warn(message, context) {
  log('warn', message, context);
}

export function error(message, context) {
  log('error', message, context);
}

// Usage
info('User logged in', {
  userId: user.id,
  email: user.email,
  ip: req.ip
});
```

**Request Logging:**

```javascript
// middleware/request-logger.js
export function logRequest(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    log('info', 'Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id
    });
  });

  next();
}
```

### 10.2 Error Tracking

**Error Middleware:**

```javascript
// middleware/error.js
export function errorHandler(err, req, res, next) {
  // Log error
  log('error', 'Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });

  // Send to error tracking service
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  // Send response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
```

**Sentry Integration:**

```javascript
// lib/sentry.js
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  }
});

export function captureException(error) {
  Sentry.captureException(error);
}

export function captureMessage(message) {
  Sentry.captureMessage(message);
}
```

### 10.3 Performance Monitoring

**Metrics Collection:**

```javascript
// lib/metrics.js
const metrics = {
  requestCount: 0,
  errorCount: 0,
  responseTimes: []
};

export function recordRequest(duration, statusCode) {
  metrics.requestCount++;
  metrics.responseTimes.push(duration);

  if (statusCode >= 400) {
    metrics.errorCount++;
  }
}

export function getMetrics() {
  const avgResponseTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
  const p95ResponseTime = metrics.responseTimes.sort((a, b) => a - b)[Math.floor(metrics.responseTimes.length * 0.95)];

  return {
    requestCount: metrics.requestCount,
    errorCount: metrics.errorCount,
    errorRate: metrics.errorCount / metrics.requestCount,
    avgResponseTime,
    p95ResponseTime
  };
}

export function resetMetrics() {
  metrics.requestCount = 0;
  metrics.errorCount = 0;
  metrics.responseTimes = [];
}
```

**Performance Middleware:**

```javascript
// middleware/performance.js
import { recordRequest } from '../lib/metrics.js';

export function trackPerformance(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    recordRequest(duration, res.statusCode);

    // Log slow requests
    if (duration > 1000) {
      log('warn', 'Slow request detected', {
        path: req.path,
        method: req.method,
        duration: `${duration}ms`
      });
    }
  });

  next();
}
```

### 10.4 Health Check Implementation

**Health Check Endpoint:**

```javascript
// api/health.js
import { getSequelize, closeConnection } from '../lib/db.js';
import { getRedisClient } from '../lib/cache.js';

export default async function handler(req, res) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {}
  };

  try {
    // Database check
    const sequelize = getSequelize();
    await sequelize.authenticate();
    health.checks.database = { status: 'ok' };
  } catch (error) {
    health.checks.database = { status: 'error', message: error.message };
    health.status = 'degraded';
  }

  try {
    // Redis check
    const redis = getRedisClient();
    await redis.ping();
    health.checks.cache = { status: 'ok' };
  } catch (error) {
    health.checks.cache = { status: 'error', message: error.message };
    health.status = 'degraded';
  }

  try {
    // S3 check
    await s3Client.send(new HeadBucketCommand({ Bucket: 'markethub-products' }));
    health.checks.storage = { status: 'ok' };
  } catch (error) {
    health.checks.storage = { status: 'error', message: error.message };
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);

  await closeConnection();
}
```

---

## 11. Cost Analysis

### 11.1 Current Infrastructure Costs

**Current Stack:**
- Server: CleverApps (Docker + PM2)
- Database: MySQL (self-hosted or cloud)
- Storage: Local disk (no cost)
- Email: SMTP service
- Payment: Paystack (transaction-based)

**Estimated Monthly Costs:**
- Server hosting: $20-50/month (depending on size)
- Database: $10-30/month (if cloud-hosted)
- Email: $0-20/month (depending on volume)
- Total: **$30-100/month**

### 11.2 Estimated Vercel Costs

**Vercel Pricing (Hobby Plan):**
- Free: 100GB bandwidth, 100GB hours
- Pro: $20/month for 1TB bandwidth, 1000GB hours

**Estimated Usage:**
- Bandwidth: 500GB/month
- Serverless execution: 500GB hours/month
- Edge functions: 100GB hours/month

**Estimated Vercel Costs:**
- Pro plan: **$20/month**

### 11.3 Database Costs

**Neon Database Pricing:**
- Free: 512MB storage, 3 compute hours
- Pro: $19/month for 8GB storage, 100 compute hours
- Scale: Auto-scales, pay as you go

**Estimated Usage:**
- Storage: 5GB
- Compute: 200 hours/month

**Estimated Database Costs:**
- Neon Pro: **$19/month**

### 11.4 Storage Costs

**AWS S3 Pricing:**
- Storage: $0.023/GB/month
- Requests: $0.0004 per 1,000 requests
- Data transfer: $0.09/GB (first 10TB free with CloudFront)

**Estimated Usage:**
- Storage: 50GB
- Requests: 1M/month
- Data transfer: 500GB/month

**Estimated Storage Costs:**
- S3 storage: $1.15/month
- S3 requests: $0.40/month
- Data transfer: $0 (free with CloudFront)
- CloudFront: $0 (included in free tier)
- Total: **$1.55/month**

### 11.5 Additional Services

**Upstash Redis:**
- Free: 10K commands/day
- Pro: $5/month for 100K commands/day

**Estimated Usage:**
- 50K commands/day

**Estimated Cache Costs:**
- Upstash Pro: **$5/month**

**AWS SQS:**
- First 1M requests/month free
- $0.40 per 1M requests after

**Estimated Usage:**
- 100K requests/month

**Estimated Queue Costs:**
- **$0/month** (within free tier)

**Email Service:**
- SendGrid: Free 100/day, then $0.10/100 emails

**Estimated Usage:**
- 1,000 emails/day

**Estimated Email Costs:**
- **$30/month**

### 11.6 Total Cost of Ownership Comparison

| Component | Current | Vercel Migration | Savings |
|-----------|----------|------------------|----------|
| Server/Hosting | $50 | $20 | $30 |
| Database | $20 | $19 | $1 |
| Storage | $0 | $1.55 | -$1.55 |
| Cache | $0 | $5 | -$5 |
| Queue | $0 | $0 | $0 |
| Email | $10 | $30 | -$20 |
| Monitoring | $0 | $0 | $0 |
| **Total** | **$80/month** | **$75.55/month** | **$4.45/month** |

**Note:** While the monthly cost is similar, the Vercel migration provides:
- Better scalability
- Auto-scaling
- Global edge network
- Reduced operational overhead
- Better developer experience

---

## 12. Timeline & Resource Planning

### 12.1 Estimated Duration for Each Phase

| Phase | Duration | Dependencies |
|--------|-----------|--------------|
| Phase 1: Database Migration | 2-3 weeks | None |
| Phase 2: Storage Migration | 1-2 weeks | Phase 1 |
| Phase 3: API Routes Conversion | 3-4 weeks | Phase 1, 2 |
| Phase 4: Background Jobs Migration | 1-2 weeks | Phase 3 |
| Phase 5: Caching Strategy | 1 week | Phase 3 |
| Phase 6: Testing & Deployment | 2-3 weeks | Phase 4, 5 |
| **Total** | **10-15 weeks** | |

### 12.2 Resource Requirements

**Team Composition:**
- 1 Senior Backend Developer (lead)
- 1 Backend Developer (support)
- 1 DevOps Engineer (infrastructure)
- 1 QA Engineer (testing)
- 1 Project Manager (coordination)

**Skill Requirements:**
- Node.js/JavaScript expertise
- PostgreSQL experience
- AWS services (S3, SQS, CloudFront)
- Vercel platform knowledge
- Serverless architecture understanding
- Database migration experience

### 12.3 Critical Path Identification

**Critical Path:**
```
Phase 1 (Database) → Phase 2 (Storage) → Phase 3 (API Routes) → Phase 6 (Testing)
```

**Parallel Execution Opportunities:**

1. **Phase 2 can overlap with Phase 1:**
   - Start S3 setup while database migration is in progress
   - Begin file migration after database is migrated

2. **Phase 5 can overlap with Phase 3:**
   - Implement caching while converting API routes
   - Test caching strategies incrementally

3. **Phase 4 can overlap with Phase 3:**
   - Convert cron jobs while converting API routes
   - Test background jobs independently

**Optimized Timeline:**

```
Week 1-2:   Phase 1 (Database Migration)
Week 2-3:   Phase 2 (Storage Migration) [Overlaps with Phase 1]
Week 3-6:   Phase 3 (API Routes Conversion)
Week 5-6:   Phase 4 (Background Jobs) [Overlaps with Phase 3]
Week 6:     Phase 5 (Caching Strategy) [Overlaps with Phase 3]
Week 7-9:   Phase 6 (Testing & Deployment)
```

**Total Duration: 9 weeks (optimized)**

### 12.4 Milestones

| Milestone | Week | Deliverables |
|-----------|-------|--------------|
| M1: Database Ready | 2 | PostgreSQL database migrated and tested |
| M2: Storage Migrated | 3 | All files in S3, CDN configured |
| M3: Core APIs Converted | 5 | Auth, User, Product APIs converted |
| M4: All APIs Converted | 6 | All 24+ API routes converted |
| M5: Background Jobs Ready | 6 | Cron jobs and queue system working |
| M6: Caching Implemented | 6 | Redis caching integrated |
| M7: Testing Complete | 8 | All tests passing, performance validated |
| M8: Production Ready | 9 | Full deployment, monitoring active |

### 12.5 Risk Mitigation Timeline

| Risk | Mitigation Timeline |
|------|-------------------|
| Data loss during migration | Week 1: Full backup, test migration |
| Performance regression | Week 5: Benchmark, optimize queries |
| Breaking API changes | Week 6: API compatibility testing |
| Cost overruns | Week 1: Set up billing alerts |
| Extended timeline | Week 1: Add 20% buffer to estimates |

---

## 13. Conclusion

This comprehensive architectural roadmap provides a detailed plan for migrating MarketHub from Express.js + PM2 + Docker to Vercel Serverless Functions. The migration addresses all critical incompatibilities while maintaining business continuity and improving scalability.

**Key Benefits:**
- **Scalability:** Auto-scaling based on demand
- **Performance:** Global edge network, reduced latency
- **Cost:** Similar monthly cost with better value
- **Operations:** Reduced infrastructure management
- **Developer Experience:** Modern tooling and workflows

**Next Steps:**
1. Review and approve this roadmap
2. Set up development environment
3. Begin Phase 1: Database Migration
4. Execute phases according to timeline
5. Monitor and adjust as needed

**Success Criteria:**
- All 24+ API routes converted to serverless functions
- Database migrated to PostgreSQL with connection-per-request
- All files migrated to S3 with CDN
- Background jobs running on Vercel Cron Jobs
- Caching implemented with Upstash Redis
- All tests passing with 80%+ coverage
- Performance metrics meeting or exceeding current benchmarks
- Zero data loss during migration
- Smooth user experience with minimal downtime

This roadmap provides a solid foundation for a successful migration to Vercel Serverless Functions, enabling MarketHub to scale efficiently while reducing operational overhead.
