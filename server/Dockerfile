# Stage 1: Dependencies
FROM node:20-alpine AS dependencies

# Set working directory
WORKDIR /app/server

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including devDependencies for build tools)
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app/server

# Copy package files
COPY package*.json ./

# Copy dependencies from previous stage
COPY --from=dependencies /app/server/node_modules ./node_modules

# Copy application source code
COPY . .

# Run postinstall script to seed initial data
RUN npm run postinstall

# Stage 3: Production
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user with uid 1000
RUN addgroup -g 1000 -S node && \
    adduser -S -u 1000 -G node node

# Set working directory
WORKDIR /app/server

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=node:node /app/server ./

# Create necessary directories with proper permissions
RUN mkdir -p logs tmp src/public && \
    chown -R node:node logs tmp src/public

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080

# Expose application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Switch to non-root user
USER node

# Set entrypoint to startup script
ENTRYPOINT ["dumb-init", "--", "./docker-entrypoint.sh"]

# Start application with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--no-daemon"]
