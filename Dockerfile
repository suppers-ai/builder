# Dockerfile for Deno Fresh workspace apps
FROM denoland/deno:2.4.2

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Cache dependencies for the specific app we're building
ARG APP_NAME=store
RUN deno cache packages/${APP_NAME}/main.ts packages/${APP_NAME}/dev.ts

# Build the specific app
WORKDIR /app/packages/${APP_NAME}

RUN deno task build

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV DENO_DEPLOYMENT_ID=docker-build

# Run the application
CMD ["deno", "serve", "--allow-env", "--allow-net", "--allow-read", "--allow-write", "--port", "8080", "_fresh/server.js"]