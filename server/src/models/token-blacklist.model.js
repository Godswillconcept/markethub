const { DataTypes, Op } = require('sequelize');
/**
 * Enhanced Token Blacklist Model with Session Tracking
 * Stores blacklisted JWT tokens with session context and user-level blacklisting support
 */
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
      unique: true,
      comment: 'SHA256 hash of the blacklisted token'
    },
    token_type: {
      type: DataTypes.ENUM('access', 'refresh'),
      allowNull: false,
      defaultValue: 'access',
      comment: 'Type of token being blacklisted'
    },
    token_expiry: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Unix timestamp when the original token expires'
    },
    blacklisted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the token was blacklisted'
    },
    reason: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'logout',
      comment: 'Reason for blacklisting (logout, password_change, security_breach, etc.)'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user whose token was blacklisted'
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Session ID associated with the token'
    },
    device_info: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Device information when token was blacklisted'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP address when token was blacklisted'
    }
  }, {
    tableName: 'token_blacklist',
    timestamps: true,
    indexes: [
      {
        name: 'idx_token_blacklist_hash',
        unique: true,
        fields: ['token_hash']
      },
      {
        name: 'idx_token_blacklist_expiry',
        fields: ['token_expiry']
      },
      {
        name: 'idx_token_blacklist_user',
        fields: ['user_id']
      },
      {
        name: 'idx_token_blacklist_session',
        fields: ['session_id']
      },
      {
        name: 'idx_token_blacklist_type',
        fields: ['token_type']
      },
      {
        name: 'idx_token_blacklist_reason',
        fields: ['reason']
      }
    ]
  });
  /**
   * Blacklist a token with session context
   */
  TokenBlacklist.blacklistToken = async function(tokenHash, tokenType, tokenExpiry, options = {}) {
    const { reason = 'logout', userId = null, sessionId = null, deviceInfo = null, ipAddress = null } = options;
    return await this.create({
      token_hash: tokenHash,
      token_type: tokenType,
      token_expiry: tokenExpiry,
      reason,
      user_id: userId,
      session_id: sessionId,
      device_info: deviceInfo,
      ip_address: ipAddress
    });
  };
  /**
   * Blacklist all tokens for a user (logout all devices)
   */
  TokenBlacklist.blacklistAllUserTokens = async function(userId, reason = 'user_logout') {
    const now = Date.now();
    // Get all active refresh tokens for the user
    const { RefreshToken } = require('./refresh-token.model');
    const activeTokens = await RefreshToken.findAll({
      where: {
        user_id: userId,
        expires_at: { [Op.gt]: new Date() }
      }
    });
    // Blacklist each token
    const blacklisted = [];
    for (const token of activeTokens) {
      try {
        await this.blacklistToken(
          token.token_hash,
          'refresh',
          token.expires_at.getTime(),
          {
            reason,
            userId,
            sessionId: token.session_id,
            deviceInfo: token.device_info,
            ipAddress: token.ip_address
          }
        );
        blacklisted.push(token.token_hash);
      } catch (error) {
        // Token might already be blacklisted, continue
        }
    }
    return blacklisted.length;
  };
  /**
   * Check if a token is blacklisted
   */
  TokenBlacklist.isTokenBlacklisted = async function(tokenHash) {
    const now = Date.now();
    const blacklistedToken = await this.findOne({
      where: {
        token_hash: tokenHash,
        token_expiry: { [Op.gt]: now }
      }
    });
    return !!blacklistedToken;
  };
  /**
   * Get blacklist entries for a user
   */
  TokenBlacklist.getUserBlacklist = async function(userId) {
    return await this.findAll({
      where: { user_id: userId },
      order: [['blacklisted_at', 'DESC']]
    });
  };
  /**
   * Get blacklist entries for a session
   */
  TokenBlacklist.getSessionBlacklist = async function(sessionId) {
    return await this.findAll({
      where: { session_id: sessionId },
      order: [['blacklisted_at', 'DESC']]
    });
  };
  /**
   * Clean up expired blacklist entries
   */
  TokenBlacklist.cleanupExpired = async function() {
    const now = Date.now();
    const deletedCount = await this.destroy({
      where: {
        token_expiry: { [Op.lt]: now }
      }
    });
    if (deletedCount > 0) {
      }
    return deletedCount;
  };
  /**
   * Get blacklist statistics
   */
  TokenBlacklist.getStats = async function() {
    const now = Date.now();
    const total = await this.count();
    const active = await this.count({
      where: { token_expiry: { [Op.gt]: now } }
    });
    const expired = total - active;
    const byType = await this.findAll({
      attributes: ['token_type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['token_type']
    });
    const byReason = await this.findAll({
      attributes: ['reason', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['reason']
    });
    return {
      total,
      active,
      expired,
      byType: byType.reduce((acc, row) => {
        acc[row.token_type] = parseInt(row.get('count'));
        return acc;
      }, {}),
      byReason: byReason.reduce((acc, row) => {
        acc[row.reason] = parseInt(row.get('count'));
        return acc;
      }, {})
    };
  };
  return TokenBlacklist;
};