# Refresh Token System Architecture

## Overview

This document outlines the comprehensive refresh token system architecture designed to address critical security issues in the current authentication system, including persistent blacklisting, session management, and token rotation.

## Current Problems Identified

1. **Token Blacklisting Fails After Database Clearance**: When database is cleared, blacklisted tokens become valid again
2. **No Refresh Token System**: Only 90-day access tokens with no refresh mechanism
3. **No Session Management**: Cannot blacklist all tokens for a user
4. **Security Vulnerabilities**: Long-lived tokens increase attack surface
5. **No Device Tracking**: Cannot manage multiple device sessions per user

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Client    │    │   Mobile Client  │    │   API Client    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Login Request      │                       │
         │──────────────────────►│                       │
         │                       │                       │
         │                       │                       │
         │ 2. Access + Refresh   │                       │
         │◄──────────────────────│                       │
         │                       │                       │
         │                       │                       │
         │ 3. API Request        │                       │
         │──────────────────────►│                       │
         │                       │                       │
         │                       │                       │
         │ 4. Token Refresh      │                       │
         │◄──────────────────────│                       │
         │                       │                       │
         │                       │                       │
         │ 5. Logout             │                       │
         │──────────────────────►│                       │
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Load Balancer                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Service                       │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Auth Routes   │  │  Token Service  │  │ Session Service │  │
│  │                 │  │                 │  │                 │  │
│  │ • /login        │  │ • Generate      │  │ • Create        │  │
│  │ • /refresh      │  │ • Validate      │  │ • Track         │  │
│  │ • /logout       │  │ • Blacklist     │  │ • Revoke        │  │
│  │ • /sessions     │  │ • Cleanup       │  │ • List          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Redis Cache                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Access Token  │  │  Refresh Token  │  │   Session Data  │  │
│  │   Blacklist     │  │   Storage       │  │   Management    │  │
│  │                 │  │                 │  │                 │  │
│  │ • TTL: 15 min   │  │ • TTL: 30 days  │  │ • Device Info   │  │
│  │ • Fast Lookup   │  │ • Secure Store  │  │ • Last Active   │  │
│  │ • Auto Cleanup  │  │ • Rotation      │  │ • IP Tracking   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                             │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Refresh Token  │  │   Token         │  │   User          │  │
│  │   Model         │  │   Blacklist     │  │   Model         │  │
│  │                 │  │   Model         │  │                 │  │
│  │ • User FK       │  │ • Token Hash    │  │ • Sessions      │  │
│  │ • Device Info   │  │ • Expiry        │  │ • Last Login    │  │
│  │ • Last Used     │  │ • User FK       │  │ • Security      │  │
│  │ • IP Address    │  │ • Reason        │  │   Settings      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema Design

### 1. Refresh Token Model

```sql
CREATE TABLE refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info JSON NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_last_used (last_used_at)
);
```

### 2. Enhanced Token Blacklist Model

```sql
CREATE TABLE token_blacklist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    token_type ENUM('access', 'refresh') NOT NULL,
    token_expiry BIGINT NOT NULL,
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(100) NOT NULL,
    user_id INT,
    session_id VARCHAR(255),
    device_info JSON,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_token_hash (token_hash),
    INDEX idx_token_expiry (token_expiry),
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_blacklisted_at (blacklisted_at)
);
```

### 3. User Session Model

```sql
CREATE TABLE user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    device_info JSON NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active),
    INDEX idx_last_activity (last_activity),
    INDEX idx_expires_at (expires_at)
);
```

## API Endpoints Design

### 1. Authentication Endpoints

