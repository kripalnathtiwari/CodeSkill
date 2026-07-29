import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import logger from '../config/logger';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = util.promisify(exec);

export class BackupService {
  private static s3Client: S3Client | null = null;

  private static getS3Client(): S3Client {
    if (!this.s3Client) {
      // Bypass self-signed cert issues (e.g., from local antivirus or corporate proxies)
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        }
      });
    }
    return this.s3Client;
  }

  public static async performBackup(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.sql`;
    const backupFilePath = path.join(__dirname, '../../', backupFileName);

    // Neon DB connection string from .env
    const databaseUrl = process.env.DATABASE_URL;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!databaseUrl) {
      logger.error('Database URL not found in environment. Backup failed.');
      return;
    }

    if (!bucketName) {
      logger.error('AWS_S3_BUCKET_NAME not found in environment. Backup failed.');
      return;
    }

    try {
      logger.info(`Starting database backup: ${backupFileName}`);
      
      // 1. Create dump file using local pg_dump v18
      const pgDumpExecutable = path.join(__dirname, '../../pgsql/pgsql/bin/pg_dump.exe');
      const { stderr } = await execAsync(`"${pgDumpExecutable}" "${databaseUrl}" -f "${backupFilePath}"`);
      if (stderr) {
        logger.warn(`pg_dump warning: ${stderr}`);
      }
      logger.info('Database dump created locally.');

      // 2. Read the created file
      const fileStream = fs.createReadStream(backupFilePath);

      // 3. Upload to AWS S3
      const s3Client = this.getS3Client();
      const uploadParams = {
        Bucket: bucketName,
        Key: `backups/${backupFileName}`,
        Body: fileStream,
      };

      logger.info('Uploading backup to AWS S3...');
      await s3Client.send(new PutObjectCommand(uploadParams));
      logger.info('Backup successfully uploaded to S3.');

    } catch (error: any) {
      logger.error(`Error during database backup process: ${error.message}`);
    } finally {
      // 4. Clean up local backup file
      if (fs.existsSync(backupFilePath)) {
        try {
          fs.unlinkSync(backupFilePath);
          logger.info(`Cleaned up local backup file: ${backupFileName}`);
        } catch (cleanupError: any) {
          logger.error(`Failed to delete local backup file: ${cleanupError.message}`);
        }
      }
    }
  }
}
