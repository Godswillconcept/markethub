require("dotenv").config();

const config = {
  // Server Configuration
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  appName: process.env.APP_NAME || "Stylay",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3001",

  // Database Configuration
  database: {
    development: {
      username: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "stylay_db",
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 3306,
      dialect: process.env.DB_DIALECT || "mysql",
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      seederStorage: "sequelize",
    },
    test: {
      username: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME_TEST || "stylay_db_test",
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 3306,
      dialect: process.env.DB_DIALECT || "mysql",
      logging: false,
      seederStorage: "sequelize",
    },
    production: (() => {
      // Parse DATABASE_URL if available
      let dbConfig = {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseInt(process.env.DB_PORT) || (process.env.DB_DIALECT === 'postgres' ? 5432 : 3306),
        dialect: process.env.DB_DIALECT || "mysql",
        logging: false,
        seederStorage: "sequelize",
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      };

      if (process.env.DATABASE_URL) {
        const url = new URL(process.env.DATABASE_URL);
        dbConfig.username = url.username;
        dbConfig.password = url.password;
        dbConfig.database = url.pathname.slice(1); // remove leading /
        dbConfig.host = url.hostname;
        dbConfig.port = parseInt(url.port) || (url.protocol === 'postgres:' ? 5432 : 3306);
        dbConfig.dialect = url.protocol.slice(0, -1); // remove :
      }

      return dbConfig;
    })(),
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your_jwt_secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
    cookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN || 90,
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
    from: process.env.EMAIL_FROM || "noreply@stylay.com",
    fromName: process.env.EMAIL_FROM_NAME || "Stylay",
  },

  // Payment Configuration
  payment: {
    paystack: {
      secretKey: process.env.PAYSTACK_SECRET_KEY || "",
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
      baseUrl: process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
      webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || "",
      webhookUrl:
        process.env.PAYSTACK_WEBHOOK_URL ||
        "http://localhost:5000/api/v1/webhooks/paystack",
      callbackUrl:
        process.env.PAYSTACK_CALLBACK_URL ||
        "http://localhost:5000/api/orders/verify",
    },
  },

  // Security
  security: {
    sessionSecret: process.env.SESSION_SECRET || "your_session_secret_here",
    passwordResetExpires: parseInt(process.env.PASSWORD_RESET_EXPIRES) || 30, // in minutes
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
      max: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
    },
  },

  // Default Passwords
  defaultPasswords: {
    vendor: process.env.DEFAULT_VENDOR_PASSWORD || "Vendor@123",
    customer: process.env.DEFAULT_CUSTOMER_PASSWORD || "Secret123!",
    admin: process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123",
  },
};

// Set the environment specific database config
config.db = config.database[config.env] || config.database.development;

module.exports = config.database;
