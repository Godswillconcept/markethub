# Refresh Token System Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the refresh token system architecture. It includes code examples, configuration details, and integration steps.

## Implementation Files

### 1. Database Models

#### Refresh Token Model (`server/src/models/refresh-token.model.js`)

```javascript
const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    device_info: {
      type: DataTypes.JSON,
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'refresh_tokens',
    timestamps: true,
    indexes: [
      { name: 'idx_refresh_token_user_id', fields: ['user_id'] },
      { name: 'idx_refresh_token_hash', unique: true, fields: ['token_hash'] },
      { name: 'idx_refresh_token_expires_at', fields: ['expires_at'] }
    ]
  });

  // Class methods
  RefreshToken.generateTokenHash = function(token) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  };

  RefreshToken.cleanupExpired = async function() {
    const now = new Date();
    return await this.destroy({
      where: { expires_at: { [Op.lt]: now } }
    });
  };

  RefreshToken.revokeToken = async function(tokenHash) {
    return await this.destroy({ where: { token_hash: tokenHash } }) > 0;
  };

  RefreshToken.revokeAllUserTokens = async function(userId) {
    return await this.destroy({ where: { user_id: userId } });
  };

  // Instance methods
  RefreshToken.prototype.isExpired = function() {
    return new Date() > this.expires_at;
  };

  RefreshToken.prototype.updateLastUsed = async function() {
    this.last_used_at = new Date();
    await this.save();
  };

  return RefreshToken;
};
```

#### User Session Model (`server/src/models/user-session.model.js`)

```javascript
const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const UserSession = sequelize.define('UserSession', {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    device_info: {
      type: DataTypes.JSON,
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_activity: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'user_sessions',
    timestamps: true,
    indexes: [
      { name: 'idx_user_session_user_id', fields: ['user_id'] },
      { name: 'idx_user_session_is_active', fields: ['is_active'] },
      { name: 'idx_user_session_last_activity', fields: ['last_activity'] }
    ]
  });

  UserSession.generateSessionId = function() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  };

  UserSession.cleanupExpired = async function() {
    const now = new Date();
    return await this.destroy({
      where: { expires_at: { [Op.lt]: now } }
    });
  };

  UserSession.revokeSession = async function(sessionId) {
    const result = await this.update(
      { is_active: false },
      { where: { id: sessionId } }
    );
    return result[0] > 0;
  };

  UserSession.revokeAllUserSessions = async function(userId, excludeSessionId = null) {
    const whereClause = { user_id: userId, is_active: true };
    if (excludeSessionId) {
      whereClause.id = { [Op.ne]: excludeSessionId };
    }
    const result = await this.update(
      { is_active: false },
      { where: whereClause }
    );
    return result[0];
  };

  return UserSession;
};
```

#### Enhanced Token Blacklist Model (`server/src/models/token-blacklist.model.js`)

```javascript
const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const TokenBlacklist = sequelize.define('TokenBlacklist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    token_hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true
    },
    token_type: {
      type: DataTypes.ENUM('access', 'refresh'),
      allowNull: false
    },
    token_expiry: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    blacklisted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    reason: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'logout'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    device_info: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'token_blacklist',
    timestamps: true,
    indexes: [
      { name: 'idx_token_blacklist_hash', unique: true, fields: ['token_hash'] },
      { name: 'idx_token_blacklist_expiry', fields: ['token_expiry'] },
      { name: 'idx_token_blacklist_user', fields: ['user_id'] },
      { name: 'idx_token_blacklist_session', fields: ['session_id'] }
    ]
  });

  TokenBlacklist.cleanupExpired = async function() {
    const now = Date.now();
    return await this.destroy({
      where: { token_expiry: { [Op.lt]: now } }
    });
  };

  return TokenBlacklist;
};
```

### 2. Services

#### Refresh Token Service (`server/src/services/refresh-token.service.js`)

