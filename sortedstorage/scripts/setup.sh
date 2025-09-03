#!/bin/bash

# SortedStorage Setup Script
# This script sets up the development and production environments

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Check Node.js version
check_node() {
    print_status "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        echo "Please install Node.js 20 or higher"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
    
    if [ "$MAJOR_VERSION" -lt 20 ]; then
        print_error "Node.js version is too old. Required: 20+, Found: $NODE_VERSION"
        exit 1
    fi
    
    print_status "Node.js version: $NODE_VERSION ✓"
}

# Check Docker
check_docker() {
    print_status "Checking Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed (optional for local development)"
        return
    fi
    
    if ! docker ps &> /dev/null; then
        print_warning "Docker daemon is not running"
        return
    fi
    
    print_status "Docker is installed and running ✓"
}

# Install dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_status "Dependencies installed ✓"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment files..."
    
    # Development environment
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_status "Created .env file from example"
        print_warning "Please update .env with your configuration"
    else
        print_status ".env file already exists"
    fi
    
    # Production environment
    if [ ! -f ".env.production" ]; then
        cp .env.example .env.production
        print_status "Created .env.production file from example"
        print_warning "Please update .env.production for production deployment"
    fi
    
    # Staging environment
    if [ ! -f ".env.staging" ]; then
        cp .env.example .env.staging
        print_status "Created .env.staging file from example"
    fi
}

# Setup Solobase backend
setup_solobase() {
    print_header "Solobase Backend Setup"
    
    read -p "Do you want to set up Solobase backend? (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Skipping Solobase setup"
        return
    fi
    
    # Check if Solobase is available
    if [ ! -d "../go/solobase" ]; then
        print_warning "Solobase not found in expected location"
        echo "Please ensure Solobase is available at ../go/solobase"
        return
    fi
    
    print_status "Building Solobase..."
    cd ../go/solobase
    
    # Compile Solobase
    if [ -f "compile.sh" ]; then
        ./compile.sh
    else
        go build -o solobase .
    fi
    
    # Build Docker image
    docker build -t solobase:latest .
    
    cd - > /dev/null
    print_status "Solobase setup completed ✓"
}

# Generate SSL certificates for local development
setup_ssl() {
    print_header "SSL Certificate Setup (Optional)"
    
    read -p "Do you want to generate self-signed SSL certificates? (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Skipping SSL setup"
        return
    fi
    
    mkdir -p certs
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout certs/server.key \
        -out certs/server.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    
    print_status "SSL certificates generated in certs/ directory"
}

# Setup Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    # Pre-commit hook for linting
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
npm run lint:check
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix errors before committing."
    exit 1
fi
EOF
    
    chmod +x .git/hooks/pre-commit
    print_status "Git hooks installed ✓"
}

# Database setup
setup_database() {
    print_header "Database Setup"
    
    read -p "Do you want to set up a local database? (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Skipping database setup"
        return
    fi
    
    # Start PostgreSQL container
    docker run -d \
        --name sortedstorage-postgres \
        -e POSTGRES_DB=solobase \
        -e POSTGRES_USER=solobase \
        -e POSTGRES_PASSWORD=solobase-password \
        -p 5432:5432 \
        postgres:15-alpine
    
    print_status "PostgreSQL database started"
    print_status "Connection string: postgresql://solobase:solobase-password@localhost:5432/solobase"
}

# Main setup flow
main() {
    print_header "SortedStorage Setup"
    echo "This script will help you set up your development environment"
    echo
    
    # System checks
    print_header "System Requirements"
    check_node
    check_docker
    
    # Installation
    print_header "Installing Dependencies"
    install_dependencies
    
    # Environment setup
    print_header "Environment Configuration"
    setup_environment
    
    # Optional setups
    setup_solobase
    setup_ssl
    setup_database
    
    # Development tools
    print_header "Development Tools"
    setup_git_hooks
    
    # Final instructions
    print_header "Setup Complete!"
    echo "Next steps:"
    echo "1. Update your .env file with appropriate values"
    echo "2. Start development server: npm run dev"
    echo "3. Start Solobase backend: cd ../go/solobase && ./solobase"
    echo "4. Access application at: http://localhost:5173"
    echo
    echo "For production deployment, run: ./scripts/deploy.sh production deploy"
    echo
    print_status "Happy coding! 🚀"
}

# Run main function
main