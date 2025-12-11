#!/bin/bash

#===============================================================================
# PMS (Property Management System) - Complete Setup Script
# This script installs all dependencies and starts the application
# Supports: Ubuntu/Debian, CentOS/RHEL/Fedora, and macOS
#===============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Property Management System"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/setup.log"

#===============================================================================
# Helper Functions
#===============================================================================

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                   ║"
    echo "║       Property Management System (PMS) - Setup Script            ║"
    echo "║                                                                   ║"
    echo "║   This script will:                                               ║"
    echo "║   • Install Docker & Docker Compose (if needed)                   ║"
    echo "║   • Configure environment variables                               ║"
    echo "║   • Build and start all services                                  ║"
    echo "║   • Run database migrations and seeding                           ║"
    echo "║   • Set up ELK stack for logging                                  ║"
    echo "║                                                                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$ID
            OS_VERSION=$VERSION_ID
        elif [ -f /etc/redhat-release ]; then
            OS="centos"
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        OS="unknown"
    fi
    echo "$OS"
}

check_root() {
    if [[ "$OS" != "macos" ]] && [[ $EUID -ne 0 ]]; then
        log_warn "This script should be run with sudo for installing system packages."
        log_info "Attempting to continue... Some operations may require sudo password."
    fi
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

#===============================================================================
# Docker Installation Functions
#===============================================================================

install_docker_ubuntu_debian() {
    log "Installing Docker on Ubuntu/Debian..."
    
    # Update package index
    sudo apt-get update -y
    
    # Install prerequisites
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        software-properties-common

    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Set up repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker

    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    log "Docker installed successfully!"
}

install_docker_centos_rhel() {
    log "Installing Docker on CentOS/RHEL/Fedora..."
    
    # Remove old versions
    sudo yum remove -y docker docker-client docker-client-latest docker-common \
        docker-latest docker-latest-logrotate docker-logrotate docker-engine 2>/dev/null || true

    # Install prerequisites
    sudo yum install -y yum-utils

    # Add Docker repository
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

    # Install Docker
    sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker

    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    log "Docker installed successfully!"
}

install_docker_macos() {
    log "Installing Docker on macOS..."
    
    if command_exists brew; then
        brew install --cask docker
        log "Docker Desktop installed. Please open Docker Desktop to complete setup."
        log_warn "After opening Docker Desktop, run this script again."
        exit 0
    else
        log_error "Homebrew is required to install Docker on macOS."
        log_info "Install Homebrew first: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
}

install_docker() {
    if command_exists docker; then
        log "Docker is already installed: $(docker --version)"
        return 0
    fi

    log "Docker not found. Installing Docker..."

    case $OS in
        ubuntu|debian|pop|linuxmint)
            install_docker_ubuntu_debian
            ;;
        centos|rhel|fedora|rocky|almalinux)
            install_docker_centos_rhel
            ;;
        macos)
            install_docker_macos
            ;;
        *)
            log_error "Unsupported OS: $OS"
            log_info "Please install Docker manually: https://docs.docker.com/get-docker/"
            exit 1
            ;;
    esac
}

install_docker_compose() {
    # Check if docker compose (v2) is available
    if docker compose version >/dev/null 2>&1; then
        log "Docker Compose is already installed: $(docker compose version)"
        return 0
    fi
    
    # Check for standalone docker-compose
    if command_exists docker-compose; then
        log "Docker Compose (standalone) is already installed: $(docker-compose --version)"
        return 0
    fi

    log "Installing Docker Compose..."
    
    # Install Docker Compose plugin
    if [[ "$OS" == "macos" ]]; then
        log_info "Docker Compose should be included with Docker Desktop on macOS."
    else
        sudo apt-get update -y 2>/dev/null || sudo yum update -y 2>/dev/null || true
        sudo apt-get install -y docker-compose-plugin 2>/dev/null || \
        sudo yum install -y docker-compose-plugin 2>/dev/null || true
    fi
    
    # Verify installation
    if docker compose version >/dev/null 2>&1; then
        log "Docker Compose installed successfully!"
    else
        log_warn "Docker Compose plugin not available. Installing standalone version..."
        COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
        sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        log "Docker Compose standalone installed: $(docker-compose --version)"
    fi
}

