'use strict';

/**
 * Migration to add replies column to support_feedback table
 * 
 * This migration adds a JSON column to store admin replies to feedback.
 * 
 * Changes:
 * - Adds: replies (JSON) - Array of admin reply objects
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const tableName = 'support_feedback';

      // Add replies column
      await queryInterface.addColumn(tableName, 'replies', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        after: 'attachments'
      }, { transaction });

      await transaction.commit();
      console.log('Migration completed successfully: replies column added to support_feedback table');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const tableName = 'support_feedback';

      // Remove replies column
      await queryInterface.removeColumn(tableName, 'replies', { transaction });

      await transaction.commit();
      console.log('Rollback completed successfully: replies column removed from support_feedback table');
    } catch (error) {
      await transaction.rollback();
      console.error('Rollback failed:', error);
      throw error;
    }
  }
};
