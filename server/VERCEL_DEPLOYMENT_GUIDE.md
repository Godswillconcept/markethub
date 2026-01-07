# Vercel Serverless Deployment Guide

## Overview
This guide explains how to deploy the Stylay API server to Vercel as a serverless application, addressing all deployment warnings and ensuring a smooth deployment process.

## Issues Fixed

### 1. Node.js Version Specification
**Problem:** The `engines` field used `>=14.0.0`, which causes Vercel to automatically upgrade to new major Node.js versions, potentially breaking the application.

**Solution:** Changed to a specific Node.js version:
```json
"engines": {
  "node": "18.x"
}
```

### 2. Deprecated Dependencies
**Problem:** Several deprecated packages were causing warnings during deployment.

**Solutions Applied:**
- `eslint`: Upgraded from `^8.32.0` to `^9.18.0`
- `eslint-config-prettier`: Upgraded from `^8.6.0` to `^9.1.0`
- `eslint-plugin-jest`: Upgraded from `^27.2.1` to `^28.10.0`
- `eslint-plugin-prettier`: Upgraded from `^4.2.1` to `^5.2.1`
- `supertest`: Upgraded from `^6.3.3` to `^7.0.0`
- `prettier`: Upgraded from `^2.8.3` to `^3.4.2`
- `express-rate-limit`: Upgraded from `^6.7.0` to `^7.5.0`
- `helmet`: Upgraded from `^6.2.0` to `^8.0.0`
- `aws-sdk`: Replaced with `@aws-sdk/client-s3` (modern AWS SDK v3)

### 3. Vercel Configuration
**Problem:** The old `vercel.json` used deprecated `builds` and `routes` configuration.

**Solution:** Updated to modern `rewrites` configuration:
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/migrate",
      "destination": "/api/migrate.js"
    },
    {
      "source": "/api/seed",
      "destination": "/api/seed.js"
    },
    {
      "source": "/(.*)",
      "destination": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### 4. Postinstall Script
**Problem:** The `postinstall` script attempted to run migrations and seeds during deployment, which fails in serverless environments.

**Solution:** Removed the `postinstall` script. Migrations and seeds should be run manually via the dedicated API endpoints.

## Deployment Steps

### Prerequisites
1. Vercel account (free tier works)
2. Node.js 18.x installed locally
3. Database connection (PostgreSQL or MySQL)
4. Redis connection (optional, for caching)

### Step 1: Install Updated Dependencies
```bash
cd server
npm install
```

### Step 2: Configure Environment Variables
Create a `.env.production` file or set environment variables in Vercel:

**Required Variables:**
```env
NODE_ENV=production
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-frontend-domain.com

# Optional but recommended
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
MIGRATION_SECRET=your-migration-secret-key

# AWS S3 (if using file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_bucket_name

# Email (if using email features)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from server directory
cd server
vercel

# Follow the prompts:
# - Set project name (e.g., stylay-api)
# - Link to existing team (optional)
# - Confirm settings
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from Git (GitHub, GitLab, Bitbucket)
4. Select the repository
5. Set root directory to `server`
6. Configure environment variables
7. Click "Deploy"

### Step 4: Run Migrations and Seeds
After deployment, run migrations and seeds using the dedicated endpoints:

**Run Migrations:**
```bash
curl -X POST https://your-project.vercel.app/api/migrate \
  -H "Authorization: Bearer YOUR_MIGRATION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action": "up"}'
```

**Run Seeders:**
```bash
curl -X POST https://your-project.vercel.app/api/seed \
  -H "Authorization: Bearer YOUR_MIGRATION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action": "all"}'
```

**Check Pending Migrations:**
```bash
curl -X GET "https://your-project.vercel.app/api/migrate?action=pending" \
  -H "Authorization: Bearer YOUR_MIGRATION_SECRET"
