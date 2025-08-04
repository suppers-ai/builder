# Dockerfile for Deno Fresh workspace apps
FROM denoland/deno:2.4.2

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Cache dependencies for the specific app we're building
ARG APP_NAME=store
RUN deno task cache

# Build the specific app with timeout and debugging
WORKDIR /app/packages/${APP_NAME}

# Check if build is already complete, if not build with timeout
RUN if [ ! -f "_fresh/server.js" ]; then \
      echo "Building ${APP_NAME}..." && \
      timeout 600 deno task build || (echo "Build timed out after 10 minutes" && exit 1); \
    else \
      echo "Build already exists, skipping..."; \
    fi

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV DENO_DEPLOYMENT_ID=docker-build

# Run the application
CMD ["deno", "serve", "--allow-env", "--allow-net", "--allow-read", "--allow-write", "--port", "8080", "_fresh/server.js"]