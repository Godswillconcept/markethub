'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'User who owns this refresh token'
      },
      token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Hashed refresh token for secure storage'
      },
      session_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Associated session ID'
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Device fingerprint and metadata'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP address of the device'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent string'
      },
      last_used_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last time this token was used'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Token expiration timestamp'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Whether this token is currently active'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('refresh_tokens', {
      name: 'idx_refresh_token_user_id',
      fields: ['user_id']
    });

    await queryInterface.addIndex('refresh_tokens', {
      name: 'idx_refresh_token_hash',
      unique: true,
      fields: ['token_hash']
    });

    await queryInterface.addIndex('refresh_tokens', {
      name: 'idx_refresh_token_session_id',
      fields: ['session_id']
    });

    await queryInterface.addIndex('refresh_tokens', {
      name: 'idx_refresh_token_expires_at',
      fields: ['expires_at']
    });

    await queryInterface.addIndex('refresh_tokens', {
      name: 'idx_refresh_token_last_used',
      fields: ['last_used_at']
    });

    await queryInterface.addIndex('refresh_tokens', {
      name: 'idx_refresh_token_active',
      fields: ['is_active']
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('refresh_tokens');
  }
};