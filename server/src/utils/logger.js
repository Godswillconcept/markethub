const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;
const path = require('path');
const fs = require('fs');
// Check if we're in a serverless environment (like Vercel)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTION_NAME;
// Create logs directory only in non-serverless environments
const logDir = path.join(__dirname, '../logs');
if (!isServerless && !fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir);
  } catch (error) {
    // In serverless environments, this will fail but we handle it gracefully
    }
}
// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  const log = `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  return log;
});
// Custom format for file output
const fileFormat = printf(({ level, message, timestamp, ...meta }) => {
  return JSON.stringify({
    timestamp,
    level: level.toUpperCase(),
    message,
    ...meta
  });
});
// Define different colors for different log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};
// Add colors to winston
winston.addColors(colors);
// Enhanced structured logging with proper levels
const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.printf(({ level, message, timestamp, ...meta }) => {
      // Add request context if available
      const context = meta.requestId ? `[Request: ${meta.requestId}]` : '';
      const userId = meta.userId ? `[User: ${meta.userId}]` : '';
      const cleanMeta = { ...meta };
      delete cleanMeta.requestId;
      delete cleanMeta.userId;
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        context: context.trim(),
        userContext: userId.trim(),
        metadata: Object.keys(cleanMeta).length > 0 ? cleanMeta : undefined
      });
    })
  ),
  defaultMeta: { service: 'stylay-api' },
  transports: [
    // Console transport - always available
    new transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      )
    }),
    // File transports only in non-serverless environments
    ...(isServerless ? [] : [
      new transports.File({
        filename: path.join(logDir, 'combined.log'),
        format: combine(
          timestamp(),
          fileFormat
        )
      }),
      new transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: combine(
          timestamp(),
          fileFormat
        )
      }),
      new transports.File({
        filename: path.join(logDir, 'http.log'),
        level: 'http',
        format: combine(
          timestamp(),
          fileFormat
        )
      })
    ])
  ],
  exitOnError: false
});
// Create a stream for morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};
module.exports = logger;
