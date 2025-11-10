export interface LocalStackConfig {
  name: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface AppConfig {
  localstackInstances: LocalStackConfig[];
  defaultInstance: string;
}

export interface S3Bucket {
  Name?: string;
  CreationDate?: Date;
}

export interface S3Object {
  Key?: string;
  LastModified?: Date;
  Size?: number;
  ETag?: string;
}

export interface DynamoDBTable {
  TableName?: string;
  TableStatus?: string;
  CreationDateTime?: Date;
  ItemCount?: number;
  TableSizeBytes?: number;
}

export interface DynamoDBItem {
  [key: string]: any;
}

export interface SQSQueue {
  QueueUrl?: string;
  QueueName?: string;
  Attributes?: Record<string, string>;
}

export interface SQSMessage {
  MessageId?: string;
  ReceiptHandle?: string;
  MD5OfBody?: string;
  Body?: string;
  Attributes?: Record<string, string>;
}

export interface SNSTopic {
  TopicArn?: string;
}

export interface SNSSubscription {
  SubscriptionArn?: string;
  Protocol?: string;
  Endpoint?: string;
  TopicArn?: string;
}

export interface LambdaFunction {
  FunctionName?: string;
  FunctionArn?: string;
  Runtime?: string;
  Handler?: string;
  CodeSize?: number;
  Description?: string;
  LastModified?: string;
}

export type ServiceType = 's3' | 'dynamodb' | 'sqs' | 'sns' | 'lambda';
