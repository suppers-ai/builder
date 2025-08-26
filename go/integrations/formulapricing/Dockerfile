FROM golang:1.21-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build main application
RUN go build -o formulapricing main.go

# Build migration CLI tool
RUN go build -o migrate cmd/migrate/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copy binaries
COPY --from=builder /app/formulapricing .
COPY --from=builder /app/migrate .

# Copy migration files (embedded in binary but also available as files)
COPY --from=builder /app/database/migrations ./database/migrations

# Set environment variable to auto-run migrations
ENV AUTO_MIGRATE=true

EXPOSE 8080

CMD ["./formulapricing"]