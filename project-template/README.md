# 🚀 Intelligent Search App

A production-ready React Native application with Turbo Modules, ML-powered search capabilities, and enterprise-grade security.

## 🏗️ Architecture

### Core Technologies
- **React Native 0.73+** with new architecture
- **iOS Turbo Modules** for native functionality
- **TypeScript** for type safety
- **ML-Powered Search** with OpenAI, Anthropic, Grok
- **GitHub Actions** for CI/CD
- **Pre-commit Hooks** for security

### Search Service Features
- 🤖 **AI-Enhanced Queries** - Smart query enhancement and suggestion
- 📊 **Sentiment Analysis** - Real-time content sentiment scoring
- 🎯 **Intelligent Categorization** - Automatic result classification
- 🛡️ **Robust Fallbacks** - 3-tier fallback system for reliability
- 📈 **Analytics Dashboard** - Search performance and insights
- 🔍 **Multi-Source Integration** - Academic, news, and industry sources

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn
- Xcode 15+
- CocoaPods
- GitHub CLI

### Setup
```bash
# Clone and setup
git clone https://github.com/yourusername/IntelligentSearchApp.git
cd IntelligentSearchApp

# Install dependencies
yarn install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Setup security
./scripts/setup-security.sh

# Install iOS dependencies
cd ios && pod install && cd ..

# Start development
yarn start
```

## 🔐 Environment Configuration

### Local Development (.env)
```bash
# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=your_github_username

# AI API Keys
AI_OPENAI_KEY=your_openai_api_key
AI_ANTHROPIC_KEY=your_anthropic_api_key
AI_GROK_KEY=your_grok_api_key

# App Configuration
NODE_ENV=development
LOG_LEVEL=info
```

### GitHub Secrets
Add these secrets in GitHub repository settings:
- `AI_OPENAI_KEY`
- `AI_ANTHROPIC_KEY`
- `AI_GROK_KEY`
- `GITHUB_TOKEN`

## 🛠️ Development

### Environment Loading
```bash
# Load GitHub credentials
./load_env.sh github yarn build-turbo-modules

# Load AI API keys
./load_env.sh ai yarn test-search

# Load all variables
./load_env.sh all yarn start
```

### Available Scripts
```bash
yarn start                    # Start Metro bundler
yarn test                     # Run tests
yarn test-search             # Test search service
yarn build-turbo-modules     # Build iOS Turbo Modules
yarn setup-security          # Setup security tools
```

## 📱 Turbo Modules

### DeviceInfoTurboModule
Native iOS module for device information:

```typescript
import DeviceInfoTurboModule from './src/native-modules/DeviceInfoTurboModule';

const deviceInfo = await DeviceInfoTurboModule.getDeviceInfo();
console.log(deviceInfo);
// {
//   name: "iPhone",
//   model: "iPhone",
//   systemName: "iOS",
//   systemVersion: "17.0",
//   identifierForVendor: "..."
// }
```

## 🔍 Search Service

### Basic Usage
```typescript
import { searchService } from './src/api/search-service';

// Perform intelligent search
const results = await searchService.search({
  query: 'machine learning tools',
  filters: {
    contentType: 'research',
    depth: 'comprehensive'
  },
  maxResults: 20
});

// Analyze search result
const analysis = await searchService.analyzeResult(results[0]);
console.log(analysis.sentiment); // 'positive' | 'negative' | 'neutral'
```

### Advanced Features
```typescript
// Generate smart suggestions
const suggestions = await searchService.generateSmartSuggestions(
  'data mining',
  currentResults
);

// Create research insights
const insights = await searchService.generateResearchInsights(results);

// Generate comprehensive report
const report = await searchService.generateSearchReport(
  'AI research trends',
  results
);
```

## 🧪 Testing

### Run Tests
```bash
# All tests
yarn test

# Search service tests
yarn test-search

# iOS tests
yarn test:ios
```

### Manual Testing
Use the diagnostic tools in development:
- Orange bug icon: Run search tests
- Yellow warning: View API diagnostics

## 🔒 Security

### Pre-commit Hooks
- Secret detection
- Code quality checks
- Environment validation
- TypeScript validation

### API Key Management
- Quarterly rotation recommended
- Separate development/production keys
- Usage monitoring and alerts
- Automatic fallbacks on failure

### Security Scanning
- GitHub secret scanning
- TruffleHog integration
- Dependency vulnerability checks
- Build artifact scanning

## 🏗️ CI/CD Pipeline

### GitHub Actions Workflow
- **Build**: iOS app with Turbo Modules
- **Test**: Unit tests and integration tests
- **Security**: Secret detection and vulnerability scanning
- **Deploy**: Automated deployment (when configured)

### Pipeline Features
- Parallel job execution
- Caching for faster builds
- Artifact retention
- Security cleanup
- Status reporting

## 📊 Performance

### Benchmarks
- **Search Response**: <3 seconds (with AI)
- **Fallback Response**: <500ms
- **Build Time**: ~15 minutes (first run)
- **Test Suite**: ~5 minutes

### Optimization
- Request caching
- AI response optimization
- Bundle size optimization
- Native module performance

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clean and rebuild
cd ios && xcodebuild clean && cd ..
yarn start --reset-cache
```

#### API Errors
```bash
# Check API status
./load_env.sh ai node -e "console.log(process.env.AI_OPENAI_KEY ? 'API key loaded' : 'Missing API key')"

# View diagnostics
# Tap yellow warning in app or check logs
```

#### Environment Issues
```bash
# Validate environment
./scripts/setup-security.sh

# Check .env file
cat .env.example  # Compare with your .env
```

## 📚 Documentation

### Additional Resources
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Security Guidelines](./SECURITY.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

### External Links
- [React Native New Architecture](https://reactnative.dev/docs/new-architecture-intro)
- [Turbo Modules Guide](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and security checks
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Follow security guidelines
- Use semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/IntelligentSearchApp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/IntelligentSearchApp/discussions)
- **Security**: security@yourcompany.com

---

Built with ❤️ using React Native, AI, and modern development practices.