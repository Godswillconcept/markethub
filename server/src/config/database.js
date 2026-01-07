const { Sequelize } = require("sequelize");
require("dotenv").config();
const logger = require("../utils/logger");

// Base configuration shared across all environments
const getBaseConfig = (env) => ({
  define: {
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  seederStorage: "sequelize",
  dialectOptions: {
    connectTimeout: 60000,
  },
});

// Development configuration
const development = {
  ...getBaseConfig("development"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "stylay_db",
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || "mysql",
};

// Test configuration
const test = {
  ...getBaseConfig("test"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME_TEST || "stylay_db_test",
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || "mysql",
  logging: false,
};

// Production configuration
const production = (() => {
  let dbConfig = {
    ...getBaseConfig("production"),
    username: process.env.MYSQL_ADDON_USER || process.env.DB_USER,
    password: process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQL_ADDON_DB || process.env.DB_NAME,
    host: process.env.MYSQL_ADDON_HOST || process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.MYSQL_ADDON_PORT || process.env.DB_PORT) || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
  };

  // Add SSL if explicitly enabled via env var
  if (process.env.DB_SSL_ENABLED === "true") {
    dbConfig.dialectOptions.ssl = {
      require: true,
      rejectUnauthorized: false,
    };
  }

  // Parse DATABASE_URL if available
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      dbConfig.username = url.username;
      dbConfig.password = url.password;
      dbConfig.database = url.pathname.slice(1).split("?")[0];
      dbConfig.host = url.hostname;
      dbConfig.port = parseInt(url.port) || 3306;

      // Handle mysql:// protocol
      if (url.protocol === "mysql:") {
        dbConfig.dialect = "mysql";
      }

      // Check if SSL is required from URL params
      const sslMode =
        url.searchParams.get("ssl-mode") || url.searchParams.get("sslmode");
      if (
        sslMode &&
        (sslMode.toLowerCase() === "required" ||
          sslMode.toLowerCase() === "true")
      ) {
        dbConfig.dialectOptions.ssl = {
          require: true,
          rejectUnauthorized: false,
        };
      }
    } catch (error) {
      console.error("Error parsing DATABASE_URL:", error);
      throw error;
    }
  }

  return dbConfig;
})();

// Get config for current environment
const env = process.env.NODE_ENV || "development";
const dbConfig = { development, test, production }[env] || development;

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established successfully");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    // In serverless, don't exit process, just log
  }
};

const syncDB = async (force = false) => {
  try {
    await sequelize.sync({ force });
    logger.info("Database synced successfully");
  } catch (error) {
    logger.error("Error syncing database:", error);
    process.exit(1);
  }
};

// IMPORTANT: Export both instance AND environment configs
module.exports = {
  sequelize,
  connectDB,
  syncDB,
  Sequelize,
  // Export environment-specific configs for API endpoints
  development,
  test,
  production,
};
