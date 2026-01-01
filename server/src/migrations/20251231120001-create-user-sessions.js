'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_sessions', {
      id: {
        type: Sequelize.STRING(255),
        primaryKey: true,
        allowNull: false,
        comment: 'Unique session ID'
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'User who owns this session'
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
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Whether this session is currently active'
      },
      last_activity: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Last time this session had activity'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'When the session was created'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'When this session expires'
      }
    });

    // Add indexes
    await queryInterface.addIndex('user_sessions', {
      name: 'idx_user_session_user_id',
      fields: ['user_id']
    });

    await queryInterface.addIndex('user_sessions', {
      name: 'idx_user_session_is_active',
      fields: ['is_active']
    });

    await queryInterface.addIndex('user_sessions', {
      name: 'idx_user_session_last_activity',
      fields: ['last_activity']
    });

    await queryInterface.addIndex('user_sessions', {
      name: 'idx_user_session_expires_at',
      fields: ['expires_at']
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_sessions');
  }
};