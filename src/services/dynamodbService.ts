import {
  ListTablesCommand,
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  AttributeValue,
  KeySchemaElement,
  AttributeDefinition,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { AWSClientFactory } from './awsClient';
import { DynamoDBTable, DynamoDBItem } from '../types';

export class DynamoDBService {
  private clientFactory: AWSClientFactory;

  constructor(clientFactory: AWSClientFactory) {
    this.clientFactory = clientFactory;
  }

  async listTables(): Promise<string[]> {
    const client = this.clientFactory.getDynamoDBClient();
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    return response.TableNames || [];
  }

  async describeTable(tableName: string): Promise<DynamoDBTable> {
    const client = this.clientFactory.getDynamoDBClient();
    const command = new DescribeTableCommand({ TableName: tableName });
    const response = await client.send(command);
    return {
      TableName: response.Table?.TableName,
      TableStatus: response.Table?.TableStatus,
      CreationDateTime: response.Table?.CreationDateTime,
      ItemCount: response.Table?.ItemCount,
      TableSizeBytes: response.Table?.TableSizeBytes,
    };
  }

  async createTable(
    tableName: string,
    keySchema: KeySchemaElement[],
    attributeDefinitions: AttributeDefinition[]
  ): Promise<void> {
    const client = this.clientFactory.getDynamoDBClient();
    const command = new CreateTableCommand({
      TableName: tableName,
      KeySchema: keySchema,
      AttributeDefinitions: attributeDefinitions,
      BillingMode: 'PAY_PER_REQUEST',
    });
    await client.send(command);
  }

  async deleteTable(tableName: string): Promise<void> {
    const client = this.clientFactory.getDynamoDBClient();
    const command = new DeleteTableCommand({ TableName: tableName });
    await client.send(command);
  }

  async scanTable(tableName: string, limit = 100): Promise<DynamoDBItem[]> {
    const client = this.clientFactory.getDynamoDBClient();
    const command = new ScanCommand({
      TableName: tableName,
      Limit: limit,
    });
    const response = await client.send(command);
    return (response.Items || []).map((item) => unmarshall(item));
  }

  async getItem(tableName: string, key: Record<string, any>): Promise<DynamoDBItem | null> {
    const client = this.clientFactory.getDynamoDBClient();
    const command = new GetItemCommand({
      TableName: tableName,
      Key: marshall(key),
    });
    const response = await client.send(command);
    return response.Item ? unmarshall(response.Item) : null;
  }

  async putItem(tableName: string, item: Record<string, any>): Promise<void> {
    const client = this.clientFactory.getDynamoDBClient();
    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(item),
    });
    await client.send(command);
  }

  async deleteItem(tableName: string, key: Record<string, any>): Promise<void> {
    const client = this.clientFactory.getDynamoDBClient();
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: marshall(key),
    });
    await client.send(command);
  }

  async updateItem(
    tableName: string,
    key: Record<string, any>,
    updates: Record<string, any>
  ): Promise<void> {
    const client = this.clientFactory.getDynamoDBClient();

    // Build update expression
    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, AttributeValue> = {};

    Object.keys(updates).forEach((key, index) => {
      const placeholder = `#attr${index}`;
      const valuePlaceholder = `:val${index}`;
      updateExpressionParts.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = key;
      expressionAttributeValues[valuePlaceholder] = marshall(updates[key]) as AttributeValue;
    });

    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: marshall(key),
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    await client.send(command);
  }
}
