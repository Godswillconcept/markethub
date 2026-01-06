# Authentication System Implementation - Comprehensive Documentation

## Table of Contents

1. [Implementation Summary](#implementation-summary)
2. [Security Considerations](#security-considerations)
3. [Implementation Steps](#implementation-steps)
4. [Migration Guide](#migration-guide)
5. [Usage Examples](#usage-examples)
6. [Troubleshooting](#troubleshooting)
7. [Appendix](#appendix)

---

## Implementation Summary

### Complete Overview

This authentication system implementation addresses critical security vulnerabilities in the original system by implementing:

- **Enhanced Token Blacklisting** with Redis persistence and session context
- **Refresh Token System** with automatic rotation and device fingerprinting
- **Session Management** with device tracking and activity monitoring
- **Comprehensive Security Features** including rate limiting and ownership verification

### Files Created and Modified

#### New Files Created

**Database Models:**
- [`server/src/models/refresh-token.model.js`](src/models/refresh-token.model.js) - Refresh token storage with device fingerprinting
- [`server/src/models/user-session.model.js`](src/models/user-session.model.js) - Session lifecycle management
- [`server/src/models/token-blacklist-enhanced.model.js`](src/models/token-blacklist-enhanced.model.js) - Enhanced blacklist with session context

**Services:**
- [`server/src/services/refresh-token.service.js`](src/services/refresh-token.service.js) - Refresh token lifecycle management
- [`server/src/services/session.service.js`](src/services/session.service.js) - Session management and validation
- [`server/src/services/token-blacklist-enhanced.service.js`](src/services/token-blacklist-enhanced.service.js) - Dual-layer token blacklisting
- [`server/src/services/cleanup.service.js`](src/services/cleanup.service.js) - Automated cleanup operations

**Controllers & Middleware:**
- [`server/src/controllers/auth-enhanced.controller.js`](src/controllers/auth-enhanced.controller.js) - Enhanced authentication endpoints
- [`server/src/middlewares/auth-enhanced.middleware.js`](src/middlewares/auth-enhanced.middleware.js) - Session-aware authentication

**Infrastructure:**
- [`server/src/jobs/cleanup.job.js`](src/jobs/cleanup.job.js) - Scheduled cleanup jobs
- [`server/src/routes/auth-enhanced.route.js`](src/routes/auth-enhanced.route.js) - New authentication routes

**Documentation:**
- [`server/docs/QUICK_START.md`](docs/QUICK_START.md) - Quick setup guide
- [`server/docs/environment-configuration.md`](docs/environment-configuration.md) - Environment setup
- [`server/docs/implementation-integration-guide.md`](docs/implementation-integration-guide.md) - Integration instructions

**Tests:**
- [`server/src/tests/auth-enhanced.test.js`](src/tests/auth-enhanced.test.js) - Comprehensive test suite
- [`server/src/tests/auth-backward-compatibility.test.js`](src/tests/auth-backward-compatibility.test.js) - Compatibility tests

#### Modified Files

- [`server/src/config/database.js`](src/config/database.js) - Database configuration updates
- [`server/src/app.js`](src/app.js) - Application setup with new services
- [`server/package.json`](package.json) - Dependencies and scripts

### Key Features and Capabilities

#### ✅ Session Tracking
- **Device Fingerprinting**: Browser, OS, device type, and IP address tracking
- **Session Lifecycle**: Creation, validation, activity monitoring, and revocation
- **Session Limits**: Configurable maximum sessions per user (default: 5)
- **Activity Monitoring**: Real-time session activity tracking

#### ✅ Enhanced Token Blacklisting
- **Redis Persistence**: Survives database clearance and restarts
- **Dual-Layer Storage**: Redis + Database for redundancy
- **Session Context**: Blacklist entries include session and device information
- **User-Level Control**: Logout all devices functionality
- **Automatic Cleanup**: Scheduled cleanup of expired entries

#### ✅ Refresh Token System
- **Short-Lived Access Tokens**: 15-minute expiration for enhanced security
- **Long-Lived Refresh Tokens**: 30-day expiration with rotation
- **Token Rotation**: New refresh token on each refresh
- **Device Binding**: Tokens tied to specific devices
- **Secure Storage**: SHA256 hashing for token storage

#### ✅ Security Features
- **Rate Limiting**: Protection against brute force attacks
- **Token Ownership**: Verification that tokens belong to users
- **Session Validation**: Mandatory session validation for sensitive operations
- **Role-Based Access**: Enhanced permission system integration
- **Audit Logging**: Comprehensive logging for security monitoring

#### ✅ Backward Compatibility
- **Original System Intact**: Existing authentication continues to work
- **Gradual Migration**: Support for both old and new systems simultaneously
- **Environment Flags**: Feature toggles for controlled rollout

---

## Security Considerations

### Security Improvements Made

#### 1. Persistent Token Blacklisting
**Problem**: Original system lost blacklisted tokens on database clearance
**Solution**: 
- Redis persistence layer with automatic TTL management
- Database fallback for redundancy
- Session-aware blacklisting with context

```javascript
// Example: Enhanced blacklisting with context
await tokenBlacklistEnhancedService.blacklistToken(token, 'access', {
  reason: 'logout',
  userId: user.id,
  sessionId: session.id,
  deviceInfo: deviceInfo,
  ipAddress: req.ip
});
```

#### 2. Refresh Token Security
**Problem**: No refresh token system, long-lived access tokens
**Solution**:
- Short-lived access tokens (15 minutes)
- Automatic token rotation on refresh
- Device binding and fingerprinting
- Session validation requirements

#### 3. Session Management
**Problem**: No session tracking or device monitoring
**Solution**:
- Comprehensive device fingerprinting
- Session lifecycle management
- Activity monitoring and automatic timeout
- Session limits per user

#### 4. Enhanced Authentication
**Problem**: Basic authentication without session context
**Solution**:
- Session-aware authentication middleware
- Device verification
- Activity tracking
- Ownership verification

### Best Practices Implemented

#### 1. Token Security
- **Hashing**: All tokens stored as SHA256 hashes
- **Rotation**: Automatic refresh token rotation
- **Expiration**: Short-lived access tokens
- **Validation**: Comprehensive token validation

#### 2. Session Security
- **Fingerprinting**: Device and browser identification
- **Activity Tracking**: Real-time session monitoring
- **Limits**: Configurable session limits per user
- **Validation**: Mandatory session validation

#### 3. Rate Limiting
- **Login Protection**: 100 attempts per 15 minutes per IP
- **Refresh Protection**: 50 refresh attempts per 15 minutes per IP
- **Logout Protection**: 20 logout attempts per hour per IP

#### 4. Audit and Monitoring
- **Comprehensive Logging**: All authentication events logged
- **Statistics**: Token and session statistics available
- **Blacklist Monitoring**: Real-time blacklist status
- **Error Tracking**: Detailed error logging

### Potential Security Risks and Mitigations

#### 1. Redis Dependency
**Risk**: System relies on Redis for optimal performance
**Mitigation**:
- Database fallback for all Redis operations
- Graceful degradation when Redis unavailable
- Health checks and monitoring

#### 2. Session Hijacking
**Risk**: Stolen session tokens could be misused
**Mitigation**:
- Device fingerprinting for session validation
- IP address tracking and validation
- Session activity monitoring
- Automatic session timeout

#### 3. Token Theft
**Risk**: Stolen refresh tokens could be misused
**Mitigation**:
- Device binding for refresh tokens
- Session validation requirements
- Automatic token rotation
- Ownership verification

#### 4. Database Overload
**Risk**: Large number of blacklist entries could impact performance
**Mitigation**:
- Automatic cleanup jobs
- Redis caching for frequently accessed data
- Database indexing optimization
- TTL-based cleanup

### Token Security Recommendations

#### 1. JWT Configuration
```bash
# Environment variables for optimal security
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=15m  # Short-lived access tokens
REFRESH_TOKEN_EXPIRES_IN=30d  # Long-lived refresh tokens
```

#### 2. Redis Configuration
```bash
# Redis for optimal performance
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password  # If using password
```

#### 3. Session Configuration
```bash
# Session management settings
SESSION_EXPIRES_IN=30d
MAX_SESSIONS_PER_USER=5
CLEANUP_INTERVAL_HOURS=1
INACTIVE_TOKEN_DAYS=30
```

#### 4. Security Headers
```javascript
// Add to your application
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

## Implementation Steps

### Step-by-Step Deployment Guide

#### Phase 1: Database Setup (15 minutes)

1. **Run Database Migrations**
   ```bash
   cd server
   npx sequelize-cli db:migrate
   ```

2. **Verify Database Tables**
   ```sql
   -- Check new tables exist
   SHOW TABLES LIKE 'refresh_tokens';
   SHOW TABLES LIKE 'user_sessions';
   SHOW TABLES LIKE 'token_blacklist_enhanced';
   ```

3. **Verify Indexes**
   ```sql
   -- Check indexes are created
   SHOW INDEXES FROM refresh_tokens;
   SHOW INDEXES FROM user_sessions;
   SHOW INDEXES FROM token_blacklist_enhanced;
   ```

#### Phase 2: Environment Configuration (10 minutes)

1. **Add Required Environment Variables**
   ```bash
   # Add to .env file
   JWT_SECRET=your-super-secret-key-min-32-chars
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # Optional (with defaults)
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=30d
   SESSION_EXPIRES_IN=30d
   MAX_SESSIONS_PER_USER=5
   ```

2. **Verify Redis Connection**
   ```bash
   # Start Redis if not running
   redis-server
   
   # Test connection
   redis-cli ping
   # Should return: PONG
   ```

#### Phase 3: Application Updates (20 minutes)

1. **Update Main App File**
   ```javascript
   // In server.js or app.js
   const cleanupJob = require('./src/jobs/cleanup.job');
   
   // After starting server
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
     cleanupJob.start(); // Add this line
   });
   ```

2. **Update Routes**
   ```javascript
   // In your main routes file
   const authEnhancedRoutes = require('./routes/auth-enhanced.route');
   app.use('/api/v1/auth', authEnhancedRoutes);
   ```

3. **Update Dependencies**
   ```bash
   cd server
   npm install node-cron redis express-rate-limit
   ```

#### Phase 4: Frontend Integration (30 minutes)

1. **Update Login Logic**
   ```javascript
   // Enhanced login with refresh tokens
   const login = async (email, password) => {
     const response = await fetch('/api/v1/auth/login-enhanced', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, password })
     });
     
     const data = await response.json();
     
     // Store tokens
     localStorage.setItem('accessToken', data.data.tokens.access.token);
     localStorage.setItem('refreshToken', data.data.tokens.refresh.token);
     localStorage.setItem('sessionId', data.data.session.id);
     
     return data;
   };
   ```

2. **Implement Token Refresh**
   ```javascript
   // Add to your API client
   axios.interceptors.response.use(
     response => response,
     async error => {
       if (error.response?.status === 401) {
         const refreshToken = localStorage.getItem('refreshToken');
         const sessionId = localStorage.getItem('sessionId');
         
         const refreshResponse = await fetch('/api/v1/auth/refresh', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ 
             refresh_token: refreshToken, 
             session_id: sessionId 
           })
         });
         
         if (refreshResponse.ok) {
           const data = await refreshResponse.json();
           localStorage.setItem('accessToken', data.data.access.token);
           localStorage.setItem('refreshToken', data.data.refresh.token);
           
           // Retry original request
           error.config.headers.Authorization = `Bearer ${data.data.access.token}`;
           return axios(error.config);
         } else {
           // Redirect to login
           window.location.href = '/login';
         }
       }
       return Promise.reject(error);
     }
   );
   ```

#### Phase 5: Testing and Validation (30 minutes)

1. **Run Test Suite**
   ```bash
   cd server
   npm test -- auth-enhanced.test.js
   npm test -- auth-backward-compatibility.test.js
   ```

2. **Manual Testing**
   - Test enhanced login flow
   - Test token refresh functionality
   - Test session management
   - Test logout functionality
   - Verify backward compatibility

3. **Monitor Logs**
   ```bash
   # Monitor application logs
   tail -f logs/app.log
   
   # Look for cleanup job execution
   grep "Cleanup" logs/app.log
   ```

### Database Migration Instructions

#### 1. Migration Scripts
The following migration scripts are included:

- `20251231120000-create-refresh-tokens.js` - Creates refresh_tokens table
- `20251231120001-create-user-sessions.js` - Creates user_sessions table  
- `20251231120002-create-token-blacklist-enhanced.js` - Creates enhanced blacklist table

#### 2. Running Migrations
```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Check migration status
npx sequelize-cli db:migrate:status

