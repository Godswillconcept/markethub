# Implementation Integration Guide

This guide provides step-by-step instructions for integrating the enhanced token blacklisting and refresh token system into your existing application.

## Quick Start Checklist

### 1. Database Migration
```bash
# Run migrations to create new tables
cd server
npx sequelize-cli db:migrate

# If migrations don't exist yet, create them:
npx sequelize-cli migration:generate --name create-refresh-token-system
```

### 2. Install Dependencies
```bash
# Ensure all required packages are installed
npm install crypto jsonwebtoken sequelize express-rate-limit node-cron
```

### 3. Environment Configuration
Add the required environment variables to your `.env` file (see `environment-configuration.md`)

### 4. Integration Steps

## Step 1: Update Models Index
The new models are automatically loaded by the existing `models/index.js` file. No changes needed.

## Step 2: Update Main App File
In your main application file (e.g., `app.js` or `server.js`), add the cleanup job initialization:

```javascript
// server.js or app.js

// ... existing imports ...
const cleanupJob = require('./src/jobs/cleanup.job');

// ... existing app setup ...

// Start cleanup jobs (after starting the server)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the cleanup job scheduler
  cleanupJob.start();
  
  logger.info('Cleanup jobs started successfully');
});
```

## Step 3: Update Auth Routes
In your main routes file, replace or add the enhanced auth routes:

```javascript
// server/src/routes/index.js or server.js

// ... existing imports ...
const authEnhancedRoutes = require('./routes/auth-enhanced.route');

// ... existing routes ...

// Use enhanced auth routes (or keep both for backward compatibility)
app.use('/api/v1/auth', authEnhancedRoutes);

// You can also keep the original routes for backward compatibility
// app.use('/api/v1/auth', authRoutes);
```

## Step 4: Update Authentication Middleware
If you have custom middleware that checks authentication, update it to use the new enhanced middleware:

```javascript
// Before (old way):
const { authenticate } = require('./middlewares/auth.middleware');

// After (new way):
const { authenticate, authenticateWithSession } = require('./middlewares/auth-enhanced.middleware');

// Use authenticate for regular JWT validation
// Use authenticateWithSession for JWT + session validation
```

## Step 5: Update Login Flow on Frontend

### Frontend Login Flow Update
```javascript
// Example frontend login implementation

async function login(email, password) {
  try {
    const response = await fetch('/api/v1/auth/login-enhanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.status === 'success') {
      // Store tokens securely
      localStorage.setItem('accessToken', data.data.tokens.access.token);
      localStorage.setItem('refreshToken', data.data.tokens.refresh.token);
      localStorage.setItem('sessionId', data.data.session.id);
      
      // Store device info for display
      localStorage.setItem('deviceInfo', JSON.stringify(data.data.session.device_info));
      
      return data.data.user;
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

### Frontend Token Refresh Implementation
```javascript
// Token refresh interceptor
async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const sessionId = localStorage.getItem('sessionId');

    if (!refreshToken || !sessionId) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token: refreshToken,
        session_id: sessionId
      })
    });

    const data = await response.json();

    if (data.status === 'success') {
      // Update stored tokens
      localStorage.setItem('accessToken', data.data.access.token);
      localStorage.setItem('refreshToken', data.data.refresh.token);
      
      return data.data.access.token;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Redirect to login
    window.location.href = '/login';
    throw error;
  }
}

// Axios interceptor example
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### Frontend Session Management
```javascript
// Get user sessions
async function getUserSessions() {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/v1/auth/sessions', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Session-Id': localStorage.getItem('sessionId')
    }
  });

  return await response.json();
}

// Logout specific session
async function logoutSession(sessionId) {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(`/api/v1/auth/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  return await response.json();
}

// Logout all devices
async function logoutAllDevices() {
  const accessToken = localStorage.getItem('accessToken');
  const sessionId = localStorage.getItem('sessionId');
  
  const response = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      logout_all: true,
      session_id: sessionId
    })
  });

  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('sessionId');
  localStorage.removeItem('deviceInfo');

  return await response.json();
}
```

## Step 6: Database Schema Updates

### Verify New Tables
After running migrations, verify these tables exist:

```sql
-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('refresh_tokens', 'user_sessions', 'token_blacklist_enhanced');

