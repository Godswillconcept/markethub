#!/usr/bin/env node

/**
 * Ngrok Authenticated Tunnel
 * Uses official @ngrok/ngrok package
 */

require('dotenv').config();
const ngrok = require('@ngrok/ngrok');
const chalk = require('chalk');

const PORT = process.env.PORT || 5000;
const NGROK_DOMAIN = 'unflaking-actionable-man.ngrok-free.dev';
const NGROK_AUTHTOKEN = process.env.NGROK_AUTHTOKEN;

console.log(chalk.blue('🔌 Starting ngrok tunnel...'));

(async () => {
  try {
    // Check if authtoken is provided
    if (!NGROK_AUTHTOKEN) {
      console.log('\n' + '='.repeat(60));
      console.log(chalk.red.bold('❌ NGROK AUTHTOKEN MISSING'));
      console.log('='.repeat(60));
      process.exit(1);
    }

    // Connect using official API
    // Note: Official package uses 'domain' not 'hostname' for static domains generally,
    // but the key is consistent.
    const listener = await ngrok.connect({
      addr: PORT,
      authtoken: NGROK_AUTHTOKEN,
      domain: NGROK_DOMAIN, 
    });

    // In official package, listener.url() gives the URL
    const url = listener.url();

    console.log('\n' + '='.repeat(60));
    console.log(chalk.green.bold('✅ NGROK CONNECTED SUCCESSFULLY!'));
    console.log('='.repeat(60));
    console.log(chalk.cyan('📡 Public URL:    ') + chalk.yellow.bold(url));
    console.log(chalk.cyan('🔗 Local URL:     ') + chalk.yellow(`http://localhost:${PORT}`));
    console.log('='.repeat(60));
    console.log(chalk.green('\n✨ Your API is now accessible from anywhere!'));
    console.log(chalk.gray(`   Use this URL in your mobile app: ${url}/api/v1/\n`));
    console.log('='.repeat(60) + '\n');
    
    // Keep process alive
    process.stdin.resume();

  } catch (err) {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.red.bold('❌ NGROK CONNECTION FAILED'));
    console.log('='.repeat(60));
    console.log(chalk.yellow('⚠️  Error:'), err.message);
    process.exit(1);
  }
})();

// Handle cleanup
async function cleanup() {
    console.log(chalk.yellow('\n\n🛑 Stopping ngrok tunnel...'));
    await ngrok.disconnect();
    process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