# Rollback last migration (if needed)
npx sequelize-cli db:migrate:undo
```

#### 3. Data Migration (Optional)
For existing users, you may want to migrate session data:

```javascript
// Example migration script
const { User, UserSession } = require('./src/models');

async function migrateUserSessions() {
  const users = await User.findAll();
  
  for (const user of users) {
    // Create default session for existing users
    await UserSession.create({
      id: UserSession.generateSessionId(),
      user_id: user.id,
      device_info: {
        fingerprint: 'migration',
        userAgent: 'migration',
        browser: 'migration',
        os: 'migration',
        device: 'migration'
      },
      ip_address: '0.0.0.0',
      user_agent: 'migration',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
  }
}
```

### Configuration Requirements

#### 1. Environment Variables
```bash
# Required
JWT_SECRET=your-super-secret-key-min-32-chars
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional (with defaults)
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
SESSION_EXPIRES_IN=30d
MAX_SESSIONS_PER_USER=5
CLEANUP_INTERVAL_HOURS=1
INACTIVE_TOKEN_DAYS=30
```

#### 2. Redis Configuration
```javascript
// server/src/config/redis.js
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

module.exports = client;
```

#### 3. Database Configuration
```javascript
// server/src/config/database.js
module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stylay_dev',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
};
```

### Testing Procedures

#### 1. Unit Tests
```bash
# Run all authentication tests
npm test -- --grep "auth"

# Run specific test files
npm test src/tests/auth-enhanced.test.js
npm test src/tests/auth-backward-compatibility.test.js
```

#### 2. Integration Tests
```javascript
// Example integration test
const request = require('supertest');
const app = require('../app');

describe('Enhanced Authentication Integration', () => {
  it('should complete full login-refresh-logout flow', async () => {
    // 1. Login
    const loginResponse = await request(app)
      .post('/api/v1/auth/login-enhanced')
      .send({ email: 'test@example.com', password: 'password123' });
    
    expect(loginResponse.status).toBe(200);
    
    // 2. Refresh token
    const refreshResponse = await request(app)
      .post('/api/v1/auth/refresh')
      .send({
        refresh_token: loginResponse.body.data.tokens.refresh.token,
        session_id: loginResponse.body.data.session.id
      });
    
    expect(refreshResponse.status).toBe(200);
    
    // 3. Logout
    const logoutResponse = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${refreshResponse.body.data.access.token}`)
      .send({ session_id: loginResponse.body.data.session.id });
    
    expect(logoutResponse.status).toBe(200);
  });
});
```

#### 3. Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery run tests/load-test.yml
```

#### 4. Security Testing
```bash
# Test rate limiting
for i in {1..150}; do
  curl -X POST http://localhost:3000/api/v1/auth/login-enhanced \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' &
done

# Test token blacklisting
# 1. Login and get token
# 2. Logout (should blacklist token)
# 3. Try to use blacklisted token (should fail)
```

---

## Migration Guide

### How to Transition from Old to New System

#### Phase 1: Parallel Operation (Recommended)

1. **Keep Original System Active**
   - Original `/api/v1/auth/login` endpoint remains functional
   - Original authentication middleware continues to work
   - No disruption to existing users

2. **Deploy Enhanced System**
   - Deploy new endpoints alongside existing ones
   - New endpoints: `/api/v1/auth/login-enhanced`, `/api/v1/auth/refresh`
   - Enhanced middleware: `authEnhancedMiddleware.authenticateWithSession`

3. **Gradual Migration**
   - Update frontend to use enhanced endpoints for new features
   - Keep existing flows using original endpoints
   - Monitor performance and user experience

#### Phase 2: Feature Rollout

1. **Session Management Features**
   - Deploy session management endpoints
   - Add session viewing and management to frontend
   - Allow users to revoke specific sessions

2. **Refresh Token Features**
   - Implement automatic token refresh in frontend
   - Add session timeout handling
   - Implement device management

3. **Enhanced Security Features**
   - Deploy rate limiting
   - Add audit logging
   - Implement blacklist monitoring

#### Phase 3: Full Migration

1. **Update All Frontend Code**
   - Replace all calls to original login with enhanced login
   - Implement token refresh logic
   - Add session management

2. **Update Middleware**
   - Replace original auth middleware with enhanced version
   - Add session validation where needed
   - Implement role-based access control

3. **Monitor and Optimize**
   - Monitor performance metrics
   - Optimize based on usage patterns
   - Fine-tune session limits and timeouts

### Backward Compatibility Notes

#### 1. API Compatibility
- **Original Endpoints**: All original auth endpoints remain functional
- **Response Format**: Enhanced endpoints return additional data but maintain compatibility
- **Error Handling**: Enhanced error messages but same HTTP status codes

#### 2. Database Compatibility
- **No Schema Changes**: New tables added without modifying existing ones
- **Data Integrity**: Foreign key constraints maintained
- **Migration Safety**: Rollback procedures available

#### 3. Frontend Compatibility
- **Optional Migration**: Frontend can migrate gradually
- **Feature Flags**: Environment-based feature toggles
- **Graceful Degradation**: System works with or without enhanced features

### Rollback Procedures

#### 1. Immediate Rollback (5 minutes)

If issues are detected immediately after deployment:

1. **Disable Enhanced Endpoints**
   ```javascript
   // Comment out enhanced routes
   // app.use('/api/v1/auth', authEnhancedRoutes);
   
   // Keep original routes active
   app.use('/api/v1/auth', authRoutes);
   ```

2. **Revert Frontend Changes**
   - Revert to original login calls
   - Remove token refresh logic
   - Use original authentication middleware

3. **Monitor System**
   - Verify original system is working
   - Check for any data corruption
   - Monitor user experience

#### 2. Database Rollback (15 minutes)

If database issues are detected:

1. **Stop Application**
   ```bash
   # Stop the application
   pm2 stop app
   ```

2. **Rollback Migrations**
   ```bash
   # Rollback last migration
   npx sequelize-cli db:migrate:undo
   
   # Or rollback specific migration
   npx sequelize-cli db:migrate:undo --to 20251231120000
   ```

3. **Verify Data Integrity**
   ```sql
   -- Check original tables are intact
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM token_blacklist;
   ```

4. **Restart Application**
   ```bash
   # Restart with original schema
   pm2 start app
   ```

#### 3. Full System Rollback (30 minutes)

If major issues require complete rollback:

1. **Stop All Services**
   ```bash
   # Stop application and Redis
   pm2 stop all
   redis-cli shutdown
   ```

2. **Restore Database Backup**
   ```bash
   # Restore from backup taken before migration
   mysql -u root -p stylay < backup_before_migration.sql
   ```

3. **Revert Code Changes**
   ```bash
   # Checkout previous version
   git checkout HEAD~1
   npm install
   ```

4. **Restart Services**
   ```bash
   # Start Redis
   redis-server
   
   # Start application
   pm2 start app
   ```

5. **Verify System**
   - Test all original functionality
   - Verify data integrity
   - Monitor for issues

#### 4. Rollback Verification

After any rollback:

1. **Functional Testing**
   ```bash
   # Test original login
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. **Data Verification**
   ```sql
   -- Verify user data integrity
   SELECT id, email, is_active FROM users WHERE email = 'test@example.com';
   
   -- Verify original blacklist functionality
   SELECT COUNT(*) FROM token_blacklist;
   ```

3. **Performance Monitoring**
   - Monitor response times
   - Check error rates
   - Verify system stability

---

## Usage Examples

### Frontend Integration Examples

#### 1. Enhanced Login Flow

```javascript
// Enhanced login with refresh tokens
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/auth/login-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store authentication data
      localStorage.setItem('accessToken', data.data.tokens.access.token);
      localStorage.setItem('refreshToken', data.data.tokens.refresh.token);
      localStorage.setItem('sessionId', data.data.session.id);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setUser(data.data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, login };
};
```

#### 2. Token Refresh Logic

```javascript
// Automatic token refresh implementation
class AuthManager {
  constructor() {
    this.refreshTimeout = null;
    this.setupInterceptors();
  }

  setupInterceptors() {
    axios.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          const sessionId = localStorage.getItem('sessionId');
          
          if (refreshToken && sessionId) {
            try {
              const newTokens = await this.refreshTokens(refreshToken, sessionId);
              localStorage.setItem('accessToken', newTokens.access.token);
              localStorage.setItem('refreshToken', newTokens.refresh.token);
              
              // Retry original request
              error.config.headers.Authorization = `Bearer ${newTokens.access.token}`;
              return axios(error.config);
            } catch (refreshError) {
              this.logout();
              return Promise.reject(refreshError);
            }
          } else {
            this.logout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async refreshTokens(refreshToken, sessionId) {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': application/json' },
      body: JSON.stringify({ refresh_token: refreshToken, session_id: sessionId })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return await response.json();
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}
```

#### 3. Session Management

```javascript
// Session management component
const SessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Session-Id': localStorage.getItem('sessionId')
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.data.other_sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/v1/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Session-Id': localStorage.getItem('sessionId')
        }
      });

      if (response.ok) {
        fetchSessions(); // Refresh session list
      }
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  const revokeAllSessions = async () => {
    try {
      const response = await fetch('/api/v1/auth/sessions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Session-Id': localStorage.getItem('sessionId')
        }
      });

      if (response.ok) {
        fetchSessions(); // Refresh session list
      }
    } catch (error) {
      console.error('Failed to revoke all sessions:', error);
    }
  };

  return (
    <div>
      <h3>Active Sessions</h3>
      {loading ? (
        <p>Loading sessions...</p>
      ) : (
        <div>
          {sessions.map(session => (
            <div key={session.id} className="session-card">
              <div>
                <strong>{session.device_info.browser}</strong> on {session.device_info.os}
              </div>
              <div>IP: {session.ip_address}</div>
              <div>Last Activity: {new Date(session.last_activity).toLocaleString()}</div>
              <button onClick={() => revokeSession(session.id)}>
                Revoke Session
              </button>
            </div>
          ))}
          <button onClick={revokeAllSessions} className="danger-button">
            Logout All Devices
          </button>
        </div>
      )}
    </div>
  );
};
```

### API Usage Examples

#### 1. Login with Enhanced Features

```bash
# Enhanced login request
POST /api/v1/auth/login-enhanced
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true
    },
    "tokens": {
      "access": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expires_in": 900,
        "type": "Bearer"
      },
      "refresh": {
        "token": "a1b2c3d4e5f6...",
        "expires_in": 2592000
      }
    },
    "session": {
      "id": "session_abc123...",
      "device_info": {
        "fingerprint": "sha256_hash...",
        "browser": "Chrome",
        "os": "Windows",
        "device": "Desktop",
        "ip": "192.168.1.1"
      },
      "ip_address": "192.168.1.1",
      "last_activity": "2025-12-31T13:00:00.000Z"
    }
  }
}
```

#### 2. Token Refresh

```bash
# Refresh token request
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "a1b2c3d4e5f6...",
  "session_id": "session_abc123..."
}

# Response
{
  "status": "success",
  "data": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 900,
      "type": "Bearer"
    },
    "refresh": {
      "token": "f6e5d4c3b2a1...",
      "expires_in": 2592000
    }
  }
}
```

#### 3. Session Management

```bash
# Get user sessions
GET /api/v1/auth/sessions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Session-Id: session_abc123...

# Response
{
  "status": "success",
  "data": {
    "current_session": {
      "id": "session_abc123...",
      "device_info": {
        "browser": "Chrome",
        "os": "Windows",
        "device": "Desktop",
        "ip": "192.168.1.1"
      },
      "ip_address": "192.168.1.1",
      "last_activity": "2025-12-31T13:00:00.000Z",
      "is_current": true
    },
    "other_sessions": [
      {
        "id": "session_def456...",
        "device_info": {
          "browser": "Firefox",
          "os": "macOS",
          "device": "Desktop",
          "ip": "192.168.1.2"
        },
        "ip_address": "192.168.1.2",
        "last_activity": "2025-12-30T10:00:00.000Z",
        "is_current": false
      }
    ]
  }
}
```

#### 4. Enhanced Logout

```bash
# Logout specific session
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "session_id": "session_abc123...",
  "logout_all": false
}

# Response
{
  "status": "success",
  "message": "Successfully logged out"
}

# Logout all devices
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "logout_all": true
}

# Response
{
  "status": "success",
  "message": "Logged out from all devices successfully",
  "data": {
    "sessions_revoked": 3,
    "tokens_revoked": 5
  }
}
```

### Common Scenarios and Solutions

#### 1. Token Expiration Handling

```javascript
// Automatic token expiration handling
const handleTokenExpiration = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const sessionId = localStorage.getItem('sessionId');
  
  if (!refreshToken || !sessionId) {
    // No refresh token available, redirect to login
    window.location.href = '/login';
    return;
  }

  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': application/json' },
      body: JSON.stringify({ 
        refresh_token: refreshToken, 
        session_id: sessionId 
      })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.data.access.token);
      localStorage.setItem('refreshToken', data.data.refresh.token);
    } else {
      // Refresh failed, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sessionId');
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    window.location.href = '/login';
  }
};
```

#### 2. Session Timeout Management

```javascript
// Session timeout management
class SessionTimeoutManager {
  constructor() {
    this.timeoutDuration = 30 * 60 * 1000; // 30 minutes
    this.timeoutId = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Reset timeout on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetTimeout(), true);
    });
  }

  resetTimeout() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.handleTimeout();
    }, this.timeoutDuration);
  }

  handleTimeout() {
    // Show warning before timeout
    alert('Your session is about to expire. Please save your work.');
    
    // Attempt to refresh session
    this.refreshSession();
  }

  async refreshSession() {
    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': application/json' },
        body: JSON.stringify({
          refresh_token: localStorage.getItem('refreshToken'),
          session_id: localStorage.getItem('sessionId')
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.data.access.token);
        localStorage.setItem('refreshToken', data.data.refresh.token);
        this.resetTimeout(); // Reset timeout after successful refresh
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      this.logout();
    }
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    window.location.href = '/login';
  }
}
```

#### 3. Multi-Device Session Management

```javascript
// Multi-device session management
const MultiDeviceManager = {
  async getActiveSessions() {
    const response = await fetch('/api/v1/auth/sessions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'X-Session-Id': localStorage.getItem('sessionId')
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch sessions');
  },

  async revokeSession(sessionId) {
    const response = await fetch(`/api/v1/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'X-Session-Id': localStorage.getItem('sessionId')
      }
    });
    
    return response.ok;
  },

  async revokeAllOtherSessions() {
    const response = await fetch('/api/v1/auth/sessions', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'X-Session-Id': localStorage.getItem('sessionId')
      }
    });
    
    return response.ok;
  },

  async logoutAllDevices() {
    const response = await fetch('/api/v1/auth/logout-all-devices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'X-Session-Id': localStorage.getItem('sessionId')
      }
    });
    
    if (response.ok) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sessionId');
      window.location.href = '/login';
    }
  }
};
```

#### 4. Error Handling and Recovery

```javascript
// Comprehensive error handling
class AuthErrorHandler {
  static handleAuthError(error, context = {}) {
    const { isRefreshAttempt = false } = context;

    if (error.response?.status === 401) {
      if (isRefreshAttempt) {
        // Refresh token is invalid, force logout
        this.handleTokenInvalidation();
      } else {
        // Try to refresh token
        this.attemptTokenRefresh();
      }
    } else if (error.response?.status === 429) {
      // Rate limited
      this.handleRateLimit();
    } else if (error.response?.status === 403) {
      // Forbidden
      this.handleForbidden();
    } else {
      // Other errors
      this.handleGenericError(error);
    }
  }

