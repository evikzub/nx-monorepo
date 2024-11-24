#!/bin/bash
export COMPOSE_CONVERT_WINDOWS_PATHS=1
export DOCKER_BUILDKIT=1

# Load development environment variables
set -a
source .env.development
set +a

# Start the services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build 