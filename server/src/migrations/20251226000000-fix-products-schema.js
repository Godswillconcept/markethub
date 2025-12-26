'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Starting products table schema fix...');

    // Check if updated_at column exists and is properly configured
    const tableInfo = await queryInterface.describeTable('products');
    
    // Check if updated_at column exists
    if (!tableInfo.updated_at) {
      console.log('Adding missing updated_at column to products table...');
      await queryInterface.addColumn('products', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: 'Timestamp of last update'
      });
    } else {
      console.log('updated_at column already exists in products table');
      
      // Check if the column has the correct default value and ON UPDATE clause
      const currentColumn = tableInfo.updated_at;
      console.log('Current updated_at column definition:', currentColumn);
      
      // If the column exists but doesn't have the proper ON UPDATE clause, we need to modify it
      // Note: MySQL doesn't allow modifying the ON UPDATE clause directly, so we might need to recreate
      if (!currentColumn.defaultValue || !currentColumn.defaultValue.toString().includes('ON UPDATE')) {
        console.log('Updating updated_at column to include ON UPDATE clause...');
        
        // Drop and recreate the column to ensure proper configuration
        await queryInterface.changeColumn('products', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
          comment: 'Timestamp of last update'
        });
      }
    }

    // Ensure created_at column has proper configuration
    if (tableInfo.created_at) {
      console.log('created_at column exists, checking configuration...');
      const createdColumn = tableInfo.created_at;
      if (!createdColumn.defaultValue || !createdColumn.defaultValue.toString().includes('CURRENT_TIMESTAMP')) {
        console.log('Updating created_at column default value...');
        await queryInterface.changeColumn('products', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          comment: 'Timestamp of creation'
        });
      }
    }

    console.log('Products table schema fix completed successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('Rolling back products table schema changes...');
    
    // Remove updated_at column if it was added
    const tableInfo = await queryInterface.describeTable('products');
    if (tableInfo.updated_at) {
      await queryInterface.removeColumn('products', 'updated_at');
    }
    
    console.log('Products table schema rollback completed');
  }
};