  static async attemptTokenRefresh() {
    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': application/json' },
        body: JSON.stringify({
          refresh_token: localStorage.getItem('refreshToken'),
          session_id: localStorage.getItem('sessionId')
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.data.access.token);
        localStorage.setItem('refreshToken', data.data.refresh.token);
        
        // Retry the original request
        // This would need to be implemented based on your HTTP client
      } else {
        this.handleTokenInvalidation();
      }
    } catch (error) {
      this.handleTokenInvalidation();
    }
  }

  static handleTokenInvalidation() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    
    // Redirect to login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  static handleRateLimit() {
    alert('Too many authentication attempts. Please wait a few minutes before trying again.');
  }

  static handleForbidden() {
    alert('You do not have permission to access this resource.');
  }

  static handleGenericError(error) {
    console.error('Authentication error:', error);
    alert('An authentication error occurred. Please try again.');
  }
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Redis Connection Issues

**Problem**: Redis connection fails or times out
```bash
# Error: Redis connection failed
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solutions**:
1. **Start Redis Server**
   ```bash
   # Start Redis
   redis-server
   
   # Or on Windows
   redis-server.exe
   ```

2. **Check Redis Status**
   ```bash
   # Test connection
   redis-cli ping
   # Should return: PONG
   
   # Check Redis info
   redis-cli info
   ```

3. **Verify Configuration**
   ```javascript
   // Check Redis configuration
   console.log('Redis config:', {
     host: process.env.REDIS_HOST,
     port: process.env.REDIS_PORT
   });
   ```

4. **Firewall Issues**
   ```bash
   # Check if port is open
   telnet localhost 6379
   
   # On Windows, enable telnet client
   dism /online /Enable-Feature /FeatureName:TelnetClient
   ```

#### 2. Database Migration Issues

**Problem**: Migrations fail or tables not created
```bash
# Error: Migration failed
SequelizeDatabaseError: Table 'refresh_tokens' already exists
```

**Solutions**:
1. **Check Migration Status**
   ```bash
   # Check migration status
   npx sequelize-cli db:migrate:status
   
   # List all migrations
   npx sequelize-cli db:migrate:list
   ```

2. **Fix Migration Conflicts**
   ```bash
   # Undo last migration
   npx sequelize-cli db:migrate:undo
   
   # Or undo specific migration
   npx sequelize-cli db:migrate:undo --to 20251231120000
   ```

3. **Manual Table Creation**
   ```sql
   -- Create refresh_tokens table manually
   CREATE TABLE refresh_tokens (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     token_hash VARCHAR(255) NOT NULL UNIQUE,
     session_id VARCHAR(255) NOT NULL,
     device_info JSON NOT NULL,
     ip_address VARCHAR(45),
     user_agent TEXT,
     last_used_at DATETIME,
     expires_at DATETIME NOT NULL,
     is_active BOOLEAN DEFAULT true,
     created_at DATETIME NOT NULL,
     updated_at DATETIME NOT NULL,
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
     INDEX idx_refresh_token_user_id (user_id),
     INDEX idx_refresh_token_hash (token_hash),
     INDEX idx_refresh_token_session_id (session_id)
   );
   ```

#### 3. Token Blacklisting Issues

**Problem**: Tokens not being blacklisted or blacklisting not working
```javascript
// Issue: Token still valid after logout
const isBlacklisted = await tokenBlacklistEnhancedService.isTokenBlacklisted(token);
console.log(isBlacklisted); // false, but should be true
```

**Solutions**:
1. **Check Redis Connection**
   ```javascript
   // Test Redis connection
   const redis = require('../config/redis');
   try {
     await redis.ping();
     console.log('Redis connected');
   } catch (error) {
     console.error('Redis not connected:', error);
   }
   ```

2. **Verify Token Hashing**
   ```javascript
   // Check token hashing
   const crypto = require('crypto');
   const tokenHash = crypto.createHash('sha256').update(token + process.env.JWT_SECRET).digest('hex');
   console.log('Token hash:', tokenHash);
   ```

3. **Check Database Storage**
   ```sql
   -- Check if token is in database
   SELECT * FROM token_blacklist_enhanced WHERE token_hash = 'your_token_hash';
   ```

#### 4. Session Management Issues

**Problem**: Sessions not being created or validated properly
```javascript
// Issue: Session validation fails
const session = await UserSession.getSessionById(sessionId);
console.log(session.isValid()); // false, but should be true
```

**Solutions**:
1. **Check Session Expiration**
   ```javascript
   // Check session expiration
   const session = await UserSession.getSessionById(sessionId);
   console.log('Session expires at:', session.expires_at);
   console.log('Current time:', new Date());
   console.log('Is expired:', session.isExpired());
   ```

2. **Verify Session Activity**
   ```javascript
   // Update session activity
   await session.updateActivity();
   
   // Check last activity
   console.log('Last activity:', session.last_activity);
   ```

3. **Check Session Limits**
   ```javascript
   // Check user session count
   const activeSessions = await UserSession.getActiveSessionsForUser(userId);
   console.log('Active sessions:', activeSessions.length);
   console.log('Max sessions per user:', process.env.MAX_SESSIONS_PER_USER);
   ```

#### 5. Frontend Integration Issues

**Problem**: Token refresh not working in frontend
```javascript
// Issue: Token refresh fails
const response = await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({
    refresh_token: refreshToken,
    session_id: sessionId
  })
});
// response.ok is false
```

**Solutions**:
1. **Check Token Storage**
   ```javascript
   // Verify tokens are stored correctly
   const refreshToken = localStorage.getItem('refreshToken');
   const sessionId = localStorage.getItem('sessionId');
   console.log('Refresh token exists:', !!refreshToken);
   console.log('Session ID exists:', !!sessionId);
   ```

2. **Verify Token Format**
   ```javascript
   // Check token format
   const refreshToken = localStorage.getItem('refreshToken');
   console.log('Token length:', refreshToken?.length);
   console.log('Token format:', refreshToken?.substring(0, 10) + '...');
   ```

3. **Check Session Validation**
   ```javascript
   // Verify session is valid
   const sessionResponse = await fetch('/api/v1/auth/sessions', {
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'X-Session-Id': sessionId
     }
   });
   console.log('Session valid:', sessionResponse.ok);
   ```

### Debugging Tips

#### 1. Enable Debug Logging
```javascript
// Add to your application startup
process.env.DEBUG = 'auth:*';
const debug = require('debug')('auth:enhanced');

// In your services, add debug logs
debug('Token blacklisted:', { tokenHash, reason, userId });
debug('Session created:', { sessionId, userId, deviceInfo });
```

#### 2. Monitor Redis Operations
```javascript
// Add Redis monitoring
const redis = require('../config/redis');

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));
redis.on('end', () => console.log('Redis connection ended'));
```

#### 3. Database Query Logging
```javascript
// Enable Sequelize query logging
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  dialect: 'mysql',
  logging: console.log // Log all queries
});
```

#### 4. Token Validation Debugging
```javascript
// Debug token validation
const jwt = require('jsonwebtoken');

function debugTokenValidation(token) {
  try {
    const decoded = jwt.decode(token);
    console.log('Token decoded:', decoded);
    
    const isExpired = decoded.exp * 1000 < Date.now();
    console.log('Token expired:', isExpired);
    
    return { decoded, isExpired };
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}
```

#### 5. Session Debugging
```javascript
// Debug session operations
async function debugSessionOperations(userId) {
  const sessions = await UserSession.getActiveSessionsForUser(userId);
  console.log('Active sessions:', sessions.length);
  
  sessions.forEach(session => {
    console.log('Session:', {
      id: session.id,
      expiresAt: session.expires_at,
      lastActivity: session.last_activity,
      isActive: session.is_active,
      isExpired: session.isExpired()
    });
  });
}
```

### Performance Considerations

#### 1. Database Performance
```sql
-- Optimize blacklist queries
CREATE INDEX idx_token_blacklist_hash_expires ON token_blacklist_enhanced(token_hash, token_expiry);

-- Optimize session queries
CREATE INDEX idx_user_session_user_active ON user_sessions(user_id, is_active, expires_at);

-- Optimize refresh token queries
CREATE INDEX idx_refresh_token_user_active ON refresh_tokens(user_id, is_active, expires_at);
```

#### 2. Redis Performance
```javascript
// Optimize Redis operations
const redis = require('redis');

// Use connection pooling
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    return Math.min(options.attempt * 100, 3000);
  }
});
```

#### 3. Memory Management
```javascript
// Monitor memory usage
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100
  });
}, 30000);
```

#### 4. Cleanup Optimization
```javascript
// Optimize cleanup jobs
const cleanupService = require('./services/cleanup.service');

