const { Sequelize } = require('sequelize');
require('dotenv').config();
const logger = require('../utils/logger');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectModule: process.env.DATABASE_URL ? require(process.env.DB_DIALECT === 'mysql' ? 'mysql2' : 'pg') : undefined,
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : true,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.DB_DIALECT === 'mysql' ? false : (process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false)
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    // In serverless, don't exit process, just log
  }
};

const syncDB = async (force = false) => {
  try {
    await sequelize.sync({ force });
    logger.info('Database synchronized');
  } catch (error) {
    logger.error('Error syncing database:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
  syncDB,
  Sequelize
};
