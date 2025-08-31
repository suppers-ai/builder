.PHONY: build build-admin build-go run dev clean

# Build everything
build: build-admin build-go

# Build the Svelte admin UI
build-admin:
	cd admin && npm install && npm run build

# Build the Go binary with embedded admin
build-go:
	go build -o solobase .

# Run development servers
dev:
	# Start Go API server in background
	go run . &
	# Start Svelte dev server
	cd admin && npm run dev

# Run production build
run: build
	./solobase

# Clean build artifacts
clean:
	rm -f solobase
	rm -rf admin/build
	rm -rf admin/node_modules