```javascript
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { RefreshToken, UserSession } = require('../models');
const tokenBlacklistService = require('./token-blacklist.service');
const logger = require('../utils/logger');

class RefreshTokenService {
  constructor() {
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
    this.sessionExpiry = process.env.SESSION_EXPIRES_IN || '30d';
  }

  generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  generateDeviceFingerprint(req) {
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress;
    
    // Create a simple device fingerprint
    const fingerprint = crypto
      .createHash('sha256')
      .update(userAgent + ip)
      .digest('hex');

    return {
      fingerprint,
      userAgent,
      ip,
      browser: this.extractBrowser(userAgent),
      os: this.extractOS(userAgent),
      device: this.extractDevice(userAgent)
    };
  }

  extractBrowser(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  extractOS(userAgent) {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  extractDevice(userAgent) {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  async createRefreshToken(userId, req) {
    const refreshToken = this.generateRefreshToken();
    const tokenHash = RefreshToken.generateTokenHash(refreshToken);
    const deviceInfo = this.generateDeviceFingerprint(req);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const refreshRecord = await RefreshToken.create({
      user_id: userId,
      token_hash: tokenHash,
      device_info: deviceInfo,
      ip_address: deviceInfo.ip,
      user_agent: deviceInfo.userAgent,
      expires_at: expiresAt
    });

    return {
      token: refreshToken,
      expiresAt: expiresAt,
      tokenId: refreshRecord.id
    };
  }

  async validateRefreshToken(refreshToken, sessionId) {
    const tokenHash = RefreshToken.generateTokenHash(refreshToken);
    
    // Check if token is blacklisted
    const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new Error('Refresh token has been revoked');
    }

    const refreshRecord = await RefreshToken.findByTokenHash(tokenHash);
    if (!refreshRecord) {
      throw new Error('Invalid refresh token');
    }

    if (refreshRecord.isExpired()) {
      await refreshRecord.destroy();
      throw new Error('Refresh token has expired');
    }

    // Validate session
    const session = await UserSession.getSessionById(sessionId);
    if (!session || !session.is_active) {
      throw new Error('Session is invalid or expired');
    }

    // Update last used
    await refreshRecord.updateLastUsed();

    return {
      userId: refreshRecord.user_id,
      sessionId: sessionId,
      deviceInfo: refreshRecord.device_info
    };
  }

  async revokeRefreshToken(refreshToken) {
    const tokenHash = RefreshToken.generateTokenHash(refreshToken);
    return await RefreshToken.revokeToken(tokenHash);
  }

  async revokeAllUserRefreshTokens(userId) {
    return await RefreshToken.revokeAllUserTokens(userId);
  }

  async cleanupExpiredTokens() {
    const deletedCount = await RefreshToken.cleanupExpired();
    logger.info(`Cleaned up ${deletedCount} expired refresh tokens`);
    return deletedCount;
  }
}

module.exports = new RefreshTokenService();
```

#### Session Service (`server/src/services/session.service.js`)

```javascript
const { UserSession } = require('../models');
const logger = require('../utils/logger');

class SessionService {
  constructor() {
    this.maxSessionsPerUser = parseInt(process.env.MAX_SESSIONS_PER_USER) || 5;
  }

  async createSession(userId, req) {
    const sessionId = UserSession.generateSessionId();
    const deviceInfo = this.generateDeviceFingerprint(req);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    // Check if user has too many active sessions
    const activeSessions = await UserSession.getActiveSessionsForUser(userId);
    if (activeSessions.length >= this.maxSessionsPerUser) {
      // Revoke the oldest session
      const oldestSession = activeSessions[activeSessions.length - 1];
      await oldestSession.deactivate();
      logger.info(`Revoked oldest session ${oldestSession.id} for user ${userId}`);
    }

    const session = await UserSession.create({
      id: sessionId,
      user_id: userId,
      device_info: deviceInfo,
      ip_address: deviceInfo.ip,
      user_agent: deviceInfo.userAgent,
      expires_at: expiresAt
    });

    return {
      id: sessionId,
      deviceInfo: deviceInfo,
      expiresAt: expiresAt
    };
  }

  async getSession(sessionId) {
    return await UserSession.getSessionById(sessionId);
  }

  async updateSessionActivity(sessionId) {
    return await UserSession.updateLastActivity(sessionId);
  }

  async revokeSession(sessionId) {
    return await UserSession.revokeSession(sessionId);
  }

  async revokeAllUserSessions(userId, excludeSessionId = null) {
    const revokedCount = await UserSession.revokeAllUserSessions(userId, excludeSessionId);
    logger.info(`Revoked ${revokedCount} sessions for user ${userId}`);
    return revokedCount;
  }

  async getUserSessions(userId) {
    return await UserSession.getActiveSessionsForUser(userId);
  }

  generateDeviceFingerprint(req) {
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress;
    
    const fingerprint = crypto
      .createHash('sha256')
      .update(userAgent + ip)
      .digest('hex');

    return {
      fingerprint,
      userAgent,
      ip,
      browser: this.extractBrowser(userAgent),
      os: this.extractOS(userAgent),
      device: this.extractDevice(userAgent)
    };
  }

  extractBrowser(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  extractOS(userAgent) {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  extractDevice(userAgent) {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  async cleanupExpiredSessions() {
    const deletedCount = await UserSession.cleanupExpired();
    logger.info(`Cleaned up ${deletedCount} expired user sessions`);
    return deletedCount;
  }
}

module.exports = new SessionService();
```

