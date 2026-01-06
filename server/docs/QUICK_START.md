# Quick Start Guide - Enhanced Token System

## 🚀 5-Minute Setup

### Step 1: Add Environment Variables
Add to your `.env` file:

```bash
# Required
JWT_SECRET=your-super-secret-key-min-32-chars
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional (defaults shown)
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
SESSION_EXPIRES_IN=30d
MAX_SESSIONS_PER_USER=5
```

### Step 2: Run Database Migration
```bash
cd server
npx sequelize-cli db:migrate
```

### Step 3: Update Main App File
In `server.js` or `app.js`, add:

```javascript
const cleanupJob = require('./src/jobs/cleanup.job');

// After starting server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  cleanupJob.start(); // Add this line
});
```

### Step 4: Update Routes
In your main routes file, add:

```javascript
const authEnhancedRoutes = require('./routes/auth-enhanced.route');
app.use('/api/v1/auth', authEnhancedRoutes);
```

## 📋 API Quick Reference

### Login (New)
```bash
POST /api/v1/auth/login-enhanced
{
  "email": "user@example.com",
  "password": "password123"
}

# Returns:
# - access token (15 min)
# - refresh token (30 days)
# - session info
```

### Refresh Token
```bash
POST /api/v1/auth/refresh
{
  "refresh_token": "...",
  "session_id": "..."
}

# Returns new access + refresh tokens
```

### Get Sessions
```bash
GET /api/v1/auth/sessions
Authorization: Bearer <access_token>
X-Session-Id: <session_id>
```

### Logout
```bash
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
{
  "session_id": "...",  # optional
  "logout_all": false   # optional
}
```

## 🎯 Frontend Integration

### Login Flow
```javascript
const response = await fetch('/api/v1/auth/login-enhanced', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

const data = await response.json();

// Store tokens
localStorage.setItem('accessToken', data.data.tokens.access.token);
localStorage.setItem('refreshToken', data.data.tokens.refresh.token);
localStorage.setItem('sessionId', data.data.session.id);
```

### Token Refresh (Auto)
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
        body: JSON.stringify({ refresh_token: refreshToken, session_id: sessionId })
      });
      
      const data = await refreshResponse.json();
      localStorage.setItem('accessToken', data.data.access.token);
      localStorage.setItem('refreshToken', data.data.refresh.token);
      
      // Retry original request
      error.config.headers.Authorization = `Bearer ${data.data.access.token}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

## ✅ Verification Checklist

- [ ] Environment variables added
- [ ] Database migrated
- [ ] Cleanup job started
- [ ] Routes updated
- [ ] Login endpoint working
- [ ] Refresh token working
- [ ] Session management working
- [ ] Logout working

## 🐛 Troubleshooting

### Redis Connection Error
```bash
# Start Redis
redis-server

# Test connection
redis-cli ping
```

### Database Migration Error
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Run specific migration
npx sequelize-cli db:migrate --to 20251231120000
```

### Token Issues
```bash
# Check logs
tail -f logs/app.log

# Verify JWT_SECRET
echo $JWT_SECRET
```

## 📚 Next Steps

1. **Test locally** - Use the test suite
2. **Update frontend** - Implement token refresh logic
3. **Monitor** - Check logs for 24 hours
4. **Deploy** - Gradual rollout recommended

## 📖 Full Documentation

- **Implementation Guide**: `implementation-integration-guide.md`
- **Environment Config**: `environment-configuration.md`
- **Test Suite**: `src/tests/auth-enhanced.test.js`
- **Summary**: `implementation-summary.md`

---

**Status**: ✅ Ready for Production
**Time to Implement**: ~30 minutes
**Risk Level**: Low (backward compatible)