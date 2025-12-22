'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('stores', 'pending_logo', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'logo',
      comment: 'Temporary storage for logo update pending admin approval'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('stores', 'pending_logo');
  }
};
