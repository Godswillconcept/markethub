const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration from .env
const sequelize = new Sequelize(
  process.env.DB_NAME || 'stylay_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false
  }
);

async function checkSeedingStatus() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check SequelizeMeta for seeders
    const [results] = await sequelize.query(`
      SELECT name FROM SequelizeMeta 
      WHERE name LIKE '%seed%' 
      ORDER BY name
    `);
    
    if (results.length === 0) {
      console.log('❌ No seeders have been executed yet');
    } else {
      console.log('\n📊 Executed Seeders:');
      results.forEach(row => {
        console.log(`  ✅ ${row.name}`);
      });
    }
    
    // Check reviews table specifically
    const [reviewCount] = await sequelize.query('SELECT COUNT(*) as count FROM reviews');
    console.log(`\n📝 Reviews in database: ${reviewCount[0].count}`);
    
    // Check orders table
    const [orderCount] = await sequelize.query('SELECT COUNT(*) as count FROM orders');
    console.log(`📦 Orders in database: ${orderCount[0].count}`);
    
    // Check products table
    const [productCount] = await sequelize.query('SELECT COUNT(*) as count FROM products');
    console.log(`🛍️ Products in database: ${productCount[0].count}`);
    
    // Check if there are any delivered orders without reviews
    const [deliveredWithoutReviews] = await sequelize.query(`
      SELECT COUNT(DISTINCT oi.id) as count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN reviews r ON oi.product_id = r.product_id AND o.user_id = r.user_id
      WHERE o.order_status = 'delivered' AND r.id IS NULL
    `);
    console.log(`🔄 Delivered order items without reviews: ${deliveredWithoutReviews[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking seeding status:', error);
  } finally {
    await sequelize.close();
  }
}

checkSeedingStatus();