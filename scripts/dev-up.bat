@echo off
set COMPOSE_CONVERT_WINDOWS_PATHS=1
set DOCKER_BUILDKIT=1

REM Load development environment variables
for /f "tokens=*" %%a in (.env.development) do set %%a

@REM docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

docker-compose -f docker-compose.dev.yml --env-file .env.development up --build