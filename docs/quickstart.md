# Quick Start Guide

## Running with Docker Compose (Easiest)

This will start both LocalStack and the UI:

```bash
docker-compose up -d
```

Access the application:
- UI: http://localhost:3000
- LocalStack: http://localhost:4566

## Running Locally

### Prerequisites
- Node.js 18+
- LocalStack running (see below)

### Start LocalStack

```bash
# Using Make (recommended - includes CORS configuration)
make localstack-start

# Or using Docker directly with CORS enabled
docker run -d --name localstack \
  -p 4566:4566 \
  -e SERVICES=s3,dynamodb,sqs,sns,lambda \
  -e EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000 \
  -e 'EXTRA_CORS_ALLOWED_HEADERS=*' \
  localstack/localstack:latest
```

### Start the UI

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Access at http://localhost:3000

## First Steps

1. Go to **Configuration** page
2. Verify the default LocalStack instance is configured:
   - Name: Local Development
   - Endpoint: http://localhost:4566
   - Region: us-east-1
3. Start using any service:
   - **S3**: Create buckets and upload files
   - **DynamoDB**: Create tables and manage items
   - **SQS**: Create queues and send messages
   - **SNS**: Create topics and subscriptions
   - **Lambda**: Deploy and invoke functions

## Using Make Commands

```bash
make help                  # Show all available commands
make install              # Install dependencies
make dev                  # Start development server
make build                # Build for production
make localstack-start     # Start LocalStack with CORS for local development
make localstack-stop      # Stop and remove LocalStack
make docker-compose-up    # Start with docker-compose
make docker-compose-down  # Stop docker-compose services
make test-localstack      # Test LocalStack connection
```

## Importing Configuration

If you have multiple LocalStack instances:

1. Go to **Configuration** page
2. Click **Import Config**
3. Paste your JSON configuration
4. Click **Import**

Example configuration:

```json
{
  "localstackInstances": [
    {
      "name": "Local",
      "endpoint": "http://localhost:4566",
      "region": "us-east-1",
      "accessKeyId": "test",
      "secretAccessKey": "test"
    }
  ],
  "defaultInstance": "Local"
}
```

## Troubleshooting

### Cannot connect to LocalStack

Check if LocalStack is running:
```bash
docker ps | grep localstack
curl http://localhost:4566/_localstack/health
```

### Port already in use

Change ports in docker-compose.yml or stop the conflicting service:
```bash
# Stop the UI
docker-compose stop localstack-ui

# Or change the port mapping
# Edit docker-compose.yml: "3001:80" instead of "3000:80"
```

## Next Steps

- Explore each service page
- Check the browser console for structured logs
- Export your configuration for backup
- Try the example workflows in the README
