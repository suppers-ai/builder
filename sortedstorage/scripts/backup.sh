#!/bin/bash

# SortedStorage Backup Script
# This script handles backing up data and configurations

set -e

# Configuration
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="sortedstorage_backup_${TIMESTAMP}"
RETENTION_DAYS=${RETENTION_DAYS:-30}

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Create backup directory
create_backup_dir() {
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"
    print_status "Created backup directory: ${BACKUP_DIR}/${BACKUP_NAME}"
}

# Backup database
backup_database() {
    print_status "Backing up database..."
    
    # Check if PostgreSQL container is running
    if docker ps | grep -q "postgres"; then
        # Backup PostgreSQL
        docker exec postgres pg_dump -U solobase solobase > \
            "${BACKUP_DIR}/${BACKUP_NAME}/database.sql"
        
        # Compress database dump
        gzip "${BACKUP_DIR}/${BACKUP_NAME}/database.sql"
        
        print_status "Database backed up successfully"
    else
        print_warning "Database container not running, skipping database backup"
    fi
}

# Backup uploaded files
backup_files() {
    print_status "Backing up uploaded files..."
    
    # Check if storage volume exists
    if docker volume ls | grep -q "solobase-storage"; then
        # Create temporary container to access volume
        docker run --rm \
            -v solobase-storage:/storage \
            -v "${PWD}/${BACKUP_DIR}/${BACKUP_NAME}":/backup \
            alpine tar czf /backup/storage.tar.gz -C /storage .
        
        print_status "Files backed up successfully"
    else
        print_warning "Storage volume not found, skipping file backup"
    fi
}

# Backup configuration
backup_config() {
    print_status "Backing up configuration..."
    
    # Copy environment files
    if [ -f ".env" ]; then
        cp .env "${BACKUP_DIR}/${BACKUP_NAME}/.env"
    fi
    
    if [ -f ".env.production" ]; then
        cp .env.production "${BACKUP_DIR}/${BACKUP_NAME}/.env.production"
    fi
    
    # Copy Docker configuration
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "${BACKUP_DIR}/${BACKUP_NAME}/docker-compose.yml"
    fi
    
    print_status "Configuration backed up successfully"
}

# Create backup manifest
create_manifest() {
    cat > "${BACKUP_DIR}/${BACKUP_NAME}/manifest.json" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "date": "$(date)",
    "version": "$(git describe --tags --always 2>/dev/null || echo 'unknown')",
    "components": {
        "database": $([ -f "${BACKUP_DIR}/${BACKUP_NAME}/database.sql.gz" ] && echo "true" || echo "false"),
        "storage": $([ -f "${BACKUP_DIR}/${BACKUP_NAME}/storage.tar.gz" ] && echo "true" || echo "false"),
        "config": $([ -f "${BACKUP_DIR}/${BACKUP_NAME}/.env" ] && echo "true" || echo "false")
    },
    "size": "$(du -sh "${BACKUP_DIR}/${BACKUP_NAME}" | cut -f1)"
}
EOF
    
    print_status "Manifest created"
}

# Compress backup
compress_backup() {
    print_status "Compressing backup..."
    
    cd "${BACKUP_DIR}"
    tar czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
    rm -rf "${BACKUP_NAME}"
    cd - > /dev/null
    
    print_status "Backup compressed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
}

# Upload to cloud storage (optional)
upload_backup() {
    if [ -z "$BACKUP_UPLOAD_URL" ]; then
        print_status "No upload URL configured, keeping backup locally"
        return
    fi
    
    print_status "Uploading backup to cloud storage..."
    
    # Example: Upload to S3
    if command -v aws &> /dev/null; then
        aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
            "${BACKUP_UPLOAD_URL}/${BACKUP_NAME}.tar.gz"
        print_status "Backup uploaded successfully"
    else
        print_warning "AWS CLI not installed, skipping cloud upload"
    fi
}

# Clean old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups..."
    
    # Find and delete backups older than retention period
    find "${BACKUP_DIR}" -name "sortedstorage_backup_*.tar.gz" \
        -type f -mtime +${RETENTION_DAYS} -delete
    
    print_status "Old backups cleaned up"
}

# Restore from backup
restore_backup() {
    BACKUP_FILE=$1
    
    if [ -z "$BACKUP_FILE" ]; then
        print_error "No backup file specified"
        echo "Usage: $0 restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
    
    print_warning "This will restore from backup and overwrite current data!"
    read -p "Are you sure? (yes/no): " -r
    
    if [ "$REPLY" != "yes" ]; then
        print_status "Restore cancelled"
        exit 0
    fi
    
    print_status "Extracting backup..."
    RESTORE_DIR="/tmp/restore_$$"
    mkdir -p "$RESTORE_DIR"
    tar xzf "$BACKUP_FILE" -C "$RESTORE_DIR"
    
    # Find the backup directory
    BACKUP_CONTENT=$(ls "$RESTORE_DIR")
    
    # Restore database
    if [ -f "$RESTORE_DIR/$BACKUP_CONTENT/database.sql.gz" ]; then
        print_status "Restoring database..."
        gunzip -c "$RESTORE_DIR/$BACKUP_CONTENT/database.sql.gz" | \
            docker exec -i postgres psql -U solobase solobase
    fi
    
    # Restore files
    if [ -f "$RESTORE_DIR/$BACKUP_CONTENT/storage.tar.gz" ]; then
        print_status "Restoring files..."
        docker run --rm \
            -v solobase-storage:/storage \
            -v "$RESTORE_DIR/$BACKUP_CONTENT":/backup \
            alpine sh -c "rm -rf /storage/* && tar xzf /backup/storage.tar.gz -C /storage"
    fi
    
    # Restore configuration
    if [ -f "$RESTORE_DIR/$BACKUP_CONTENT/.env" ]; then
        print_status "Restoring configuration..."
        cp "$RESTORE_DIR/$BACKUP_CONTENT/.env" .env.restored
        print_warning "Configuration restored to .env.restored - please review and rename"
    fi
    
    # Cleanup
    rm -rf "$RESTORE_DIR"
    
    print_status "Restore completed successfully"
}

# Main execution
case ${1:-backup} in
    backup)
        print_status "Starting backup process..."
        create_backup_dir
        backup_database
        backup_files
        backup_config
        create_manifest
        compress_backup
        upload_backup
        cleanup_old_backups
        print_status "Backup completed successfully"
        ;;
    
    restore)
        restore_backup "$2"
        ;;
    
    list)
        print_status "Available backups:"
        ls -lh "${BACKUP_DIR}"/sortedstorage_backup_*.tar.gz 2>/dev/null || \
            print_warning "No backups found"
        ;;
    
    cleanup)
        cleanup_old_backups
        ;;
    
    *)
        print_error "Unknown command: $1"
        echo "Usage: $0 [backup|restore|list|cleanup]"
        exit 1
        ;;
esac