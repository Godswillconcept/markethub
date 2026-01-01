const { UserSession } = require('../models');
const tokenBlacklistService = require('./token-blacklist-enhanced.service');
const logger = require('../utils/logger');

/**
 * Session Service
 * Manages user sessions with device tracking and activity monitoring
 */
class SessionService {
  constructor() {
    this.maxSessionsPerUser = parseInt(process.env.MAX_SESSIONS_PER_USER) || 5;
    this.sessionExpiry = process.env.SESSION_EXPIRES_IN || '30d';
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
        await this.revokeSession(oldestSession.id);
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
   * Get session by ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object|null>}
   */
  async getSession(sessionId) {
    try {
      return await UserSession.getSessionById(sessionId);
    } catch (error) {
      logger.error('Error getting session:', error);
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

  /**
   * Revoke a specific session
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>}
   */
  async revokeSession(sessionId) {
    try {
      // Revoke session
      const revoked = await UserSession.revokeSession(sessionId);
      
      // Revoke associated refresh tokens
      if (revoked) {
        const { RefreshToken } = require('./refresh-token.model');
        const tokens = await RefreshToken.findTokensForSession(sessionId);
        
        for (const token of tokens) {
          await tokenBlacklistService.blacklistToken(
            token.token_hash,
            'refresh',
            {
              reason: 'session_revoked',
              userId: token.user_id,
              sessionId: sessionId,
              deviceInfo: token.device_info,
              ipAddress: token.ip_address
            }
          );
        }
      }

      logger.info(`Revoked session ${sessionId}`);
      return revoked;
    } catch (error) {
      logger.error('Error revoking session:', error);
      throw error;
    }
  }

  /**
   * Revoke all sessions for a user
   * @param {number} userId - User ID
   * @param {string|null} excludeSessionId - Session to exclude
   * @returns {Promise<number>}
   */
  async revokeAllUserSessions(userId, excludeSessionId = null) {
    try {
      const revokedCount = await UserSession.revokeAllUserSessions(userId, excludeSessionId);
      
      // Revoke all associated refresh tokens
      const { RefreshToken } = require('./refresh-token.model');
      const activeTokens = await RefreshToken.findActiveTokensForUser(userId);
      
      for (const token of activeTokens) {
        if (excludeSessionId && token.session_id === excludeSessionId) {
          continue; // Skip tokens from the excluded session
        }
        
        await tokenBlacklistService.blacklistToken(
          token.token_hash,
          'refresh',
          {
            reason: 'user_logout_all',
            userId: userId,
            sessionId: token.session_id,
            deviceInfo: token.device_info,
            ipAddress: token.ip_address
          }
        );
      }

      logger.info(`Revoked ${revokedCount} sessions for user ${userId}`);
      return revokedCount;
    } catch (error) {
      logger.error('Error revoking all user sessions:', error);
      throw error;
    }
  }

  /**
   * Get all active sessions for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>}
   */
  async getUserSessions(userId) {
    try {
      return await UserSession.getActiveSessionsForUser(userId);
    } catch (error) {
      logger.error('Error getting user sessions:', error);
      throw error;
    }
  }

  /**
   * Get session statistics for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async getUserSessionStats(userId) {
    try {
      return await UserSession.getUserSessionStats(userId);
    } catch (error) {
      logger.error('Error getting user session stats:', error);
      throw error;
    }
  }

  /**
   * Clean up expired sessions
   * @returns {Promise<number>}
   */
  async cleanupExpiredSessions() {
    try {
      const deletedCount = await UserSession.cleanupExpired();
      logger.info(`Cleaned up ${deletedCount} expired user sessions`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }

  /**
   * Clean up inactive sessions
   * @param {number} days - Number of days to keep inactive sessions
   * @returns {Promise<number>}
   */
  async cleanupInactiveSessions(days = 30) {
    try {
      const deletedCount = await UserSession.cleanupInactive(days);
      logger.info(`Cleaned up ${deletedCount} inactive user sessions`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up inactive sessions:', error);
      throw error;
    }
  }

  /**
   * Generate device fingerprint from request
   * @param {Object} req - Express request object
   * @returns {Object}
   */
  generateDeviceFingerprint(req) {
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    
    const crypto = require('crypto');
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
   * Validate session
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>}
   */
  async validateSession(sessionId) {
    try {
      const session = await UserSession.getSessionById(sessionId);
      if (!session) {
        return false;
      }

      return session.isValid();
    } catch (error) {
      logger.error('Error validating session:', error);
      return false;
    }
  }

  /**
   * Get session details with device info
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object|null>}
   */
  async getSessionDetails(sessionId) {
    try {
      const session = await UserSession.getSessionById(sessionId);
      if (!session) {
        return null;
      }

      return {
        id: session.id,
        userId: session.user_id,
        deviceInfo: session.device_info,
        ipAddress: session.ip_address,
        lastActivity: session.last_activity,
        isActive: session.is_active,
        isExpired: session.isExpired(),
        isValid: session.isValid(),
        expiresAt: session.expires_at
      };
    } catch (error) {
      logger.error('Error getting session details:', error);
      throw error;
    }
  }

  /**
   * Update session device info (useful for device changes)
   * @param {string} sessionId - Session ID
   * @param {Object} req - Express request object
   * @returns {Promise<boolean>}
   */
  async updateSessionDeviceInfo(sessionId, req) {
    try {
      const deviceInfo = this.generateDeviceFingerprint(req);
      
      const [updated] = await UserSession.update(
        {
          device_info: deviceInfo,
          ip_address: deviceInfo.ip,
          user_agent: deviceInfo.userAgent,
          last_activity: new Date()
        },
        { where: { id: sessionId } }
      );

      return updated > 0;
    } catch (error) {
      logger.error('Error updating session device info:', error);
      return false;
    }
  }
}

module.exports = new SessionService();
