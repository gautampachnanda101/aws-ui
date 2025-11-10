import {
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWSClientFactory } from './awsClient';
import { S3Bucket, S3Object } from '../types';

export class S3Service {
  private clientFactory: AWSClientFactory;

  constructor(clientFactory: AWSClientFactory) {
    this.clientFactory = clientFactory;
  }

  async listBuckets(): Promise<S3Bucket[]> {
    const client = this.clientFactory.getS3Client();
    const command = new ListBucketsCommand({});
    const response = await client.send(command);
    return response.Buckets || [];
  }

  async createBucket(bucketName: string): Promise<void> {
    const client = this.clientFactory.getS3Client();
    const command = new CreateBucketCommand({ Bucket: bucketName });
    await client.send(command);
  }

  async deleteBucket(bucketName: string): Promise<void> {
    const client = this.clientFactory.getS3Client();

    // First, delete all objects in the bucket
    const objects = await this.listObjects(bucketName);
    for (const obj of objects) {
      if (obj.Key) {
        await this.deleteObject(bucketName, obj.Key);
      }
    }

    // Then delete the bucket
    const command = new DeleteBucketCommand({ Bucket: bucketName });
    await client.send(command);
  }

  async listObjects(bucketName: string, prefix?: string): Promise<S3Object[]> {
    const client = this.clientFactory.getS3Client();
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });
    const response = await client.send(command);
    return response.Contents || [];
  }

  async uploadObject(
    bucketName: string,
    key: string,
    body: string | Uint8Array | Buffer,
    contentType?: string
  ): Promise<void> {
    const client = this.clientFactory.getS3Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    await client.send(command);
  }

  async deleteObject(bucketName: string, key: string): Promise<void> {
    const client = this.clientFactory.getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(command);
  }

  async getObject(bucketName: string, key: string): Promise<string> {
    const client = this.clientFactory.getS3Client();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await client.send(command);
    const bodyContents = await response.Body?.transformToString();
    return bodyContents || '';
  }

  async getPresignedUrl(bucketName: string, key: string, expiresIn = 3600): Promise<string> {
    const client = this.clientFactory.getS3Client();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    return await getSignedUrl(client, command, { expiresIn });
  }

  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      const client = this.clientFactory.getS3Client();
      const command = new HeadBucketCommand({ Bucket: bucketName });
      await client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
