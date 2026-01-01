const cron = require('node-cron');
const cleanupService = require('../services/cleanup.service');
const logger = require('../utils/logger');

/**
 * Cleanup Job
 * Scheduled job for automatic cleanup of expired tokens and sessions
 */
class CleanupJob {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the cleanup cron job
   */
  start() {
    // Run cleanup every hour
    cron.schedule('0 * * * *', async () => {
      await this.runCleanup();
    });

    // Run comprehensive cleanup once per day at 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.runComprehensiveCleanup();
    });

    logger.info('Cleanup jobs scheduled:');
    logger.info('  - Hourly cleanup: 0 * * * *');
    logger.info('  - Daily comprehensive cleanup: 0 2 * * *');
  }

  /**
   * Run standard cleanup job
   */
  async runCleanup() {
    if (this.isRunning) {
      logger.warn('Cleanup job already running, skipping this iteration');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('Starting hourly cleanup job');
      const result = await cleanupService.cleanupExpiredTokens();
      
      const duration = Date.now() - startTime;
      logger.info(`Hourly cleanup completed in ${duration}ms`, result);
      
      return result;
    } catch (error) {
      logger.error('Hourly cleanup job failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run comprehensive cleanup job
   */
  async runComprehensiveCleanup() {
    if (this.isRunning) {
      logger.warn('Comprehensive cleanup job already running, skipping this iteration');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('Starting daily comprehensive cleanup job');
      const result = await cleanupService.runComprehensiveCleanup(30);
      
      const duration = Date.now() - startTime;
      logger.info(`Daily comprehensive cleanup completed in ${duration}ms`, result);
      
      return result;
    } catch (error) {
      logger.error('Daily comprehensive cleanup job failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run emergency cleanup
   */
  async runEmergencyCleanup() {
    logger.warn('Running emergency cleanup');
    try {
      const result = await cleanupService.emergencyCleanup();
      logger.info('Emergency cleanup completed', result);
      return result;
    } catch (error) {
      logger.error('Emergency cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.getNextRun()
    };
  }

  /**
   * Get next scheduled run times
   */
  getNextRun() {
    // This is a simplified version - in production you'd use cron-schedule or similar
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);

    const next2AM = new Date(now);
    next2AM.setMinutes(0, 0, 0);
    next2AM.setHours(2);
    if (next2AM <= now) {
      next2AM.setDate(next2AM.getDate() + 1);
    }

    return {
      hourly: nextHour.toISOString(),
      daily: next2AM.toISOString()
    };
  }
}

module.exports = new CleanupJob();