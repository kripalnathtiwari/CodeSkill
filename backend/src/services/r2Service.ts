import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import { PermanentJobError, RetryableServiceError } from "../lib/errors";

/**
 * Cloudflare R2 S3-compatible client.
 * Requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.
 */
export class R2Service {
  private client: S3Client | null = null;

  private getBucket(): string {
    const bucket = process.env.R2_BUCKET_NAME?.trim();
    if (!bucket) {
      throw new PermanentJobError("R2_BUCKET_NAME is not configured", "MISSING_R2_CONFIG");
    }
    return bucket;
  }

  private getClient(): S3Client {
    if (this.client) {
      return this.client;
    }

    const accountId = process.env.R2_ACCOUNT_ID?.trim();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    const endpoint =
      process.env.R2_ENDPOINT?.trim() ||
      (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new PermanentJobError(
        "Cloudflare R2 credentials (R2_ACCOUNT_ID/R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are missing",
        "MISSING_R2_CONFIG"
      );
    }

    this.client = new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });

    return this.client;
  }

  public isConfigured(): boolean {
    return Boolean(
      (process.env.R2_ENDPOINT || process.env.R2_ACCOUNT_ID) &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME
    );
  }

  public async uploadObject(params: {
    key: string;
    body: Buffer | string;
    contentType: string;
  }): Promise<{ key: string }> {
    try {
      await this.getClient().send(
        new PutObjectCommand({
          Bucket: this.getBucket(),
          Key: params.key,
          Body: params.body,
          ContentType: params.contentType,
        })
      );
      return { key: params.key };
    } catch (err: any) {
      if (err instanceof PermanentJobError) throw err;
      throw new RetryableServiceError(`R2 uploadObject failed for ${params.key}: ${err.message}`);
    }
  }

  public async getObjectStream(key: string): Promise<Readable> {
    try {
      const response = await this.getClient().send(
        new GetObjectCommand({
          Bucket: this.getBucket(),
          Key: key,
        })
      );
      if (!response.Body) {
        throw new PermanentJobError(`R2 object ${key} has empty body`, "R2_EMPTY_OBJECT");
      }
      return response.Body as Readable;
    } catch (err: any) {
      if (err instanceof PermanentJobError) throw err;
      if (err?.$metadata?.httpStatusCode === 404 || err?.name === "NoSuchKey") {
        throw new PermanentJobError(`R2 object not found: ${key}`, "R2_NOT_FOUND");
      }
      throw new RetryableServiceError(`R2 getObjectStream failed for ${key}: ${err.message}`);
    }
  }

  public async listObjects(prefix: string, maxKeys = 500): Promise<Array<{ key: string; lastModified?: Date }>> {
    try {
      const response = await this.getClient().send(
        new ListObjectsV2Command({
          Bucket: this.getBucket(),
          Prefix: prefix,
          MaxKeys: maxKeys,
        })
      );
      return (response.Contents || [])
        .filter((obj) => Boolean(obj.Key))
        .map((obj) => ({ key: obj.Key!, lastModified: obj.LastModified }));
    } catch (err: any) {
      if (err instanceof PermanentJobError) throw err;
      throw new RetryableServiceError(`R2 listObjects failed: ${err.message}`);
    }
  }

  public async deleteObject(key: string): Promise<void> {
    try {
      await this.getClient().send(
        new DeleteObjectCommand({
          Bucket: this.getBucket(),
          Key: key,
        })
      );
    } catch (err: any) {
      if (err instanceof PermanentJobError) throw err;
      throw new RetryableServiceError(`R2 deleteObject failed for ${key}: ${err.message}`);
    }
  }

  public async getPresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.getBucket(),
        Key: key,
      });
      return await getSignedUrl(this.getClient(), command, { expiresIn: expiresInSeconds });
    } catch (err: any) {
      if (err instanceof PermanentJobError) throw err;
      throw new RetryableServiceError(`R2 presign failed for ${key}: ${err.message}`);
    }
  }
}

export const r2Service = new R2Service();
export default r2Service;
