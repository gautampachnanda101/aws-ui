import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SNSClient } from '@aws-sdk/client-sns';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { LocalStackConfig } from '../types';

export class AWSClientFactory {
  private config: LocalStackConfig;

  constructor(config: LocalStackConfig) {
    this.config = config;
  }

  private getBaseClientConfig() {
    return {
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    };
  }

  private getS3ClientConfig() {
    return {
      ...this.getBaseClientConfig(),
      forcePathStyle: true, // Required for LocalStack/MinIO/SeaweedFS S3
    };
  }

  getS3Client(): S3Client {
    return new S3Client(this.getS3ClientConfig());
  }

  getDynamoDBClient(): DynamoDBClient {
    return new DynamoDBClient(this.getBaseClientConfig());
  }

  getSQSClient(): SQSClient {
    return new SQSClient(this.getBaseClientConfig());
  }

  getSNSClient(): SNSClient {
    return new SNSClient(this.getBaseClientConfig());
  }

  getLambdaClient(): LambdaClient {
    return new LambdaClient(this.getBaseClientConfig());
  }
}
