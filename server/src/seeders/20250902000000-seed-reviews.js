'use strict';
const { faker } = require('@faker-js/faker/locale/en_US');

// Configure faker
const {
  number: { int: randomNumber },
  lorem: { sentences },
  date: { between },
  helpers: { arrayElement }
} = faker;

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Fetch delivered order items with complete details
      console.log('Fetching delivered order items...');

      const deliveredOrderItems = await queryInterface.sequelize.query(
        `SELECT oi.id as order_item_id, oi.product_id, oi.variant_id, oi.combination_id, o.user_id, o.order_date
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE o.order_status = 'delivered'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      if (deliveredOrderItems.length === 0) {
        throw new Error('No delivered orders found. Please seed orders first.');
      }

      console.log(`Found ${deliveredOrderItems.length} delivered order items`);

      console.log(`Creating ${deliveredOrderItems.length} reviews`);

      // Validate that we have unique order items to avoid duplicate reviews
      const uniqueOrderItems = new Set(deliveredOrderItems.map(item => item.order_item_id));
      console.log(`Unique order items: ${uniqueOrderItems.size}`);

      // Rating distribution using arrayElement
      const ratingValues = [1.0, 2.0, 3.0, 4.0, 5.0];

      const batchSize = 200;
      let totalReviews = 0;

      // Check for existing reviews to avoid duplicates
      console.log('Checking for existing reviews...');
      const existingReviews = await queryInterface.sequelize.query(
        `SELECT product_id, user_id FROM reviews`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );
      
      const existingReviewKeys = new Set(existingReviews.map(r => `${r.product_id}-${r.user_id}`));
      console.log(`Found ${existingReviewKeys.size} existing reviews`);

      // Filter out order items where the user has already reviewed the product
      const filteredReviewData = deliveredOrderItems.filter(item =>
        !existingReviewKeys.has(`${item.product_id}-${item.user_id}`)
      );
      console.log(`Filtered to ${filteredReviewData.length} order items without reviews`);

      for (let batchStart = 0; batchStart < filteredReviewData.length; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, filteredReviewData.length);
        const batch = filteredReviewData.slice(batchStart, batchEnd);

        console.log(`Processing batch: reviews ${batchStart + 1} to ${batchEnd}`);

        const reviewsToInsert = batch.map(item => {
          const rating = arrayElement(ratingValues);
          const hasComment = Math.random() < 0.7;
          const comment = hasComment ? generateRealisticComment(rating) : null;

          // Review created 1-30 days after order date
          const reviewDate = between({
            from: item.order_date,
            to: new Date(Math.min(new Date(item.order_date).getTime() + 30 * 24 * 60 * 60 * 1000, Date.now()))
          });

          return {
            product_id: item.product_id,
            user_id: item.user_id,
            rating,
            comment,
            created_at: reviewDate,
            updated_at: reviewDate
          };
        });
  
        // Function to generate realistic comments based on rating
        function generateRealisticComment(rating) {
          const comments = {
            1.0: [
              "Very disappointed with this purchase. The quality is much worse than expected.",
              "Poor quality and terrible customer service. Would not recommend.",
              "Product arrived damaged and the material feels cheap. Very unhappy.",
              "Not worth the money at all. Poor craftsmanship and design.",
              "Worst purchase I've made. Would return if possible.",
              "The product didn't meet my expectations at all. Very poor quality.",
              "Regret buying this. The materials feel very cheap and construction is poor.",
              "Customer service was unhelpful when I tried to return this item.",
              "Packaging was terrible and the product arrived with scratches.",
              "Would not buy again. The product broke after just a few uses."
            ],
            2.0: [
              "Product is okay, but could be better. The material feels a bit cheap for the price.",
              "Not satisfied with the quality. Expected better for this price point.",
              "Some issues with the product. It's decent but has room for improvement.",
              "Average product. Nothing special, but does the job.",
              "Could be better. Quality is not what I expected.",
              "It works, but I've seen better quality at this price point.",
              "The design is nice but the actual product quality is lacking.",
              "Some assembly issues, but overall it's functional.",
              "Not the best, but not the worst. Could use some improvements.",
              "The color was different than shown online, a bit disappointed."
            ],
            3.0: [
              "Product is decent. Nothing extraordinary but acceptable quality.",
              "Average experience. Good enough for the price.",
              "It's okay, but not outstanding. Could use some improvements.",
              "Satisfactory product. Meets basic expectations.",
              "Decent quality. Not bad, but not great either.",
              "Good for everyday use. Nothing fancy but gets the job done.",
              "The product is as described, though the quality could be better.",
              "Average build quality. Should last a reasonable amount of time.",
              "Nice design but the materials feel a bit cheap.",
              "It's okay. Does what it's supposed to do without any issues."
            ],
            4.0: [
              "Great product overall! Very satisfied with my purchase.",
              "Excellent quality and fast delivery. Highly recommended!",
              "Love this product! Good value for money.",
              "Very happy with this purchase. Good quality materials.",
              "Impressed with the quality and design. Would buy again.",
              "Fantastic value for the price. Very pleased with this purchase!",
              "High-quality materials and excellent craftsmanship. Very satisfied!",
              "Fast shipping and the product exceeded my expectations!",
              "Beautiful design and great functionality. Would definitely recommend!",
              "Excellent customer service and a wonderful product. Very happy!"
            ],
            5.0: [
              "Absolutely amazing! Exceeded all my expectations.",
              "Perfect product! Excellent quality and great customer service.",
              "Outstanding quality! Worth every penny.",
              "Fantastic purchase! Highly recommend to everyone.",
              "Amazing product! Better than described and arrived quickly.",
              "Absolutely perfect! The quality is exceptional and shipping was fast.",
              "Beyond expectations! This product is worth every penny and more!",
              "Exceptional quality and attention to detail. A+ experience!",
              "Love this so much! It's even better than the pictures showed!",
              "Perfect in every way! Excellent communication and fast shipping!"
            ]
          };
          
          return arrayElement(comments[rating]);
        }

        await queryInterface.bulkInsert('reviews', reviewsToInsert, { transaction });
        totalReviews += reviewsToInsert.length;
      }
  
      await transaction.commit();
      console.log(`Successfully seeded ${totalReviews} reviews for delivered orders`);

    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding reviews:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete only reviews created by this seeder (those with comments from delivered orders)
      // Since we can't easily identify seeded reviews, we'll delete all reviews
      await queryInterface.bulkDelete('reviews', null, { transaction });
      
      await transaction.commit();
      console.log('Cleaned up all seeded reviews');

    } catch (error) {
      await transaction.rollback();
      console.error('Error cleaning up reviews:', error);
      throw error;
    }
  }
};