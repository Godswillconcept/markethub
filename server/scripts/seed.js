
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runSeeders() {
  try {
    console.log('Running seeders...');
    const { stdout, stderr } = await execPromise('npx sequelize-cli db:seed:all');
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeeders();