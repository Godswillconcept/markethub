
const { Sequelize } = require('sequelize');
const fs = require('fs');
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

    const action = req.query.action || 'all';
    const seederName = req.query.seeder;

    const seedersPath = path.join(__dirname, '../server/src/seeders');
    
    // Check if seeders directory exists
    if (!fs.existsSync(seedersPath)) {
      return res.status(404).json({
        success: false,
        error: 'Seeders directory not found',
        path: seedersPath
      });
    }

    const seederFiles = fs.readdirSync(seedersPath)
      .filter(file => file.endsWith('.js'))
      .sort();

    if (seederFiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No seeder files found',
        path: seedersPath
      });
    }

    const queryInterface = sequelize.getQueryInterface();
    const results = [];

    switch(action) {
      case 'all':
        console.log(`Running ${seederFiles.length} seeders...`);
        for (const file of seederFiles) {
          console.log(`Executing seeder: ${file}`);
          const seeder = require(path.join(seedersPath, file));
          
          if (typeof seeder.up !== 'function') {
            throw new Error(`Seeder ${file} does not export an 'up' function`);
          }
          
          await seeder.up(queryInterface, Sequelize);
          results.push(file);
        }
        return res.json({ 
          success: true,
          message: 'All seeders executed successfully',
          count: results.length,
          seeders: results,
          timestamp: new Date().toISOString()
        });

      case 'one':
        if (!seederName) {
          return res.status(400).json({
            error: 'Seeder name required',
            message: 'Use ?action=one&seeder=seeder-name'
          });
        }
        
        console.log(`Looking for seeder: ${seederName}`);
        const seederFile = seederFiles.find(f => f.includes(seederName));
        
        if (!seederFile) {
          return res.status(404).json({ 
            error: 'Seeder not found',
            requested: seederName,
            available: seederFiles
          });
        }
        
        console.log(`Executing seeder: ${seederFile}`);
        const seeder = require(path.join(seedersPath, seederFile));
        
        if (typeof seeder.up !== 'function') {
          throw new Error(`Seeder ${seederFile} does not export an 'up' function`);
        }
        
        await seeder.up(queryInterface, Sequelize);
        return res.json({ 
          success: true,
          message: 'Seeder executed successfully',
          seeder: seederFile,
          timestamp: new Date().toISOString()
        });

      case 'undo':
        if (seederFiles.length === 0) {
          return res.status(404).json({
            error: 'No seeders to undo'
          });
        }
        
        const lastSeederFile = seederFiles[seederFiles.length - 1];
        console.log(`Undoing seeder: ${lastSeederFile}`);
        const lastSeeder = require(path.join(seedersPath, lastSeederFile));
        
        if (typeof lastSeeder.down !== 'function') {
          throw new Error(`Seeder ${lastSeederFile} does not export a 'down' function`);
        }
        
        await lastSeeder.down(queryInterface, Sequelize);
        return res.json({ 
          success: true,
          message: 'Seeder undone successfully',
          seeder: lastSeederFile,
          timestamp: new Date().toISOString()
        });

      case 'list':
        return res.json({
          success: true,
          count: seederFiles.length,
          seeders: seederFiles,
          path: seedersPath,
          timestamp: new Date().toISOString()
        });

      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          message: 'Valid actions are: all, one, undo, list',
          requestedAction: action
        });
    }
  } catch (error) {
    console.error('Seeding error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Seeding failed',
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
