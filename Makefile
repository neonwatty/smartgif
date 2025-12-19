# SmartGIF Makefile
# Standard commands for development, testing, and CI

.PHONY: help install lint test test-coverage test-e2e test-e2e-headed test-deploy build dev clean

# Default target
help:
	@echo "SmartGIF Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install        Install dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev            Start development server"
	@echo "  make build          Build for production"
	@echo ""
	@echo "Quality:"
	@echo "  make lint           Run ESLint"
	@echo "  make lint-fix       Run ESLint with auto-fix"
	@echo ""
	@echo "Testing:"
	@echo "  make test           Run unit tests"
	@echo "  make test-coverage  Run unit tests with coverage"
	@echo "  make test-e2e       Run E2E tests (requires dev server)"
	@echo "  make test-e2e-headed Run E2E tests with visible browser"
	@echo "  make test-deploy    Run E2E tests against live deployment"
	@echo "  make test-all       Run all tests (unit + E2E)"
	@echo ""
	@echo "CI:"
	@echo "  make ci             Run full CI pipeline (lint, test, build)"
	@echo "  make ci-e2e         Run E2E tests in CI mode"

# Setup
install:
	npm ci

install-e2e:
	npx playwright install --with-deps chromium

# Development
dev:
	npm run dev

build:
	npm run build

# Quality
lint:
	npm run lint

lint-fix:
	npm run lint -- --fix

# Testing
test:
	npm run test

test-coverage:
	npm run test:coverage

test-e2e:
	npm run test:e2e

test-e2e-headed:
	npm run test:e2e:headed

test-deploy:
	npm run test:deploy

test-all: test test-e2e

# CI Pipeline
ci: lint test-coverage build

ci-e2e: install-e2e test-e2e

# Cleanup
clean:
	rm -rf dist node_modules coverage playwright-report playwright-report-deploy test-results