-- Check table structure
\d refresh_tokens
\d user_sessions
\d token_blacklist_enhanced
```

### Index Verification
```sql
-- Verify indexes are created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('refresh_tokens', 'user_sessions', 'token_blacklist_enhanced');
```

## Step 7: Testing the Implementation

### Test 1: Login and Token Retrieval
```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/v1/auth/login-enhanced \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Expected response:
# {
#   "status": "success",
#   "data": {
#     "user": { ... },
#     "tokens": {
#       "access": { "token": "...", "expires_in": 900, "type": "Bearer" },
#       "refresh": { "token": "...", "expires_in": 2592000 }
#     },
#     "session": {
#       "id": "...",
#       "device_info": { ... },
#       "ip_address": "..."
#     }
#   }
# }
```

### Test 2: Token Refresh
```bash
# Test refresh endpoint
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your-refresh-token",
    "session_id": "your-session-id"
  }'

# Expected response:
# {
#   "status": "success",
#   "data": {
#     "access": { "token": "...", "expires_in": 900, "type": "Bearer" },
#     "refresh": { "token": "...", "expires_in": 2592000 }
#   }
# }
```

### Test 3: Session Management
```bash
# Get sessions (requires access token)
curl -X GET http://localhost:3000/api/v1/auth/sessions \
  -H "Authorization: Bearer your-access-token" \
  -H "X-Session-Id: your-session-id"

# Revoke session
curl -X DELETE http://localhost:3000/api/v1/auth/sessions/session-id-to-revoke \
  -H "Authorization: Bearer your-access-token"
```

### Test 4: Enhanced Logout
```bash
# Logout specific session
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "logout_all": false
  }'

# Logout all devices
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "logout_all": true
  }'
```

### Test 5: Token Blacklisting
```bash
# Test that blacklisted tokens are rejected
# 1. Login and get token
# 2. Logout (which blacklists the token)
# 3. Try to use the blacklisted token
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer blacklisted-token"

# Expected: 401 Unauthorized with message about revoked token
```

## Step 8: Monitoring and Maintenance

### Check Cleanup Job Status
```javascript
// In your application, you can check cleanup status
const cleanupService = require('./services/cleanup.service');

// Get cleanup statistics
const stats = await cleanupService.getCleanupStats();
console.log('Pending cleanup:', stats);
```

### Monitor Token Usage
```sql
-- Check active refresh tokens
SELECT COUNT(*) as active_tokens 
FROM refresh_tokens 
WHERE is_active = true 
AND expires_at > NOW();

-- Check active sessions
SELECT COUNT(*) as active_sessions 
FROM user_sessions 
WHERE is_active = true 
AND expires_at > NOW();

-- Check blacklisted tokens
SELECT COUNT(*) as blacklisted_tokens 
FROM token_blacklist_enhanced 
WHERE token_expiry > EXTRACT(EPOCH FROM NOW()) * 1000;
```

## Step 9: Performance Optimization

### Redis Optimization
```javascript
// In production, ensure Redis is properly configured
// Check Redis memory usage
redis-cli info memory

// Monitor Redis keys
redis-cli keys "blacklist:*" | wc -l
```

### Database Optimization
```sql
-- Add these indexes if not already present
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_active ON refresh_tokens(user_id, is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON user_sessions(user_id, is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_blacklist_user_session ON token_blacklist_enhanced(user_id, session_id);
```

## Step 10: Security Considerations

### 1. Rate Limiting
The system includes rate limiting for:
- Login attempts (100 per 15 minutes)
- Token refresh (50 per 15 minutes)
- Logout attempts (20 per hour)

### 2. Token Security
- Access tokens: 15 minutes
- Refresh tokens: 30 days
- Automatic rotation on refresh
- Device fingerprinting

### 3. Session Security
- Maximum 5 sessions per user
- Automatic session cleanup
- Activity tracking
- IP monitoring

## Troubleshooting

### Common Issues

#### 1. "Redis not connected"
**Solution**: Check Redis configuration and ensure Redis server is running

#### 2. "Session not found" errors
**Solution**: Verify session_id is being sent in headers or body

#### 3. "Token expired" on refresh
**Solution**: Check refresh token expiration and ensure cleanup jobs aren't removing valid tokens

#### 4. "Too many sessions"
**Solution**: Either revoke old sessions or increase MAX_SESSIONS_PER_USER

### Debug Mode
Enable debug logging by setting:
```bash
LOG_LEVEL=debug
NODE_ENV=development
```

## Rollback Plan

If you need to rollback:

1. **Stop new logins**: Disable the enhanced login endpoint
2. **Keep existing sessions**: Don't revoke existing tokens
3. **Monitor**: Watch for errors
4. **Revert routes**: Switch back to original auth routes
5. **Cleanup**: Remove new tables after migration period

## Support

For issues or questions:
- Check logs: `logs/app.log`
- Monitor Redis: `redis-cli monitor`
- Database queries: Enable query logging
- Review environment variables

---

**Next Steps**: After successful integration, monitor the system for 24-48 hours before considering the old system deprecated.