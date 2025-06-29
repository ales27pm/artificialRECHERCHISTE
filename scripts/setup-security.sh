#!/bin/bash

# Security Setup Script for React Native with AI Search Engine
# This script configures security tools and validates the environment

set -e

LOG_PREFIX="[SECURITY_SETUP]"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}${LOG_PREFIX}${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}${LOG_PREFIX}${NC} $1"
}

log_error() {
    echo -e "${RED}${LOG_PREFIX}${NC} $1"
}

# Check if running in the correct directory
check_project_root() {
    if [ ! -f "package.json" ]; then
        log_error "This script must be run from the project root directory"
        exit 1
    fi
    log_info "Project root directory confirmed"
}

# Install security dependencies
install_security_tools() {
    log_info "Installing security tools..."
    
    # Install pre-commit if not already installed
    if ! command -v pre-commit &> /dev/null; then
        log_info "Installing pre-commit..."
        pip3 install pre-commit || {
            log_warn "pip3 not available, trying pip..."
            pip install pre-commit || {
                log_error "Failed to install pre-commit. Please install it manually."
                exit 1
            }
        }
    else
        log_info "pre-commit already installed"
    fi
    
    # Install git-secrets if available
    if command -v brew &> /dev/null; then
        if ! command -v git-secrets &> /dev/null; then
            log_info "Installing git-secrets..."
            brew install git-secrets || log_warn "Failed to install git-secrets via brew"
        else
            log_info "git-secrets already installed"
        fi
    fi
}

# Setup pre-commit hooks
setup_pre_commit() {
    log_info "Setting up pre-commit hooks..."
    
    # Install pre-commit hooks
    pre-commit install || {
        log_error "Failed to install pre-commit hooks"
        exit 1
    }
    
    # Initialize secrets baseline
    if [ ! -f ".secrets.baseline" ]; then
        log_info "Creating secrets baseline..."
        detect-secrets scan --baseline .secrets.baseline || {
            log_warn "Failed to create secrets baseline, continuing..."
        }
    else
        log_info "Secrets baseline already exists"
    fi
    
    log_info "Pre-commit hooks installed successfully"
}

# Configure git-secrets if available
setup_git_secrets() {
    if command -v git-secrets &> /dev/null; then
        log_info "Configuring git-secrets..."
        
        # Install git-secrets hooks
        git secrets --install || log_warn "git-secrets hooks already installed"
        
        # Register common secret patterns
        git secrets --register-aws || true
        
        # Add custom patterns for API keys
        git secrets --add 'sk-[a-zA-Z0-9]{32,}' || true  # OpenAI keys
        git secrets --add 'ghp_[a-zA-Z0-9]{36}' || true  # GitHub tokens
        git secrets --add 'claude-[a-zA-Z0-9-]{32,}' || true  # Anthropic keys
        git secrets --add 'xai-[a-zA-Z0-9-]{32,}' || true  # Grok keys
        
        log_info "git-secrets configured successfully"
    else
        log_warn "git-secrets not available, skipping configuration"
    fi
}

# Validate environment setup
validate_environment() {
    log_info "Validating environment configuration..."
    
    # Check if .env.example exists
    if [ ! -f ".env.example" ]; then
        log_error ".env.example file not found"
        exit 1
    fi
    
    # Check if .env is properly ignored
    if git check-ignore .env >/dev/null 2>&1; then
        log_info ".env file is properly ignored by git"
    else
        log_error ".env file is not ignored by git! This is a security risk."
        log_error "Please ensure .env is added to .gitignore"
        exit 1
    fi
    
    # Check for potential secrets in committed files
    log_info "Scanning for potential secrets in committed files..."
    if git log --all --full-history -- | grep -i "password\|secret\|key\|token" | head -5; then
        log_warn "Found potential secrets in git history. Please review carefully."
    fi
    
    # Check environment loader script
    if [ -f "load_env.sh" ] && [ -x "load_env.sh" ]; then
        log_info "Environment loader script is properly configured"
    else
        log_error "Environment loader script (load_env.sh) is missing or not executable"
        exit 1
    fi
    
    log_info "Environment validation completed"
}

# Create security documentation
create_security_docs() {
    log_info "Creating security documentation..."
    
    cat > SECURITY.md << 'EOF'
# Security Guidelines

## Environment Variables

### Local Development
- Use `.env` file for local environment variables
- Never commit `.env` to git
- Use `.env.example` as a template
- Prefix variables by type: `GITHUB_`, `AI_`, etc.

### Production/CI
- Use GitHub Secrets for sensitive data
- Rotate keys regularly
- Monitor for secret exposure

## API Key Management

### Supported Services
- **OpenAI**: `AI_OPENAI_KEY`
- **Anthropic**: `AI_ANTHROPIC_KEY` 
- **Grok**: `AI_GROK_KEY`
- **GitHub**: `GITHUB_TOKEN`

### Security Best Practices
1. **Never hardcode secrets** in source code
2. **Use environment variables** for all sensitive data
3. **Rotate keys regularly** (every 90 days recommended)
4. **Monitor for exposure** using GitHub secret scanning
5. **Use least privilege** - only grant necessary permissions

## Tools

### Pre-commit Hooks
- **detect-secrets**: Scans for potential secrets
- **eslint**: Code quality and security linting
- **typescript**: Type checking for security

### Environment Loader
Use `./load_env.sh` to load environment variables safely:

```bash
# Load GitHub credentials
./load_env.sh github yarn build

# Load AI API keys
./load_env.sh ai npm test

# Load all variables
./load_env.sh all yarn start
```

## Incident Response

### If Secrets Are Exposed
1. **Immediately rotate** the exposed keys
2. **Remove from git history** using BFG or git-filter-branch
3. **Check logs** for unauthorized access
4. **Update security practices** to prevent recurrence

### Emergency Contacts
- Security team: security@yourcompany.com
- GitHub security: security@github.com

## Compliance
This project follows security best practices for:
- API key management
- Source code security
- CI/CD pipeline security
- Secret rotation and monitoring
EOF
    
    log_info "Security documentation created (SECURITY.md)"
}

# Main execution
main() {
    log_info "Starting security setup for React Native AI Search Engine..."
    
    check_project_root
    install_security_tools
    setup_pre_commit
    setup_git_secrets
    validate_environment
    create_security_docs
    
    log_info "Security setup completed successfully!"
    log_info ""
    log_info "Next steps:"
    log_info "1. Copy .env.example to .env and fill in your API keys"
    log_info "2. Add repository secrets in GitHub Settings > Secrets and variables > Actions"
    log_info "3. Run 'pre-commit run --all-files' to test the setup"
    log_info "4. Review SECURITY.md for ongoing security practices"
}

# Run main function
main "$@"