#!/bin/bash
cd /home/joris/Projects/suppers-ai/builder/sortedstorage
rm -f ./.data/test-clean.db
export DATABASE_TYPE=sqlite
export DATABASE_URL="file:./.data/test-clean.db"
export DEFAULT_ADMIN_EMAIL="admin@example.com"
export DEFAULT_ADMIN_PASSWORD="Test123456789!"
export PORT=8096
./sortedstorage-backend 2>&1 | head -15
