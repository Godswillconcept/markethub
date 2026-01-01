const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const redis = require('../config/redis');
const { TokenBlacklist, RefreshToken } = require('../models');
const logger = require('../utils/logger');

/**
 * Enhanced Token Blacklist Service with Session Tracking
 * Manages JWT token blacklisting using Redis for efficient lookup with database fallback
 * Provides comprehensive token blacklisting with session context and user-level control
 */
class TokenBlacklistService {
  constructor() {
    this.redis = redis;
  }

  /**
   * Hash the token for secure storage
   * @param {string} token - The JWT token to hash
   * @returns {string} - SHA256 hash of the token
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token + process.env.JWT_SECRET).digest('hex');
  }

  /**
   * Check if Redis is available for use
   * @returns {boolean} - True if Redis is connected and enabled
   */
  isRedisAvailable() {
    return this.redis.isConnected && this.redis.isEnabled;
  }

  /**
   * Add a token to the blacklist with Redis primary and database fallback
   * @param {string} token - The JWT token to blacklist
   * @param {string} tokenType - 'access' or 'refresh'
   * @param {Object} options - Additional context
   * @returns {Promise<boolean>} - Success status
   */
  async blacklistToken(token, tokenType = 'access', options = {}) {
    try {
      const {
        reason = 'logout',
        userId = null,
        sessionId = null,
        deviceInfo = null,
        ipAddress = null
      } = options;

      const tokenHash = this.hashToken(token);
      
      // Get token expiration time from JWT payload
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        logger.warn('Token blacklist: Unable to decode token expiration');
        return false;
      }

      const tokenExpiry = decoded.exp * 1000; // Convert to milliseconds
      const ttl = Math.max(0, Math.floor((tokenExpiry - Date.now()) / 1000));

      // Try Redis first if available
      if (this.isRedisAvailable()) {
        try {
          const key = `blacklist:${tokenHash}`;
          await this.redis.setex(key, ttl, JSON.stringify({
            token_type: tokenType,
            reason,
            user_id: userId,
            session_id: sessionId,
            device_info: deviceInfo,
            ip_address: ipAddress,
            blacklisted_at: Date.now()
          }));
          logger.info(`Token blacklisted in Redis with TTL: ${ttl} seconds`);
        } catch (redisError) {
          logger.warn('Redis blacklist failed, falling back to database:', redisError.message);
          // Continue to database fallback
        }
      }

      // Database storage with enhanced context
      await TokenBlacklist.blacklistToken(
        tokenHash,
        tokenType,
        tokenExpiry,
        {
          reason,
          userId,
          sessionId,
          deviceInfo,
          ipAddress
        }
      );

      logger.info(`Token blacklisted in database (type: ${tokenType}, expires: ${new Date(tokenExpiry).toISOString()})`);
      return true;
    } catch (error) {
      logger.error('Error blacklisting token:', error);
      return false;
    }
  }

  /**
   * Check if a token is blacklisted with Redis primary and database fallback
   * @param {string} token - The JWT token to check
   * @returns {Promise<boolean>} - True if token is blacklisted
   */
  async isTokenBlacklisted(token) {
    try {
      const tokenHash = this.hashToken(token);
      const now = Date.now();

      // Try Redis first if available
      if (this.isRedisAvailable()) {
        try {
          const key = `blacklist:${tokenHash}`;
          const result = await this.redis.get(key);
          if (result) {
            return true;
          }
        } catch (redisError) {
          logger.warn('Redis blacklist check failed, falling back to database:', redisError.message);
          // Continue to database fallback
        }
      }

      // Database fallback
      const isBlacklisted = await TokenBlacklist.isTokenBlacklisted(tokenHash);
      return isBlacklisted;
    } catch (error) {
      logger.error('Error checking token blacklist:', error);
      return false;
    }
  }

  /**
   * Blacklist all tokens for a specific user (logout all devices)
   * @param {number} userId - The user ID
   * @param {string} reason - Reason for blacklisting
   * @returns {Promise<number>} - Number of tokens blacklisted
   */
  async blacklistAllUserTokens(userId, reason = 'user_logout') {
    try {
      const blacklistedCount = await TokenBlacklist.blacklistAllUserTokens(userId, reason);

      // Also blacklist in Redis if available
      if (this.isRedisAvailable()) {
        try {
          // Get all active refresh tokens for the user
          const activeTokens = await RefreshToken.findActiveTokensForUser(userId);
          
          for (const token of activeTokens) {
            const redisKey = `blacklist:${token.token_hash}`;
            const ttl = Math.max(0, Math.floor((token.expires_at.getTime() - Date.now()) / 1000));
            await this.redis.setex(redisKey, ttl, JSON.stringify({
              token_type: 'refresh',
              reason,
              user_id: userId,
              session_id: token.session_id,
              device_info: token.device_info,
              ip_address: token.ip_address,
              blacklisted_at: Date.now()
            }));
          }
        } catch (redisError) {
          logger.warn('Failed to blacklist user tokens in Redis:', redisError.message);
        }
      }

      logger.info(`Blacklisted ${blacklistedCount} tokens for user ${userId}`);
      return blacklistedCount;
    } catch (error) {
      logger.error('Error blacklisting all user tokens:', error);
      throw error;
    }
  }

  /**
   * Clean up expired blacklist entries
   * @returns {Promise<number>} - Number of entries cleaned up
   */
  async cleanup() {
    try {
      let cleanedCount = 0;
      
      // Clean up Redis (if available) - Redis handles TTL automatically
      if (this.isRedisAvailable()) {
        // Redis keys with TTL are automatically cleaned up
        console.log('Redis blacklist cleanup: handled automatically by TTL');
      }
      
      // Clean up database
      cleanedCount = await TokenBlacklist.cleanupExpired();
      
      console.log('Token blacklist cleanup completed');
      return cleanedCount;
    } catch (error) {
      console.error('Error during blacklist cleanup:', error);
      throw error;
    }
  }

  /**
   * Blacklist all tokens for a specific session
   * @param {string} sessionId - The session ID
   * @param {string} reason - Reason for blacklisting
   * @returns {Promise<number>} - Number of tokens blacklisted
   */
  async blacklistSessionTokens(sessionId, reason = 'session_logout') {
    try {
      const sessionTokens = await RefreshToken.findTokensForSession(sessionId);
      
      let blacklistedCount = 0;
      for (const token of sessionTokens) {
        if (await this.blacklistToken(
          token.token_hash,
          'refresh',
          {
            reason,
            userId: token.user_id,
            sessionId,
            deviceInfo: token.device_info,
            ipAddress: token.ip_address
          }
        )) {
          blacklistedCount++;
        }
      }

      logger.info(`Blacklisted ${blacklistedCount} tokens for session ${sessionId}`);
      return blacklistedCount;
    } catch (error) {
      logger.error('Error blacklisting session tokens:', error);
      throw error;
    }
  }

  /**
   * Get blacklist entries for a user
   * @param {number} userId - The user ID
   * @returns {Promise<Array>}
   */
  async getUserBlacklist(userId) {
    try {
      return await TokenBlacklist.getUserBlacklist(userId);
    } catch (error) {
      logger.error('Error getting user blacklist:', error);
      throw error;
    }
  }

  /**
   * Get blacklist entries for a session
   * @param {string} sessionId - The session ID
   * @returns {Promise<Array>}
   */
  async getSessionBlacklist(sessionId) {
    try {
      return await TokenBlacklist.getSessionBlacklist(sessionId);
    } catch (error) {
      logger.error('Error getting session blacklist:', error);
      throw error;
    }
  }

  /**
   * Verify token and blacklist it if valid
   * @param {string} token - The JWT token
   * @param {string} tokenType - Token type
   * @param {Object} context - Additional context for blacklisting
   * @returns {Promise<boolean>} - True if successfully blacklisted
   */
  async revokeToken(token, tokenType = 'access', context = {}) {
    try {
      // First check if already blacklisted
      if (await this.isTokenBlacklisted(token)) {
        logger.info('Token already blacklisted');
        return true;
      }

      // Verify token is valid before blacklisting
      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (verifyError) {
        logger.warn('Token verification failed before blacklisting:', verifyError.message);
        // Still blacklist it even if expired/invalid
      }

      return await this.blacklistToken(token, tokenType, context);
    } catch (error) {
      logger.error('Error revoking token:', error);
      return false;
    }
  }

  /**
   * Get detailed blacklist information
   * @param {string} tokenHash - Optional specific token hash
   * @returns {Promise<Object>}
   */
  async getBlacklistDetails(tokenHash = null) {
    try {
      if (tokenHash) {
        const entry = await TokenBlacklist.findOne({
          where: { token_hash: tokenHash }
        });
        return entry ? entry.toJSON() : null;
      }

      const entries = await TokenBlacklist.findAll({
        order: [['blacklisted_at', 'DESC']],
        limit: 100 // Limit to prevent huge responses
      });

      return entries.map(entry => entry.toJSON());
    } catch (error) {
      logger.error('Error getting blacklist details:', error);
      throw error;
    }
  }

  /**
   * Get blacklist statistics
   * @returns {Promise<Object>} - Statistics about the blacklist
   */
  async getStats() {
    try {
      const stats = {
        redis: {
          available: this.isRedisAvailable(),
          connected: this.redis.isConnected
        },
        database: {}
      };

      // Get database stats
      const dbStats = await TokenBlacklist.getStats();
      stats.database = dbStats;

      return stats;
    } catch (error) {
      logger.error('Error getting blacklist stats:', error);
      return { error: error.message };
    }
  }
}

module.exports = new TokenBlacklistService();
