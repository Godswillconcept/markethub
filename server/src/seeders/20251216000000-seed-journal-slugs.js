'use strict';

const slugify = require('slugify');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const journals = await queryInterface.sequelize.query(
      'SELECT id, title FROM journals',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (journals.length === 0) {
      console.log('No journals found to update.');
      return;
    }

    const slugCounts = {}; // Track usage of base slugs

    const updates = [];
    for (const journal of journals) {
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

      // Add update promise
      updates.push(queryInterface.sequelize.query(
        'UPDATE journals SET slug = ? WHERE id = ?',
        {
          replacements: [slug, journal.id],
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      ));
    }

    await Promise.all(updates);
    console.log(`Updated ${journals.length} journals with unique slugs.`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      'UPDATE journals SET slug = NULL'
    );
  }
};
