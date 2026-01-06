#!/bin/sh
set -e
set -o pipefail

# =============================================================================
# Docker Entrypoint Script for MarketHub Server
# =============================================================================
# This script handles database migrations and seeders before starting the
# application. It includes database connection checks, retry logic with
# exponential backoff, comprehensive logging, and graceful shutdown handling.
# =============================================================================

# -----------------------------------------------------------------------------
# Logging Functions
# -----------------------------------------------------------------------------

# Get current timestamp in ISO 8601 format
get_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Log informational message
log_info() {
    echo "[$(get_timestamp)] [INFO] $*"
}

# Log warning message
log_warn() {
    echo "[$(get_timestamp)] [WARN] $*" >&2
}

# Log error message
log_error() {
    echo "[$(get_timestamp)] [ERROR] $*" >&2
}

# -----------------------------------------------------------------------------
# Environment Variable Validation
# -----------------------------------------------------------------------------

# Set default values for optional environment variables
: "${NODE_ENV:=production}"
: "${PORT:=8080}"
: "${DB_HOST:=localhost}"
: "${DB_PORT:=3306}"
: "${DB_DIALECT:=mysql}"

# Validate critical environment variables
validate_environment() {
    log_info "Validating environment variables..."
    
    local missing_vars=""
    
    # Check critical variables
    if [ -z "$DB_NAME" ]; then
        missing_vars="$missing_vars DB_NAME"
    fi
    
    if [ -z "$DB_USER" ]; then
        missing_vars="$missing_vars DB_USER"
    fi
    
    if [ -z "$DB_PASSWORD" ]; then
        missing_vars="$missing_vars DB_PASSWORD"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        missing_vars="$missing_vars JWT_SECRET"
    fi
    
    if [ -n "$missing_vars" ]; then
        log_error "Missing required environment variables:$missing_vars"
        log_error "Please set these variables before starting the application"
        exit 1
    fi
    
    log_info "Environment validation passed"
    log_info "NODE_ENV: $NODE_ENV"
    log_info "PORT: $PORT"
    log_info "DB_HOST: $DB_HOST"
    log_info "DB_PORT: $DB_PORT"
    log_info "DB_DIALECT: $DB_DIALECT"
    log_info "DB_NAME: $DB_NAME"
}

# -----------------------------------------------------------------------------
# Database Connection Functions
# -----------------------------------------------------------------------------

# Wait for database to be ready with exponential backoff
wait_for_db() {
    log_info "Waiting for database connection..."
    
    local max_retries=30
    local retry_count=0
    local wait_time=1
    local max_wait_time=16
    local db_ready=false
    
    while [ $retry_count -lt $max_retries ]; do
        retry_count=$((retry_count + 1))
        
        log_info "Database connection attempt $retry_count/$max_retries (waiting ${wait_time}s)..."
        
        # Attempt database connection based on dialect
        case "$DB_DIALECT" in
            mysql|mariadb)
                if command -v mysql >/dev/null 2>&1; then
                    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; then
                        db_ready=true
                        break
                    fi
                else
                    # Fallback: try using node to connect
                    if node -e "
                        const mysql = require('mysql2/promise');
                        mysql.createConnection({
                            host: process.env.DB_HOST,
                            port: process.env.DB_PORT,
                            user: process.env.DB_USER,
                            password: process.env.DB_PASSWORD
                        }).then(() => process.exit(0)).catch(() => process.exit(1));
                    " 2>/dev/null; then
                        db_ready=true
                        break
                    fi
                fi
                ;;
            postgres|postgresql)
                if command -v psql >/dev/null 2>&1; then
                    if PGPASSWORD="$DB_PASSWORD" psql -h"$DB_HOST" -p"$DB_PORT" -U"$DB_USER" -d"$DB_NAME" -c "SELECT 1" >/dev/null 2>&1; then
                        db_ready=true
                        break
                    fi
                else
                    # Fallback: try using node to connect
                    if node -e "
                        const { Client } = require('pg');
                        const client = new Client({
                            host: process.env.DB_HOST,
                            port: process.env.DB_PORT,
                            user: process.env.DB_USER,
                            password: process.env.DB_PASSWORD,
                            database: process.env.DB_NAME
                        });
                        client.connect().then(() => {
                            client.end();
                            process.exit(0);
                        }).catch(() => process.exit(1));
                    " 2>/dev/null; then
                        db_ready=true
                        break
                    fi
                fi
                ;;
            *)
                log_warn "Unknown database dialect: $DB_DIALECT, skipping connection check"
                db_ready=true
                break
                ;;
        esac
        
        if [ "$db_ready" = true ]; then
            break
        fi
        
        # Exponential backoff with jitter
        sleep $wait_time
        
        # Double the wait time for next retry, up to max_wait_time
        if [ $wait_time -lt $max_wait_time ]; then
            wait_time=$((wait_time * 2))
        fi
    done
    
    if [ "$db_ready" = true ]; then
        log_info "Database connection successful"
        return 0
    else
        log_error "Database connection failed after $max_retries attempts"
        log_error "Please check your database configuration and ensure it's running"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# Database Migration Functions
# -----------------------------------------------------------------------------

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    if npx sequelize-cli db:migrate; then
        log_info "Database migrations completed successfully"
        return 0
    else
        exit_code=$?
        log_warn "Database migrations failed with exit code $exit_code"
        log_warn "This may be expected if migrations are already applied"
        log_warn "You may need to run migrations manually if the database is not properly set up"
        return 0
    fi
}

# -----------------------------------------------------------------------------
# Database Seeder Functions
# -----------------------------------------------------------------------------

# Run database seeders
run_seeders() {
    log_info "Running database seeders..."
    
    if npx sequelize-cli db:seed:all; then
        log_info "Database seeders completed successfully"
        return 0
    else
        exit_code=$?
        log_warn "Database seeders failed with exit code $exit_code"
        log_warn "This may be expected if seeders are already applied"
        log_warn "You may need to run seeders manually if the database is not properly seeded"
        return 0
    fi
}

# -----------------------------------------------------------------------------
# Signal Handling
# -----------------------------------------------------------------------------

# Setup signal handlers for graceful shutdown
setup_signal_handlers() {
    # Trap SIGTERM and SIGINT for graceful shutdown
    trap 'log_info "Received termination signal, shutting down..."; exit 0' TERM INT
}

# -----------------------------------------------------------------------------
# Main Execution
# -----------------------------------------------------------------------------

main() {
    log_info "=========================================="
    log_info "Starting Docker entrypoint..."
    log_info "=========================================="
    
    # Setup signal handlers
    setup_signal_handlers
    
    # Validate environment variables
    validate_environment
    
    # Wait for database to be ready
    if ! wait_for_db; then
        log_error "Failed to connect to database, exiting..."
        exit 1
    fi
    
    # Run database migrations
    run_migrations
    
    # Run database seeders
    run_seeders
    
    # Start the application
    log_info "=========================================="
    log_info "Starting application..."
    log_info "=========================================="
    
    # Execute the command passed as arguments
    # Using exec ensures the application replaces the shell process
    # This allows signals to be properly forwarded to the application
    if [ $# -eq 0 ]; then
        # Default command if none provided
        log_info "No command provided, using default: npx pm2-runtime ecosystem.config.js --env production"
        exec npx pm2-runtime ecosystem.config.js --env production
    else
        log_info "Executing command: $*"
        exec "$@"
    fi
}

# Run main function with all arguments
main "$@"
