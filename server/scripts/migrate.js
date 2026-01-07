const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
async function runMigrations() {
  try {
    const { stdout, stderr } = await execPromise('npx sequelize-cli db:migrate');
    if (stderr) console.error(stderr);
    } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
runMigrations();