### 3. Enhanced Authentication Controller

#### Updated Auth Controller (`server/src/controllers/auth.controller.js`)

Add these new methods to the existing auth controller:

```javascript
// Add these imports at the top
const refreshTokenService = require('../services/refresh-token.service');
const sessionService = require('../services/session.service');

/**
 * Refresh access token using refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refresh_token, session_id } = req.body;

    if (!refresh_token || !session_id) {
      return next(new AppError('Refresh token and session ID are required', 400));
    }

    // Validate refresh token and session
    const validation = await refreshTokenService.validateRefreshToken(refresh_token, session_id);
    
    // Generate new access token
    const newAccessToken = signToken(validation.userId);
    
    // Generate new refresh token (rotation)
    const newRefreshToken = await refreshTokenService.createRefreshToken(validation.userId, req);
    
    // Update session activity
    await sessionService.updateSessionActivity(session_id);

    res.status(200).json({
      status: 'success',
      data: {
        access: {
          token: newAccessToken,
          expires_in: 900, // 15 minutes
          type: 'Bearer'
        },
        refresh: {
          token: newRefreshToken.token,
          expires_in: 2592000 // 30 days
        }
      }
    });
  } catch (err) {
    logger.error(`Error refreshing token: ${err.message}`, { error: err });
    if (err instanceof AppError) {
      next(err);
    } else {
      next(new AppError('Invalid refresh token', 401));
    }
  }
};

/**
 * Get user sessions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessions = await sessionService.getUserSessions(userId);

    // Mark current session
    const currentSessionId = req.headers['x-session-id'];
    const currentSession = sessions.find(s => s.id === currentSessionId);

    res.status(200).json({
      status: 'success',
      data: {
        current_session: currentSession ? {
          id: currentSession.id,
          device_info: currentSession.device_info,
          ip_address: currentSession.ip_address,
          last_activity: currentSession.last_activity,
          is_current: true
        } : null,
        other_sessions: sessions
          .filter(s => s.id !== currentSessionId)
          .map(s => ({
            id: s.id,
            device_info: s.device_info,
            ip_address: s.ip_address,
            last_activity: s.last_activity,
            is_current: false
          }))
      }
    });
  } catch (err) {
    logger.error(`Error getting sessions: ${err.message}`, { error: err });
    next(new AppError('Error retrieving sessions', 500));
  }
};

/**
 * Revoke specific session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Get the session to verify it belongs to the user
    const session = await sessionService.getSession(sessionId);
    if (!session || session.user_id !== userId) {
      return next(new AppError('Session not found', 404));
    }

    await sessionService.revokeSession(sessionId);

    res.status(200).json({
      status: 'success',
      message: 'Session revoked successfully'
    });
  } catch (err) {
    logger.error(`Error revoking session: ${err.message}`, { error: err });
    next(new AppError('Error revoking session', 500));
  }
};

/**
 * Revoke all sessions except current
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.revokeAllSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const currentSessionId = req.headers['x-session-id'];

    const revokedCount = await sessionService.revokeAllUserSessions(userId, currentSessionId);

    res.status(200).json({
      status: 'success',
      message: `Revoked ${revokedCount} sessions successfully`
    });
  } catch (err) {
    logger.error(`Error revoking all sessions: ${err.message}`, { error: err });
    next(new AppError('Error revoking sessions', 500));
  }
};

/**
 * Enhanced logout with session management
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.logout = async (req, res, next) => {
  try {
    const { session_id, logout_all = false } = req.body;
    const userId = req.user.id;

    if (logout_all) {
      // Revoke all sessions for user
      await sessionService.revokeAllUserSessions(userId);
      await refreshTokenService.revokeAllUserRefreshTokens(userId);
    } else if (session_id) {
      // Revoke specific session
      await sessionService.revokeSession(session_id);
      // Revoke associated refresh tokens (if any)
      // This would require tracking refresh token -> session relationships
    } else {
      // Default logout behavior
      // Clear cookies and blacklist JWT token
      if (req.cookies?.jwt) {
        res.clearCookie("jwt", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });
      }

      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const tokenBlacklistService = require('../services/token-blacklist.service');
        await tokenBlacklistService.blacklistToken(token);
      }
    }

    res.status(200).json({
      status: "success",
      message: "Successfully logged out"
    });
  } catch (err) {
    logger.error(`Error during logout: ${err.message}`, { error: err });
    next(new AppError('Error during logout', 500));
  }
};
```

