'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_variants', 'hex_code', {
      type: Sequelize.STRING(7),
      allowNull: true,
      comment: 'Hexadecimal color code (e.g., #FF0000) for color variants'
    });

    // Add index for performance on color lookups
    await queryInterface.addIndex('product_variants', ['hex_code'], {
      name: 'product_variants_hex_code_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('product_variants', 'product_variants_hex_code_idx');
    await queryInterface.removeColumn('product_variants', 'hex_code');
  }
};
