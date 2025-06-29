# 📋 Complete Setup Instructions

This guide provides step-by-step instructions for setting up your React Native project with Turbo Modules and ML-powered search.

## 🎯 Overview

The automated setup script creates a production-ready React Native application with:
- iOS Turbo Modules
- ML-powered search service
- Secure CI/CD pipeline
- Environment management
- Security tools

## 🚀 Quick Setup (Recommended)

### 1. Run Automated Setup
```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/yourusername/rn-setup/main/setup-automated-rn-project.sh
chmod +x setup-automated-rn-project.sh
./setup-automated-rn-project.sh
```

### 2. Follow Interactive Prompts
- Project name (default: IntelligentSearchApp)
- GitHub authentication (automatically detected)
- Configuration preferences

### 3. Configure API Keys
```bash
cd YourProjectName
cp .env.example .env
# Edit .env with your actual API keys
```

### 4. Complete Security Setup
```bash
./scripts/setup-security.sh
```

## 🔧 Manual Setup (Advanced)

If you prefer manual setup or need customization:

### 1. Prerequisites Installation

#### macOS Setup
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install node yarn git gh cocoapods
brew install --cask xcode

# Install GitHub CLI and login
gh auth login
```

#### Verify Prerequisites
```bash
node --version    # Should be 18+
yarn --version    # Should be 1.22+
xcodebuild -version  # Should be Xcode 15+
pod --version     # Should be 1.12+
```

### 2. Project Creation

#### Initialize React Native Project
```bash
npx react-native@latest init IntelligentSearchApp --template react-native-template-typescript
cd IntelligentSearchApp
```

#### Enable New Architecture
Edit `ios/Podfile`:
```ruby
use_react_native!(
  :path => "../node_modules/react-native",
  :hermes_enabled => true,
  :fabric_enabled => true,
  :new_architecture_enabled => true
)
```

#### Install iOS Dependencies
```bash
cd ios
pod install
cd ..
```

### 3. Turbo Modules Setup

#### Create Swift Turbo Module
Create `ios/IntelligentSearchApp/TurboModules/DeviceInfoTurboModule.swift`:
```swift
import Foundation
import React

@objc(DeviceInfoTurboModule)
class DeviceInfoTurboModule: NSObject, RCTBridgeModule {
    
    static func moduleName() -> String! {
        return "DeviceInfoTurboModule"
    }
    
    @objc
    func getDeviceInfo(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let deviceInfo: [String: Any] = [
            "name": UIDevice.current.name,
            "model": UIDevice.current.model,
            "systemName": UIDevice.current.systemName,
            "systemVersion": UIDevice.current.systemVersion
        ]
        resolve(deviceInfo)
    }
    
    @objc
    func requiresMainQueueSetup() -> Bool {
        return false
    }
}
```

#### Create TypeScript Interface
Create `src/native-modules/DeviceInfoTurboModule.ts`:
```typescript
import { NativeModules } from 'react-native';

interface DeviceInfoInterface {
  getDeviceInfo(): Promise<{
    name: string;
    model: string;
    systemName: string;
    systemVersion: string;
  }>;
}

const { DeviceInfoTurboModule } = NativeModules;
export default DeviceInfoTurboModule as DeviceInfoInterface;
```

### 4. ML Search Service Setup

#### Install Dependencies
```bash
yarn add @anthropic-ai/sdk openai uuid react-native-get-random-values
yarn add -D @types/uuid
```

#### Copy Search Service Files
Copy the following files from the template:
- `src/api/search-service.ts`
- `src/types/search.ts`
- `src/config/environment.ts`
- `src/utils/searchTest.ts`

### 5. Environment Management

#### Create Environment Files
```bash
# Create .env.example
cat > .env.example << 'EOF'
GITHUB_TOKEN=your_github_personal_access_token
AI_OPENAI_KEY=your_openai_api_key
AI_ANTHROPIC_KEY=your_anthropic_api_key
AI_GROK_KEY=your_grok_api_key
NODE_ENV=development
EOF

# Create .env from example
cp .env.example .env
```

#### Create Environment Loader
Copy `load_env.sh` from the template and make it executable:
```bash
chmod +x load_env.sh
```

#### Update .gitignore
Add to `.gitignore`:
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
secrets.json
```

### 6. CI/CD Pipeline Setup

#### Create GitHub Actions Workflow
Create `.github/workflows/build-ios-turbo-modules.yml` with the complete workflow from the template.

#### Setup Pre-commit Hooks
```bash
pip install pre-commit
# Copy .pre-commit-config.yaml from template
pre-commit install
```

### 7. GitHub Repository Setup

#### Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: React Native with Turbo Modules"
```

#### Create GitHub Repository
```bash
gh repo create IntelligentSearchApp --private --source=. --remote=origin --push
```

#### Add GitHub Secrets
```bash
# Add via GitHub web interface or CLI
gh secret set AI_OPENAI_KEY --body "your_openai_key"
gh secret set AI_ANTHROPIC_KEY --body "your_anthropic_key"
gh secret set AI_GROK_KEY --body "your_grok_key"
gh secret set GITHUB_TOKEN --body "your_github_token"
```

## ⚙️ Configuration Details

### API Keys Setup

#### OpenAI API Key
1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env` as `AI_OPENAI_KEY=sk-...`

#### Anthropic API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create API key
3. Add to `.env` as `AI_ANTHROPIC_KEY=sk-ant-...`

#### Grok API Key
1. Visit [xAI Console](https://console.x.ai/)
2. Generate API key
3. Add to `.env` as `AI_GROK_KEY=xai-...`

#### GitHub Token
1. Visit [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate token with repo permissions
3. Add to `.env` as `GITHUB_TOKEN=ghp_...`

### Environment Variables

#### Required Variables
```bash
# Authentication
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=yourusername

# AI APIs
AI_OPENAI_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_ANTHROPIC_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_GROK_KEY=xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App Config
NODE_ENV=development
LOG_LEVEL=info
```

#### Optional Variables
```bash
# iOS Configuration
IOS_BUNDLE_ID=com.yourcompany.intelligentsearch
IOS_TEAM_ID=XXXXXXXXXX
IOS_PROVISIONING_PROFILE=xxxxx-xxxxx-xxxxx

# API Configuration
API_BASE_URL=https://api.example.com
API_TIMEOUT=30000
```

## 🧪 Testing Setup

### Run Initial Tests
```bash
# Test environment loading
./load_env.sh all echo "Environment loaded successfully"

# Test search service
./load_env.sh ai yarn test-search

# Test iOS build
yarn build-turbo-modules
```

### Verify CI/CD Pipeline
```bash
# Push to trigger CI/CD
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

## 🔒 Security Verification

### Run Security Checks
```bash
# Run pre-commit hooks
pre-commit run --all-files

# Check for secrets
./scripts/setup-security.sh

# Verify .env is ignored
git status  # .env should not appear
```

### Validate API Keys
```bash
# Test API connectivity
./load_env.sh ai node -e "
const openai = require('openai');
const client = new openai.OpenAI({ apiKey: process.env.AI_OPENAI_KEY });
console.log('OpenAI client created successfully');
"
```

## 🚨 Troubleshooting

### Common Issues

#### Xcode Build Errors
```bash
# Clean build
cd ios
xcodebuild clean
rm -rf build/
pod install --repo-update
cd ..
```

#### Node.js Version Issues
```bash
# Use Node Version Manager
nvm install 18
nvm use 18
```

#### CocoaPods Issues
```bash
# Update CocoaPods
sudo gem update cocoapods
cd ios
pod repo update
pod install
```

#### GitHub CLI Issues
```bash
# Re-authenticate
gh auth logout
gh auth login
```

### Error Solutions

#### "Command not found" Errors
Ensure all prerequisites are installed and in PATH:
```bash
echo $PATH
which node yarn git gh xcodebuild pod
```

#### Permission Errors
```bash
# Fix script permissions
chmod +x load_env.sh
chmod +x scripts/setup-security.sh
```

#### API Authentication Errors
Verify API keys are correct and have proper permissions:
- OpenAI: Check billing and usage limits
- Anthropic: Verify API access is enabled
- Grok: Confirm account status

## 📈 Performance Optimization

### Build Performance
```bash
# Enable build caching
export CCACHE_DIR=~/.ccache
export USE_CCACHE=1

# Optimize Metro bundler
yarn start --reset-cache
```

### Development Workflow
```bash
# Use environment-specific commands
./load_env.sh ai yarn test-search     # For AI testing
./load_env.sh github yarn build       # For GitHub operations
./load_env.sh all yarn start          # For development
```

## 📚 Next Steps

After successful setup:

1. **Customize the App**: Modify the search interface and add features
2. **Configure Deployment**: Set up app store deployment
3. **Add Monitoring**: Implement analytics and error tracking
4. **Scale Infrastructure**: Optimize for production usage
5. **Team Setup**: Add team members and configure permissions

## 🆘 Getting Help

If you encounter issues:

1. **Check Logs**: Review setup.log and CI/CD logs
2. **Verify Prerequisites**: Ensure all tools are properly installed
3. **Test Components**: Use the built-in diagnostic tools
4. **Consult Documentation**: Review React Native and Turbo Modules docs
5. **Seek Support**: Open GitHub issues or contact support

---

This setup creates a production-ready foundation for your React Native application with enterprise-grade security, performance, and maintainability.