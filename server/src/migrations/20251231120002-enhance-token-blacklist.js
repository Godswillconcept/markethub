'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new columns to existing token_blacklist table
    await queryInterface.addColumn('token_blacklist', 'token_type', {
      type: Sequelize.ENUM('access', 'refresh'),
      allowNull: false,
      defaultValue: 'access',
      comment: 'Type of token being blacklisted'
    });

    await queryInterface.addColumn('token_blacklist', 'session_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Session ID associated with the token'
    });

    await queryInterface.addColumn('token_blacklist', 'device_info', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Device information when token was blacklisted'
    });

    await queryInterface.addColumn('token_blacklist', 'ip_address', {
      type: Sequelize.STRING(45),
      allowNull: true,
      comment: 'IP address when token was blacklisted'
    });

    // Update existing reason column to be NOT NULL with default
    await queryInterface.changeColumn('token_blacklist', 'reason', {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: 'logout',
      comment: 'Reason for blacklisting (logout, password_change, security_breach, etc.)'
    });

    // Add new indexes
    await queryInterface.addIndex('token_blacklist', {
      name: 'idx_token_blacklist_session',
      fields: ['session_id']
    });

    await queryInterface.addIndex('token_blacklist', {
      name: 'idx_token_blacklist_type',
      fields: ['token_type']
    });

    await queryInterface.addIndex('token_blacklist', {
      name: 'idx_token_blacklist_reason',
      fields: ['reason']
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('token_blacklist', 'idx_token_blacklist_reason');
    await queryInterface.removeIndex('token_blacklist', 'idx_token_blacklist_type');
    await queryInterface.removeIndex('token_blacklist', 'idx_token_blacklist_session');

    // Revert reason column changes
    await queryInterface.changeColumn('token_blacklist', 'reason', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: 'logout',
      comment: 'Reason for blacklisting (logout, password_change, etc.)'
    });

    // Remove added columns
    await queryInterface.removeColumn('token_blacklist', 'ip_address');
    await queryInterface.removeColumn('token_blacklist', 'device_info');
    await queryInterface.removeColumn('token_blacklist', 'session_id');
    await queryInterface.removeColumn('token_blacklist', 'token_type');
  }
};