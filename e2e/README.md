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

### CI/CD Commands

These commands are designed for CI environments where the Docker image is already built or pulled:

```bash
# Start containers using pre-built image (for CI)
make e2e-ci-setup DOCKER_IMAGE=ghcr.io/owner/repo:tag

# Run E2E tests
make e2e-test

# Cleanup CI containers
make e2e-ci-cleanup
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

E2E tests run automatically in GitHub Actions on:
- Every release (when a new version is published)
- Every push to the main branch

The workflow:
1. Builds and publishes Docker image (on release) or uses existing image (on push)
2. Pulls the published image
3. Starts LocalStack with CORS configured using `make e2e-ci-setup`
4. Validates AWS service operations (S3, DynamoDB, SQS, SNS)
5. Runs Playwright E2E tests using `make e2e-test`
6. Uploads test reports as artifacts
7. Cleans up using `make e2e-ci-cleanup`

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
