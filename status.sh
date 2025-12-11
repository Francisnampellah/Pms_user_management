#!/bin/bash

#===============================================================================
# PMS (Property Management System) - Status Checker
# This script shows the status of all services
#===============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Load environment
if [ -f .env ]; then
    source .env
fi
ELASTIC_PWD="${ELASTIC_PASSWORD:-changeme}"

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║             PMS - Service Status                                  ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
echo -e "${CYAN}Docker Containers:${NC}"
echo "─────────────────────────────────────────────────────────────────────"
docker compose ps 2>/dev/null || docker-compose ps
echo ""

echo -e "${CYAN}Service Health Checks:${NC}"
echo "─────────────────────────────────────────────────────────────────────"

# API Health
printf "  API (http://localhost:3000): "
if curl -s http://localhost:3000/health 2>/dev/null | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
fi

# PostgreSQL Health
printf "  PostgreSQL (localhost:5432): "
if docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-pms_user}" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
fi

# Elasticsearch Health
printf "  Elasticsearch (http://localhost:9200): "
ES_STATUS=$(curl -s -u "elastic:${ELASTIC_PWD}" http://localhost:9200/_cluster/health 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
if [ "$ES_STATUS" = "green" ]; then
    echo -e "${GREEN}✓ Healthy (green)${NC}"
elif [ "$ES_STATUS" = "yellow" ]; then
    echo -e "${YELLOW}⚠ Warning (yellow)${NC}"
elif [ "$ES_STATUS" = "red" ]; then
    echo -e "${RED}✗ Unhealthy (red)${NC}"
else
    echo -e "${RED}✗ Not responding${NC}"
fi

# Logstash Health
printf "  Logstash (http://localhost:9600): "
if curl -s http://localhost:9600/_node/stats 2>/dev/null | grep -q '"status"'; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
fi

# Kibana Health
printf "  Kibana (http://localhost:5601): "
KIBANA_STATUS=$(curl -s http://localhost:5601/api/status 2>/dev/null | grep -o '"level":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ "$KIBANA_STATUS" = "available" ]; then
    echo -e "${GREEN}✓ Healthy${NC}"
elif [ "$KIBANA_STATUS" = "degraded" ]; then
    echo -e "${YELLOW}⚠ Degraded${NC}"
else
    echo -e "${RED}✗ Not ready${NC}"
fi

echo ""
echo -e "${CYAN}Resource Usage:${NC}"
echo "─────────────────────────────────────────────────────────────────────"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null | grep pms || true

echo ""
echo -e "${CYAN}Elasticsearch Indices:${NC}"
echo "─────────────────────────────────────────────────────────────────────"
curl -s -u "elastic:${ELASTIC_PWD}" "http://localhost:9200/_cat/indices?v&h=index,docs.count,store.size" 2>/dev/null | grep pms || echo "  No indices found"

echo ""
echo -e "${CYAN}Quick Links:${NC}"
echo "─────────────────────────────────────────────────────────────────────"
echo "  • API Docs:    http://localhost:3000/api"
echo "  • Kibana:      http://localhost:5601"
echo "  • ES Health:   http://localhost:9200/_cluster/health?pretty"
echo ""
