'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vendor_messages', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      vendor_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false
      },
      admin_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true
      },
      full_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      topic: {
        type: Sequelize.ENUM(
          'Loan',
          'Product Support',
          'Technical Issue',
          'General Inquiry',
          'Other'
        ),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'open'
      },
      reference_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('vendor_messages', ['vendor_id']);
    await queryInterface.addIndex('vendor_messages', ['admin_id']);
    await queryInterface.addIndex('vendor_messages', ['status']);
    await queryInterface.addIndex('vendor_messages', ['topic']);
    await queryInterface.addIndex('vendor_messages', ['reference_number']);

    // Add foreign key constraints
    await queryInterface.addConstraint('vendor_messages', {
      type: 'foreign key',
      fields: ['vendor_id'],
      name: 'vendor_messages_vendor_id_fk',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('vendor_messages', {
      type: 'foreign key',
      fields: ['admin_id'],
      name: 'vendor_messages_admin_id_fk',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop foreign key constraints first
    await queryInterface.removeConstraint('vendor_messages', 'vendor_messages_vendor_id_fk');
    await queryInterface.removeConstraint('vendor_messages', 'vendor_messages_admin_id_fk');

    // Drop the table
    await queryInterface.dropTable('vendor_messages');
  }
};