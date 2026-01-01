const { DataTypes, Op } = require('sequelize');

/**
 * Refresh Token Model
 * Stores refresh tokens with device fingerprinting and session tracking
 */
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
      onDelete: 'CASCADE',
      comment: 'User who owns this refresh token'
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Hashed refresh token for secure storage'
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Associated session ID'
    },
    device_info: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Device fingerprint and metadata'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP address of the device'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent string'
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time this token was used'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Token expiration timestamp'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'Whether this token is currently active'
    }
  }, {
    tableName: 'refresh_tokens',
    timestamps: true,
    indexes: [
      {
        name: 'idx_refresh_token_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_refresh_token_hash',
        unique: true,
        fields: ['token_hash']
      },
      {
        name: 'idx_refresh_token_session_id',
        fields: ['session_id']
      },
      {
        name: 'idx_refresh_token_expires_at',
        fields: ['expires_at']
      },
      {
        name: 'idx_refresh_token_last_used',
        fields: ['last_used_at']
      },
      {
        name: 'idx_refresh_token_active',
        fields: ['is_active']
      }
    ]
  });

  /**
   * Generate a secure hash from a refresh token
   */
  RefreshToken.generateTokenHash = function(token) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  };

  /**
   * Find a token by its hash
   */
  RefreshToken.findByTokenHash = async function(tokenHash) {
    return await this.findOne({ where: { token_hash: tokenHash } });
  };

  /**
   * Find active tokens for a user
   */
  RefreshToken.findActiveTokensForUser = async function(userId) {
    const now = new Date();
    return await this.findAll({
      where: {
        user_id: userId,
        is_active: true,
        expires_at: { [Op.gt]: now }
      },
      order: [['last_used_at', 'DESC']]
    });
  };

  /**
   * Find tokens for a specific session
   */
  RefreshToken.findTokensForSession = async function(sessionId) {
    return await this.findAll({
      where: { session_id: sessionId },
      order: [['created_at', 'DESC']]
    });
  };

  /**
   * Revoke a specific token
   */
  RefreshToken.revokeToken = async function(tokenHash) {
    const result = await this.update(
      { is_active: false },
      { where: { token_hash: tokenHash } }
    );
    return result[0] > 0;
  };

  /**
   * Revoke all tokens for a user
   */
  RefreshToken.revokeAllUserTokens = async function(userId) {
    const result = await this.update(
      { is_active: false },
      { where: { user_id: userId, is_active: true } }
    );
    return result[0];
  };

  /**
   * Revoke all tokens for a session
   */
  RefreshToken.revokeSessionTokens = async function(sessionId) {
    const result = await this.update(
      { is_active: false },
      { where: { session_id: sessionId, is_active: true } }
    );
    return result[0];
  };

  /**
   * Update last used timestamp
   */
  RefreshToken.updateLastUsed = async function(tokenHash) {
    return await this.update(
      { last_used_at: new Date() },
      { where: { token_hash: tokenHash } }
    );
  };

  /**
   * Clean up expired tokens
   */
  RefreshToken.cleanupExpired = async function() {
    const now = new Date();
    const deletedCount = await this.destroy({
      where: {
        expires_at: { [Op.lt]: now }
      }
    });
    
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired refresh tokens`);
    }
    
    return deletedCount;
  };

  /**
   * Clean up inactive tokens (older than 30 days)
   */
  RefreshToken.cleanupInactive = async function(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const deletedCount = await this.destroy({
      where: {
        is_active: false,
        updated_at: { [Op.lt]: cutoffDate }
      }
    });
    
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} inactive refresh tokens`);
    }
    
    return deletedCount;
  };

  /**
   * Get token statistics for a user
   */
  RefreshToken.getUserTokenStats = async function(userId) {
    const now = new Date();
    
    const total = await this.count({ where: { user_id: userId } });
    const active = await this.count({
      where: {
        user_id: userId,
        is_active: true,
        expires_at: { [Op.gt]: now }
      }
    });
    const expired = await this.count({
      where: {
        user_id: userId,
        expires_at: { [Op.lt]: now }
      }
    });
    const inactive = total - active - expired;
    
    return {
      total,
      active,
      expired,
      inactive
    };
  };

  /**
   * Check if token is expired
   */
  RefreshToken.prototype.isExpired = function() {
    return new Date() > this.expires_at;
  };

  /**
   * Check if token is valid (active and not expired)
   */
  RefreshToken.prototype.isValid = function() {
    return this.is_active && !this.isExpired();
  };

  return RefreshToken;
};