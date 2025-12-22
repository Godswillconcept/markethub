'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('stores', 'paystack_subaccount_code', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'cac_number'
    });

    await queryInterface.addColumn('stores', 'paystack_recipient_code', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'paystack_subaccount_code'
    });
    
    // Index for faster lookups
    await queryInterface.addIndex('stores', ['paystack_subaccount_code']);
    await queryInterface.addIndex('stores', ['paystack_recipient_code']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('stores', ['paystack_subaccount_code']);
    await queryInterface.removeIndex('stores', ['paystack_recipient_code']);
    await queryInterface.removeColumn('stores', 'paystack_recipient_code');
    await queryInterface.removeColumn('stores', 'paystack_subaccount_code');
  }
};
