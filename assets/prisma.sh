#!/usr/bin/env bash
# Prisma Database Sync Script
# - Pulls schema from database
# - Generates Prisma client
# - Creates timestamped migration

# Exit on error
set -e

# Color output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to handle errors
handle_error() {
  echo -e "${RED}ERROR: $1${NC}"
  exit 1
}

# Function for successful steps
success_step() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Generate timestamp for migration folder
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
MIGRATION_DIR="prisma/migrations/migration_${TIMESTAMP}"

# Step 1: Pull database schema
echo "Pulling database schema..."
npx prisma db pull || handle_error "Failed to pull database schema"
success_step "Database schema pulled successfully"

# Step 2: Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate || handle_error "Failed to generate Prisma client"
success_step "Prisma client generated successfully"

# Step 3: Create migration
echo "Creating migration script..."
# Create migration directory
mkdir -p "$MIGRATION_DIR" || handle_error "Failed to create migration directory"

# Generate migration SQL
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > "${MIGRATION_DIR}/migration.sql" || handle_error "Failed to generate migration SQL"

success_step "Migration created at: ${MIGRATION_DIR}/migration.sql"
echo -e "${GREEN}All steps completed successfully${NC}"