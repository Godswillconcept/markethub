const { Sequelize } = require('sequelize');
const Umzug = require('umzug');
const path = require('path');
require('dotenv').config();

// Import database config
const dbConfigs = require('../src/config/database');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Security check - VERY IMPORTANT!
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.MIGRATION_SECRET;

  if (!expectedSecret) {
    return res.status(500).json({ 
      error: 'MIGRATION_SECRET not configured',
      message: 'Please set MIGRATION_SECRET in environment variables'
    });
  }

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or missing authorization token'
    });
  }

  let sequelize;
  
  try {
    // Get environment config
    const env = process.env.NODE_ENV || 'production';
    const config = dbConfigs[env];

    if (!config) {
      throw new Error(`No database configuration found for environment: ${env}`);
    }

    // Create Sequelize instance
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        dialectOptions: config.dialectOptions || {},
        pool: config.pool || {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        logging: false
      }
    );

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Initialize Umzug
    const umzug = new Umzug({
      migrations: {
        path: path.join(__dirname, '../server/src/migrations'),
        params: [sequelize.getQueryInterface(), Sequelize]
      },
      storage: 'sequelize',
      storageOptions: {
        sequelize: sequelize,
        tableName: 'SequelizeMeta'
      }
    });

    const action = req.query.action || 'up';
    let result;

    switch(action) {
      case 'up':
        console.log('Running migrations...');
        result = await umzug.up();
        return res.json({ 
          success: true,
          message: 'Migrations executed successfully',
          count: result.length,
          migrations: result.map(m => m.file || m.name),
          timestamp: new Date().toISOString()
        });
        
      case 'down':
        console.log('Rolling back last migration...');
        result = await umzug.down();
        return res.json({ 
          success: true,
          message: 'Migration rolled back successfully',
          migration: result.file || result.name,
          timestamp: new Date().toISOString()
        });
        
      case 'pending':
        console.log('Checking pending migrations...');
        result = await umzug.pending();
        return res.json({ 
          success: true,
          count: result.length,
          pending: result.map(m => m.file || m.name),
          timestamp: new Date().toISOString()
        });
        
      case 'executed':
        console.log('Checking executed migrations...');
        result = await umzug.executed();
        return res.json({ 
          success: true,
          count: result.length,
          executed: result.map(m => m.file || m.name),
          timestamp: new Date().toISOString()
        });
        
      case 'status':
        console.log('Checking migration status...');
        const pending = await umzug.pending();
        const executed = await umzug.executed();
        return res.json({
          success: true,
          status: {
            pending: pending.map(m => m.file || m.name),
            executed: executed.map(m => m.file || m.name),
            pendingCount: pending.length,
            executedCount: executed.length
          },
          timestamp: new Date().toISOString()
        });
        
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          message: 'Valid actions are: up, down, pending, executed, status',
          requestedAction: action
        });
    }
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Migration failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : 'Check server logs',
      timestamp: new Date().toISOString()
    });
  } finally {
    if (sequelize) {
      try {
        await sequelize.close();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
};