### 4. Routes

#### Updated Auth Routes (`server/src/routes/auth.route.js`)

Add these routes to the existing auth routes:

```javascript
// Add these imports
const { refreshTokenValidation, sessionValidation } = require("../validators/auth.validator");

// Add these routes after the existing routes

// Refresh token route
router.post(
  "/refresh",
  refreshTokenValidation,
  validate,
  authController.refreshToken
);

// Session management routes
router.get(
  "/sessions",
  authController.getSessions
);

router.delete(
  "/sessions/:sessionId",
  sessionValidation,
  validate,
  authController.revokeSession
);

router.delete(
  "/sessions",
  authController.revokeAllSessions
);

// Enhanced logout route
router.post(
  "/logout",
  authController.logout
);
```

### 5. Validators

#### Auth Validators (`server/src/validators/auth.validator.js`)

Add these validation rules:

```javascript
// Add these validation rules

const refreshTokenValidation = [
  body('refresh_token')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid refresh token format'),
  body('session_id')
    .notEmpty()
    .withMessage('Session ID is required')
    .isLength({ min: 10 })
    .withMessage('Invalid session ID format')
];

const sessionValidation = [
  param('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isLength({ min: 10 })
    .withMessage('Invalid session ID format')
];

const logoutValidation = [
  body('session_id')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Invalid session ID format'),
  body('logout_all')
    .optional()
    .isBoolean()
    .withMessage('logout_all must be a boolean')
];

// Export the new validators
module.exports = {
  // ... existing exports
  refreshTokenValidation,
  sessionValidation,
  logoutValidation
};
```

### 6. Environment Configuration

#### Updated Environment Variables (`.env`)

Add these new environment variables:

```bash
# Refresh Token Configuration
REFRESH_TOKEN_EXPIRES_IN=30d
SESSION_EXPIRES_IN=30d
MAX_SESSIONS_PER_USER=5

# Token Rotation
REFRESH_TOKEN_ROTATION=true
DEVICE_FINGERPRINTING=true

# Session Security
SESSION_ACTIVITY_TRACKING=true
SESSION_IP_VALIDATION=true
```

### 7. Database Migrations