check_docker_running() {
    log "Checking if Docker daemon is running..."
    
    if ! docker info >/dev/null 2>&1; then
        log_warn "Docker daemon is not running. Attempting to start..."
        
        if [[ "$OS" == "macos" ]]; then
            open -a Docker
            log_info "Opening Docker Desktop. Please wait for it to start..."
            
            # Wait for Docker to start (max 60 seconds)
            for i in {1..60}; do
                if docker info >/dev/null 2>&1; then
                    log "Docker is now running!"
                    return 0
                fi
                sleep 1
            done
            
            log_error "Docker failed to start. Please open Docker Desktop manually and run this script again."
            exit 1
        else
            sudo systemctl start docker
            sleep 3
            
            if docker info >/dev/null 2>&1; then
                log "Docker started successfully!"
            else
                log_error "Failed to start Docker daemon."
                exit 1
            fi
        fi
    else
        log "Docker daemon is running."
    fi
}

#===============================================================================
# Environment Setup Functions
#===============================================================================

setup_environment() {
    log "Setting up environment variables..."
    
    ENV_FILE="${SCRIPT_DIR}/.env"
    ENV_EXAMPLE="${SCRIPT_DIR}/.env.example"
    ENV_DOCKER="${SCRIPT_DIR}/.env.docker"

    # Check if .env already exists
    if [ -f "$ENV_FILE" ]; then
        log_info ".env file already exists. Keeping existing configuration."
        return 0
    fi

    # Copy from .env.docker or .env.example
    if [ -f "$ENV_DOCKER" ]; then
        cp "$ENV_DOCKER" "$ENV_FILE"
        log "Created .env from .env.docker"
    elif [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        log "Created .env from .env.example"
    else
        log "Creating default .env file..."
        cat > "$ENV_FILE" << 'EOF'
# Application
NODE_ENV=production
API_PORT=3000

# Database
POSTGRES_USER=pms_user
POSTGRES_PASSWORD=pms_secure_password_change_me
POSTGRES_DB=pms_db

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-also-minimum-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# Password Hashing
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# CORS
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info

# ELK Stack Configuration
ENABLE_ELK_LOGGING=true
LOGSTASH_HOST=logstash
LOGSTASH_PORT=5000
ELASTIC_PASSWORD=changeme
EOF
    fi

    # Generate secure passwords if not in development
    if [ "$GENERATE_SECRETS" = "true" ]; then
        log "Generating secure secrets..."
        
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        JWT_REFRESH_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        POSTGRES_PASSWORD=$(openssl rand -base64 24 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 24 | head -n 1)
        ELASTIC_PASSWORD=$(openssl rand -base64 16 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
        
        # Update .env file with generated secrets
        sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" "$ENV_FILE"
        sed -i.bak "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}|g" "$ENV_FILE"
        sed -i.bak "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|g" "$ENV_FILE"
        sed -i.bak "s|ELASTIC_PASSWORD=.*|ELASTIC_PASSWORD=${ELASTIC_PASSWORD}|g" "$ENV_FILE"
        rm -f "${ENV_FILE}.bak"
        
        log "Secure secrets generated and saved to .env"
    fi

    log "Environment setup complete!"
}

#===============================================================================
# System Requirements Check
#===============================================================================

check_system_requirements() {
    log "Checking system requirements..."
    
    # Check available memory
    if [[ "$OS" == "macos" ]]; then
        TOTAL_MEM=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024/1024)}')
    else
        TOTAL_MEM=$(free -g | awk '/^Mem:/{print $2}')
    fi
    
    if [ "$TOTAL_MEM" -lt 4 ]; then
        log_warn "System has less than 4GB RAM. ELK stack may not perform well."
        log_info "Consider disabling ELK: ENABLE_ELK_LOGGING=false"
    else
        log "Memory: ${TOTAL_MEM}GB available ✓"
    fi

    # Check available disk space
    DISK_AVAIL=$(df -BG "${SCRIPT_DIR}" | awk 'NR==2 {print $4}' | tr -d 'G')
    if [ "$DISK_AVAIL" -lt 10 ]; then
        log_warn "Less than 10GB disk space available. Consider freeing up space."
    else
        log "Disk space: ${DISK_AVAIL}GB available ✓"
    fi

    # Check ports availability
    check_port 3000 "API"
    check_port 5432 "PostgreSQL"
    check_port 9200 "Elasticsearch"
    check_port 5601 "Kibana"
}

check_port() {
    PORT=$1
    SERVICE=$2
    
    if command_exists lsof; then
        if lsof -i :$PORT >/dev/null 2>&1; then
            log_warn "Port $PORT ($SERVICE) is already in use."
        fi
    elif command_exists ss; then
        if ss -tuln | grep -q ":$PORT "; then
            log_warn "Port $PORT ($SERVICE) is already in use."
        fi
    fi
}

#===============================================================================
# Application Setup Functions
#===============================================================================

