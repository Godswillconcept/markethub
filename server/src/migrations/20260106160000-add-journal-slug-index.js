'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add unique index on slug field for faster lookups
    await queryInterface.addIndex('journals', ['slug'], {
      unique: true,
      name: 'journals_slug_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the index
    await queryInterface.removeIndex('journals', 'journals_slug_unique');
  }
};
