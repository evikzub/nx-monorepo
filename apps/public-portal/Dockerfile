# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root level config files
COPY nx.json tsconfig.base.json package.json package-lock.json ./
COPY eslint.config.js jest.preset.js ./
COPY tailwind-workspace-preset.js ./

# Copy project configurations
COPY apps/public-portal/project.json ./apps/public-portal/
# COPY apps/public-portal/postcss.config.json ./apps/public-portal/
# COPY apps/public-portal/tailwind.config.json ./apps/public-portal/

# COPY apps/public-portal/index.d.ts ./apps/public-portal/
# COPY apps/public-portal/next-env.d.ts ./apps/public-portal/

COPY libs/shared/ui/project.json ./libs/shared/ui/
COPY libs/shared/types/project.json ./libs/shared/types/

# Copy eslint and jest configs
COPY apps/public-portal/eslint.config.js ./apps/public-portal/
COPY apps/public-portal/jest.config.ts ./apps/public-portal/
COPY libs/shared/types/eslint.config.js ./libs/shared/types/
COPY libs/shared/types/jest.config.ts ./libs/shared/types/

# COPY libs/shared/ui/postcss.config.js ./libs/shared/ui/
#COPY libs/shared/ui/tailwind.config.ts ./libs/shared/ui/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source files
COPY apps/public-portal ./apps/public-portal
COPY libs/shared/ui ./libs/shared/ui
COPY libs/shared/types ./libs/shared/types

# Install NX globally and build
# This requires for Build debugging
# RUN npm install -g nx

# RUN nx build
RUN npx nx build public-portal --verbose

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist/apps/public-portal ./
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Set environment variables
ENV NODE_ENV=production
# ENV PORT=4200

EXPOSE ${PORT}

# CMD ["npm", "start"]
# CMD ["npx", "next", "start", "-p", "${NEXT_PUBLIC_API_GATEWAY_PORT}"]
# CMD npx nx serve public-portal -p 4010 --verbose
CMD npx next start