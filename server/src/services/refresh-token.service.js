const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { RefreshToken, UserSession } = require('../models');
const tokenBlacklistService = require('../services/token-blacklist-enhanced.service');
const logger = require('../utils/logger');

/**
 * Refresh Token Service
 * Manages refresh token lifecycle with device fingerprinting and session management
 */
class RefreshTokenService {
  constructor() {
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
    this.sessionExpiry = process.env.SESSION_EXPIRES_IN || '30d';
    this.maxSessionsPerUser = parseInt(process.env.MAX_SESSIONS_PER_USER) || 5;
  }

  /**
   * Generate a secure refresh token
   * @returns {string}
   */
  generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Generate device fingerprint from request
   * @param {Object} req - Express request object
   * @returns {Object}
   */
  generateDeviceFingerprint(req) {
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    
    const fingerprint = crypto
      .createHash('sha256')
      .update(userAgent + ip + process.env.JWT_SECRET)
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

  /**
   * Extract browser from user agent
   */
  extractBrowser(userAgent) {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  /**
   * Extract OS from user agent
   */
  extractOS(userAgent) {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux') && !userAgent.includes('Android')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Extract device type from user agent
   */
  extractDevice(userAgent) {
    if (!userAgent) return 'Desktop';
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  /**
   * Calculate expiration date
   */
  calculateExpiry(days = 30) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  /**
   * Create a new refresh token for a user
   * @param {number} userId - User ID
   * @param {Object} req - Express request object
   * @returns {Promise<Object>}
   */
  async createRefreshToken(userId, req) {
    try {
      if (!userId) {
        throw new Error('User ID is required to create a refresh token');
      }
      const refreshToken = this.generateRefreshToken();
      const tokenHash = RefreshToken.generateTokenHash(refreshToken);
      const deviceInfo = this.generateDeviceFingerprint(req);
      const expiresAt = this.calculateExpiry(30);

      // Create session first
      const session = await this.createSession(userId, req);
      
      // Create refresh token
      const refreshRecord = await RefreshToken.create({
        user_id: userId,
        token_hash: tokenHash,
        session_id: session.id,
        device_info: deviceInfo,
        ip_address: deviceInfo.ip,
        user_agent: deviceInfo.userAgent,
        expires_at: expiresAt
      });

      logger.info(`Created refresh token for user ${userId}, session ${session.id}`);

      return {
        token: refreshToken,
        expiresAt: expiresAt,
        tokenId: refreshRecord.id,
        sessionId: session.id,
        deviceInfo: deviceInfo
      };
    } catch (error) {
      logger.error('Error creating refresh token:', error);
      throw error;
    }
  }

  /**
   * Create a new session for a user
   * @param {number} userId - User ID
   * @param {Object} req - Express request object
   * @returns {Promise<Object>}
   */
  async createSession(userId, req) {
    try {
      const sessionId = UserSession.generateSessionId();
      const deviceInfo = this.generateDeviceFingerprint(req);
      const expiresAt = this.calculateExpiry(30);

      // Check if user has too many active sessions
      const activeSessions = await UserSession.getActiveSessionsForUser(userId);
      if (activeSessions.length >= this.maxSessionsPerUser) {
        // Revoke the oldest session
        const oldestSession = activeSessions[activeSessions.length - 1];
        await UserSession.revokeSession(oldestSession.id);
        // Also revoke tokens for the old session
        await this.revokeSessionTokens(oldestSession.id);
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

      logger.info(`Created session ${sessionId} for user ${userId}`);

      return {
        id: sessionId,
        deviceInfo: deviceInfo,
        expiresAt: expiresAt
      };
    } catch (error) {
      logger.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Validate refresh token and session
   * @param {string} refreshToken - The refresh token
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>}
   */
  async validateRefreshToken(refreshToken, sessionId) {
    try {
      const tokenHash = RefreshToken.generateTokenHash(refreshToken);

      // Check if token is blacklisted
      const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new Error('Refresh token has been revoked');
      }

      // Find the refresh token record
      const refreshRecord = await RefreshToken.findByTokenHash(tokenHash);
      if (!refreshRecord) {
        throw new Error('Invalid refresh token');
      }

      // Check if token is expired
      if (refreshRecord.isExpired()) {
        await refreshRecord.destroy();
        throw new Error('Refresh token has expired');
      }

      // Check if token is active
      if (!refreshRecord.is_active) {
        throw new Error('Refresh token is not active');
      }

      // Validate session
      const session = await UserSession.getSessionById(sessionId);
      if (!session || !session.isValid()) {
        throw new Error('Session is invalid or expired');
      }

      // Update last used timestamp
      await RefreshToken.updateLastUsed(tokenHash);
      await session.updateActivity();

      return {
        userId: refreshRecord.user_id,
        sessionId: sessionId,
        deviceInfo: refreshRecord.device_info,
        session: session
      };
    } catch (error) {
      logger.error('Error validating refresh token:', error);
      throw error;
    }
  }

  /**
   * Refresh tokens (rotate refresh token and generate new access token)
   * @param {string} refreshToken - Current refresh token
   * @param {string} sessionId - Session ID
   * @param {Object} req - Express request object
   * @returns {Promise<Object>}
   */
  async refreshTokens(refreshToken, sessionId, req) {
    try {
      // Validate current refresh token
      const validation = await this.validateRefreshToken(refreshToken, sessionId);

      // Revoke the old refresh token
      await this.revokeRefreshToken(refreshToken);

      // Create new refresh token (rotation)
      const newRefreshToken = await this.createRefreshToken(validation.userId, req);

      // Generate new access token
      const newAccessToken = this.generateAccessToken(validation.userId);

      logger.info(`Tokens refreshed for user ${validation.userId}, session ${sessionId}`);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken.token,
        expiresAt: newRefreshToken.expiresAt,
        sessionId: sessionId
      };
    } catch (error) {
      logger.error('Error refreshing tokens:', error);
      throw error;
    }
  }

  /**
   * Generate access token
   * @param {number} userId - User ID
   * @returns {string}
   */
  generateAccessToken(userId) {
    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn }
    );
  }

  /**
   * Revoke a specific refresh token
   * @param {string} refreshToken - The refresh token to revoke
   * @returns {Promise<boolean>}
   */
  async revokeRefreshToken(refreshToken) {
    try {
      const tokenHash = RefreshToken.generateTokenHash(refreshToken);
      
      // Blacklist the token
      const blacklisted = await tokenBlacklistService.blacklistToken(
        refreshToken,
        'refresh',
        { reason: 'token_refresh' }
      );

      // Deactivate in database
      const deactivated = await RefreshToken.revokeToken(tokenHash);

      return blacklisted && deactivated;
    } catch (error) {
      logger.error('Error revoking refresh token:', error);
      return false;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>}
   */
  async revokeAllUserRefreshTokens(userId) {
    try {
      const count = await RefreshToken.revokeAllUserTokens(userId);
      
      // Also blacklist all user tokens
      await tokenBlacklistService.blacklistAllUserTokens(userId, 'user_logout');

      logger.info(`Revoked ${count} refresh tokens for user ${userId}`);
      return count;
    } catch (error) {
      logger.error('Error revoking all user refresh tokens:', error);
      throw error;
    }
  }

  /**
   * Revoke all tokens for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<number>}
   */
  async revokeSessionTokens(sessionId) {
    try {
      const count = await RefreshToken.revokeSessionTokens(sessionId);
      
      // Also blacklist session tokens
      await tokenBlacklistService.blacklistSessionTokens(sessionId, 'session_logout');

      logger.info(`Revoked ${count} refresh tokens for session ${sessionId}`);
      return count;
    } catch (error) {
      logger.error('Error revoking session tokens:', error);
      throw error;
    }
  }

  /**
   * Get active refresh tokens for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>}
   */
  async getUserRefreshTokens(userId) {
    try {
      return await RefreshToken.findActiveTokensForUser(userId);
    } catch (error) {
      logger.error('Error getting user refresh tokens:', error);
      throw error;
    }
  }

  /**
   * Get refresh token statistics for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async getUserTokenStats(userId) {
    try {
      return await RefreshToken.getUserTokenStats(userId);
    } catch (error) {
      logger.error('Error getting user token stats:', error);
      throw error;
    }
  }

  /**
   * Clean up expired refresh tokens
   * @returns {Promise<number>}
   */
  async cleanupExpiredTokens() {
    try {
      const deletedCount = await RefreshToken.cleanupExpired();
      logger.info(`Cleaned up ${deletedCount} expired refresh tokens`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }

  /**
   * Clean up inactive refresh tokens
   * @param {number} days - Number of days to keep inactive tokens
   * @returns {Promise<number>}
   */
  async cleanupInactiveTokens(days = 30) {
    try {
      const deletedCount = await RefreshToken.cleanupInactive(days);
      logger.info(`Cleaned up ${deletedCount} inactive refresh tokens`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up inactive tokens:', error);
      throw error;
    }
  }

  /**
   * Verify refresh token ownership
   * @param {string} refreshToken - The refresh token
   * @param {number} userId - User ID to verify ownership
   * @returns {Promise<boolean>}
   */
  async verifyTokenOwnership(refreshToken, userId) {
    try {
      const tokenHash = RefreshToken.generateTokenHash(refreshToken);
      const tokenRecord = await RefreshToken.findByTokenHash(tokenHash);
      
      if (!tokenRecord) {
        return false;
      }

      return tokenRecord.user_id === userId;
    } catch (error) {
      logger.error('Error verifying token ownership:', error);
      return false;
    }
  }

  /**
   * Get session information
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object|null>}
   */
  async getSessionInfo(sessionId) {
    try {
      const session = await UserSession.getSessionById(sessionId);
      if (!session) {
        return null;
      }

      return {
        id: session.id,
        deviceInfo: session.device_info,
        ipAddress: session.ip_address,
        lastActivity: session.last_activity,
        isActive: session.is_active,
        isExpired: session.isExpired(),
        isValid: session.isValid()
      };
    } catch (error) {
      logger.error('Error getting session info:', error);
      throw error;
    }
  }

  /**
   * Update session activity
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>}
   */
  async updateSessionActivity(sessionId) {
    try {
      const result = await UserSession.updateLastActivity(sessionId);
      return result[0] > 0;
    } catch (error) {
      logger.error('Error updating session activity:', error);
      return false;
    }
  }
}

module.exports = new RefreshTokenService();
