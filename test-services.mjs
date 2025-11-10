#!/usr/bin/env node

// End-to-End Test Script for LocalStack Services using AWS SDK
import { S3Client, CreateBucketCommand, ListBucketsCommand, PutObjectCommand, DeleteObjectCommand, DeleteBucketCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, CreateTableCommand, ListTablesCommand, PutItemCommand, ScanCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import { SQSClient, CreateQueueCommand, ListQueuesCommand, SendMessageCommand, ReceiveMessageCommand, DeleteQueueCommand } from '@aws-sdk/client-sqs';
import { SNSClient, CreateTopicCommand, ListTopicsCommand, PublishCommand, DeleteTopicCommand } from '@aws-sdk/client-sns';
import { LambdaClient, CreateFunctionCommand, ListFunctionsCommand, InvokeCommand, DeleteFunctionCommand } from '@aws-sdk/client-lambda';

const config = {
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
  forcePathStyle: true,
};

let testsPassed = 0;
let testsFailed = 0;

const log = {
  success: (msg) => {
    console.log('\x1b[32m✓\x1b[0m', msg);
    testsPassed++;
  },
  error: (msg, err) => {
    console.log('\x1b[31m✗\x1b[0m', msg);
    if (err) console.log('  Error:', err.message);
    testsFailed++;
  },
  section: (msg) => console.log('\n\x1b[36m' + msg + '\x1b[0m'),
};

async function testS3() {
  log.section('1. Testing S3 Service');
  log.section('--------------------');

  const client = new S3Client(config);
  const bucketName = 'test-bucket-' + Date.now();

  try {
    // Create bucket
    await client.send(new CreateBucketCommand({ Bucket: bucketName }));
    log.success('Create S3 bucket');
  } catch (err) {
    log.error('Create S3 bucket', err);
    return;
  }

  try {
    // List buckets
    const { Buckets } = await client.send(new ListBucketsCommand({}));
    if (Buckets.some(b => b.Name === bucketName)) {
      log.success('List S3 buckets');
    } else {
      log.error('List S3 buckets - bucket not found');
    }
  } catch (err) {
    log.error('List S3 buckets', err);
  }

  try {
    // Put object
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: 'test.txt',
      Body: 'Hello from test!',
    }));
    log.success('Upload object to S3');
  } catch (err) {
    log.error('Upload object to S3', err);
  }

  try {
    // Delete object
    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: 'test.txt',
    }));
    log.success('Delete S3 object');
  } catch (err) {
    log.error('Delete S3 object', err);
  }

  try {
    // Delete bucket
    await client.send(new DeleteBucketCommand({ Bucket: bucketName }));
    log.success('Delete S3 bucket');
  } catch (err) {
    log.error('Delete S3 bucket', err);
  }
}

async function testDynamoDB() {
  log.section('\n2. Testing DynamoDB Service');
  log.section('---------------------------');

  const client = new DynamoDBClient(config);
  const tableName = 'test-table-' + Date.now();

  try {
    // Create table
    await client.send(new CreateTableCommand({
      TableName: tableName,
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      BillingMode: 'PAY_PER_REQUEST',
    }));
    log.success('Create DynamoDB table');
  } catch (err) {
    log.error('Create DynamoDB table', err);
    return;
  }

  try {
    // List tables
    const { TableNames } = await client.send(new ListTablesCommand({}));
    if (TableNames.includes(tableName)) {
      log.success('List DynamoDB tables');
    } else {
      log.error('List DynamoDB tables - table not found');
    }
  } catch (err) {
    log.error('List DynamoDB tables', err);
  }

  try {
    // Put item
    await client.send(new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: 'test-id-1' },
        name: { S: 'Test Item' },
        value: { N: '42' },
      },
    }));
    log.success('Put item to DynamoDB');
  } catch (err) {
    log.error('Put item to DynamoDB', err);
  }

  try {
    // Scan table
    const { Items } = await client.send(new ScanCommand({ TableName: tableName }));
    if (Items && Items.length > 0) {
      log.success('Scan DynamoDB table');
    } else {
      log.error('Scan DynamoDB table - no items found');
    }
  } catch (err) {
    log.error('Scan DynamoDB table', err);
  }

  try {
    // Delete table
    await client.send(new DeleteTableCommand({ TableName: tableName }));
    log.success('Delete DynamoDB table');
  } catch (err) {
    log.error('Delete DynamoDB table', err);
  }
}