#### POST /api/v1/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "tokens": {
      "access": {
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "expires_in": 900,
        "type": "Bearer"
      },
      "refresh": {
        "token": "refresh_token_hash",
        "expires_in": 2592000
      }
    },
    "session": {
      "id": "session_abc123",
      "device_info": {
        "browser": "Chrome",
        "os": "Windows",
        "device": "Desktop"
      },
      "ip_address": "192.168.1.1"
    }
  }
}
```

#### POST /api/v1/auth/refresh
**Request:**
```json
{
  "refresh_token": "refresh_token_hash",
  "session_id": "session_abc123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "access": {
      "token": "new_access_token",
      "expires_in": 900,
      "type": "Bearer"
    },
    "refresh": {
      "token": "new_refresh_token_hash",
      "expires_in": 2592000
    }
  }
}
```

#### POST /api/v1/auth/logout
**Request:**
```json
{
  "session_id": "session_abc123",
  "logout_all": false
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### 2. Session Management Endpoints

#### GET /api/v1/auth/sessions
**Response:**
```json
{
  "status": "success",
  "data": {
    "current_session": {
      "id": "session_abc123",
      "device_info": {...},
      "ip_address": "192.168.1.1",
      "last_activity": "2025-12-31T12:00:00Z",
      "is_current": true
    },
    "other_sessions": [
      {
        "id": "session_def456",
        "device_info": {...},
        "ip_address": "10.0.0.1",
        "last_activity": "2025-12-30T10:00:00Z",
        "is_current": false
      }
    ]
  }
}
```

#### DELETE /api/v1/auth/sessions/:sessionId
**Response:**
```json
{
  "status": "success",
  "message": "Session terminated successfully"
}
```

#### DELETE /api/v1/auth/sessions
**Response:**
```json
{
  "status": "success",
  "message": "All sessions terminated successfully"
}
```

### 3. Admin Endpoints

#### GET /api/v1/admin/users/:userId/sessions
**Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": 123,
    "sessions": [
      {
        "id": "session_abc123",
        "device_info": {...},
        "ip_address": "192.168.1.1",
        "last_activity": "2025-12-31T12:00:00Z",
        "is_active": true
      }
    ]
  }
}
```

#### POST /api/v1/admin/users/:userId/revoke-all-sessions
**Response:**
```json
{
  "status": "success",
  "message": "All sessions for user revoked successfully"
}
```

## Security Model

### 1. Token Lifecycle

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───▶│   Access    │───▶│   Refresh   │───▶│   Logout    │
│             │    │   Token     │    │   Token     │    │             │
│ • 15 min    │    │ • 15 min    │    │ • 30 days   │    │ • Immediate │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
         │                 │                 │                 │
         │                 │                 │                 │
         ▼                 ▼                 ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Session   │    │   Blacklist │    │   Rotation  │    │   Cleanup   │
│             │    │             │    │             │    │             │
│ • 30 days   │    │ • Persistent│    │ • Automatic │    │ • Automatic │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 2. Security Measures

#### Token Security
- **Access Tokens**: Short-lived (15 minutes), signed with JWT
- **Refresh Tokens**: Long-lived (30 days), stored securely with device binding
- **Token Rotation**: New refresh token issued on each refresh
- **Device Binding**: Refresh tokens tied to device fingerprint
- **IP Tracking**: Monitor for suspicious IP changes

#### Session Security
- **Session Tracking**: All active sessions tracked in real-time
- **Device Fingerprinting**: Unique device identification
- **Activity Monitoring**: Last activity tracking for security analysis
- **Concurrent Session Limits**: Configurable maximum sessions per user

#### Blacklisting Security
- **Persistent Storage**: Blacklist survives database operations
- **Redis + Database**: Dual-layer storage for performance and persistence
- **Automatic Cleanup**: Expired tokens automatically removed
- **Session Revocation**: Complete session termination capability

## Migration Strategy

### Phase 1: Foundation (Week 1)
1. **Database Schema Updates**
   - Add refresh_tokens table
   - Enhance token_blacklist table
   - Add user_sessions table
   - Create migration scripts

2. **Core Infrastructure**
   - Implement refresh token service
   - Update token blacklist service
   - Create session management service
   - Add Redis configuration for sessions

### Phase 2: Authentication Enhancement (Week 2)
1. **API Updates**
   - Modify login endpoint to return refresh tokens
   - Add refresh token endpoint
   - Implement session management endpoints
   - Update logout functionality

2. **Middleware Updates**
   - Enhance authentication middleware
   - Fix blacklisting issues
   - Add session validation
   - Implement device tracking

### Phase 3: Client Integration (Week 3)
1. **Frontend Updates**
   - Update login flow to handle refresh tokens
   - Implement automatic token refresh
   - Add session management UI
   - Update logout functionality

2. **Mobile App Updates**
   - Implement refresh token handling
   - Add session management
   - Update authentication flows

### Phase 4: Advanced Features (Week 4)
1. **Admin Features**
   - Session management dashboard
   - Bulk session revocation
   - Security monitoring
   - Audit logging

2. **Monitoring & Cleanup**
   - Scheduled cleanup jobs
   - Performance monitoring
   - Security alerts
   - Analytics dashboard

### Backward Compatibility
- **Dual Token Support**: Support both old and new token systems during transition
- **Gradual Migration**: Users migrate automatically on next login
- **Fallback Mechanisms**: Graceful degradation if new features fail
- **Configuration Flags**: Enable/disable new features via environment variables

## Error Handling

### Error Response Format
```json
{
  "status": "error",
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Access token has expired",
    "details": {
      "token_type": "access",
      "expired_at": "2025-12-31T12:15:00Z"
    }
  }
}
```

### Error Codes
- `TOKEN_EXPIRED`: Access token expired, requires refresh
- `REFRESH_TOKEN_EXPIRED`: Refresh token expired, requires re-login
- `TOKEN_REVOKED`: Token blacklisted, requires re-login
- `SESSION_EXPIRED`: Session expired, requires re-login
- `DEVICE_MISMATCH`: Device fingerprint mismatch
- `IP_CHANGED`: Suspicious IP change detected
- `MAX_SESSIONS`: User has too many active sessions
- `INVALID_TOKEN`: Token format or signature invalid

### Error Recovery
- **Automatic Refresh**: Client automatically refreshes expired access tokens
- **Graceful Degradation**: System continues to function if session tracking fails
- **User Notifications**: Clear error messages for users
- **Admin Alerts**: Security events logged and alerted

## Implementation Roadmap

### Week 1: Core Infrastructure
- [ ] Create database migration scripts
- [ ] Implement refresh token model
- [ ] Implement session model
- [ ] Enhance token blacklist model
- [ ] Create refresh token service
- [ ] Create session management service
- [ ] Update Redis configuration

### Week 2: Authentication Updates
- [ ] Modify login endpoint
- [ ] Add refresh token endpoint
- [ ] Implement session management endpoints
- [ ] Update logout functionality
- [ ] Enhance authentication middleware
- [ ] Fix blacklisting issues
- [ ] Add device tracking

### Week 3: Client Integration
- [ ] Update frontend authentication
- [ ] Implement automatic token refresh
- [ ] Add session management UI
- [ ] Update mobile app authentication
- [ ] Test integration scenarios
- [ ] Performance optimization

### Week 4: Advanced Features
- [ ] Admin session management dashboard
- [ ] Bulk session revocation
- [ ] Security monitoring
- [ ] Audit logging
- [ ] Scheduled cleanup jobs
- [ ] Performance monitoring
- [ ] Documentation and training

## Security Considerations

### Token Security
- **Storage**: Refresh tokens stored securely with encryption
- **Transmission**: All tokens transmitted over HTTPS only
- **Validation**: Strict token validation with signature verification
- **Rotation**: Automatic refresh token rotation on each use

### Session Security
- **Fingerprinting**: Device fingerprinting for session validation
- **Activity Tracking**: Monitor session activity for anomalies
- **Timeout**: Automatic session timeout after inactivity
- **Revocation**: Immediate session revocation capability

### Data Protection
- **Encryption**: Sensitive data encrypted at rest and in transit
- **Access Control**: Role-based access to session management
- **Audit Logging**: All security events logged for analysis
- **Compliance**: GDPR and data protection compliance

## Performance Considerations

### Redis Optimization
- **Memory Management**: Efficient memory usage for token storage
- **TTL Configuration**: Appropriate TTL settings for automatic cleanup
- **Connection Pooling**: Optimized Redis connection management
- **Cluster Support**: Redis cluster support for high availability

### Database Optimization
- **Indexing**: Proper indexing for fast token lookups
- **Partitioning**: Consider partitioning for large-scale deployments
- **Caching**: Strategic caching to reduce database load
- **Cleanup Jobs**: Efficient cleanup of expired tokens

### Monitoring
- **Performance Metrics**: Track authentication performance
- **Error Rates**: Monitor authentication error rates
- **Session Analytics**: Analyze session patterns and usage
- **Security Events**: Monitor for security incidents

This comprehensive refresh token system architecture addresses all identified security issues while providing a robust, scalable, and maintainable authentication solution.