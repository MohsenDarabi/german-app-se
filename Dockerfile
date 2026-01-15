# ============================================
# Stage 1: Base with pnpm
# ============================================
FROM node:20-alpine AS base

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

# Set working directory
WORKDIR /app

# ============================================
# Stage 2: Dependencies
# ============================================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/ui/package.json ./packages/ui/
COPY packages/content-model/package.json ./packages/content-model/
COPY packages/srs-engine/package.json ./packages/srs-engine/
COPY packages/utils/package.json ./packages/utils/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 3: Development
# ============================================
FROM base AS dev

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/content-model/node_modules ./packages/content-model/node_modules
COPY --from=deps /app/packages/srs-engine/node_modules ./packages/srs-engine/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules

# Copy all source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start dev server with host binding for Docker
CMD ["sh", "-c", "cd apps/web && pnpm exec vite --host 0.0.0.0"]

# ============================================
# Stage 4: Build for Production
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/content-model/node_modules ./packages/content-model/node_modules
COPY --from=deps /app/packages/srs-engine/node_modules ./packages/srs-engine/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules

# Copy source
COPY . .

# Build all packages
RUN pnpm run build

# ============================================
# Stage 5: Production (nginx)
# ============================================
FROM nginx:alpine AS production

# Copy built static files
COPY --from=builder /app/apps/web/build /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
