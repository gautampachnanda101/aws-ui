import {
  ListQueuesCommand,
  CreateQueueCommand,
  DeleteQueueCommand,
  GetQueueAttributesCommand,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  PurgeQueueCommand,
  GetQueueUrlCommand,
} from '@aws-sdk/client-sqs';
import { AWSClientFactory } from './awsClient';
import { SQSMessage } from '../types';

export class SQSService {
  private clientFactory: AWSClientFactory;

  constructor(clientFactory: AWSClientFactory) {
    this.clientFactory = clientFactory;
  }

  async listQueues(): Promise<string[]> {
    const client = this.clientFactory.getSQSClient();
    const command = new ListQueuesCommand({});
    const response = await client.send(command);
    return response.QueueUrls || [];
  }

  async createQueue(queueName: string, attributes?: Record<string, string>): Promise<string> {
    const client = this.clientFactory.getSQSClient();
    const command = new CreateQueueCommand({
      QueueName: queueName,
      Attributes: attributes,
    });
    const response = await client.send(command);
    return response.QueueUrl || '';
  }

  async deleteQueue(queueUrl: string): Promise<void> {
    const client = this.clientFactory.getSQSClient();
    const command = new DeleteQueueCommand({ QueueUrl: queueUrl });
    await client.send(command);
  }

  async getQueueAttributes(queueUrl: string): Promise<Record<string, string>> {
    const client = this.clientFactory.getSQSClient();
    const command = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['All'],
    });
    const response = await client.send(command);
    return response.Attributes || {};
  }

  async sendMessage(queueUrl: string, messageBody: string, attributes?: Record<string, any>): Promise<void> {
    const client = this.clientFactory.getSQSClient();
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
      MessageAttributes: attributes,
    });
    await client.send(command);
  }

  async receiveMessages(
    queueUrl: string,
    maxMessages = 10,
    waitTimeSeconds = 0
  ): Promise<SQSMessage[]> {
    const client = this.clientFactory.getSQSClient();
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: waitTimeSeconds,
      AttributeNames: ['All'],
      MessageAttributeNames: ['All'],
    });
    const response = await client.send(command);
    return response.Messages || [];
  }

  async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    const client = this.clientFactory.getSQSClient();
    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    });
    await client.send(command);
  }

  async purgeQueue(queueUrl: string): Promise<void> {
    const client = this.clientFactory.getSQSClient();
    const command = new PurgeQueueCommand({ QueueUrl: queueUrl });
    await client.send(command);
  }

  async getQueueUrl(queueName: string): Promise<string> {
    const client = this.clientFactory.getSQSClient();
    const command = new GetQueueUrlCommand({ QueueName: queueName });
    const response = await client.send(command);
    return response.QueueUrl || '';
  }

  getQueueName(queueUrl: string): string {
    const parts = queueUrl.split('/');
    return parts[parts.length - 1];
  }
}
