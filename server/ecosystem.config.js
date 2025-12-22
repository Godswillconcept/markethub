module.exports = {
  apps: [
    // Application configuration for deployment
    {
      name: 'stylay-server',
      script: './app.js',
      instances: 1, // Single instance recommended for database connection stability
      exec_mode: 'fork',
      cwd: './server',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8080
      },
      // Auto-restart configuration
      autorestart: true,
      max_memory_restart: '512M',
      // Enhanced logging configuration
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // PM2 monitoring
      pmx: true,
      // Graceful shutdown
      kill_timeout: 5000,
      // Instance variable
      instance_var: 'INSTANCE_ID',
      // Watch in development only
      watch: process.env.NODE_ENV === 'development',
      ignore_watch: ['node_modules', 'logs', '.git', '../client', 'public', 'uploads'],
      // Log rotation
      max_files: 5,
      max_size: '10M',
      // Environment-specific settings
      env_production_staging: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8080,
        PM2_ENV: 'staging'
      },
      // Health check configuration
      health_check: {
        enabled: true,
        path: '/health',
        port: process.env.PORT || 8080
      }
    }
  ]
};