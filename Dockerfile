# ===================================
# AutoBooks-UI Dockerfile (Next.js)
# Multi-stage build for optimized production image
# ===================================

# ===================================
# Dependencies Stage
# ===================================
FROM node:22-alpine AS deps

# Install libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ===================================
# Development Stage
# ===================================
FROM node:22-alpine AS development

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Enable pnpm
RUN corepack enable pnpm

# Expose development port
EXPOSE 3000

# Start development server with hot-reload
CMD ["pnpm", "dev"]

# ===================================
# Builder Stage
# ===================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_ORG
ARG NEXT_PUBLIC_SENTRY_PROJECT

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
ENV NEXT_PUBLIC_SENTRY_ORG=${NEXT_PUBLIC_SENTRY_ORG}
ENV NEXT_PUBLIC_SENTRY_PROJECT=${NEXT_PUBLIC_SENTRY_PROJECT}

# Build the application
RUN corepack enable pnpm && pnpm build

# ===================================
# Production Stage
# ===================================
FROM node:22-alpine AS production

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]
