'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('cart_items', 'combination_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'variant_combinations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Reference to the specific variant combination for this cart item',
      after: 'selected_variants'
    });

    // Add index for better query performance
    await queryInterface.addIndex('cart_items', ['combination_id'], {
      name: 'cart_items_combination_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('cart_items', 'cart_items_combination_id_idx');
    await queryInterface.removeColumn('cart_items', 'combination_id');
  }
};