#### Migration Script (`server/migrations/20251231120000_create_refresh_token_system.js`)

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create refresh_tokens table
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: false
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      last_used_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
      }
    });

    // Create user_sessions table
    await queryInterface.createTable('user_sessions', {
      id: {
        type: Sequelize.STRING(255),
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: false
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      last_activity: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('refresh_tokens', ['user_id']);
    await queryInterface.addIndex('refresh_tokens', ['token_hash'], { unique: true });
    await queryInterface.addIndex('refresh_tokens', ['expires_at']);
    
    await queryInterface.addIndex('user_sessions', ['user_id']);
    await queryInterface.addIndex('user_sessions', ['is_active']);
    await queryInterface.addIndex('user_sessions', ['last_activity']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_sessions');
    await queryInterface.dropTable('refresh_tokens');
  }
};
```

### 8. Scheduled Cleanup Jobs

#### Cleanup Service (`server/src/services/cleanup.service.js`)

```javascript
const refreshTokenService = require('./refresh-token.service');
const sessionService = require('./session.service');
const tokenBlacklistService = require('./token-blacklist.service');
const logger = require('../utils/logger');

class CleanupService {
  async cleanupExpiredTokens() {
    try {
      const [refreshTokenCount, sessionCount, blacklistCount] = await Promise.all([
        refreshTokenService.cleanupExpiredTokens(),
        sessionService.cleanupExpiredSessions(),
        tokenBlacklistService.cleanup()
      ]);

      logger.info('Token cleanup completed', {
        refreshTokenCount,
        sessionCount,
        blacklistCount
      });

      return {
        refreshTokenCount,
        sessionCount,
        blacklistCount
      };
    } catch (error) {
      logger.error('Error during token cleanup:', error);
      throw error;
    }
  }

  async runScheduledCleanup() {
    logger.info('Starting scheduled cleanup job');
    try {
      const result = await this.cleanupExpiredTokens();
      logger.info('Scheduled cleanup completed successfully', result);
    } catch (error) {
      logger.error('Scheduled cleanup failed:', error);
    }
  }
}

module.exports = new CleanupService();
```

#### Cron Job Setup (`server/src/jobs/cleanup.job.js`)

```javascript
const cron = require('node-cron');
const cleanupService = require('../services/cleanup.service');
const logger = require('../utils/logger');

class CleanupJob {
  start() {
    // Run cleanup every hour
    cron.schedule('0 * * * *', async () => {
      logger.info('Running scheduled token cleanup job');
      await cleanupService.runScheduledCleanup();
    });

    logger.info('Cleanup job scheduled to run every hour');
  }
}

module.exports = new CleanupJob();
```

### 9. Testing Strategy

#### Unit Tests (`server/src/tests/services/refresh-token.service.test.js`)

```javascript
const { RefreshToken, User } = require('../../models');
const refreshTokenService = require('../../services/refresh-token.service');
const { setupTestDB, cleanupTestDB } = require('../helpers/test-helpers');

describe('RefreshTokenService', () => {
  beforeEach(async () => {
    await setupTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('createRefreshToken', () => {
    it('should create a refresh token for a user', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123'
      });

      const req = {
        get: jest.fn().mockReturnValue('Test User Agent'),
        ip: '127.0.0.1'
      };

      const result = await refreshTokenService.createRefreshToken(user.id, req);

      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
      expect(result.tokenId).toBeDefined();

      const savedToken = await RefreshToken.findByPk(result.tokenId);
      expect(savedToken).toBeTruthy();
      expect(savedToken.user_id).toBe(user.id);
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate a valid refresh token', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123'
      });

      const req = {
        get: jest.fn().mockReturnValue('Test User Agent'),
        ip: '127.0.0.1'
      };

      const session = await UserSession.create({
        id: 'test-session-id',
        user_id: user.id,
        device_info: {},
        expires_at: new Date(Date.now() + 86400000)
      });

      const { token } = await refreshTokenService.createRefreshToken(user.id, req);

      const validation = await refreshTokenService.validateRefreshToken(token, session.id);

      expect(validation.userId).toBe(user.id);
      expect(validation.sessionId).toBe(session.id);
    });
  });
});
```

### 10. Integration Testing

#### Integration Tests (`server/src/tests/integration/auth-refresh-token.test.js`)

```javascript
const request = require('supertest');
const app = require('../../app');
const { setupTestDB, cleanupTestDB } = require('../helpers/test-helpers');

describe('Auth Refresh Token Integration', () => {
  beforeEach(async () => {
    await setupTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 12),
        email_verified_at: new Date()
      });

      // Login to get refresh token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data.tokens).toBeDefined();
      expect(loginResponse.body.data.tokens.refresh).toBeDefined();

      // Refresh token
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refresh_token: loginResponse.body.data.tokens.refresh.token,
          session_id: loginResponse.body.data.session.id
        });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.data.access).toBeDefined();
      expect(refreshResponse.body.data.refresh).toBeDefined();
    });
  });
});
```

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Create database migration scripts
- [ ] Run migrations to create new tables
- [ ] Verify table structure and indexes

### Phase 2: Core Services
- [ ] Implement RefreshToken model
- [ ] Implement UserSession model
- [ ] Implement RefreshTokenService
- [ ] Implement SessionService
- [ ] Update TokenBlacklistService

### Phase 3: Authentication Updates
- [ ] Update auth controller with new endpoints
- [ ] Add validation rules for new endpoints
- [ ] Update auth routes
- [ ] Enhance authentication middleware

### Phase 4: Client Integration
- [ ] Update frontend authentication logic
- [ ] Implement automatic token refresh
- [ ] Add session management UI
- [ ] Update mobile app authentication

### Phase 5: Testing & Deployment
- [ ] Write unit tests for new services
- [ ] Write integration tests for endpoints
- [ ] Performance testing
- [ ] Security testing
- [ ] Deploy to staging environment
- [ ] Monitor and validate functionality

## Security Considerations

### Token Security
- **Storage**: Refresh tokens stored with SHA256 hashing
- **Transmission**: All tokens transmitted over HTTPS
- **Validation**: Strict device fingerprinting validation
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

This implementation guide provides a comprehensive roadmap for implementing the refresh token system with all necessary code examples, configuration details, and testing strategies.