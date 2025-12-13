# Multi-stage Dockerfile for Next.js production build

# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Verify Node.js and npm versions
RUN node --version && npm --version

# Copy package files
COPY package*.json ./

# Verify package.json is valid
RUN node -e "require('./package.json')" || (echo "Invalid package.json" && exit 1)

# Install dependencies with verbose logging and better error handling
# Use npm ci for more reliable, reproducible builds (requires package-lock.json)
# Fall back to npm install if package-lock.json doesn't exist
RUN if [ -f package-lock.json ]; then \
      npm ci --verbose --loglevel=verbose || (echo "npm ci failed, trying npm install..." && npm install --verbose --loglevel=verbose); \
    else \
      echo "package-lock.json not found, using npm install..." && \
      npm install --verbose --loglevel=verbose --legacy-peer-deps; \
    fi

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Stage 2: Runner
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
# With standalone output, Next.js creates everything in .next/standalone
# The standalone directory contains server.js, package.json, and minimal node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Copy scripts and required files for running init/seed scripts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/models ./models
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/utils ./utils
# Ensure public directory exists (standalone may include it)
RUN mkdir -p public || true
# Create package.json with type: module for scripts (standalone has its own, but we need this for scripts)
RUN echo '{"type":"module"}' > package-module.json

# Install wget for healthcheck (as root before switching user)
RUN apk add --no-cache wget

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 9000

ENV PORT=9000
ENV HOSTNAME="0.0.0.0"

# With standalone output, Next.js creates server.js in the standalone directory
# The standalone output includes a minimal server.js that we can run directly
CMD ["node", "server.js"]

