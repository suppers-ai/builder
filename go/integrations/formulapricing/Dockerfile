FROM golang:1.23-alpine AS builder

WORKDIR /build

RUN apk add --no-cache git

# Copy the entire go directory structure
COPY . /go/src/builder

# Set working directory to formulapricing
WORKDIR /go/src/builder/integrations/formulapricing

# Build with local module replacements
RUN go build -o formulapricing main.go

# Build migration CLI tool (if it exists)
RUN if [ -f cmd/migrate/main.go ]; then go build -o migrate cmd/migrate/main.go || echo "Migrate build failed, continuing..."; fi

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copy binaries
COPY --from=builder /go/src/builder/integrations/formulapricing/formulapricing .
COPY --from=builder /go/src/builder/integrations/formulapricing/migrate* .

# Copy migration files (embedded in binary but also available as files)
COPY --from=builder /go/src/builder/integrations/formulapricing/database/migrations ./database/migrations

# Set environment variable to auto-run migrations
ENV AUTO_MIGRATE=true

EXPOSE 8080

CMD ["./formulapricing"]