// Run cleanup during low traffic hours
const cron = require('node-cron');
cron.schedule('0 2 * * *', async () => {
  console.log('Running comprehensive cleanup...');
  await cleanupService.runComprehensiveCleanup(30);
});
```

#### 5. Rate Limiting Optimization
```javascript
// Optimize rate limiting
const rateLimit = require('express-rate-limit');

const optimizedRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for certain conditions
    return req.ip === process.env.TRUSTED_IP;
  }
});
```

---

## Appendix

### Environment Variables Reference

```bash
# Required Environment Variables
JWT_SECRET=your-super-secret-key-min-32-chars
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional Environment Variables (with defaults)
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
SESSION_EXPIRES_IN=30d
MAX_SESSIONS_PER_USER=5
CLEANUP_INTERVAL_HOURS=1
INACTIVE_TOKEN_DAYS=30

# Database Configuration
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=stylay

# Redis Configuration (optional)
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Application Configuration
NODE_ENV=production
PORT=3000
APP_NAME=Stylay
```

### API Endpoints Reference

#### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/v1/auth/login-enhanced` | Enhanced login with refresh tokens | None |
| POST | `/api/v1/auth/login` | Original login (backward compatibility) | None |
| POST | `/api/v1/auth/refresh` | Refresh access token | Session required |
| POST | `/api/v1/auth/logout` | Enhanced logout with session management | Required |
| POST | `/api/v1/auth/logout-all-devices` | Logout all devices | Required |
| POST | `/api/v1/auth/register` | User registration | None |
| POST | `/api/v1/auth/verify-email` | Email verification | None |