```

### Step 5: Verify Deployment
Check the health endpoint:
```bash
curl https://your-project.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-07T13:00:00.000Z",
  "environment": "production",
  "cors": {
    "configured": true,
    "origins": "https://your-frontend-domain.com"
  }
}
```

## Serverless Architecture

### Entry Points
The application uses three serverless entry points:

1. **`api/index.js`** - Main API handler serving all routes
2. **`api/migrate.js`** - Database migration endpoint
3. **`api/seed.js`** - Database seeding endpoint

### Function Configuration
- **Memory:** 1024 MB (configurable in `vercel.json`)
- **Max Duration:** 30 seconds (configurable in `vercel.json`)
- **Timeout Handling:** All long-running operations should be optimized for serverless execution

### Database Connection
The application uses connection pooling and automatic connection management:
- Connections are established on cold starts
- Connections are reused across warm invocations
- Connections are properly closed after execution

### File Uploads
For serverless deployment, file uploads are handled via:
- AWS S3 integration (recommended)
- Temporary storage with immediate processing
- Size limits enforced (max 10MB per file)

## Monitoring and Debugging

### View Logs
```bash
vercel logs
```

### View Real-time Logs
```bash
vercel logs --follow
```

### Check Function Metrics
Access the metrics endpoint:
```bash
curl https://your-project.vercel.app/metrics
```

### Common Issues and Solutions

#### Issue: Cold Start Latency
**Solution:** Use Vercel's Edge Functions for frequently accessed endpoints, or implement caching with Redis.

#### Issue: Database Connection Limits
**Solution:** Configure connection pooling in `src/config/database.js`:
```javascript
pool: {
  max: 5,
  min: 1,
  acquire: 30000,
  idle: 10000
}
```

#### Issue: Timeout Errors
**Solution:** Increase function duration in `vercel.json` or optimize long-running operations.

#### Issue: File Upload Failures
**Solution:** Use AWS S3 for file storage instead of local filesystem.

## Performance Optimization

### 1. Enable Caching
Configure Redis for caching frequently accessed data:
```env
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### 2. Use CDN for Static Assets
Configure CDN for static files served from `src/public` and `src/products`.

### 3. Optimize Database Queries
- Use indexes on frequently queried columns
- Implement pagination for large datasets
- Use eager loading (Sequelize `include`) to reduce N+1 queries

### 4. Implement Response Compression
Already enabled via `compression` middleware.

## Security Best Practices

1. **Environment Variables:** Never commit `.env` files. Use Vercel's environment variable management.
2. **API Keys:** Rotate migration secrets and API keys regularly.
3. **Rate Limiting:** Already configured with `express-rate-limit`.
4. **CORS:** Restrict CORS origins to your frontend domain only.
5. **Security Headers:** Already configured via `helmet` middleware.

## Scaling Considerations

### Horizontal Scaling
Vercel automatically scales serverless functions based on traffic.

### Database Scaling
- Use managed database services (AWS RDS, Google Cloud SQL, etc.)
- Implement read replicas for read-heavy workloads
- Use connection pooling to limit database connections

### Caching Strategy
- Implement Redis for session management
- Cache API responses for frequently accessed data
- Use CDN for static assets

## Cost Optimization

### Vercel Free Tier Limits
- 100 GB bandwidth per month
- 6,000 minutes of execution time per month
- 100 serverless function invocations per day

### Optimization Tips
1. Implement aggressive caching to reduce function invocations
2. Use Edge Functions for simple, fast responses
3. Optimize bundle size by removing unused dependencies
4. Use database connection pooling to reduce connection overhead

## Backup and Recovery

### Database Backups
Configure automated backups in your database provider.

### Environment Variable Backup
Export your Vercel environment variables:
```bash
vercel env ls
```

### Rollback Strategy
Vercel maintains deployment history. Rollback to a previous deployment:
```bash
vercel rollback <deployment-url>
```

## Maintenance

### Regular Tasks
1. Monitor function execution times and errors
2. Review and optimize slow database queries
3. Update dependencies regularly
4. Review and update security headers
5. Monitor database connection usage

### Dependency Updates
```bash
npm update
npm audit fix
```

## Support and Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Express.js Documentation](https://expressjs.com/)

## Troubleshooting Checklist

- [ ] Node.js version set to 18.x in package.json
- [ ] All environment variables configured in Vercel
- [ ] Database connection string is correct and accessible
- [ ] Migrations and seeds have been run
- [ ] CORS origin matches your frontend domain
- [ ] File uploads configured with AWS S3 (if needed)
- [ ] Redis configured (if using caching)
- [ ] Function duration and memory limits appropriate for workload
- [ ] Rate limiting configured appropriately
- [ ] Security headers reviewed and tested

## Next Steps

1. Deploy to Vercel using the steps above
2. Run migrations and seeds
3. Test all API endpoints
4. Set up monitoring and alerts
5. Configure custom domain (optional)
6. Set up CI/CD pipeline (optional)
7. Implement automated testing (optional)
