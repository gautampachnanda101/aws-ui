# LocalStack CRUD UI

A comprehensive React + Vite application for managing AWS services through LocalStack with full CRUD operations. Features Google Cloud Logging standards and Docker support.

## Features

### Supported AWS Services

- **S3**: Complete bucket and object management
  - Create/delete buckets
  - Upload/download/delete objects
  - List buckets and objects

- **DynamoDB**: Full table and item operations
  - Create/delete tables
  - Add/update/delete items
  - Scan tables

- **SQS**: Queue management and messaging
  - Create/delete queues
  - Send/receive/delete messages
  - View queue attributes

- **SNS**: Topic and subscription management
  - Create/delete topics
  - Publish messages
  - Manage subscriptions

- **Lambda**: Function deployment and invocation
  - Create/delete functions
  - Invoke functions
  - View function details

### Additional Features

- Multi-instance configuration support
- JSON-based configuration import/export
- Google Cloud Logging standard structured logging
- Docker containerization
- Responsive UI with dark mode support
- Real-time operation feedback

## Quick Start

### Prerequisites

- Node.js 18+ or Docker
- LocalStack running on `http://localhost:4566` (or custom endpoint)

### Option 1: Docker Compose (Recommended)

The easiest way to run the application with LocalStack:

```bash
# Start both LocalStack and the UI
docker-compose up -d

# Access the UI at http://localhost:3000
# LocalStack will be available at http://localhost:4566
```

To stop:

```bash
docker-compose down
```

### Option 2: Development Mode

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Application will be available at http://localhost:3000
```

### Option 3: Production Build

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Preview production build
npm run preview
```

## Configuration

### Default Configuration

By default, the application connects to:
- Endpoint: `http://localhost:4566`
- Region: `us-east-1`
- Access Key: `test`
- Secret Key: `test`

### Adding Multiple Instances

1. Navigate to the **Configuration** page
2. Fill in the instance details:
   - Instance Name
   - Endpoint URL
   - Region
   - Access Key ID
   - Secret Access Key
3. Click **Add Instance**
4. Select the instance you want to use

### JSON Configuration

You can import/export configuration as JSON:

#### Example Configuration File

```json
{
  "localstackInstances": [
    {
      "name": "Local Development",
      "endpoint": "http://localhost:4566",
      "region": "us-east-1",
      "accessKeyId": "test",
      "secretAccessKey": "test"
    },
    {
      "name": "Docker LocalStack",
      "endpoint": "http://localstack:4566",
      "region": "us-west-2",
      "accessKeyId": "test",
      "secretAccessKey": "test"
    },
    {
      "name": "Remote LocalStack",
      "endpoint": "https://localstack.example.com",
      "region": "eu-west-1",
      "accessKeyId": "your-key",
      "secretAccessKey": "your-secret"
    }
  ],
  "defaultInstance": "Local Development"
}
```

Save this as `config.json` and import it through the Configuration page.

## Architecture

### Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand with persistence
- **AWS SDK**: AWS SDK v3 for JavaScript
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Containerization**: Docker + Docker Compose

### Project Structure

```
aws-ui/
├── src/
│   ├── components/        # Reusable UI components
│   │   └── Navigation.tsx
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx
│   │   ├── S3Page.tsx
│   │   ├── DynamoDBPage.tsx
│   │   ├── SQSPage.tsx
│   │   ├── SNSPage.tsx
│   │   ├── LambdaPage.tsx
│   │   └── ConfigPage.tsx
│   ├── services/         # AWS service clients
│   │   ├── awsClient.ts
│   │   ├── s3Service.ts
│   │   ├── dynamodbService.ts
│   │   ├── sqsService.ts
│   │   ├── snsService.ts
│   │   ├── lambdaService.ts
│   │   └── logger.ts     # Google standard logging
│   ├── stores/           # State management
│   │   └── configStore.ts
│   ├── types/            # TypeScript definitions
│   │   └── index.ts
│   ├── config/           # Default configuration
│   │   └── default-config.json
│   ├── styles/           # Global styles
│   │   └── index.css
│   ├── App.tsx           # Main application
│   └── main.tsx          # Entry point
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── nginx.conf           # Nginx configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

## Logging

The application uses Google Cloud Logging standards for structured logging:

### Log Levels

- `DEBUG`: Detailed debugging information
- `INFO`: General informational messages
- `NOTICE`: Normal but significant events
- `WARNING`: Warning messages
- `ERROR`: Error events
- `CRITICAL`: Critical conditions
- `ALERT`: Action must be taken immediately
- `EMERGENCY`: System is unusable

### Log Format

```json
{
  "severity": "INFO",
  "message": "Operation completed successfully",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "component": "s3-service",
  "metadata": {
    "bucketName": "my-bucket",
    "operation": "createBucket"
  }
}
```

In development mode, logs are pretty-printed to the console. In production, logs are output as JSON for aggregation systems.

## Docker Deployment

### Building the Image

```bash
docker build -t localstack-crud-ui .
```

### Running the Container

```bash
docker run -p 3000:80 localstack-crud-ui
```

### Docker Compose Configuration

The `docker-compose.yml` includes:
- LocalStack with health checks
- UI application with nginx
- Proper networking between services
- Volume persistence for LocalStack data

### Environment Variables

- `NODE_ENV`: Set to `production` for production builds
- `SERVICES`: LocalStack services to enable (in docker-compose)

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Adding New Services

1. Create service client in `src/services/`
2. Create page component in `src/pages/`
3. Add route in `src/App.tsx`
4. Add navigation item in `src/components/Navigation.tsx`
5. Update types in `src/types/index.ts`

## Security Considerations

- The application uses LocalStack credentials which are typically `test/test`
- For production use with real AWS services, ensure proper credential management
- CORS is handled by the AWS SDK configuration
- The application includes security headers in nginx configuration

## Troubleshooting

### LocalStack Connection Issues

1. Ensure LocalStack is running: `docker ps`
2. Check LocalStack health: `curl http://localhost:4566/_localstack/health`
3. Verify endpoint configuration in the UI

### CORS Errors

- LocalStack should automatically handle CORS
- If issues persist, check LocalStack configuration

### Build Issues

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Documentation

For more detailed documentation, see the [docs](docs/) folder:

- **[Quick Start Guide](docs/quickstart.md)** - Get started in 5 minutes
- **[Project Summary](docs/project-summary.md)** - Complete project overview and architecture
- **[Test Report](docs/test-report.md)** - Detailed test results and coverage
- **[E2E Test Summary](docs/e2e-test-summary.md)** - End-to-end test summary

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues and questions:
- Check the troubleshooting section
- Review LocalStack documentation: https://docs.localstack.cloud/
- Open an issue on the project repository

## Acknowledgments

- LocalStack for AWS service emulation
- AWS SDK team for the JavaScript SDK
- React and Vite communities