#### Session Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/v1/auth/sessions` | Get user sessions | Required |
| DELETE | `/api/v1/auth/sessions/:sessionId` | Revoke specific session | Required |
| DELETE | `/api/v1/auth/sessions` | Revoke all sessions | Required |
| GET | `/api/v1/auth/token-stats` | Get token statistics | Required |
| POST | `/api/v1/auth/revoke-refresh-token` | Revoke specific refresh token | Required |

#### Admin Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/v1/auth/admin/blacklist-stats` | Get blacklist statistics | Admin only |
| GET | `/api/v1/auth/blacklist` | Get user blacklist entries | Required |

### Database Schema

#### refresh_tokens Table
```sql
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  session_id VARCHAR(255) NOT NULL,
  device_info JSON NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  last_used_at DATETIME,
  expires_at DATETIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_token_user_id (user_id),
  INDEX idx_refresh_token_hash (token_hash),
  INDEX idx_refresh_token_session_id (session_id),
  INDEX idx_refresh_token_expires_at (expires_at)
);
```

#### user_sessions Table
```sql
CREATE TABLE user_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  device_info JSON NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_session_user_id (user_id),
  INDEX idx_user_session_is_active (is_active),
  INDEX idx_user_session_last_activity (last_activity),
  INDEX idx_user_session_expires_at (expires_at)
);
```