async function testSQS() {
  log.section('\n3. Testing SQS Service');
  log.section('----------------------');

  const client = new SQSClient(config);
  const queueName = 'test-queue-' + Date.now();
  let queueUrl;

  try {
    // Create queue
    const { QueueUrl } = await client.send(new CreateQueueCommand({ QueueName: queueName }));
    queueUrl = QueueUrl;
    log.success('Create SQS queue');
  } catch (err) {
    log.error('Create SQS queue', err);
    return;
  }

  try {
    // List queues
    const { QueueUrls } = await client.send(new ListQueuesCommand({}));
    if (QueueUrls && QueueUrls.some(url => url.includes(queueName))) {
      log.success('List SQS queues');
    } else {
      log.error('List SQS queues - queue not found');
    }
  } catch (err) {
    log.error('List SQS queues', err);
  }

  try {
    // Send message
    await client.send(new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: 'Test message',
    }));
    log.success('Send message to SQS');
  } catch (err) {
    log.error('Send message to SQS', err);
  }

  try {
    // Receive message
    const { Messages } = await client.send(new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 1,
    }));
    if (Messages && Messages.length > 0) {
      log.success('Receive message from SQS');
    } else {
      log.error('Receive message from SQS - no messages');
    }
  } catch (err) {
    log.error('Receive message from SQS', err);
  }

  try {
    // Delete queue
    await client.send(new DeleteQueueCommand({ QueueUrl: queueUrl }));
    log.success('Delete SQS queue');
  } catch (err) {
    log.error('Delete SQS queue', err);
  }
}

async function testSNS() {
  log.section('\n4. Testing SNS Service');
  log.section('----------------------');

  const client = new SNSClient(config);
  const topicName = 'test-topic-' + Date.now();
  let topicArn;

  try {
    // Create topic
    const { TopicArn } = await client.send(new CreateTopicCommand({ Name: topicName }));
    topicArn = TopicArn;
    log.success('Create SNS topic');
  } catch (err) {
    log.error('Create SNS topic', err);
    return;
  }

  try {
    // List topics
    const { Topics } = await client.send(new ListTopicsCommand({}));
    if (Topics && Topics.some(t => t.TopicArn === topicArn)) {
      log.success('List SNS topics');
    } else {
      log.error('List SNS topics - topic not found');
    }
  } catch (err) {
    log.error('List SNS topics', err);
  }

  try {
    // Publish message
    await client.send(new PublishCommand({
      TopicArn: topicArn,
      Message: 'Test notification',
    }));
    log.success('Publish message to SNS');
  } catch (err) {
    log.error('Publish message to SNS', err);
  }

  try {
    // Delete topic
    await client.send(new DeleteTopicCommand({ TopicArn: topicArn }));
    log.success('Delete SNS topic');
  } catch (err) {
    log.error('Delete SNS topic', err);
  }
}

async function testLambda() {
  log.section('\n5. Testing Lambda Service');
  log.section('-------------------------');

  const client = new LambdaClient(config);
  const functionName = 'test-function-' + Date.now();

  const code = `
exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello from Lambda!' })
    };
};
`;

  try {
    // Create function
    await client.send(new CreateFunctionCommand({
      FunctionName: functionName,
      Runtime: 'nodejs18.x',
      Handler: 'index.handler',
      Code: { ZipFile: new TextEncoder().encode(code) },
      Role: 'arn:aws:iam::000000000000:role/lambda-role',
    }));
    log.success('Create Lambda function');
  } catch (err) {
    log.error('Create Lambda function', err);
    return;
  }

  try {
    // List functions
    const { Functions } = await client.send(new ListFunctionsCommand({}));
    if (Functions && Functions.some(f => f.FunctionName === functionName)) {
      log.success('List Lambda functions');
    } else {
      log.error('List Lambda functions - function not found');
    }
  } catch (err) {
    log.error('List Lambda functions', err);
  }

  try {
    // Invoke function
    const response = await client.send(new InvokeCommand({
      FunctionName: functionName,
    }));
    if (response.StatusCode === 200) {
      log.success('Invoke Lambda function');
    } else {
      log.error('Invoke Lambda function - bad status code');
    }
  } catch (err) {
    log.error('Invoke Lambda function', err);
  }

  try {
    // Delete function
    await client.send(new DeleteFunctionCommand({ FunctionName: functionName }));
    log.success('Delete Lambda function');
  } catch (err) {
    log.error('Delete Lambda function', err);
  }
}

async function runTests() {
  console.log('============================================');
  console.log('LocalStack CRUD UI - End-to-End Test');
  console.log('============================================');

  await testS3();
  await testDynamoDB();
  await testSQS();
  await testSNS();
  await testLambda();

  console.log('\n============================================');
  console.log('Test Summary');
  console.log('============================================');
  console.log('\x1b[32mTests Passed:\x1b[0m', testsPassed);
  console.log('\x1b[31mTests Failed:\x1b[0m', testsFailed);
  console.log('');

  if (testsFailed === 0) {
    console.log('\x1b[32m✓ All tests passed!\x1b[0m');
    process.exit(0);
  } else {
    console.log('\x1b[31m✗ Some tests failed\x1b[0m');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
