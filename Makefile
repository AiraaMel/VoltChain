# ENX Energy Platform Makefile

.PHONY: help build test deploy clean install simulate listener settlement

help: ## Show this help message
	@echo "ENX Energy Platform - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	yarn install

build: ## Build the Anchor program
	anchor build

test: ## Run tests
	anchor test

deploy: ## Deploy to devnet
	anchor deploy

clean: ## Clean build artifacts
	anchor clean
	rm -rf target/
	rm -rf dist/
	rm -rf node_modules/

simulate: ## Run IoT simulation
	yarn run:simulate

listener: ## Start event listener
	yarn run:listener

settlement: ## Run settlement process
	yarn run:settlement

dev: ## Start development environment
	@echo "Starting development environment..."
	@echo "1. Building program..."
	@make build
	@echo "2. Deploying to devnet..."
	@make deploy
	@echo "3. Running tests..."
	@make test
	@echo "Development environment ready!"

setup: ## Initial setup
	@echo "Setting up ENX Energy Platform..."
	@make install
	@make build
	@echo "Setup complete! Run 'make dev' to start development."

lint: ## Run linter
	yarn lint

lint:fix: ## Fix linting issues
	yarn lint:fix
