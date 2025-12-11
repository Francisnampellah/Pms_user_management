#!/bin/bash

#===============================================================================
# PMS (Property Management System) - Stop Script
# This script stops all running services
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
echo "║             PMS - Stopping Services                               ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

cd "$SCRIPT_DIR"

# Parse arguments
REMOVE_VOLUMES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --remove-data|-v)
            REMOVE_VOLUMES=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --remove-data, -v  Remove all data volumes (WARNING: Deletes all data!)"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

if [ "$REMOVE_VOLUMES" = true ]; then
    echo -e "${YELLOW}WARNING: This will delete all data including the database!${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Stopping services and removing all data...${NC}"
        docker compose down -v 2>/dev/null || docker-compose down -v
        echo -e "${GREEN}All services stopped and data removed.${NC}"
    else
        echo "Cancelled."
        exit 0
    fi
else
    echo "Stopping all services..."
    docker compose down 2>/dev/null || docker-compose down
    echo -e "${GREEN}All services stopped. Data is preserved.${NC}"
fi

echo ""
echo "To start again, run: ./start.sh"
echo ""
