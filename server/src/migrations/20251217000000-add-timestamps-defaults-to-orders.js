'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add default values to created_at and updated_at columns
    await queryInterface.changeColumn('orders', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.changeColumn('orders', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove default values from created_at and updated_at columns
    await queryInterface.changeColumn('orders', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false
    });

    await queryInterface.changeColumn('orders', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};
