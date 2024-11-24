# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root level config files
COPY nx.json tsconfig.base.json package.json package-lock.json ./
COPY eslint.config.js jest.preset.js ./

# Copy project configurations
COPY apps/services/assessment-service/project.json ./apps/services/assessment-service/
COPY libs/shared/backend/project.json ./libs/shared/backend/
COPY libs/shared/types/project.json ./libs/shared/types/

# Copy eslint and jest configs
COPY apps/services/assessment-service/eslint.config.js ./apps/services/assessment-service/
COPY apps/services/assessment-service/jest.config.ts ./apps/services/assessment-service/
COPY libs/shared/backend/eslint.config.js ./libs/shared/backend/
COPY libs/shared/backend/jest.config.ts ./libs/shared/backend/
COPY libs/shared/types/eslint.config.js ./libs/shared/types/
COPY libs/shared/types/jest.config.ts ./libs/shared/types/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source files
COPY apps/services/assessment-service ./apps/services/assessment-service
COPY libs/shared/backend ./libs/shared/backend
COPY libs/shared/types ./libs/shared/types

# Install NX globally and build
# RUN npm install -g nx
RUN npx nx build assessment-service --verbose

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
ENV PORT=${ASSESSMENT_SERVICE_PORT}

EXPOSE ${ASSESSMENT_SERVICE_PORT}

CMD ["node", "dist/apps/services/assessment-service/main.js"]
# CMD ["npx", "nx", "serve", "assessment-service"]
# CMD ["npx", "run", "start:assessment-service"]
