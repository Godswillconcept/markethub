const { Sequelize } = require('sequelize');
const config = require('./src/config/config.js');

const sequelize = new Sequelize(config.development);

async function checkCounts() {
  try {
    const tables = ['users', 'vendors', 'products','categories', 'product_variants', 'product_images', 'reviews',  'orders', 'order_items', 'order_details', 'journals', 'supply', 'variant_types'];
    
    console.log('\n=== Production Mode Data Volumes ===\n');
    
    for (const table of tables) {
      const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table.charAt(0).toUpperCase() + table.slice(1)}: ${results[0].count}`);
    }
    
    console.log('\n');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

checkCounts();