build_and_start_services() {
    log "Building and starting Docker services..."
    
    cd "$SCRIPT_DIR"
    
    # Pull latest images
    log_info "Pulling latest Docker images..."
    docker compose pull 2>/dev/null || docker-compose pull
    
    # Build custom images
    log_info "Building custom images..."
    docker compose build 2>/dev/null || docker-compose build
    
    # Start services (without API first to run migrations)
    log_info "Starting database and ELK services..."
    docker compose up -d postgres elasticsearch 2>/dev/null || docker-compose up -d postgres elasticsearch
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    wait_for_service "postgres" 30
    wait_for_service "elasticsearch" 60
}

wait_for_service() {
    SERVICE=$1
    TIMEOUT=$2
    
    log_info "Waiting for $SERVICE to be ready..."
    
    for i in $(seq 1 $TIMEOUT); do
        if docker compose ps 2>/dev/null | grep -q "$SERVICE.*healthy" || \
           docker-compose ps 2>/dev/null | grep -q "$SERVICE.*healthy"; then
            log "$SERVICE is healthy!"
            return 0
        fi
        sleep 1
    done
    
    log_warn "$SERVICE health check timed out. Continuing anyway..."
}

start_logstash_kibana() {
    log "Starting Logstash and Kibana..."
    
    cd "$SCRIPT_DIR"
    
    docker compose up -d logstash kibana 2>/dev/null || docker-compose up -d logstash kibana
    
    # Wait for Logstash
    wait_for_service "logstash" 60
}

run_migrations() {
    log "Running database migrations..."
    
    cd "$SCRIPT_DIR"
    
    # Run migrations
    docker compose run --rm migrate 2>/dev/null || docker-compose run --rm migrate
    
    if [ $? -eq 0 ]; then
        log "Migrations completed successfully!"
    else
        log_error "Migration failed. Check logs for details."
        docker compose logs migrate 2>/dev/null || docker-compose logs migrate
        exit 1
    fi
}

start_api() {
    log "Starting API service..."
    
    cd "$SCRIPT_DIR"
    
    docker compose up -d api 2>/dev/null || docker-compose up -d api
    
    # Wait for API to be healthy
    wait_for_service "api" 60
}

setup_elasticsearch() {
    log "Setting up Elasticsearch..."
    
    # Get elastic password from .env
    source "${SCRIPT_DIR}/.env"
    ELASTIC_PWD="${ELASTIC_PASSWORD:-changeme}"
    
    # Wait for Elasticsearch to be fully ready
    for i in {1..30}; do
        if curl -s -u "elastic:${ELASTIC_PWD}" http://localhost:9200/_cluster/health >/dev/null 2>&1; then
            break
        fi
        sleep 2
    done
    
    # Set kibana_system password
    log_info "Configuring Kibana system user..."
    curl -s -X POST "http://localhost:9200/_security/user/kibana_system/_password" \
        -H "Content-Type: application/json" \
        -u "elastic:${ELASTIC_PWD}" \
        -d "{\"password\": \"${ELASTIC_PWD}\"}" >/dev/null 2>&1 || true
    
    # Create index template
    log_info "Creating index template..."
    curl -s -X PUT "http://localhost:9200/_index_template/pms-logs-template" \
        -H "Content-Type: application/json" \
        -u "elastic:${ELASTIC_PWD}" \
        -d '{
            "index_patterns": ["pms-logs-*"],
            "template": {
                "settings": {
                    "number_of_shards": 1,
                    "number_of_replicas": 0
                }
            }
        }' >/dev/null 2>&1 || true
    
    log "Elasticsearch setup complete!"
}

setup_kibana_data_view() {
    log "Setting up Kibana data view..."
    
    source "${SCRIPT_DIR}/.env"
    ELASTIC_PWD="${ELASTIC_PASSWORD:-changeme}"
    
    # Wait for Kibana to be ready
    for i in {1..60}; do
        if curl -s http://localhost:5601/api/status 2>&1 | grep -q '"level":"available"'; then
            break
        fi
        sleep 2
    done
    
    # Create data view
    curl -s -X POST "http://localhost:5601/api/data_views/data_view" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: true" \
        -u "elastic:${ELASTIC_PWD}" \
        -d '{
            "data_view": {
                "title": "pms-logs-*",
                "name": "PMS API Logs",
                "timeFieldName": "@timestamp"
            }
        }' >/dev/null 2>&1 || true
    
    log "Kibana data view created!"
}

#===============================================================================
# Health Check Functions
#===============================================================================

