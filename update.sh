#!/bin/bash

#===============================================================================
# PMS (Property Management System) - Update Script
# This script updates and restarts the application
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║             PMS - Update & Restart                                ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

cd "$SCRIPT_DIR"

# Parse arguments
RUN_MIGRATIONS=false
PULL_IMAGES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --migrate)
            RUN_MIGRATIONS=true
            shift
            ;;
        --pull)
            PULL_IMAGES=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --migrate  Run database migrations after update"
            echo "  --pull     Pull latest Docker images before rebuild"
            echo "  --help     Show this help message"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

echo "Stopping API service..."
docker compose stop api 2>/dev/null || docker-compose stop api

if [ "$PULL_IMAGES" = true ]; then
    echo "Pulling latest images..."
    docker compose pull 2>/dev/null || docker-compose pull
fi

echo "Rebuilding API image..."
docker compose build api 2>/dev/null || docker-compose build api

if [ "$RUN_MIGRATIONS" = true ]; then
    echo "Running migrations..."
    docker compose run --rm migrate 2>/dev/null || docker-compose run --rm migrate
fi

echo "Starting API service..."
docker compose up -d api 2>/dev/null || docker-compose up -d api

echo ""
echo -e "${GREEN}Update complete!${NC}"
echo ""

# Show status
docker compose ps 2>/dev/null || docker-compose ps
