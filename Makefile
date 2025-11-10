.PHONY: help install dev build preview lint docker-build docker-run docker-compose-up docker-compose-down docker-compose-logs clean localstack-start localstack-stop test-localstack release

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
		localstack/localstack:latest

localstack-stop: ## Stop and remove LocalStack
	docker stop localstack || true
	docker rm localstack || true

test-localstack: ## Test LocalStack connection
	@curl -s http://localhost:4566/_localstack/health | jq '.'

release: ## Create a new release (triggers Docker image build and publish)
	@./release.sh
