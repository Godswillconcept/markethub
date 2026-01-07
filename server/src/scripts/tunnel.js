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
);
(async () => {
  try {
    // Check if authtoken is provided
    if (!NGROK_AUTHTOKEN) {
      );
      );
      );
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
    );
    );
    );
    + chalk.yellow.bold(url));
    + chalk.yellow(`http://localhost:${PORT}`));
    );
    );
    );
    + '\n');
    // Keep process alive
    process.stdin.resume();
  } catch (err) {
    );
    );
    );
    , err.message);
    process.exit(1);
  }
})();
// Handle cleanup
async function cleanup() {
    );
    await ngrok.disconnect();
    process.exit(0);
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
