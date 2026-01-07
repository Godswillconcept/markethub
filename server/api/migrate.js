const { Sequelize, sequelize } = require('../src/config/database');
const Umzug = require('umzug');
const path = require('path');
require('dotenv').config();

const umzug = new Umzug({
  migrations: {
    path: path.join(__dirname, '../src/migrations'),
    params: [sequelize.getQueryInterface(), Sequelize]
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize
  }
});

module.exports = async (req, res) => {
  // Security check
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.MIGRATION_SECRET;

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const action = req.query.action || 'up';

  try {
    let result;
    
    switch(action) {
      case 'up':
        result = await umzug.up();
        res.json({ 
          message: 'Migrations executed successfully',
          migrations: result.map(m => m.file)
        });
        break;
        
      case 'down':
        result = await umzug.down();
        res.json({ 
          message: 'Migration rolled back successfully',
          migration: result.file
        });
        break;
        
      case 'pending':
        result = await umzug.pending();
        res.json({ 
          pending: result.map(m => m.file)
        });
        break;
        
      case 'executed':
        result = await umzug.executed();
        res.json({ 
          executed: result.map(m => m.file)
        });
        break;
        
      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      error: 'Migration failed',
      details: error.message
    });
  } finally {
    await sequelize.close();
  }
};