# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root level config files
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
COPY eslint.config.js jest.preset.js ./

# Copy project configurations
COPY apps/services/user-service/project.json ./apps/services/user-service/
COPY libs/shared/backend/project.json ./libs/shared/backend/
COPY libs/shared/types/project.json ./libs/shared/types/

# # Copy eslint and jest configs
# COPY apps/services/user-service/eslint.config.js ./apps/services/user-service/
# COPY apps/services/user-service/jest.config.ts ./apps/services/user-service/
# COPY libs/shared/backend/eslint.config.js ./libs/shared/backend/
# COPY libs/shared/backend/jest.config.ts ./libs/shared/backend/
# COPY libs/shared/types/eslint.config.js ./libs/shared/types/
# COPY libs/shared/types/jest.config.ts ./libs/shared/types/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source files
COPY apps/services/user-service ./apps/services/user-service
COPY libs/shared/backend ./libs/shared/backend
COPY libs/shared/types ./libs/shared/types

# Install NX globally and build
# RUN npm install -g nx
RUN npx nx build user-service --verbose

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy only the built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies
# Use --omit=dev to skip dev dependencies
# Use --frozen-lockfile instead of ci
RUN npm i --omit=dev --frozen-lockfile --legacy-peer-deps

# Set environment variables
ENV NODE_ENV=production
ENV PORT=${USER_SERVICE_PORT}

EXPOSE ${USER_SERVICE_PORT}

CMD ["node", "dist/apps/services/user-service/main.js"]
