# E2E Tests

End-to-end tests for the LocalStack CRUD UI using Playwright.

## Running Tests

### Quick Start

Run the full E2E test suite (builds image, starts containers, runs tests, cleans up):

```bash
make e2e
```

### Individual Commands

```bash
# Setup E2E environment (build and start containers)
make e2e-setup

# Run tests against running containers
make e2e-test

# Cleanup containers
make e2e-cleanup

# Run tests with visible browser
make e2e-headed
```

### Manual Testing

```bash
# Install dependencies (including Playwright browsers)
npm install
npx playwright install

# Start containers manually
make e2e-setup

# Run tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Run tests with visible browser
npm run test:e2e:headed

# Cleanup
make e2e-cleanup
```

## Test Structure

- **ui-navigation.spec.ts** - Tests navigation across all pages
- **s3-operations.spec.ts** - Tests S3 bucket CRUD operations
- **dynamodb-operations.spec.ts** - Tests DynamoDB table operations
- **configuration.spec.ts** - Tests configuration page functionality

## Test Reports

After running tests, reports are available in:

- `playwright-report/` - HTML report with screenshots
- `test-results/` - Raw test artifacts, traces, and videos

View the HTML report:

```bash
npx playwright show-report
```

## Screenshots and Videos

- Screenshots are captured on test failures
- Videos are recorded for failed tests
- Traces are saved for debugging failed tests

## CI/CD

E2E tests run automatically in GitHub Actions on every release:

1. Published Docker image is pulled
2. LocalStack is started with CORS configured
3. UI container is started
4. Playwright tests run against the live environment
5. Test reports are uploaded as artifacts

## Configuration

Test configuration is in `playwright.config.ts`:

- Base URL: `http://localhost:3000`
- Browser: Chromium (Desktop Chrome)
- Viewport: 1280x720
- Retries: 2 (in CI)
- Video: On failure
- Screenshot: On failure
- Trace: On failure

## Troubleshooting

### Tests Fail to Connect

Ensure containers are running:

```bash
docker ps
curl http://localhost:3000/health
curl http://localhost:4566/_localstack/health
```

### Port Conflicts

If ports 3000 or 4566 are in use, stop conflicting services:

```bash
make e2e-cleanup
docker ps
```

### Browser Installation

If Playwright browsers are not installed:

```bash
npx playwright install chromium
```

### Viewing Failed Test Details

```bash
# View HTML report with screenshots
npx playwright show-report

# View trace for a specific test
npx playwright show-trace test-results/<test-name>/trace.zip
```
