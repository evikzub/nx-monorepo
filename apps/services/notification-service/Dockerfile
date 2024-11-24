# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root level config files
COPY nx.json tsconfig.base.json package.json package-lock.json ./
COPY eslint.config.js jest.preset.js ./

# Copy project configurations
COPY apps/services/notification-service/project.json ./apps/services/notification-service/
COPY libs/shared/backend/project.json ./libs/shared/backend/
COPY libs/shared/types/project.json ./libs/shared/types/

# Copy eslint and jest configs
COPY apps/services/notification-service/eslint.config.js ./apps/services/notification-service/
COPY apps/services/notification-service/jest.config.ts ./apps/services/notification-service/
COPY libs/shared/backend/eslint.config.js ./libs/shared/backend/
COPY libs/shared/backend/jest.config.ts ./libs/shared/backend/
COPY libs/shared/types/eslint.config.js ./libs/shared/types/
COPY libs/shared/types/jest.config.ts ./libs/shared/types/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source files
COPY apps/services/notification-service ./apps/services/notification-service
COPY libs/shared/backend ./libs/shared/backend
COPY libs/shared/types ./libs/shared/types

# Install NX globally and build
# RUN npm install -g nx
RUN npx nx build notification-service --verbose

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy only the built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Set environment variables
ENV NODE_ENV=production
ENV PORT=${NOTIFICATION_SERVICE_PORT}

EXPOSE ${NOTIFICATION_SERVICE_PORT}

CMD ["node", "dist/apps/services/notification-service/main.js"]
# CMD ["npx", "nx", "serve", "notification-service"]
# CMD ["npx", "run", "start:notification-service"]
