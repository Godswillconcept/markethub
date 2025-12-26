'use strict';
const slugify = require('slugify');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Main gender categories
    const genderCategories = [
      { 
        name: "Men", 
        description: "Trendy and stylish clothing for men",
        slug: "men"
      },
      { 
        name: "Women", 
        description: "Elegant and fashionable clothing for women",
        slug: "women"
      },
      { 
        name: "Kiddies", 
        description: "Cute and comfortable clothing for children",
        slug: "kiddies"
      }
    ];

    // Common subcategories for each gender
    const allSubcategories = [
      { name: "T-shirts", slug: "t-shirts", description: "Comfortable and stylish T-shirts" },
      { name: "Shorts", slug: "shorts", description: "Casual and trendy shorts" },
      { name: "Shirts", slug: "shirts", description: "Fashionable shirts for all occasions" },
      { name: "Hoodies", slug: "hoodies", description: "Warm and cozy hoodies" },
      { name: "Jeans", slug: "jeans", description: "Durable and stylish jeans" },
      { name: "Skirts", slug: "skirts", description: "Elegant and fashionable skirts" }
    ];

    /**
     * Environment-based data volume control:
     * - Production: 2 subcategories per gender (6 total subcategories + 3 main = 9 categories)
     * - Staging: 4 subcategories per gender (12 total subcategories + 3 main = 15 categories)
     * - Development: 6 subcategories per gender (18 total subcategories + 3 main = 21 categories)
     */
    const subcategoriesPerGender = process.env.NODE_ENV === 'production' ? 2 :
                                   process.env.NODE_ENV === 'staging' ? 4 : 6;
    const subcategories = allSubcategories.slice(0, subcategoriesPerGender);

    const now = new Date();
    const categoriesToInsert = [];
    
    // Insert main categories first
    const createdCategories = [];
    
    for (const category of genderCategories) {
      let categoryId;

      // Check if category already exists
      const [existingCategory] = await queryInterface.sequelize.query(
        'SELECT id FROM categories WHERE slug = :slug',
        {
          replacements: { slug: category.slug },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // Insert main category if it doesn't exist
        await queryInterface.bulkInsert('categories', [{
          name: category.name,
          slug: category.slug,
          description: category.description,
          parent_id: null,
          created_at: now,
          updated_at: now
        }]);

        // Get the newly inserted category ID
        const [newCategory] = await queryInterface.sequelize.query(
          'SELECT id FROM categories WHERE slug = :slug',
          {
            replacements: { slug: category.slug },
            type: queryInterface.sequelize.QueryTypes.SELECT
          }
        );
        categoryId = newCategory.id;
      }
      
      if (categoryId) {
        createdCategories.push({
          id: categoryId,
          name: category.name,
          slug: category.slug
        });
      }
    }
    
    // Insert subcategories for each main category
    for (const mainCategory of createdCategories) {
      for (const subcategory of subcategories) {
        const subSlug = `${mainCategory.slug}-${subcategory.slug}`;
        
        // Check if subcategory already exists
        const [existingSub] = await queryInterface.sequelize.query(
          'SELECT id FROM categories WHERE slug = :slug',
          {
            replacements: { slug: subSlug },
            type: queryInterface.sequelize.QueryTypes.SELECT
          }
        );

        if (!existingSub) {
          await queryInterface.bulkInsert('categories', [{
            name: `${mainCategory.name} ${subcategory.name}`,
            slug: subSlug,
            description: subcategory.description,
            parent_id: mainCategory.id,
            created_at: now,
            updated_at: now
          }]);
        }
      }
    }
    
    return createdCategories;
  },

  async down(queryInterface, Sequelize) {
    // First delete subcategories
    await queryInterface.bulkDelete('categories', {
      parent_id: {
        [Sequelize.Op.ne]: null
      }
    });
    
    // Then delete main categories
    await queryInterface.bulkDelete('categories', {
      parent_id: null
    });
  }
};
