@echo off
set COMPOSE_CONVERT_WINDOWS_PATHS=1
set DOCKER_BUILDKIT=1

docker-compose -f docker-compose.dev.yml --env-file .env.dev up --build api-gateway