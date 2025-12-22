'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the table exists before attempting to modify it
    const tableExists = await queryInterface.describeTable('support_feedback').catch(() => false);
    if (!tableExists) {
      throw new Error('support_feedback table does not exist. Please run the create-support-feedback migration first.');
    }

    // Rename message to description
    await queryInterface.renameColumn('support_feedback', 'message', 'description');

    // Add new fields
    await queryInterface.addColumn('support_feedback', 'subject', {
      type: Sequelize.STRING(150),
      allowNull: false,
      defaultValue: ''
    });

    await queryInterface.addColumn('support_feedback', 'order_number', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: ''
    });

    await queryInterface.addColumn('support_feedback', 'issue_type', {
      type: Sequelize.ENUM(
        'Order Not Delivered',
        'Wrong Item Received',
        'Payment Issue',
        'Return/Refund Request',
        'Account Issue',
        'Technical Issue',
        'Other'
      ),
      allowNull: false,
      defaultValue: 'Other'
    });

    await queryInterface.addColumn('support_feedback', 'preferred_support_method', {
      type: Sequelize.ENUM('Email', 'Phone', 'Chat'),
      allowNull: false,
      defaultValue: 'Email'
    });

    await queryInterface.addColumn('support_feedback', 'contact_email', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('support_feedback', 'contact_phone', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('support_feedback', 'attachments', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('support_feedback', 'reference_number', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: ''
    });

    // Update status enum
    await queryInterface.changeColumn('support_feedback', 'status', {
      type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed'),
      allowNull: false,
      defaultValue: 'open'
    });

    // Add indexes
    await queryInterface.addIndex('support_feedback', ['reference_number'], {
      name: 'support_feedback_reference_number_unique',
      unique: true
    });

    await queryInterface.addIndex('support_feedback', ['order_number']);
    await queryInterface.addIndex('support_feedback', ['status']);
    await queryInterface.addIndex('support_feedback', ['issue_type']);
  },

  down: async (queryInterface, Sequelize) => {
    // Check if the table exists before attempting to drop it
    const tableExists = await queryInterface.describeTable('support_feedback').catch(() => false);
    if (!tableExists) {
      console.log('support_feedback table does not exist, skipping rollback');
      return;
    }

    // Reverse operations in reverse order
    // Drop indexes first
    await queryInterface.removeIndex('support_feedback', 'support_feedback_reference_number_unique').catch(() => {});
    await queryInterface.removeIndex('support_feedback', 'order_number').catch(() => {});
    await queryInterface.removeIndex('support_feedback', 'status').catch(() => {});
    await queryInterface.removeIndex('support_feedback', 'issue_type').catch(() => {});

    // Drop columns in reverse order
    await queryInterface.removeColumn('support_feedback', 'reference_number').catch(() => {});
    await queryInterface.removeColumn('support_feedback', 'attachments').catch(() => {});
    await queryInterface.removeColumn('support_feedback', 'contact_phone').catch(() => {});
    await queryInterface.removeColumn('support_feedback', 'contact_email').catch(() => {});
    await queryInterface.removeColumn('support_feedback', 'preferred_support_method').catch(() => {});
    await queryInterface.removeColumn('support_feedback', 'issue_type').catch(() => {});
    await queryInterface.removeColumn('support_feedback', 'order_number').catch(() => {});
    await queryInterface.removeColumn('support_feedback', 'subject').catch(() => {});

    // Rename description back to message
    await queryInterface.renameColumn('support_feedback', 'description', 'message').catch(() => {});

    // Change status enum back to original
    await queryInterface.changeColumn('support_feedback', 'status', {
      type: Sequelize.ENUM('open', 'resolved'),
      allowNull: false,
      defaultValue: 'open'
    }).catch(() => {});
  }
};