#### token_blacklist_enhanced Table
```sql
CREATE TABLE token_blacklist_enhanced (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_hash VARCHAR(255) NOT NULL,
  token_type ENUM('access', 'refresh') NOT NULL,
  token_expiry DATETIME NOT NULL,
  blacklisted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(255),
  user_id INT,
  session_id VARCHAR(255),
  device_info JSON,
  ip_address VARCHAR(45),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_blacklist_token_hash (token_hash),
  INDEX idx_blacklist_token_expiry (token_expiry),
  INDEX idx_blacklist_user_id (user_id),
  INDEX idx_blacklist_session_id (session_id)
);
```

### Testing Commands

#### Unit Tests
```bash
# Run all authentication tests
npm test -- --grep "auth"

# Run specific test files
npm test src/tests/auth-enhanced.test.js
npm test src/tests/auth-backward-compatibility.test.js

# Run with coverage
npm run test:coverage
```

#### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run specific integration tests
npm test -- --grep "integration"
```

#### Load Tests
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run tests/load-test.yml

# Generate load test report
artillery run tests/load-test.yml --output report.json
artillery report report.json --output report.html
```

#### Security Tests
```bash
# Run security tests
npm test -- --grep "security"

# Test rate limiting
npm run test:rate-limit

# Test token blacklisting
npm run test:blacklist
```

