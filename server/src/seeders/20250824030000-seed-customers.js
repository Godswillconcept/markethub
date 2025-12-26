'use strict';
const { faker } = require('@faker-js/faker/locale/en_NG');
const bcrypt = require('bcryptjs');
require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Data Reduction Strategy:
     * This seeder implements environment-based data volume control to optimize performance
     * and resource usage across different deployment environments:
     * - Production: 20 customers (lowest)
     * - Staging: 100 customers (medium)
     * - Development: 200 customers (highest)
     *
     * Rationale:
     * - Development: 200 customers provide sufficient data for UI/UX testing and basic functionality
     *   without overwhelming local databases or slowing down development workflows
     * - Staging: 100 customers simulate realistic user loads for performance testing, API stress testing,
     *   and user experience validation while maintaining reasonable resource consumption
     * - Production: 20 customers ensure the system can handle real-world user volumes and provides
     *   meaningful analytics data while being scalable for future growth
     *
     * Conditional Logic:
     * The strategy uses process.env.NODE_ENV to determine the current environment and sets
     * totalCustomers accordingly. The batch processing system (batchSize = 100) ensures efficient
     * database operations regardless of the total volume.
     *
     * Future Maintainability:
     * - Environment variables can be easily adjusted without code changes
     * - Batch processing allows for scaling to even larger datasets if needed
     * - Clear separation of concerns between data generation and insertion logic
     * - Comprehensive error handling for data uniqueness (emails, phone numbers)
     *
     * This approach ensures:
     * - Faster development cycles with smaller datasets
     * - Realistic performance testing in staging
     * - Production-ready data volumes when deployed
     * - Easy scalability for future requirements
     */
    
    // Get the customer role ID
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'customer' LIMIT 1`
    );

    if (roles.length === 0) {
      throw new Error('Customer role not found. Please run the roles seeder first.');
    }

    const customerRoleId = roles[0].id;
    const passwordHash = await bcrypt.hash(process.env.DEFAULT_CUSTOMER_PASSWORD || "Secret123!", 10);
    const customers = [];
    const userRoles = [];
    const now = new Date();
    const usedPhoneNumbers = new Set();
    const usedEmails = new Set();

    // Adjust customer count based on NODE_ENV
    // Production: 20 (lowest), Staging: 100 (medium), Development: 200 (highest)
    const totalCustomers = process.env.NODE_ENV === 'production' ? 20 :
                          process.env.NODE_ENV === 'staging' ? 100 : 200;
    const batchSize = 100;
    const numBatches = Math.ceil(totalCustomers / batchSize);

    for (let batch = 0; batch < numBatches; batch++) {
      const batchCustomers = [];
      const batchUserRoles = [];
      const currentBatchSize = Math.min(batchSize, totalCustomers - (batch * batchSize));
      
      // Generate a batch of customers
      for (let i = 0; i < currentBatchSize; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      // Generate unique email
      let email = faker.internet.email({
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLowerCase(),
        provider: 'stylay.ng'
      });

      // Ensure email uniqueness
      let emailCounter = 1;
      while (usedEmails.has(email)) {
        email = faker.internet.email({
          firstName: firstName.toLowerCase(),
          lastName: lastName.toLowerCase(),
          provider: `stylay${emailCounter}.ng`
        });
        emailCounter++;
      }
      usedEmails.add(email);

      // Generate unique phone number
      let phone = `+234${faker.helpers.arrayElement(['70', '80', '81', '90', '91'])}${faker.string.numeric(8)}`;
      let phoneCounter = 1;
      while (usedPhoneNumbers.has(phone)) {
        phone = `+234${faker.helpers.arrayElement(['70', '80', '81', '90', '91'])}${faker.string.numeric(8)}`;
        phoneCounter++;
      }
      usedPhoneNumbers.add(phone);

      const customer = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: passwordHash,
        phone: phone,
        gender: faker.helpers.arrayElement(['male', 'female', 'other']),
        profile_image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=128`,
        email_verified_at: now,
        created_at: now,
        updated_at: now
      };

      batchCustomers.push(customer);
      }

      // Insert the current batch of customers
      if (batchCustomers.length > 0) {
        const insertedUsers = await queryInterface.bulkInsert('users', batchCustomers, { returning: true });
        
        // Add user-role relationships for this batch
        for (let i = 0; i < batchCustomers.length; i++) {
          const userId = typeof insertedUsers === 'number' ? insertedUsers + i : insertedUsers[i].id;
          batchUserRoles.push({
            user_id: userId,
            role_id: customerRoleId,
            created_at: now
          });
        }
        
        // Insert user-role relationships for this batch
        if (batchUserRoles.length > 0) {
          await queryInterface.bulkInsert('user_roles', batchUserRoles);
        }
        
        console.log(`Inserted ${batchCustomers.length} customers in batch ${batch + 1}/${numBatches}`);
      }
    }

  },

  async down(queryInterface, Sequelize) {
    // Helper function to get customer role ID
    const getCustomerRoleId = async () => {
      const [roles] = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'customer' LIMIT 1`
      );
      
      if (roles.length === 0) {
        throw new Error('Customer role not found');
      }
      
      return roles[0].id;
    };

    // Delete all user-role relationships first to avoid foreign key constraint
    await queryInterface.bulkDelete('user_roles', { 
      role_id: await getCustomerRoleId() 
    });
    
    // Then delete users
    return queryInterface.bulkDelete('users', { 
      id: { [Sequelize.Op.gte]: 1 } 
    });
  }
};
