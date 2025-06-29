# 🔐 Security Configuration Guide

## Overview

This React Native AI Search Engine project implements enterprise-grade security practices for API key management, environment variable handling, and CI/CD pipeline security.

## 🚀 Quick Setup

### 1. Initial Security Setup
```bash
# Run the automated security setup
./scripts/setup-security.sh

# Create your environment file
cp .env.example .env
```

### 2. Configure API Keys

Edit your `.env` file with your actual API keys:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_personal_access_token
GITHUB_USERNAME=your_github_username
GITHUB_REPO=your_repo_name

# AI API Keys
AI_OPENAI_KEY=sk-your_openai_api_key
AI_ANTHROPIC_KEY=sk-ant-your_anthropic_api_key
AI_GROK_KEY=xai-your_grok_api_key

# Development Environment
NODE_ENV=development
API_BASE_URL=https://api.example.com
```

### 3. GitHub Repository Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

- `GITHUB_TOKEN` - Your GitHub personal access token
- `AI_OPENAI_KEY` - Your OpenAI API key
- `AI_ANTHROPIC_KEY` - Your Anthropic API key  
- `AI_GROK_KEY` - Your Grok API key
- `EXPO_TOKEN` - Your Expo authentication token

## 🛠️ Usage

### Environment Loading

Use the environment loader script to safely load variables:

```bash
# Load GitHub credentials for builds
./load_env.sh github yarn build

# Load AI API keys for testing
./load_env.sh ai npm test

# Load all variables for development
./load_env.sh all yarn start
```

### In JavaScript/TypeScript

```typescript
import { getEnvironment, getApiKey, validateAiApiKeys } from './src/config/environment';

// Get environment configuration
const config = getEnvironment();

// Get specific API key
const openaiKey = getApiKey('openai');

// Validate all API keys
const { valid, missing } = validateAiApiKeys();
if (!valid) {
  console.error('Missing API keys:', missing);
}
```

## 🏗️ CI/CD Pipeline

### GitHub Actions Workflow

The project includes a comprehensive CI/CD pipeline (`/.github/workflows/build-ios-turbo-modules.yml`) that:

- ✅ Builds iOS apps with Turbo Modules support
- ✅ Runs security scans for secrets
- ✅ Executes linting and type checking
- ✅ Runs automated tests
- ✅ Compiles native iOS components
- ✅ Securely manages environment variables

### Pipeline Features

1. **Multi-Stage Build**
   - Node.js and Bun setup
   - Expo CLI configuration
   - Xcode and iOS Simulator setup
   - CocoaPods dependency management

2. **Security Scanning**
   - Secret detection with TruffleHog
   - Pattern matching for API keys
   - Vulnerability scanning

3. **Build Artifacts**
   - iOS build outputs
   - Build logs for debugging
   - Test results and coverage

## 🔒 Security Features

### Pre-commit Hooks

Automatically configured hooks that run before each commit:

- **Secret Detection**: Scans for potential API keys and tokens
- **Code Linting**: ESLint with security rules
- **Type Checking**: TypeScript validation
- **Environment Validation**: Checks for hardcoded secrets

### API Key Management

#### Local Development
- Uses `.env` file (never committed)
- Automatic masking in logs
- Format validation
- Fallback to Vibecode keys

#### Production/CI
- GitHub Secrets for sensitive data
- Environment-specific configuration
- Secure logging practices
- Automatic cleanup

### Secure Logging

```typescript
import { secureLog } from './src/config/environment';

// Automatically masks sensitive data
secureLog('info', 'API request completed', {
  apiKey: 'sk-...',  // Will be masked as '***MASKED***'
  response: data
});
```

## 📱 iOS Turbo Modules Configuration

### Enable New Architecture

The project is configured for React Native's new architecture with Turbo Modules:

```javascript
// metro.config.js
module.exports = {
  resolver: {
    unstable_enableNewResolver: true,
  },
  transformer: {
    unstable_allowRequireContext: true,
  },
};
```

### iOS Build Configuration

```ruby
# ios/Podfile
pod 'RCT-Folly', :podspec => '../node_modules/react-native/third-party-podspecs/RCT-Folly.podspec'
pod 'React-hermes', :path => '../node_modules/react-native/ReactCommon/hermes'

# Enable Turbo Modules
ENV['RCT_NEW_ARCH_ENABLED'] = '1'
```

## 🔍 Security Monitoring

### Automated Scans

1. **Pre-commit**: Local secret detection
2. **CI Pipeline**: Comprehensive security scanning
3. **GitHub**: Native secret scanning alerts
4. **Dependency**: Automated vulnerability detection

### Manual Verification

```bash
# Run security checks manually
pre-commit run --all-files

# Check for secrets in git history
git log --all --full-history | grep -i "password\|secret\|key\|token"

# Validate environment setup
./load_env.sh all echo "Environment loaded successfully"
```

## 🚨 Incident Response

### If API Keys Are Exposed

1. **Immediate Actions**:
   ```bash
   # Rotate the exposed keys immediately
   # Remove from git history
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env' \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Update Configuration**:
   - Generate new API keys
   - Update GitHub Secrets
   - Update local `.env` file

3. **Verify Security**:
   - Run security scans
   - Check access logs
   - Monitor for unauthorized usage

### Emergency Contacts

- **Security Team**: security@yourcompany.com
- **GitHub Security**: https://github.com/security
- **API Providers**: Check respective documentation

## 📋 Security Checklist

### Initial Setup
- [ ] Run `./scripts/setup-security.sh`
- [ ] Create `.env` from `.env.example`
- [ ] Add GitHub repository secrets
- [ ] Install pre-commit hooks
- [ ] Test environment loading

### Ongoing Maintenance
- [ ] Rotate API keys quarterly
- [ ] Monitor security alerts
- [ ] Update dependencies regularly
- [ ] Review access logs
- [ ] Validate CI/CD pipeline

### Before Deployment
- [ ] Run security scans
- [ ] Verify no secrets in code
- [ ] Check environment variables
- [ ] Test fallback mechanisms
- [ ] Validate iOS build process

## 🛡️ Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Implement least privilege** access controls
4. **Monitor and audit** API key usage
5. **Rotate credentials** regularly
6. **Use secure logging** practices
7. **Validate input data** and API responses
8. **Keep dependencies** up to date

## 📚 Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [React Native Security Guide](https://reactnative.dev/docs/security)
- [Expo Security Best Practices](https://docs.expo.dev/guides/security/)
- [iOS App Security](https://developer.apple.com/security/)

## 🤝 Contributing

When contributing to this project:

1. Run pre-commit hooks: `pre-commit run --all-files`
2. Never commit API keys or secrets
3. Use the environment loader for testing
4. Follow secure coding practices
5. Document security-related changes

---

For questions or security concerns, please contact the development team or open a secure issue in the repository.