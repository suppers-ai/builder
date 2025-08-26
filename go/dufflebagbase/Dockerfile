# Build stage
FROM golang:1.23-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make gcc musl-dev

WORKDIR /build

# Copy go mod files and vendor directory if it exists
COPY go.mod go.sum ./
COPY vendor* ./vendor/

# Download dependencies only if vendor doesn't exist
RUN if [ ! -d "vendor" ]; then go mod download; fi

# Copy source code
COPY . .

# Install templ
RUN go install github.com/a-h/templ/cmd/templ@latest

# Generate templ files
RUN templ generate

# Build the binary
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o dufflebagbase .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates postgresql-client

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /build/dufflebagbase .

# Copy static files and views (templ generated files)
COPY --from=builder /build/static ./static
COPY --from=builder /build/views ./views

EXPOSE 8080

CMD ["./dufflebagbase"]