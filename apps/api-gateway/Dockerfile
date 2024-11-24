# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# # Copy workspace configuration files
# COPY package.json package-lock.json nx.json tsconfig.base.json ./
# COPY workspace.json ./

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY nx.json tsconfig.base.json ./
COPY eslint.config.js jest.preset.js ./

# Copy project configurations
COPY apps/api-gateway/project.json ./apps/api-gateway/
COPY libs/shared/backend/project.json ./libs/shared/backend/
COPY libs/shared/types/project.json ./libs/shared/types/

# # Copy eslint and jest configs
# COPY apps/api-gateway/eslint.config.js ./apps/api-gateway/
# COPY apps/api-gateway/jest.config.ts ./apps/api-gateway/
# COPY libs/shared/backend/eslint.config.js ./libs/shared/backend/
# COPY libs/shared/backend/jest.config.ts ./libs/shared/backend/
# COPY libs/shared/types/eslint.config.js ./libs/shared/types/
# COPY libs/shared/types/jest.config.ts ./libs/shared/types/

# Install dependencies with legacy peer deps
# Use --frozen-lockfile instead of ci for better error messages
RUN npm ci --legacy-peer-deps

# Copy source files
COPY apps/api-gateway ./apps/api-gateway
COPY libs/shared/backend ./libs/shared/backend
COPY libs/shared/types ./libs/shared/types

# # Install NX globally
# RUN npm install -g nx

# Build the application
RUN npx nx build api-gateway --verbose

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
# Use --omit=dev to skip dev dependencies
# Use --frozen-lockfile instead of ci
RUN npm install --omit=dev --frozen-lockfile --legacy-peer-deps

# Set environment variables
# ENV NODE_ENV=production
ENV PORT=${API_GATEWAY_PORT}

# Expose the port
EXPOSE ${API_GATEWAY_PORT}

# Start the application
CMD ["node", "dist/apps/api-gateway/main.js"]
