#!/bin/bash

# Environment Variable Loader Script
# Usage: ./load_env.sh [github|ai|all] [command...]

set -e  # Exit on any error

ENV_FILE=".env"
LOG_PREFIX="[ENV_LOADER]"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}${LOG_PREFIX}${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}${LOG_PREFIX}${NC} $1"
}

log_error() {
    echo -e "${RED}${LOG_PREFIX}${NC} $1"
}

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    log_error ".env file not found. Please create one using .env.example as a template."
    exit 1
fi

# Function to load specific environment variables
load_env_vars() {
    local prefix="$1"
    local count=0
    
    if [ "$prefix" = "all" ]; then
        log_info "Loading all environment variables from $ENV_FILE"
        set -a  # Automatically export all variables
        source "$ENV_FILE"
        set +a
        count=$(grep -c "^[A-Z]" "$ENV_FILE" 2>/dev/null || echo "0")
    else
        log_info "Loading ${prefix} environment variables from $ENV_FILE"
        # Export variables that match the prefix
        while IFS= read -r line; do
            if [[ $line =~ ^${prefix}_[A-Z_]+= ]]; then
                export "$line"
                ((count++))
            fi
        done < "$ENV_FILE"
    fi
    
    log_info "Loaded $count environment variables"
}

# Function to validate required variables
validate_env() {
    local env_type="$1"
    local missing_vars=()
    
    case "$env_type" in
        "github")
            [ -z "$GITHUB_TOKEN" ] && missing_vars+=("GITHUB_TOKEN")
            ;;
        "ai")
            [ -z "$AI_OPENAI_KEY" ] && missing_vars+=("AI_OPENAI_KEY")
            [ -z "$AI_ANTHROPIC_KEY" ] && missing_vars+=("AI_ANTHROPIC_KEY")
            [ -z "$AI_GROK_KEY" ] && missing_vars+=("AI_GROK_KEY")
            ;;
        "all")
            # Check all critical variables
            [ -z "$GITHUB_TOKEN" ] && missing_vars+=("GITHUB_TOKEN")
            [ -z "$AI_OPENAI_KEY" ] && missing_vars+=("AI_OPENAI_KEY")
            ;;
    esac
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        log_error "Please check your .env file"
        return 1
    fi
    
    return 0
}

# Function to mask sensitive values in logs
mask_env_vars() {
    # Override echo, printf, and console.log to mask sensitive data
    export BASH_XTRACEFD=2
    exec 2> >(sed 's/\(GITHUB_TOKEN\|AI_[A-Z_]*KEY\)=[^[:space:]]*/\1=***MASKED***/g')
}

# Main script logic
main() {
    local env_type="$1"
    shift
    
    # Validate input
    if [ -z "$env_type" ]; then
        log_error "Usage: $0 [github|ai|all] [command...]"
        log_error "Examples:"
        log_error "  $0 github yarn build"
        log_error "  $0 ai npm test"
        log_error "  $0 all yarn start"
        exit 1
    fi
    
    # Enable log masking for security
    mask_env_vars
    
    # Load environment variables based on type
    case "$env_type" in
        "github")
            load_env_vars "GITHUB"
            validate_env "github"
            ;;
        "ai")
            load_env_vars "AI"
            validate_env "ai"
            ;;
        "all")
            load_env_vars "all"
            validate_env "all"
            ;;
        *)
            log_error "Invalid environment type: $env_type"
            log_error "Valid types: github, ai, all"
            exit 1
            ;;
    esac
    
    # Execute remaining commands if provided
    if [ $# -gt 0 ]; then
        log_info "Executing command: $*"
        exec "$@"
    else
        log_info "Environment loaded. You can now run commands with the loaded variables."
        log_info "Example: GITHUB_TOKEN=***MASKED*** (${#GITHUB_TOKEN} characters)"
    fi
}

# Run main function with all arguments
main "$@"