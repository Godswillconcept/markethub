# Docker Setup Guide for MarketHub Server

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [Building the Image](#building-the-image)
5. [Running the Container](#running-the-container)
6. [Docker Compose](#docker-compose)
7. [Database Setup](#database-setup)
8. [Health Checks](#health-checks)
9. [Volumes](#volumes)
10. [Security Considerations](#security-considerations)
11. [Troubleshooting](#troubleshooting)
12. [Production Deployment](#production-deployment)
13. [Development Mode](#development-mode)
14. [File Structure](#file-structure)

---

## Overview

This Docker configuration provides a production-ready, multi-stage build setup for the MarketHub server application. The setup includes:

### Key Features
- **Multi-stage Build**: Optimized image size by separating dependencies, build, and production stages
- **Non-root User**: Enhanced security by running the application as a non-privileged user (UID 1000)
- **Health Checks**: Built-in health monitoring with automatic restart on failure
- **Database Migrations**: Automatic database schema migration and seeding on startup
- **Graceful Shutdown**: Proper signal handling using `dumb-init` for clean container termination
- **PM2 Process Management**: Production-grade process management with automatic restarts
- **Connection Retry**: Exponential backoff for database connection attempts
- **Comprehensive Logging**: Structured logging with timestamps and log levels

### What This Setup Accomplishes
- Creates a lightweight, secure Docker image (~200-300MB)
- Automates database initialization (migrations and seeders)
- Ensures the application starts only when the database is ready
- Provides health monitoring and automatic recovery
- Supports both MySQL and PostgreSQL databases
- Enables easy deployment to any container orchestration platform

---

## Prerequisites

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher (for docker-compose deployment)
- **Database**: MySQL 5.7+ or PostgreSQL 12+ (can be containerized or external)

### Required Ports
- **Application Port**: 8080 (default, configurable via `PORT` environment variable)
- **Database Ports**:
  - MySQL: 3306 (default)
  - PostgreSQL: 5432 (default)
- **Redis** (optional): 6379 (if using Redis for caching)

### Required Environment Variables
The following environment variables must be set before running the container:

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | Database username |
| `DB_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |

---

## Environment Variables

### Required Variables

```bash
# Database Configuration
DB_NAME=markethub_production          # Database name
DB_USER=markethub_user                # Database username
DB_PASSWORD=secure_password_here      # Database password
DB_HOST=db                            # Database host (default: localhost)
DB_PORT=3306                          # Database port (default: 3306 for MySQL, 5432 for PostgreSQL)
DB_DIALECT=mysql                      # Database type: mysql or postgres

# Security
JWT_SECRET=your-super-secret-jwt-key  # JWT secret for token signing
```

### Optional Variables

```bash
# Application Configuration
NODE_ENV=production                   # Environment: development, production, staging
PORT=8080                             # Application port (default: 8080)

# Server Configuration
SERVER_URL=http://localhost:8080      # Base URL for the server
CLIENT_URL=http://localhost:3000      # Frontend URL for CORS

# Email Configuration (if using email features)
SMTP_HOST=smtp.gmail.com              # SMTP server host
SMTP_PORT=587                         # SMTP server port
SMTP_USER=your-email@gmail.com        # SMTP username
SMTP_PASS=your-email-password        # SMTP password

# AWS S3 Configuration (if using S3 for file storage)
AWS_ACCESS_KEY_ID=your-access-key     # AWS access key
AWS_SECRET_ACCESS_KEY=your-secret-key # AWS secret key
AWS_REGION=us-east-1                  # AWS region
AWS_S3_BUCKET=your-bucket-name        # S3 bucket name

# Redis Configuration (optional)
REDIS_ENABLED=true                    # Enable Redis caching (default: false)
REDIS_HOST=redis                      # Redis host
REDIS_PORT=6379                       # Redis port
REDIS_PASSWORD=                       # Redis password (if required)

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000          # Rate limit window in milliseconds (15 minutes)
RATE_LIMIT_MAX_REQUESTS=100           # Max requests per window
```

### Setting Environment Variables

#### Method 1: Using .env file
Create a `.env` file in the project root:
```bash
DB_NAME=markethub_production
DB_USER=markethub_user
DB_PASSWORD=secure_password_here
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=8080
```

#### Method 2: Using docker run command
```bash
docker run -d \
  -e DB_NAME=markethub_production \
  -e DB_USER=markethub_user \
  -e DB_PASSWORD=secure_password_here \
  -e JWT_SECRET=your-super-secret-jwt-key \
  -p 8080:8080 \
  stylay-server:latest
```

#### Method 3: Using docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    environment:
      - DB_NAME=markethub_production
      - DB_USER=markethub_user
      - DB_PASSWORD=secure_password_here
      - JWT_SECRET=your-super-secret-jwt-key
```

---

## Building the Image

### Basic Build Command

Navigate to the server directory and build the image:

```bash
cd server
docker build -t stylay-server:latest .
```

### Build with Custom Tag

```bash
docker build -t stylay-server:v1.0.0 .
```

### Build with Build Arguments

The Dockerfile doesn't require build arguments, but you can customize the build:

```bash
docker build \
  --build-arg NODE_ENV=production \
  -t stylay-server:latest .
```

### Multi-platform Build (for ARM/M1 Macs)

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t stylay-server:latest \
  --push .
```

### Build Output

The build process will:
1. **Dependencies Stage**: Install all npm dependencies
2. **Builder Stage**: Run postinstall script to seed initial data
3. **Production Stage**: Install only production dependencies and copy built application

Expected image size: ~200-300MB

---

## Running the Container

### Basic Run Command

```bash
docker run -d \
  --name stylay-server \
  -p 8080:8080 \
  stylay-server:latest
```

### Run with Environment Variables

```bash
docker run -d \
  --name stylay-server \
  -p 8080:8080 \
  -e DB_NAME=markethub_production \
  -e DB_USER=markethub_user \
  -e DB_PASSWORD=secure_password_here \
  -e DB_HOST=db \
  -e JWT_SECRET=your-super-secret-jwt-key \
  stylay-server:latest
```

### Run with Volume Mounts

```bash
docker run -d \
  --name stylay-server \
  -p 8080:8080 \
  -v $(pwd)/logs:/app/server/logs \
  -v $(pwd)/uploads:/app/server/uploads \
  -v $(pwd)/tmp:/app/server/tmp \
  -e DB_NAME=markethub_production \
  -e DB_USER=markethub_user \
  -e DB_PASSWORD=secure_password_here \
  -e JWT_SECRET=your-super-secret-jwt-key \
  stylay-server:latest
```

### Run with Named Volumes

```bash
docker run -d \
  --name stylay-server \
  -p 8080:8080 \
  -v stylay-logs:/app/server/logs \
  -v stylay-uploads:/app/server/uploads \
  -v stylay-tmp:/app/server/tmp \
  -e DB_NAME=markethub_production \
  -e DB_USER=markethub_user \
  -e DB_PASSWORD=secure_password_here \
  -e JWT_SECRET=your-super-secret-jwt-key \
  stylay-server:latest
```

### Run with Custom Command

```bash
docker run -d \
  --name stylay-server \
  -p 8080:8080 \
  -e DB_NAME=markethub_production \
  -e DB_USER=markethub_user \
  -e DB_PASSWORD=secure_password_here \
  -e JWT_SECRET=your-super-secret-jwt-key \
  stylay-server:latest \
  pm2-runtime start ecosystem.config.js --env production
```

### Run with Resource Limits

```bash
docker run -d \
  --name stylay-server \
  -p 8080:8080 \
  --memory="512m" \
  --cpus="1.0" \
  -e DB_NAME=markethub_production \
  -e DB_USER=markethub_user \
  -e DB_PASSWORD=secure_password_here \
  -e JWT_SECRET=your-super-secret-jwt-key \
  stylay-server:latest
```

### Run with Restart Policy

```bash
docker run -d \
  --name stylay-server \
  -p 8080:8080 \
  --restart unless-stopped \
  -e DB_NAME=markethub_production \
  -e DB_USER=markethub_user \
  -e DB_PASSWORD=secure_password_here \
  -e JWT_SECRET=your-super-secret-jwt-key \
  stylay-server:latest
```

---

## Docker Compose

### Complete Docker Compose Example (MySQL)

Create a `docker-compose.yml` file in the project root:

```yaml
version: '3.8'

services:
  # MySQL Database
  db:
    image: mysql:8.0
    container_name: markethub-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root_password_here
      MYSQL_DATABASE: markethub_production
      MYSQL_USER: markethub_user
      MYSQL_PASSWORD: secure_password_here
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./server/database/seeders:/docker-entrypoint-initdb.d
    networks:
      - markethub-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-proot_password_here"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Application Server
  app:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: stylay-server
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: production
      PORT: 8080
      DB_HOST: db
      DB_PORT: 3306
      DB_DIALECT: mysql
      DB_NAME: markethub_production
      DB_USER: markethub_user
      DB_PASSWORD: secure_password_here
      JWT_SECRET: your-super-secret-jwt-key
      SERVER_URL: http://localhost:8080
      CLIENT_URL: http://localhost:3000
    volumes:
      - ./server/logs:/app/server/logs
      - ./server/uploads:/app/server/uploads
      - ./server/tmp:/app/server/tmp
    networks:
      - markethub-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Redis (Optional - for caching)
  redis:
    image: redis:7-alpine
    container_name: markethub-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - markethub-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql-data:
    driver: local
  redis-data:
    driver: local

networks:
  markethub-network:
    driver: bridge
```

### Docker Compose Example (PostgreSQL)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: markethub-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: markethub_production
      POSTGRES_USER: markethub_user
      POSTGRES_PASSWORD: secure_password_here
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - markethub-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U markethub_user -d markethub_production"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Application Server
  app:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: stylay-server
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: production
      PORT: 8080
      DB_HOST: db
      DB_PORT: 5432
      DB_DIALECT: postgres
      DB_NAME: markethub_production
      DB_USER: markethub_user
      DB_PASSWORD: secure_password_here
      JWT_SECRET: your-super-secret-jwt-key
      SERVER_URL: http://localhost:8080
      CLIENT_URL: http://localhost:3000
    volumes:
      - ./server/logs:/app/server/logs
      - ./server/uploads:/app/server/uploads
      - ./server/tmp:/app/server/tmp
    networks:
      - markethub-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  postgres-data:
    driver: local

networks:
  markethub-network:
    driver: bridge
```

### Docker Compose with Environment File

Create a `.env` file:
```bash
# Database
DB_NAME=markethub_production
DB_USER=markethub_user
DB_PASSWORD=secure_password_here
DB_HOST=db
DB_PORT=3306
DB_DIALECT=mysql

# Security
JWT_SECRET=your-super-secret-jwt-key

# Application
NODE_ENV=production
PORT=8080
SERVER_URL=http://localhost:8080
CLIENT_URL=http://localhost:3000
```

Update docker-compose.yml:
```yaml
version: '3.8'

services:
  app:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: stylay-server
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file:
      - .env
    volumes:
      - ./server/logs:/app/server/logs
      - ./server/uploads:/app/server/uploads
      - ./server/tmp:/app/server/tmp
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d app

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f app

# View logs for all services
docker-compose logs -f

# Restart a service
docker-compose restart app

# Rebuild and restart
docker-compose up -d --build app

# Scale application (if using cluster mode)
docker-compose up -d --scale app=3
```

---

## Database Setup

### Automatic Database Initialization

The Docker setup automatically handles database initialization through the [`docker-entrypoint.sh`](docker-entrypoint.sh:1) script:

1. **Database Connection Check**: Waits for the database to be ready (up to 30 attempts with exponential backoff)
2. **Run Migrations**: Executes all pending database migrations using Sequelize CLI
3. **Run Seeders**: Executes all database seeders to populate initial data

### Migration Process

The entrypoint script runs the following commands:

```bash
# Run migrations
npx sequelize-cli db:migrate

# Run seeders
npx sequelize-cli db:seed:all
```

### Manual Migration Commands

If you need to run migrations manually (e.g., for troubleshooting):

```bash
# Enter the container
docker exec -it stylay-server sh

# Run migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Check migration status
npx sequelize-cli db:migrate:status

# Run seeders
npx sequelize-cli db:seed:all

# Undo last seeder
npx sequelize-cli db:seed:undo

# Undo all seeders
npx sequelize-cli db:seed:undo:all
```

### Database Connection Troubleshooting

#### Issue: Container exits with "Database connection failed"

**Solution 1**: Check database is running
```bash
docker ps | grep db
```

**Solution 2**: Verify database credentials
```bash
docker logs stylay-server | grep "Database connection"
```

**Solution 3**: Check network connectivity
```bash
docker exec -it stylay-server ping db
```

**Solution 4**: Increase wait time
Modify the entrypoint script or add environment variable to increase retry count.

#### Issue: Migrations fail

**Solution 1**: Check migration files exist
```bash
docker exec -it stylay-server ls -la src/database/migrations/
```

**Solution 2**: Run migrations manually to see detailed error
```bash
docker exec -it stylay-server npx sequelize-cli db:migrate
```

**Solution 3**: Check database permissions
Ensure the database user has CREATE, ALTER, and INSERT permissions.

### Database Seeding

The [`postinstall`](package.json:29) script in [`package.json`](package.json:1) runs the following seeders during build:

```bash
npm run seed:file 20250823010000-seed-default-roles.js
npm run seed:file 20250823020000-seed-permissions.js
npm run seed:file 20250824000000-seed-admin-user.js
npm run seed:file 20251108000000-add-missing-permissions.js
npm run seed:file 20251108100000-add-recently-viewed-permissions.js
npm run seed:file 20251123101801-assign-customer-role-to-vendors.js
```

These seeders create:
- Default user roles (Admin, Customer, Vendor, SubAdmin)
- Permissions for each role
- Default admin user
- Additional permissions for recently viewed items
- Customer role assignment for vendors

---

## Health Checks

### Health Check Endpoint

The application exposes a health check endpoint at `/health` that returns HTTP 200 when the application is healthy.

### Health Check Configuration

The [`Dockerfile`](Dockerfile:1) includes a built-in health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

**Parameters:**
- `--interval=30s`: Check health every 30 seconds
- `--timeout=10s`: Wait up to 10 seconds for response
- `--start-period=40s`: Wait 40 seconds before first check (allows application startup)
- `--retries=3`: Allow 3 consecutive failures before marking unhealthy

### Monitoring Container Health

```bash
# Check container health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# View health check logs
docker inspect stylay-server | grep -A 10 Health

# Watch health status in real-time
watch -n 2 'docker ps --format "table {{.Names}}\t{{.Status}}"'
```

### PM2 Health Check

The [`ecosystem.config.js`](ecosystem.config.js:1) also includes health check configuration:

```javascript
health_check: {
  enabled: true,
  path: '/health',
  port: process.env.PORT || 8080
}
```

### Custom Health Check Endpoint

If you need to customize the health check endpoint, modify the route in your application:

```javascript
// Add to your Express app
app.get('/health', (req, res) => {
  // Check database connection
  // Check external services
  // Return health status
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected'
  });
});
```

---

## Volumes

### Required Volumes

The Docker setup requires the following volumes for persistence:

| Volume Path | Purpose | Recommended Type |
|-------------|---------|------------------|
| `/app/server/logs` | Application logs (PM2 logs) | Bind mount or named volume |
| `/app/server/uploads` | User-uploaded files (images, documents) | Bind mount or named volume |
| `/app/server/tmp` | Temporary files | Bind mount or named volume |

### Volume Configuration Examples

#### Bind Mount (Development)

```bash
docker run -d \
  --name stylay-server \
  -p 8080:8080 \
  -v $(pwd)/logs:/app/server/logs \
  -v $(pwd)/uploads:/app/server/uploads \
  -v $(pwd)/tmp:/app/server/tmp \
  stylay-server:latest
```

#### Named Volume (Production)

```bash
docker run -d \
  --name stylay-server \
  -p 8080:8080 \
  -v stylay-logs:/app/server/logs \
  -v stylay-uploads:/app/server/uploads \
  -v stylay-tmp:/app/server/tmp \
  stylay-server:latest
```

#### Docker Compose Volumes

```yaml
version: '3.8'

services:
  app:
    volumes:
      - ./server/logs:/app/server/logs
      - ./server/uploads:/app/server/uploads
      - ./server/tmp:/app/server/tmp

volumes:
  stylay-logs:
  stylay-uploads:
  stylay-tmp:
```

### Volume Management

```bash
# List all volumes
docker volume ls

# Inspect a volume
docker volume inspect stylay-logs

# Remove a volume
docker volume rm stylay-logs

# Backup a volume
docker run --rm -v stylay-uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz /data

# Restore a volume
docker run --rm -v stylay-uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /
```

### Volume Permissions

The Dockerfile creates directories with proper permissions:

```dockerfile
RUN mkdir -p logs tmp src/public && \
    chown -R node:node logs tmp src/public
```

If you encounter permission issues with bind mounts:

```bash
# On Linux, ensure the host directories have correct permissions
sudo chown -R 1000:1000 ./logs ./uploads ./tmp

# Or run container with --user flag
docker run --user 1000:1000 ...
```

---

## Security Considerations

### Non-Root User

The Dockerfile creates and uses a non-root user for enhanced security:

```dockerfile
# Create non-root user with uid 1000
RUN addgroup -g 1000 -S node && \
    adduser -S -u 1000 -G node node

# Switch to non-root user
USER node
```

**Benefits:**
- Reduces attack surface if container is compromised
- Prevents privilege escalation attacks
- Follows security best practices

### Environment Variable Security

**Best Practices:**

1. **Never commit `.env` files to version control**
   - The [`.dockerignore`](.dockerignore:1) file excludes `.env` files from the build context

2. **Use Docker Secrets for sensitive data** (in swarm mode):
   ```yaml
   version: '3.8'
   services:
     app:
       secrets:
         - db_password
         - jwt_secret
   secrets:
     db_password:
       file: ./secrets/db_password.txt
     jwt_secret:
       file: ./secrets/jwt_secret.txt
   ```

3. **Use environment variable files with restricted permissions**:
   ```bash
   chmod 600 .env
   ```

4. **Use secret management services** in production:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Google Secret Manager

### Network Isolation

**Best Practices:**

1. **Use custom networks**:
   ```yaml
   networks:
     markethub-network:
       driver: bridge
   ```

2. **Don't expose database ports publicly**:
   ```yaml
   services:
     db:
       ports: []  # Remove port mapping for production
   ```

3. **Use internal networks for service-to-service communication**:
   ```yaml
   networks:
     internal:
       internal: true
   ```

### Image Security

**Best Practices:**

1. **Use specific base image tags**:
   ```dockerfile
   FROM node:20-alpine AS production
   ```

2. **Scan images for vulnerabilities**:
   ```bash
   docker scan stylay-server:latest
   ```

3. **Keep base images updated**:
   ```bash
   docker pull node:20-alpine
   docker build -t stylay-server:latest .
   ```

4. **Use minimal base images** (Alpine is already minimal)

### Runtime Security

**Best Practices:**

1. **Set resource limits**:
   ```bash
   docker run --memory="512m" --cpus="1.0" stylay-server:latest
   ```

2. **Use read-only filesystem where possible**:
   ```bash
   docker run --read-only --tmpfs /tmp stylay-server:latest
   ```

3. **Drop unnecessary capabilities**:
   ```bash
   docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE stylay-server:latest
   ```

4. **Use security profiles** (AppArmor, SELinux):
   ```bash
   docker run --security-opt apparmor=docker-default stylay-server:latest
   ```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Container exits immediately

**Symptoms:**
```bash
docker ps  # Container not listed
docker ps -a  # Container shows "Exited (1)"
```

**Solutions:**

1. **Check logs for error messages**:
   ```bash
   docker logs stylay-server
   ```

2. **Verify environment variables**:
   ```bash
   docker inspect stylay-server | grep -A 20 Env
   ```

3. **Check if required environment variables are set**:
   ```bash
   docker logs stylay-server | grep "Missing required environment variables"
   ```

4. **Verify database connection**:
   ```bash
   docker logs stylay-server | grep "Database connection"
   ```

#### Issue 2: Database connection fails

**Symptoms:**
```bash
docker logs stylay-server
# Output: "Database connection failed after 30 attempts"
```

**Solutions:**

1. **Check if database container is running**:
   ```bash
   docker ps | grep db
   ```

2. **Verify database health**:
   ```bash
   docker inspect markethub-db | grep -A 10 Health
   ```

3. **Check network connectivity**:
   ```bash
   docker exec -it stylay-server ping db
   ```

4. **Verify database credentials**:
   ```bash
   docker logs stylay-server | grep "DB_"
   ```

5. **Test database connection manually**:
   ```bash
   docker exec -it markethub-db mysql -u markethub_user -p markethub_production
   ```

#### Issue 3: Migrations fail

**Symptoms:**
```bash
docker logs stylay-server
# Output: "Database migrations failed with exit code 1"
```

**Solutions:**

1. **Check migration files exist**:
   ```bash
   docker exec -it stylay-server ls -la src/database/migrations/
   ```

2. **Run migrations manually to see detailed error**:
   ```bash
   docker exec -it stylay-server npx sequelize-cli db:migrate
   ```

3. **Check database permissions**:
   ```bash
   docker exec -it markethub-db mysql -u root -p -e "SHOW GRANTS FOR 'markethub_user'@'%';"
   ```

4. **Check if migrations are already applied**:
   ```bash
   docker exec -it stylay-server npx sequelize-cli db:migrate:status
   ```

#### Issue 4: Health check fails

**Symptoms:**
```bash
docker ps
# Output: "stylay-server   unhealthy"
```

**Solutions:**

1. **Check if application is running**:
   ```bash
   docker exec -it stylay-server pm2 status
   ```

2. **Test health endpoint manually**:
   ```bash
   docker exec -it stylay-server wget -O- http://localhost:8080/health
   ```

3. **Check application logs**:
   ```bash
   docker exec -it stylay-server cat logs/error.log
   docker exec -it stylay-server cat logs/out.log
   ```

4. **Increase start period** in Dockerfile:
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3
   ```

#### Issue 5: Permission denied errors

**Symptoms:**
```bash
docker logs stylay-server
# Output: "EACCES: permission denied"
```

**Solutions:**

1. **Check volume permissions**:
   ```bash
   ls -la ./logs ./uploads ./tmp
   ```

2. **Fix permissions on host**:
   ```bash
   sudo chown -R 1000:1000 ./logs ./uploads ./tmp
   ```

3. **Use named volumes instead of bind mounts**:
   ```bash
   docker run -v stylay-logs:/app/server/logs ...
   ```

#### Issue 6: Out of memory errors

**Symptoms:**
```bash
docker logs stylay-server
# Output: "JavaScript heap out of memory"
```

**Solutions:**

1. **Increase memory limit**:
   ```bash
   docker run --memory="1g" stylay-server:latest
   ```

2. **Set Node.js memory limit**:
   ```bash
   docker run -e NODE_OPTIONS="--max-old-space-size=512" stylay-server:latest
   ```

3. **Check PM2 memory limit** in [`ecosystem.config.js`](ecosystem.config.js:20):
   ```javascript
   max_memory_restart: '512M'
   ```

### Viewing Logs

#### Container Logs

```bash
# View all logs
docker logs stylay-server

# View last 100 lines
docker logs --tail 100 stylay-server

# Follow logs in real-time
docker logs -f stylay-server

# View logs with timestamps
docker logs -t stylay-server

# View logs since a specific time
docker logs --since 2024-01-01T00:00:00 stylay-server
```

#### Application Logs (PM2)

```bash
# Enter container
docker exec -it stylay-server sh

# View PM2 logs
pm2 logs stylay-server

# View error logs only
pm2 logs stylay-server --err

# View logs with timestamps
pm2 logs stylay-server --timestamp

# View last 100 lines
pm2 logs stylay-server --lines 100

# Clear logs
pm2 flush
```

#### Log Files

```bash
# View combined log
docker exec -it stylay-server cat logs/combined.log

# View stdout log
docker exec -it stylay-server cat logs/out.log

# View stderr log
docker exec -it stylay-server cat logs/error.log

# Follow log file
docker exec -it stylay-server tail -f logs/combined.log
```

### Accessing Container Shell

```bash
# Access shell as node user
docker exec -it stylay-server sh

# Access shell as root (if needed)
docker exec -it -u root stylay-server sh

# Run a single command
docker exec stylay-server pm2 status

# Run multiple commands
docker exec stylay-server sh -c "pm2 status && pm2 logs --lines 10"
```

### Debugging Tips

1. **Enable verbose logging**:
   ```bash
   docker run -e DEBUG=* stylay-server:latest
   ```

2. **Run container in interactive mode**:
   ```bash
   docker run -it --rm --entrypoint sh stylay-server:latest
   ```

3. **Inspect container configuration**:
   ```bash
   docker inspect stylay-server
   ```

4. **Check container resource usage**:
   ```bash
   docker stats stylay-server
   ```

5. **Export container filesystem for inspection**:
   ```bash
   docker export stylay-server > stylay-server.tar
   ```

---

## Production Deployment

### Recommended Deployment Practices

#### 1. Resource Limits

Set appropriate resource limits to prevent resource exhaustion:

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

Or with docker run:
```bash
docker run \
  --memory="512m" \
  --memory-swap="1g" \
  --cpus="1.0" \
  --cpu-shares=512 \
  stylay-server:latest
```

#### 2. Restart Policies

Configure automatic restart on failure:

```yaml
# docker-compose.yml
services:
  app:
    restart: unless-stopped
```

Or with docker run:
```bash
docker run --restart unless-stopped stylay-server:latest
```

**Restart Policy Options:**
- `no`: Do not automatically restart (default)
- `on-failure`: Restart only if container exits with non-zero exit code
- `always`: Always restart
- `unless-stopped`: Always restart unless explicitly stopped

#### 3. Logging Configuration

Configure log rotation and retention:

```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

PM2 log rotation (configured in [`ecosystem.config.js`](ecosystem.config.js:37)):
```javascript
max_files: 5,
max_size: '10M'
```

#### 4. Health Checks

Ensure health checks are properly configured:

```yaml
# docker-compose.yml
services:
  app:
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### 5. Network Configuration

Use isolated networks for security:

```yaml
# docker-compose.yml
networks:
  frontend:
    driver: bridge
  backend:
    internal: true  # No external access

services:
  app:
    networks:
      - frontend
      - backend
  db:
    networks:
      - backend
```

#### 6. Secrets Management

Use Docker Secrets for sensitive data (Swarm mode):

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    secrets:
      - db_password
      - jwt_secret
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
      JWT_SECRET_FILE: /run/secrets/jwt_secret

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

Create secrets:
```bash
echo "secure_password" | docker secret create db_password -
echo "jwt_secret_key" | docker secret create jwt_secret -
```

#### 7. Backup Strategy

Implement regular backups:

```bash
# Backup database
docker exec markethub-db mysqldump -u root -p markethub_production > backup.sql

# Backup volumes
docker run --rm -v stylay-uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz /data

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec markethub-db mysqldump -u root -proot_password markethub_production > /backups/db_$DATE.sql
docker run --rm -v stylay-uploads:/data -v /backups:/backup alpine tar czf /backup/uploads_$DATE.tar.gz /data
```

#### 8. Monitoring and Alerts

Set up monitoring:

```bash
# Install PM2 monitoring
docker exec -it stylay-server pm2 install pm2-logrotate

# Monitor container resources
docker stats stylay-server

# Set up alerts (using external tools)
# - Prometheus + Grafana
# - Datadog
# - New Relic
# - CloudWatch
```

### Deployment to Cloud Platforms

#### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml markethub

# Scale services
docker service scale markethub_app=3

# View services
docker service ls

# View logs
docker service logs -f markethub_app
```

#### Kubernetes

Create a Kubernetes deployment manifest:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stylay-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: stylay-server
  template:
    metadata:
      labels:
        app: stylay-server
    spec:
      containers:
      - name: stylay-server
        image: stylay-server:latest
        ports:
        - containerPort: 8080
        env:
        - name: DB_NAME
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: name
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: user
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "0.5"
          limits:
            memory: "512Mi"
            cpu: "1.0"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 40
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        volumeMounts:
        - name: logs
          mountPath: /app/server/logs
        - name: uploads
          mountPath: /app/server/uploads
      volumes:
      - name: logs
        persistentVolumeClaim:
          claimName: stylay-logs-pvc
      - name: uploads
        persistentVolumeClaim:
          claimName: stylay-uploads-pvc
```

Deploy to Kubernetes:
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get pods
kubectl logs -f deployment/stylay-server
```

#### AWS ECS

Create an ECS task definition:

```json
{
  "family": "stylay-server",
  "containerDefinitions": [
    {
      "name": "stylay-server",
      "image": "your-registry/stylay-server:latest",
      "memory": 512,
      "cpu": 1024,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "8080"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-password"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/stylay-server",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "node -e \"require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})\""
        ],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 40
      }
    }
  ]
}
```

### CI/CD Integration

#### GitHub Actions Example

```yaml
# .github/workflows/docker-deploy.yml
name: Docker Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Build Docker image
      run: |
        cd server
        docker build -t stylay-server:${{ github.sha }} .
        docker tag stylay-server:${{ github.sha }} stylay-server:latest

    - name: Run tests
      run: |
        docker run --rm stylay-server:latest npm test

    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push stylay-server:${{ github.sha }}
        docker push stylay-server:latest

    - name: Deploy to production
      run: |
        # Add deployment commands here
        # e.g., docker-compose pull && docker-compose up -d
```

---

## Development Mode

### Modifying for Development

To adapt the Docker setup for development:

#### 1. Use Development Dockerfile

Create a `Dockerfile.dev`:

```dockerfile
FROM node:20-alpine

WORKDIR /app/server

# Install all dependencies (including devDependencies)
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create directories
RUN mkdir -p logs tmp uploads

# Expose port
EXPOSE 8080

# Run with nodemon for hot-reload
CMD ["npm", "run", "dev"]
```

#### 2. Update docker-compose.yml for Development

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: ./server
      dockerfile: Dockerfile.dev
    container_name: stylay-server-dev
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "9229:9229"  # Debug port
    environment:
      NODE_ENV: development
      PORT: 8080
      DB_HOST: db
      DB_PORT: 3306
      DB_DIALECT: mysql
      DB_NAME: markethub_dev
      DB_USER: markethub_user
      DB_PASSWORD: dev_password
      JWT_SECRET: dev-jwt-secret
    volumes:
      - ./server:/app/server  # Mount for hot-reload
      - /app/server/node_modules  # Prevent overwriting node_modules
    networks:
      - markethub-network
    command: npm run dev

  db:
    image: mysql:8.0
    container_name: markethub-db-dev
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: markethub_dev
      MYSQL_USER: markethub_user
      MYSQL_PASSWORD: dev_password
    ports:
      - "3306:3306"
    volumes:
      - mysql-dev-data:/var/lib/mysql
    networks:
      - markethub-network

volumes:
  mysql-dev-data:

networks:
  markethub-network:
    driver: bridge
```

#### 3. Hot-Reload Setup

The development setup uses nodemon for hot-reload:

```json
// package.json
{
  "scripts": {
    "dev": "nodemon app.js"
  }
}
```

Nodemon configuration (create `nodemon.json`):
```json
{
  "watch": ["src", "app.js"],
  "ext": "js,json",
  "ignore": ["node_modules", "logs", "uploads", "tmp"],
  "exec": "node app.js"
}
```

### Debugging in Docker

#### 1. Enable Node.js Debugging

Update the development Dockerfile:

```dockerfile
# Expose debug port
EXPOSE 9229

# Run with debug flag
CMD ["node", "--inspect=0.0.0.0:9229", "app.js"]
```

#### 2. Connect VSCode Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Docker",
      "remoteRoot": "/app/server",
      "localRoot": "${workspaceFolder}/server",
      "port": 9229,
      "address": "localhost",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

#### 3. Debug with Chrome DevTools

```bash
# Forward debug port
docker run -p 9229:9229 stylay-server-dev

# Open Chrome DevTools
# Navigate to chrome://inspect
# Click "Configure" and add localhost:9229
```

### Development Workflow

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Rebuild after changes
docker-compose -f docker-compose.dev.yml up -d --build app

# Access container shell
docker exec -it stylay-server-dev sh

# Run tests
docker exec -it stylay-server-dev npm test

# Run migrations
docker exec -it stylay-server-dev npm run migrate

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Development Tips

1. **Use bind mounts for code changes**:
   ```yaml
   volumes:
     - ./server:/app/server
     - /app/server/node_modules
   ```

2. **Disable health checks in development**:
   ```yaml
   healthcheck:
     disable: true
   ```

3. **Use verbose logging**:
   ```bash
   docker run -e DEBUG=* stylay-server:latest
   ```

4. **Share database with production schema**:
   ```bash
   # Export production schema
   docker exec markethub-db mysqldump -u root -p --no-data markethub_production > schema.sql

   # Import to development database
   docker exec -i markethub-db-dev mysql -u root -p markethub_dev < schema.sql
   ```

5. **Use test data seeders**:
   ```bash
   docker exec -it stylay-server-dev npm run seed
   ```

---

## File Structure

### Docker-Related Files

The following files are part of the Docker configuration:

| File | Location | Purpose |
|------|----------|---------|
| [`Dockerfile`](Dockerfile:1) | `server/Dockerfile` | Multi-stage Docker build configuration |
| [`.dockerignore`](.dockerignore:1) | `server/.dockerignore` | Files to exclude from Docker build context |
| [`docker-entrypoint.sh`](docker-entrypoint.sh:1) | `server/docker-entrypoint.sh` | Container startup script for database initialization |
| [`ecosystem.config.js`](ecosystem.config.js:1) | `server/ecosystem.config.js` | PM2 process manager configuration |
| `DOCKER_SETUP.md` | `server/DOCKER_SETUP.md` | This documentation file |

### File Locations

```
server/
├── Dockerfile                  # Docker build configuration
├── .dockerignore              # Docker build exclusions
├── docker-entrypoint.sh       # Container startup script
├── ecosystem.config.js        # PM2 configuration
├── DOCKER_SETUP.md            # Docker documentation
├── package.json               # Node.js dependencies
├── app.js                     # Application entry point
├── src/                       # Application source code
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── middlewares/           # Express middlewares
│   ├── services/              # Business logic
│   ├── database/              # Database configuration
│   │   ├── migrations/        # Database migration files
│   │   ├── seeders/           # Database seeder files
│   │   └── config.js          # Database connection config
│   └── utils/                 # Utility functions
├── logs/                      # Application logs (created at runtime)
├── uploads/                   # User uploads (created at runtime)
└── tmp/                       # Temporary files (created at runtime)
```

### File Descriptions

#### Dockerfile

The [`Dockerfile`](Dockerfile:1) defines a multi-stage build process:

1. **Dependencies Stage**: Installs all npm dependencies
2. **Builder Stage**: Runs postinstall script to seed initial data
3. **Production Stage**: Creates production-ready image with only production dependencies

Key features:
- Uses `node:20-alpine` base image for minimal size
- Creates non-root user (UID 1000) for security
- Includes health check endpoint
- Uses `dumb-init` for proper signal handling
- Configures PM2 for process management

#### .dockerignore

The [`.dockerignore`](.dockerignore:1) file excludes unnecessary files from the Docker build context:

- `node_modules/` - Dependencies are installed during build
- `.env*` - Environment files (security)
- `logs/`, `tmp/` - Runtime directories
- Test files and documentation
- IDE and editor files
- Build artifacts

#### docker-entrypoint.sh

The [`docker-entrypoint.sh`](docker-entrypoint.sh:1) script handles container startup:

1. **Environment Validation**: Checks for required environment variables
2. **Database Connection**: Waits for database with exponential backoff
3. **Migrations**: Runs database migrations
4. **Seeders**: Runs database seeders
5. **Application Start**: Starts the application with PM2

Key features:
- Comprehensive logging with timestamps
- Graceful shutdown handling
- Retry logic with exponential backoff
- Support for MySQL and PostgreSQL

#### ecosystem.config.js

The [`ecosystem.config.js`](ecosystem.config.js:1) file configures PM2:

- **App Name**: `stylay-server`
- **Instances**: 1 (single instance for database connection stability)
- **Script**: `./app.js`
- **Environment**: Development and production configurations
- **Logging**: Separate log files for stdout, stderr, and combined output
- **Memory Limit**: 512MB with auto-restart
- **Health Check**: Enabled on `/health` endpoint

### Additional Configuration Files

#### .env.example

Create a `.env.example` file to document required environment variables:

```bash
# Database
DB_NAME=markethub_production
DB_USER=markethub_user
DB_PASSWORD=secure_password_here
DB_HOST=db
DB_PORT=3306
DB_DIALECT=mysql

# Security
JWT_SECRET=your-super-secret-jwt-key

# Application
NODE_ENV=production
PORT=8080
SERVER_URL=http://localhost:8080
CLIENT_URL=http://localhost:3000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Redis (optional)
REDIS_ENABLED=false
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
```

#### docker-compose.yml

Create a `docker-compose.yml` file for easy deployment:

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: markethub-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root_password_here
      MYSQL_DATABASE: markethub_production
      MYSQL_USER: markethub_user
      MYSQL_PASSWORD: secure_password_here
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - markethub-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-proot_password_here"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: stylay-server
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:8080"
    env_file:
      - .env
    volumes:
      - ./server/logs:/app/server/logs
      - ./server/uploads:/app/server/uploads
      - ./server/tmp:/app/server/tmp
    networks:
      - markethub-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  mysql-data:

networks:
  markethub-network:
    driver: bridge
```

---

## Quick Start Guide

### Using Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd markethub
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f app
   ```

5. **Check health**:
   ```bash
   curl http://localhost:8080/health
   ```

### Using Docker Run

1. **Build image**:
   ```bash
   cd server
   docker build -t stylay-server:latest .
   ```

2. **Start database** (if using external database, skip this):
   ```bash
   docker run -d \
     --name markethub-db \
     -e MYSQL_ROOT_PASSWORD=root_password \
     -e MYSQL_DATABASE=markethub_production \
     -e MYSQL_USER=markethub_user \
     -e MYSQL_PASSWORD=secure_password \
     -p 3306:3306 \
     mysql:8.0
   ```

3. **Start application**:
   ```bash
   docker run -d \
     --name stylay-server \
     -p 8080:8080 \
     -e DB_NAME=markethub_production \
     -e DB_USER=markethub_user \
     -e DB_PASSWORD=secure_password \
     -e DB_HOST=markethub-db \
     -e JWT_SECRET=your-jwt-secret \
     --link markethub-db:db \
     stylay-server:latest
   ```

4. **View logs**:
   ```bash
   docker logs -f stylay-server
   ```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Sequelize CLI Documentation](https://sequelize.org/docs/v6/other-topics/migrations/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## Support

For issues or questions related to the Docker setup:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review container logs: `docker logs stylay-server`
3. Check application logs: `docker exec -it stylay-server cat logs/error.log`
4. Verify environment variables: `docker inspect stylay-server | grep -A 20 Env`

---

**Last Updated**: 2026-01-05
**Version**: 1.0.0
