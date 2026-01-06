# Enhanced Token Refresh Mechanism

This document describes the improved token refresh mechanism implemented in the client to address critical authentication issues.

## Issues Addressed

1. **Missing session_id in refresh requests** - The server requires both refresh_token AND session_id, but client only sent refresh_token
2. **No concurrent request handling** - Multiple 401s trigger simultaneous refresh attempts
3. **No retry mechanism** - Single refresh failure immediately logs out users
4. **Poor error handling** - Network failures during refresh not handled gracefully
5. **No cross-tab synchronization** - Authentication state inconsistent across browser tabs

## Implementation Details

### 1. Fixed Refresh Token Request

**File**: `client/src/services/axios.js`

The refresh token request now includes both required parameters:

```javascript
const response = await axios.post(
  `${getApiUrl()}/auth/refresh-token`,
  { 
    refresh_token: refreshToken,
    session_id: sessionId  // Added session_id
  },
  {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    withCredentials: true,
  }
);
```

### 2. Implemented Concurrent Request Handling

**State Management**:
```javascript
let isRefreshing = false;
let failedQueue = [];
```

**Queue Mechanism**:
- When a 401 error occurs and refresh is already in progress, requests are queued
- Queued requests are processed after successful token refresh
- Prevents multiple simultaneous refresh attempts

### 3. Added Retry Mechanism with Exponential Backoff

**Retry Configuration**:
```javascript
const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY = 1000; // 1 second base delay

// Exponential backoff: delay = base * 2^(attempt-1)
const delay = BASE_RETRY_DELAY * Math.pow(2, attempt - 1);
```

**Retry Logic**:
- Up to 3 retry attempts with exponential backoff
- 1s, 2s, 4s delays between attempts
- Clear auth data and redirect to login after max retries

### 4. Improved Error Handling

**Network Error Handling**:
- Detects CORS issues
- Provides user-friendly error messages
- Logs detailed troubleshooting information

**Graceful Degradation**:
- Handles refresh failures without immediately logging out
- Preserves user experience during temporary issues

### 5. Added Cross-Tab Synchronization

**Storage Events**:
```javascript
window.addEventListener('storage', (event) => {
  if (event.key === 'auth_event') {
    const authEvent = JSON.parse(event.newValue);
    // Handle token refresh and logout events
  }
});
```

**Events**:
- `token_refreshed`: Updates token in other tabs
- `logout`: Clears auth state in all tabs

### 6. Updated Authentication Hooks

**useLogin Hook** (`client/src/Features/authentication/useLogin.js`):
```javascript
// Store session_id if available
if (response.session?.id) {
  localStorage.setItem("session_id", response.session.id);
}
```

**useLogout Hook** (`client/src/Features/authentication/useLogout.js`):
```javascript
// Clean up session_id
localStorage.removeItem("session_id");
```

## Usage

### Manual Token Refresh
Components can trigger manual token refresh:

```javascript
import { forceTokenRefresh } from '../services/axios.js';

const handleRefresh = async () => {
  try {
    await forceTokenRefresh();
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Check Token Expiration
```javascript
import { isTokenExpired } from '../services/axios.js';

if (isTokenExpired()) {
  // Token is expired, handle accordingly
}
```

## Benefits

1. **Improved Reliability**: Retry mechanism handles temporary network issues
2. **Better UX**: No immediate logout on single refresh failure
3. **Consistency**: Cross-tab synchronization maintains auth state
4. **Performance**: Concurrent request handling reduces unnecessary API calls
5. **Debugging**: Enhanced logging for troubleshooting

## Testing

Test file: `client/src/services/axios.test.js`

Run tests with:
```bash
npm test client/src/services/axios.test.js
```

## Backward Compatibility

The implementation maintains backward compatibility with existing code:
- All existing axios functionality preserved
- No breaking changes to API responses
- Graceful fallback for missing session_id