# LocalStack CRUD UI Documentation

Welcome to the LocalStack CRUD UI documentation!

## Overview

This is a comprehensive React + Vite application for managing AWS services through LocalStack with full CRUD operations. The application provides an intuitive interface for managing:

- **S3** - Object storage and buckets
- **DynamoDB** - NoSQL database tables and items
- **SQS** - Message queues
- **SNS** - Notification topics and subscriptions
- **Lambda** - Serverless functions

## Key Features

- ✅ Full CRUD operations for all supported services
- ✅ Multi-instance LocalStack configuration
- ✅ Google Cloud Logging standards
- ✅ Docker containerization
- ✅ Light and dark mode support
- ✅ Real-time operation feedback
- ✅ Branded UI with Pachnanda Digital

## Quick Links

### Getting Started
- [Quick Start Guide](quickstart.md) - Set up and run the application in minutes
- [Configuration](../config.example.json) - Example configuration file

### Reference
- [Project Summary](project-summary.md) - Complete architecture and implementation details
- [Test Report](test-report.md) - Comprehensive testing results
- [E2E Test Summary](e2e-test-summary.md) - End-to-end test results

## Architecture

The application is built with:
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **State Management**: Zustand
- **AWS SDK**: AWS SDK v3
- **Styling**: CSS Variables with light/dark mode
- **Deployment**: Docker + Nginx

## Support

For issues and questions:
- Check the [troubleshooting section](project-summary.md#troubleshooting)
- Review [LocalStack documentation](https://docs.localstack.cloud/)
- Check the [Quick Start Guide](quickstart.md)
