#!/bin/bash

#===============================================================================
# PMS (Property Management System) - Logs Viewer
# This script shows logs from various services
#===============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
CYAN='\033[0;36m'
NC='\033[0m'

show_help() {
    echo -e "${CYAN}PMS Log Viewer${NC}"
    echo ""
    echo "Usage: $0 [SERVICE] [OPTIONS]"
    echo ""
    echo "Services:"
    echo "  api            Show API logs"
    echo "  postgres       Show PostgreSQL logs"
    echo "  elasticsearch  Show Elasticsearch logs"
    echo "  logstash       Show Logstash logs"
    echo "  kibana         Show Kibana logs"
    echo "  all            Show all logs"
    echo ""
    echo "Options:"
    echo "  -f, --follow   Follow log output (like tail -f)"
    echo "  -n, --lines N  Number of lines to show (default: 100)"
    echo "  --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 api -f           # Follow API logs"
    echo "  $0 postgres -n 50   # Show last 50 PostgreSQL logs"
    echo "  $0 all -f           # Follow all logs"
}

SERVICE="${1:-api}"
shift || true

FOLLOW=""
LINES="100"

while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW="-f"
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

case $SERVICE in
    api|postgres|elasticsearch|logstash|kibana)
        docker compose logs $FOLLOW --tail="$LINES" "$SERVICE" 2>/dev/null || \
        docker-compose logs $FOLLOW --tail="$LINES" "$SERVICE"
        ;;
    all)
        docker compose logs $FOLLOW --tail="$LINES" 2>/dev/null || \
        docker-compose logs $FOLLOW --tail="$LINES"
        ;;
    --help|-h)
        show_help
        ;;
    *)
        echo "Unknown service: $SERVICE"
        show_help
        exit 1
        ;;
esac