verify_services() {
    log "Verifying all services are running..."
    
    echo ""
    docker compose ps 2>/dev/null || docker-compose ps
    echo ""
    
    # Test API health
    log_info "Testing API health endpoint..."
    for i in {1..10}; do
        if curl -s http://localhost:3000/health | grep -q '"success":true'; then
            log "API is healthy! ✓"
            break
        fi
        sleep 2
    done
    
    # Test Elasticsearch
    source "${SCRIPT_DIR}/.env"
    if curl -s -u "elastic:${ELASTIC_PASSWORD:-changeme}" http://localhost:9200/_cluster/health | grep -q '"status"'; then
        log "Elasticsearch is healthy! ✓"
    fi
    
    # Test Kibana
    if curl -s http://localhost:5601/api/status | grep -q '"level":"available"'; then
        log "Kibana is healthy! ✓"
    fi
}

print_success() {
    source "${SCRIPT_DIR}/.env"
    
    echo ""
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                   ║"
    echo "║           🎉 PMS Setup Complete! 🎉                               ║"
    echo "║                                                                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${CYAN}Access Points:${NC}"
    echo "  • API:           http://localhost:3000"
    echo "  • API Health:    http://localhost:3000/health"
    echo "  • API Docs:      http://localhost:3000/api"
    echo "  • Kibana:        http://localhost:5601"
    echo "  • Elasticsearch: http://localhost:9200"
    echo ""
    echo -e "${CYAN}Credentials:${NC}"
    echo "  • Elasticsearch/Kibana:"
    echo "    - Username: elastic"
    echo "    - Password: ${ELASTIC_PASSWORD:-changeme}"
    echo ""
    echo -e "${CYAN}Test Accounts:${NC}"
    echo "  • System Admin:     admin@pms.com / Admin123!"
    echo "  • Org Admin:        orgadmin1@pms.com / User123!"
    echo "  • Property Manager: propmanager1@pms.com / User123!"
    echo "  • Staff:            staff1@pms.com / User123!"
    echo ""
    echo -e "${CYAN}Useful Commands:${NC}"
    echo "  • View logs:        docker compose logs -f api"
    echo "  • Stop services:    docker compose down"
    echo "  • Restart:          docker compose restart"
    echo "  • Full reset:       docker compose down -v && ./start.sh"
    echo ""
    echo -e "${YELLOW}Note: If this is a fresh installation, you may need to log out and back in"
    echo -e "      for Docker group permissions to take effect.${NC}"
    echo ""
}

#===============================================================================
# Cleanup Functions
#===============================================================================

cleanup_on_error() {
    log_error "An error occurred during setup. Cleaning up..."
    cd "$SCRIPT_DIR"
    docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true
}

#===============================================================================
# Main Script
#===============================================================================

main() {
    # Set up error handling
    trap cleanup_on_error ERR
    
    # Initialize log file
    echo "PMS Setup Log - $(date)" > "$LOG_FILE"
    
    # Print banner
    print_banner
    
    # Detect OS
    OS=$(detect_os)
    log "Detected OS: $OS"
    
    # Check if running as root (for Linux)
    check_root
    
    # Parse arguments
    GENERATE_SECRETS=false
    SKIP_ELK=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --generate-secrets)
                GENERATE_SECRETS=true
                shift
                ;;
            --skip-elk)
                SKIP_ELK=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --generate-secrets  Generate secure random secrets for production"
                echo "  --skip-elk          Skip ELK stack installation (reduces memory usage)"
                echo "  --help              Show this help message"
                exit 0
                ;;
            *)
                log_warn "Unknown option: $1"
                shift
                ;;
        esac
    done
    
    # Step 1: Check system requirements
    check_system_requirements
    
    # Step 2: Install Docker
    install_docker
    
    # Step 3: Install Docker Compose
    install_docker_compose
    
    # Step 4: Check Docker is running
    check_docker_running
    
    # Step 5: Setup environment
    setup_environment
    
    # Step 6: Build and start services
    build_and_start_services
    
    # Step 7: Start Logstash and Kibana (if not skipped)
    if [ "$SKIP_ELK" = false ]; then
        start_logstash_kibana
    fi
    
    # Step 8: Run migrations
    run_migrations
    
    # Step 9: Start API
    start_api
    
    # Step 10: Setup Elasticsearch (if not skipped)
    if [ "$SKIP_ELK" = false ]; then
        setup_elasticsearch
        setup_kibana_data_view
    fi
    
    # Step 11: Verify services
    verify_services
    
    # Step 12: Print success message
    print_success
}

# Run main function
main "$@"
