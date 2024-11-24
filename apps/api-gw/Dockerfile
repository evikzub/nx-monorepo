# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace configuration files
COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY workspace.json ./
COPY eslint.config.js jest.preset.js ./

# Copy all project.json files to maintain workspace structure
COPY apps/api-gw/project.json ./apps/api-gw/
COPY libs/shared/backend/project.json ./libs/shared/backend/
COPY libs/shared/types/project.json ./libs/shared/types/

# Copy eslint and jest configs
COPY apps/api-gw/eslint.config.js ./apps/api-gw/
COPY apps/api-gw/jest.config.ts ./apps/api-gw/
COPY libs/shared/backend/eslint.config.js ./libs/shared/backend/
COPY libs/shared/backend/jest.config.ts ./libs/shared/backend/
COPY libs/shared/types/eslint.config.js ./libs/shared/types/
COPY libs/shared/types/jest.config.ts ./libs/shared/types/

# Install dependencies with legacy peer deps
RUN npm ci --legacy-peer-deps

# Copy source files
COPY apps/api-gw ./apps/api-gw
COPY libs/shared/backend ./libs/shared/backend
COPY libs/shared/types ./libs/shared/types

# Clear NX cache and build
# RUN nx reset

# Install NX globally
RUN npm install -g nx
RUN nx build api-gw --verbose

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and built assets
# COPY --from=builder /app/package.json /app/package-lock.json ./
# COPY --from=builder /app/dist/apps/api-gw ./dist/apps/api-gw
# COPY --from=builder /app/dist/libs/shared/backend ./dist/libs/shared/backend
# COPY --from=builder /app/dist/libs/shared/types ./dist/libs/shared/types

# Copy only the built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps

# Set environment variables
# ENV NODE_ENV=production
ENV PORT=${API_GATEWAY_PORT}

# Expose the port
EXPOSE ${API_GATEWAY_PORT}

# Start the application
CMD ["node", "dist/apps/api-gw/main.js"]
