# Environment Configuration for Enhanced Token System

This document outlines the environment variables needed for the enhanced token blacklisting and refresh token system.

## Required Environment Variables

Add these variables to your `.env` file:

### JWT Configuration
```bash
# JWT Secret (keep this secure!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT Expiration (short-lived access tokens)
JWT_EXPIRES_IN=15m

# Application Name (used in token issuer)
APP_NAME=Stylay
```

### Refresh Token Configuration
```bash
# Refresh Token Expiration (30 days)
REFRESH_TOKEN_EXPIRES_IN=30d

# Session Expiration (30 days)
SESSION_EXPIRES_IN=30d

# Maximum sessions per user
MAX_SESSIONS_PER_USER=5

# Token Rotation (enable/disable)
REFRESH_TOKEN_ROTATION=true

# Device Fingerprinting (enable/disable)
DEVICE_FINGERPRINTING=true
```

### Session Security
```bash
# Session Activity Tracking (enable/disable)
SESSION_ACTIVITY_TRACKING=true

# Session IP Validation (enable/disable)
SESSION_IP_VALIDATION=true
```

### Redis Configuration (for token blacklisting)
```bash
# Redis Host
REDIS_HOST=localhost

# Redis Port
REDIS_PORT=6379

# Redis Password (if applicable)
REDIS_PASSWORD=

# Redis Database Index
REDIS_DB=0

# Redis TLS (enable for production)
REDIS_TLS=false

# Redis URL (alternative to individual settings)
REDIS_URL=redis://localhost:6379
```

### Database Configuration
```bash
# Database connection string or individual settings
DATABASE_URL=your-database-connection-string

# Or individual settings:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stylay
DB_USER=your_username
DB_PASSWORD=your_password
DB_DIALECT=postgres
```

### Cleanup Job Configuration
```bash
# Cleanup interval in hours (default: 1)
CLEANUP_INTERVAL_HOURS=1

# Days to keep inactive tokens (default: 30)
INACTIVE_TOKEN_DAYS=30

# Days to keep inactive sessions (default: 30)
INACTIVE_SESSION_DAYS=30
```

### Logging Configuration
```bash
# Log level (error, warn, info, debug)
LOG_LEVEL=info

# Log file path (optional)
LOG_FILE=logs/app.log

# Enable console logging
CONSOLE_LOGGING=true
```

## Configuration Examples

### Development Environment
```bash
# .env.development
NODE_ENV=development
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
SESSION_EXPIRES_IN=30d
MAX_SESSIONS_PER_USER=5
REDIS_HOST=localhost
REDIS_PORT=6379
LOG_LEVEL=debug
CONSOLE_LOGGING=true
```

### Production Environment
```bash
# .env.production
NODE_ENV=production
JWT_SECRET=very-secure-production-secret-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
SESSION_EXPIRES_IN=30d
MAX_SESSIONS_PER_USER=5
REDIS_HOST=redis-cluster.prod.internal
REDIS_PORT=6379
REDIS_PASSWORD=secure-redis-password
REDIS_TLS=true
LOG_LEVEL=warn
CONSOLE_LOGGING=false
```

### Testing Environment
```bash
# .env.test
NODE_ENV=test
JWT_SECRET=test-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=1d
SESSION_EXPIRES_IN=1d
MAX_SESSIONS_PER_USER=3
REDIS_HOST=localhost
REDIS_PORT=6379
LOG_LEVEL=error
```

## Security Best Practices

1. **JWT Secret**: Use a strong, unique secret (minimum 32 characters)
2. **Redis Security**: Enable TLS in production, use passwords
3. **Token Expiration**: Keep access tokens short (15 minutes)
4. **Session Limits**: Set reasonable limits per user
5. **Environment Separation**: Use different secrets for each environment
6. **Secret Rotation**: Implement regular secret rotation policies

## Migration from Old System

If migrating from the old token system:

1. **Keep old JWT_SECRET**: Don't change it immediately
2. **Dual System**: Run both systems in parallel initially
3. **Gradual Migration**: Users migrate on next login
4. **Monitor**: Watch for errors during transition
5. **Cleanup**: Remove old system after successful migration

## Verification

To verify your configuration:

```bash
# Check if environment variables are loaded
node -e "console.log(process.env.JWT_SECRET ? '✓ JWT_SECRET set' : '✗ JWT_SECRET missing')"
node -e "console.log(process.env.REDIS_HOST ? '✓ Redis configured' : '✗ Redis missing')"

# Test Redis connection
node -e "const redis = require('./config/redis'); console.log(redis.isConnected ? '✓ Redis connected' : '✗ Redis connection failed')"

# Test database connection
node -e "const { sequelize } = require('./config/database'); sequelize.authenticate().then(() => console.log('✓ Database connected')).catch(err => console.log('✗ Database error:', err.message))"
```

## Troubleshooting

### Redis Connection Issues
- Check Redis is running: `redis-cli ping`
- Verify host/port configuration
- Check firewall rules
- Test with `redis-cli -h <host> -p <port>`

### Database Connection Issues
- Verify database credentials
- Check database server status
- Ensure database exists
- Check network connectivity

### Token Issues
- Verify JWT_SECRET matches across all instances
- Check token expiration times
- Validate Redis is storing blacklisted tokens
- Monitor logs for token validation errors