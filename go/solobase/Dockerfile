# Build stage
FROM golang:1.23-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make gcc musl-dev

WORKDIR /build

# Copy go mod files first for better caching
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Install templ
RUN go install github.com/a-h/templ/cmd/templ@latest

# Generate templ files
RUN templ generate

# Build the binary
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o solobase .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates postgresql-client

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /build/solobase .

# Copy static files and views (templ generated files)
COPY --from=builder /build/static ./static
COPY --from=builder /build/views ./views

# Demo configuration with in-memory database
ENV PORT=8080
ENV DATABASE_TYPE=sqlite
ENV DATABASE_URL=:memory:
ENV DEFAULT_ADMIN_EMAIL=demo@solobase.dev
ENV DEFAULT_ADMIN_PASSWORD=Demo123!

EXPOSE 8080

CMD ["./solobase"]