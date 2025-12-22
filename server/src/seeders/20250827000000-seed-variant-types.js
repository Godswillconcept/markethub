'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed common variant types used in e-commerce
    const variantTypes = [
      {
        name: 'color',
        display_name: 'Color',
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'size',
        display_name: 'Size',
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'material',
        display_name: 'Material',
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'style',
        display_name: 'Style',
        sort_order: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'pattern',
        display_name: 'Pattern',
        sort_order: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'fit',
        display_name: 'Fit',
        sort_order: 6,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'length',
        display_name: 'Length',
        sort_order: 7,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'weight',
        display_name: 'Weight',
        sort_order: 8,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Additional variant types used by product seeder
      {
        name: 'waist',
        display_name: 'Waist',
        sort_order: 9,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'wash',
        display_name: 'Wash',
        sort_order: 11,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'sleeve',
        display_name: 'Sleeve',
        sort_order: 12,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'neckline',
        display_name: 'Neckline',
        sort_order: 13,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'waist_type',
        display_name: 'Waist Type',
        sort_order: 14,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'hood_type',
        display_name: 'Hood Type',
        sort_order: 15,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'sleeve_type',
        display_name: 'Sleeve Type',
        sort_order: 16,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'lining',
        display_name: 'Lining',
        sort_order: 17,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'fabric_type',
        display_name: 'Fabric Type',
        sort_order: 18,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'pockets',
        display_name: 'Pockets',
        sort_order: 19,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'closure_type',
        display_name: 'Closure Type',
        sort_order: 20,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'rise',
        display_name: 'Rise',
        sort_order: 21,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'distressed',
        display_name: 'Distressed',
        sort_order: 22,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('variant_types', variantTypes);
    console.log(`Seeded ${variantTypes.length} variant types`);
  },

  async down(queryInterface, Sequelize) {
    // Remove all seeded variant types
    await queryInterface.bulkDelete('variant_types', null, {});
    console.log('Removed all seeded variant types');
  }
};
