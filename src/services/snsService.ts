import {
  ListTopicsCommand,
  CreateTopicCommand,
  DeleteTopicCommand,
  PublishCommand,
  SubscribeCommand,
  UnsubscribeCommand,
  ListSubscriptionsByTopicCommand,
  GetTopicAttributesCommand,
} from '@aws-sdk/client-sns';
import { AWSClientFactory } from './awsClient';
import { SNSTopic, SNSSubscription } from '../types';

export class SNSService {
  private clientFactory: AWSClientFactory;

  constructor(clientFactory: AWSClientFactory) {
    this.clientFactory = clientFactory;
  }

  async listTopics(): Promise<SNSTopic[]> {
    const client = this.clientFactory.getSNSClient();
    const command = new ListTopicsCommand({});
    const response = await client.send(command);
    return response.Topics || [];
  }

  async createTopic(topicName: string): Promise<string> {
    const client = this.clientFactory.getSNSClient();
    const command = new CreateTopicCommand({ Name: topicName });
    const response = await client.send(command);
    return response.TopicArn || '';
  }

  async deleteTopic(topicArn: string): Promise<void> {
    const client = this.clientFactory.getSNSClient();
    const command = new DeleteTopicCommand({ TopicArn: topicArn });
    await client.send(command);
  }

  async publish(
    topicArn: string,
    message: string,
    subject?: string,
    attributes?: Record<string, any>
  ): Promise<string> {
    const client = this.clientFactory.getSNSClient();
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: message,
      Subject: subject,
      MessageAttributes: attributes,
    });
    const response = await client.send(command);
    return response.MessageId || '';
  }

  async subscribe(
    topicArn: string,
    protocol: string,
    endpoint: string
  ): Promise<string> {
    const client = this.clientFactory.getSNSClient();
    const command = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: protocol,
      Endpoint: endpoint,
    });
    const response = await client.send(command);
    return response.SubscriptionArn || '';
  }

  async unsubscribe(subscriptionArn: string): Promise<void> {
    const client = this.clientFactory.getSNSClient();
    const command = new UnsubscribeCommand({ SubscriptionArn: subscriptionArn });
    await client.send(command);
  }

  async listSubscriptions(topicArn: string): Promise<SNSSubscription[]> {
    const client = this.clientFactory.getSNSClient();
    const command = new ListSubscriptionsByTopicCommand({ TopicArn: topicArn });
    const response = await client.send(command);
    return response.Subscriptions || [];
  }

  async getTopicAttributes(topicArn: string): Promise<Record<string, string>> {
    const client = this.clientFactory.getSNSClient();
    const command = new GetTopicAttributesCommand({ TopicArn: topicArn });
    const response = await client.send(command);
    return response.Attributes || {};
  }

  getTopicName(topicArn: string): string {
    const parts = topicArn.split(':');
    return parts[parts.length - 1];
  }
}
