import { BackupService } from './src/services/backupService';
import logger from './src/config/logger';

async function testBackup() {
  logger.info('Running manual test for AWS S3 Backup...');
  try {
    await BackupService.performBackup();
    logger.info('Manual backup test completed! Check your AWS S3 bucket to confirm the file is there.');
  } catch (error) {
    logger.error('Manual backup test failed:', error);
  }
}

testBackup();
