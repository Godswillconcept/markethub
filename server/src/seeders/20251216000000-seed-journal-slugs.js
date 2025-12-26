'use strict';

const slugify = require('slugify');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Get all journals WITHOUT slug
      const journals = await queryInterface.sequelize.query(
        'SELECT id, title FROM journals WHERE slug IS NULL OR slug = ""',
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      console.log(`Found ${journals.length} journals needing slugs`);

      if (journals.length === 0) {
        console.log('No journals found to update.');
        await transaction.commit();
        return;
      }

      const slugCounts = {}; // Track usage of base slugs

      // Process in batches of 10 to avoid too many connections
      const batchSize = 10;
      for (let i = 0; i < journals.length; i += batchSize) {
        const batch = journals.slice(i, i + batchSize);

        // Process batch with transaction
        await Promise.all(
          batch.map(journal => {
            let slug = slugify(journal.title, { lower: true, strict: true });

            // Ensure uniqueness
            if (slugCounts[slug]) {
              let counter = 1;
              let newSlug = `${slug}-${counter}`;
              while (slugCounts[newSlug]) {
                counter++;
                newSlug = `${slug}-${counter}`;
              }
              slug = newSlug;
            }

            slugCounts[slug] = true; // Mark slug as used

            return queryInterface.sequelize.query(
              'UPDATE journals SET slug = ? WHERE id = ?',
              {
                replacements: [slug, journal.id],
                type: queryInterface.sequelize.QueryTypes.UPDATE,
                transaction
              }
            );
          })
        );

        console.log(`Processed ${Math.min(i + batchSize, journals.length)}/${journals.length} journals`);
      }

      await transaction.commit();
      console.log(`Updated ${journals.length} journals with unique slugs.`);

    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding journal slugs:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        'UPDATE journals SET slug = NULL',
        { transaction }
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
