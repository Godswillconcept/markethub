const { DataTypes, Op } = require('sequelize');

/**
 * User Session Model
 * Tracks active user sessions with device fingerprinting and activity monitoring
 */
module.exports = (sequelize, DataTypes) => {
  const UserSession = sequelize.define('UserSession', {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
      comment: 'Unique session ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'User who owns this session'
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'Whether this session is currently active'
    },
    last_activity: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Last time this session had activity'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the session was created'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When this session expires'
    }
  }, {
    tableName: 'user_sessions',
    timestamps: false, // We're managing timestamps manually
    indexes: [
      {
        name: 'idx_user_session_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_user_session_is_active',
        fields: ['is_active']
      },
      {
        name: 'idx_user_session_last_activity',
        fields: ['last_activity']
      },
      {
        name: 'idx_user_session_expires_at',
        fields: ['expires_at']
      }
    ]
  });

  /**
   * Generate a secure session ID
   */
  UserSession.generateSessionId = function() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  };

  /**
   * Extract browser info from user agent
   */
  UserSession.extractBrowser = function(userAgent) {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  };

  /**
   * Extract OS info from user agent
   */
  UserSession.extractOS = function(userAgent) {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux') && !userAgent.includes('Android')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  };

  /**
   * Extract device type from user agent
   */
  UserSession.extractDevice = function(userAgent) {
    if (!userAgent) return 'Desktop';
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  };

  /**
   * Generate device fingerprint from request
   */
  UserSession.generateDeviceFingerprint = function(req) {
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    
    const fingerprint = crypto
      .createHash('sha256')
      .update(userAgent + ip + process.env.JWT_SECRET)
      .digest('hex');

    return {
      fingerprint,
      userAgent,
      browser: this.extractBrowser(userAgent),
      os: this.extractOS(userAgent),
      device: this.extractDevice(userAgent)
    };
  };

  /**
   * Find session by ID
   */
  UserSession.getSessionById = async function(sessionId) {
    return await this.findOne({ where: { id: sessionId } });
  };

  /**
   * Find active sessions for a user
   */
  UserSession.getActiveSessionsForUser = async function(userId) {
    const now = new Date();
    return await this.findAll({
      where: {
        user_id: userId,
        is_active: true,
        expires_at: { [Op.gt]: now }
      },
      order: [['last_activity', 'DESC']]
    });
  };

  /**
   * Find all sessions for a user (including inactive)
   */
  UserSession.getAllSessionsForUser = async function(userId) {
    return await this.findAll({
      where: { user_id: userId },
      order: [['last_activity', 'DESC']]
    });
  };

  /**
   * Update session activity
   */
  UserSession.updateLastActivity = async function(sessionId) {
    return await this.update(
      { last_activity: new Date() },
      { where: { id: sessionId } }
    );
  };

  /**
   * Revoke a specific session
   */
  UserSession.revokeSession = async function(sessionId) {
    const result = await this.update(
      { is_active: false },
      { where: { id: sessionId } }
    );
    return result[0] > 0;
  };

  /**
   * Revoke all sessions for a user (optionally exclude current session)
   */
  UserSession.revokeAllUserSessions = async function(userId, excludeSessionId = null) {
    const whereClause = {
      user_id: userId,
      is_active: true
    };
    
    if (excludeSessionId) {
      whereClause.id = { [Op.ne]: excludeSessionId };
    }
    
    const result = await this.update(
      { is_active: false },
      { where: whereClause }
    );
    return result[0];
  };

  /**
   * Check if session is expired
   */
  UserSession.prototype.isExpired = function() {
    return new Date() > this.expires_at;
  };

  /**
   * Check if session is valid (active and not expired)
   */
  UserSession.prototype.isValid = function() {
    return this.is_active && !this.isExpired();
  };

  /**
   * Update last activity timestamp
   */
  UserSession.prototype.updateActivity = async function() {
    this.last_activity = new Date();
    await this.save();
  };

  /**
   * Deactivate session
   */
  UserSession.prototype.deactivate = async function() {
    this.is_active = false;
    await this.save();
  };

  /**
   * Clean up expired sessions
   */
  UserSession.cleanupExpired = async function() {
    const now = new Date();
    const deletedCount = await this.destroy({
      where: {
        expires_at: { [Op.lt]: now }
      }
    });
    
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired user sessions`);
    }
    
    return deletedCount;
  };

  /**
   * Clean up inactive sessions (older than specified days)
   */
  UserSession.cleanupInactive = async function(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const deletedCount = await this.destroy({
      where: {
        is_active: false,
        last_activity: { [Op.lt]: cutoffDate }
      }
    });
    
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} inactive user sessions`);
    }
    
    return deletedCount;
  };

  /**
   * Get session statistics for a user
   */
  UserSession.getUserSessionStats = async function(userId) {
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
   * Get session device info
   */
  UserSession.prototype.getDeviceInfo = function() {
    return {
      id: this.id,
      browser: this.device_info?.browser || 'Unknown',
      os: this.device_info?.os || 'Unknown',
      device: this.device_info?.device || 'Desktop',
      ip_address: this.ip_address,
      last_activity: this.last_activity,
      is_current: false // This will be set by the controller
    };
  };

  return UserSession;
};