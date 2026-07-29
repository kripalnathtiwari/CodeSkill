import cron from 'node-cron';
import logger from '../config/logger';
import { BackupService } from '../services/backupService';

// Schedule the task to run every day at 00:00 (Midnight)
export const initBackupCronJob = () => {
  logger.info('Initializing daily database backup cron job...');
  
  // '0 0 * * *' -> Run at 00:00 every day
  cron.schedule('0 0 * * *', async () => {
    logger.info('Cron Job Triggered: Starting daily database backup...');
    try {
      await BackupService.performBackup();
      logger.info('Daily database backup completed successfully.');
    } catch (error: any) {
      logger.error(`Daily database backup failed: ${error.message}`);
    }
  });
};
