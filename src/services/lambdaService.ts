import {
  ListFunctionsCommand,
  CreateFunctionCommand,
  DeleteFunctionCommand,
  GetFunctionCommand,
  InvokeCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  Runtime,
} from '@aws-sdk/client-lambda';
import { AWSClientFactory } from './awsClient';
import { LambdaFunction } from '../types';

export class LambdaService {
  private clientFactory: AWSClientFactory;

  constructor(clientFactory: AWSClientFactory) {
    this.clientFactory = clientFactory;
  }

  async listFunctions(): Promise<LambdaFunction[]> {
    const client = this.clientFactory.getLambdaClient();
    const command = new ListFunctionsCommand({});
    const response = await client.send(command);
    return response.Functions || [];
  }

  async getFunction(functionName: string): Promise<LambdaFunction | null> {
    try {
      const client = this.clientFactory.getLambdaClient();
      const command = new GetFunctionCommand({ FunctionName: functionName });
      const response = await client.send(command);
      return response.Configuration || null;
    } catch {
      return null;
    }
  }

  async createFunction(
    functionName: string,
    runtime: Runtime | string,
    handler: string,
    code: Uint8Array,
    role: string,
    description?: string,
    environment?: Record<string, string>
  ): Promise<void> {
    const client = this.clientFactory.getLambdaClient();
    const command = new CreateFunctionCommand({
      FunctionName: functionName,
      Runtime: runtime as Runtime,
      Handler: handler,
      Code: { ZipFile: code },
      Role: role,
      Description: description,
      Environment: environment ? { Variables: environment } : undefined,
    });
    await client.send(command);
  }

  async deleteFunction(functionName: string): Promise<void> {
    const client = this.clientFactory.getLambdaClient();
    const command = new DeleteFunctionCommand({ FunctionName: functionName });
    await client.send(command);
  }

  async invokeFunction(
    functionName: string,
    payload?: Record<string, any>
  ): Promise<{ statusCode: number; payload: string }> {
    const client = this.clientFactory.getLambdaClient();
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: payload ? JSON.stringify(payload) : undefined,
    });
    const response = await client.send(command);

    const payloadString = response.Payload
      ? new TextDecoder().decode(response.Payload)
      : '';

    return {
      statusCode: response.StatusCode || 0,
      payload: payloadString,
    };
  }

  async updateFunctionCode(functionName: string, code: Uint8Array): Promise<void> {
    const client = this.clientFactory.getLambdaClient();
    const command = new UpdateFunctionCodeCommand({
      FunctionName: functionName,
      ZipFile: code,
    });
    await client.send(command);
  }

  async updateFunctionConfiguration(
    functionName: string,
    config: {
      runtime?: Runtime | string;
      handler?: string;
      description?: string;
      environment?: Record<string, string>;
    }
  ): Promise<void> {
    const client = this.clientFactory.getLambdaClient();
    const command = new UpdateFunctionConfigurationCommand({
      FunctionName: functionName,
      Runtime: config.runtime as Runtime | undefined,
      Handler: config.handler,
      Description: config.description,
      Environment: config.environment ? { Variables: config.environment } : undefined,
    });
    await client.send(command);
  }
}