### Monitoring and Logging

#### Log Levels
```javascript
// Configure log levels
const logger = require('./utils/logger');

logger.info('Informational message');
logger.warn('Warning message');
logger.error('Error message');
logger.debug('Debug message');
```

#### Health Checks
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      auth: await checkAuthSystem()
    }
  };
  
  const isHealthy = Object.values(health.services).every(service => service.healthy);
  res.status(isHealthy ? 200 : 503).json(health);
});

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    return { healthy: true, message: 'Database connected' };
  } catch (error) {
    return { healthy: false, message: error.message };
  }
}

async function checkRedis() {
  try {
    await redis.ping();
    return { healthy: true, message: 'Redis connected' };
  } catch (error) {
    return { healthy: false, message: error.message };
  }
}
```

#### Metrics Collection
```javascript
// Metrics collection
const metrics = {
  tokens: {
    issued: 0,
    refreshed: 0,
    blacklisted: 0
  },
  sessions: {
    active: 0,
    created: 0,
    revoked: 0
  },
  errors: {
    auth: 0,
    session: 0,
    token: 0
  }
};

// Increment metrics
metrics.tokens.issued++;
metrics.sessions.active++;

// Export metrics
app.get('/metrics', (req, res) => {
  res.json(metrics);
});
```

### Security Headers

```javascript
// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

### Backup and Recovery

#### Database Backup
```bash
# Create database backup
mysqldump -u root -p stylay > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database backup
mysql -u root -p stylay < backup_file.sql
```

#### Redis Backup
```bash
# Create Redis backup
redis-cli BGSAVE
# Wait for backup to complete
redis-cli LASTSAVE

# Restore Redis backup
redis-cli --rdb backup_file.rdb
```

#### Application Backup
```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz server/

# Restore application files
tar -xzf app_backup_file.tar.gz
```

---

**Document Version**: 1.0.0
**Last Updated**: December 31, 2025
**Status**: Production Ready
**Next Review**: March 31, 2026

For support and questions, please contact the development team or refer to the individual component documentation files.