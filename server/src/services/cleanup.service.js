const refreshTokenService = require('./refresh-token.service');
const sessionService = require('./session.service');
const tokenBlacklistService = require('./token-blacklist.service');
const logger = require('../utils/logger');
/**
 * Cleanup Service
 * Handles scheduled cleanup of expired tokens, sessions, and blacklist entries
 */
class CleanupService {
  /**
   * Clean up all expired tokens, sessions, and blacklist entries
   * @returns {Promise<Object>}
   */
  async cleanupExpiredTokens() {
    try {
      const [refreshTokenCount, sessionCount, blacklistCount] = await Promise.all([
        refreshTokenService.cleanupExpiredTokens(),
        sessionService.cleanupExpiredSessions(),
        tokenBlacklistService.cleanup()
      ]);
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
  /**
   * Clean up inactive tokens and sessions
   * @param {number} days - Number of days to keep inactive items
   * @returns {Promise<Object>}
   */
  async cleanupInactiveItems(days = 30) {
    try {
      const [refreshTokenCount, sessionCount] = await Promise.all([
        refreshTokenService.cleanupInactiveTokens(days),
        sessionService.cleanupInactiveSessions(days)
      ]);
      return {
        refreshTokenCount,
        sessionCount,
        days
      };
    } catch (error) {
      logger.error('Error during inactive items cleanup:', error);
      throw error;
    }
  }
  /**
   * Run scheduled cleanup job
   * @returns {Promise<Object>}
   */
  async runScheduledCleanup() {
    try {
      const result = await this.cleanupExpiredTokens();
      return result;
    } catch (error) {
      logger.error('Scheduled cleanup failed:', error);
      throw error;
    }
  }
  /**
   * Run comprehensive cleanup (expired + inactive)
   * @param {number} inactiveDays - Days to keep inactive items
   * @returns {Promise<Object>}
   */
  async runComprehensiveCleanup(inactiveDays = 30) {
    try {
      const [expiredResult, inactiveResult] = await Promise.all([
        this.cleanupExpiredTokens(),
        this.cleanupInactiveItems(inactiveDays)
      ]);
      const result = {
        expired: expiredResult,
        inactive: inactiveResult,
        total: {
          refreshTokens: expiredResult.refreshTokenCount + inactiveResult.refreshTokenCount,
          sessions: expiredResult.sessionCount + inactiveResult.sessionCount,
          blacklist: expiredResult.blacklistCount
        }
      };
      return result;
    } catch (error) {
      logger.error('Comprehensive cleanup failed:', error);
      throw error;
    }
  }
  /**
   * Get cleanup statistics
   * @returns {Promise<Object>}
   */
  async getCleanupStats() {
    try {
      const now = Date.now();
      // Get counts of items that would be cleaned up
      const { RefreshToken, UserSession, TokenBlacklist } = require('../models');
      const expiredRefreshTokens = await RefreshToken.count({
        where: { expires_at: { [Op.lt]: new Date() } }
      });
      const expiredSessions = await UserSession.count({
        where: { expires_at: { [Op.lt]: new Date() } }
      });
      const expiredBlacklist = await TokenBlacklist.count({
        where: { token_expiry: { [Op.lt]: now } }
      });
      const inactiveRefreshTokens = await RefreshToken.count({
        where: {
          is_active: false,
          updated_at: { [Op.lt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      });
      const inactiveSessions = await UserSession.count({
        where: {
          is_active: false,
          last_activity: { [Op.lt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      });
      return {
        pendingCleanup: {
          expired: {
            refreshTokens: expiredRefreshTokens,
            sessions: expiredSessions,
            blacklist: expiredBlacklist
          },
          inactive: {
            refreshTokens: inactiveRefreshTokens,
            sessions: inactiveSessions
          }
        },
        totalPending: expiredRefreshTokens + expiredSessions + expiredBlacklist + inactiveRefreshTokens + inactiveSessions
      };
    } catch (error) {
      logger.error('Error getting cleanup stats:', error);
      throw error;
    }
  }
  /**
   * Emergency cleanup - clean up everything expired immediately
   * @returns {Promise<Object>}
   */
  async emergencyCleanup() {
    try {
      const result = await this.runComprehensiveCleanup(0); // Clean up everything
      return result;
    } catch (error) {
      logger.error('Emergency cleanup failed:', error);
      throw error;
    }
  }
}
module.exports = new CleanupService();
