.PHONY: help install dev build preview lint docker-build docker-run docker-compose-up docker-compose-down docker-compose-logs clean localstack-start localstack-stop test-localstack release e2e-setup e2e-test e2e-cleanup e2e e2e-headed e2e-ci-setup e2e-ci-cleanup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

preview: ## Preview production build
	npm run preview

lint: ## Run linter
	npm run lint

docker-build: ## Build Docker image
	docker build -t localstack-crud-ui:latest .

docker-run: ## Run Docker container
	docker run -p 3000:80 --name localstack-ui localstack-crud-ui:latest

docker-compose-up: ## Start with docker-compose
	docker-compose up -d

docker-compose-down: ## Stop docker-compose services
	docker-compose down

docker-compose-logs: ## View docker-compose logs
	docker-compose logs -f

clean: ## Clean build artifacts and dependencies
	rm -rf node_modules dist

localstack-start: ## Start LocalStack with CORS for local development
	docker run -d --name localstack \
		-p 4566:4566 \
		-e SERVICES=s3,dynamodb,sqs,sns,lambda \
		-e EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000 \
		-e 'EXTRA_CORS_ALLOWED_HEADERS=*' \
		-v /var/run/docker.sock:/var/run/docker.sock \
		localstack/localstack:latest

localstack-stop: ## Stop and remove LocalStack
	docker stop localstack || true
	docker rm localstack || true

test-localstack: ## Test LocalStack connection
	@curl -s http://localhost:4566/_localstack/health | jq '.'

release: ## Create a new release (triggers Docker image build and publish)
	@./release.sh

e2e-setup: ## Build Docker image and start containers for E2E testing
	@echo "Building Docker image..."
	docker build -t localstack-crud-ui:e2e .
	@echo "Starting LocalStack..."
	docker run -d --name localstack-e2e \
		-p 4566:4566 \
		-e SERVICES=s3,dynamodb,sqs,sns,lambda \
		-e EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000 \
		-e 'EXTRA_CORS_ALLOWED_HEADERS=*' \
		-v /var/run/docker.sock:/var/run/docker.sock \
		localstack/localstack:latest
	@echo "Waiting for LocalStack to be ready..."
	@timeout 60 bash -c 'until curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; do sleep 2; done' || (echo "LocalStack failed to start" && exit 1)
	@echo "LocalStack is ready!"
	@echo "Starting UI container..."
	docker run -d --name localstack-ui-e2e \
		-p 3000:80 \
		localstack-crud-ui:e2e
	@echo "Waiting for UI to be ready..."
	@timeout 30 bash -c 'until curl -s http://localhost:3000/health > /dev/null 2>&1; do sleep 2; done' || (echo "UI failed to start" && exit 1)
	@echo "UI is ready!"
	@echo "✓ E2E environment is ready for testing"

e2e-test: ## Run Playwright E2E tests with screenshots
	@echo "Running E2E tests..."
	npm run test:e2e
	@echo "✓ E2E tests completed"

e2e-cleanup: ## Stop and remove E2E test containers
	@echo "Cleaning up E2E containers..."
	@docker stop localstack-ui-e2e localstack-e2e 2>/dev/null || true
	@docker rm localstack-ui-e2e localstack-e2e 2>/dev/null || true
	@docker rmi localstack-crud-ui:e2e 2>/dev/null || true
	@echo "✓ Cleanup complete"

e2e: ## Run full E2E test suite (build, start containers, test, cleanup)
	@echo "========================================"
	@echo "  Starting Full E2E Test Suite"
	@echo "========================================"
	@$(MAKE) e2e-cleanup 2>/dev/null || true
	@$(MAKE) e2e-setup
	@$(MAKE) e2e-test || (echo "Tests failed!" && $(MAKE) e2e-cleanup && exit 1)
	@$(MAKE) e2e-cleanup
	@echo "========================================"
	@echo "  E2E Test Suite Completed Successfully"
	@echo "========================================"
	@echo ""
	@echo "Test reports available at:"
	@echo "  - playwright-report/ (HTML report)"
	@echo "  - test-results/ (screenshots and traces)"
	@echo ""
	@echo "To view the report, run: npx playwright show-report"

e2e-headed: ## Run E2E tests in headed mode (visible browser)
	@echo "Running E2E tests in headed mode..."
	@$(MAKE) e2e-cleanup 2>/dev/null || true
	@$(MAKE) e2e-setup
	npm run test:e2e:headed || ($(MAKE) e2e-cleanup && exit 1)
	@$(MAKE) e2e-cleanup

e2e-ci-setup: ## Start containers for CI E2E testing (assumes image already available)
	@echo "Starting LocalStack for CI..."
	docker run -d --name localstack \
		-p 4566:4566 \
		-e SERVICES=s3,dynamodb,sqs,sns,lambda \
		-e EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000 \
		-e 'EXTRA_CORS_ALLOWED_HEADERS=*' \
		localstack/localstack:latest
	@echo "Waiting for LocalStack to be ready..."
	@timeout 60 bash -c 'until curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; do sleep 2; done' || (echo "LocalStack failed to start" && exit 1)
	@echo "LocalStack is ready!"
	@echo "Starting UI container from published image..."
	docker run -d --name localstack-ui \
		-p 3000:80 \
		$(DOCKER_IMAGE)
	@echo "Waiting for UI to be ready..."
	@timeout 30 bash -c 'until curl -s http://localhost:3000/health > /dev/null 2>&1; do sleep 2; done' || (echo "UI failed to start" && exit 1)
	@echo "UI is ready!"
	@echo "✓ CI E2E environment is ready for testing"

e2e-ci-cleanup: ## Stop and remove CI E2E test containers
	@echo "Cleaning up CI E2E containers..."
	@docker stop localstack-ui localstack 2>/dev/null || true
	@docker rm localstack-ui localstack 2>/dev/null || true
	@echo "✓ CI cleanup complete"
