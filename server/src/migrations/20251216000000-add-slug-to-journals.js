'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('journals', 'slug', {
      type: Sequelize.STRING(255),
      allowNull: true, // Initially allow null for existing records, will execute seeder to fill
      unique: true,
      after: 'title'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('journals', 'slug');
  }
};
