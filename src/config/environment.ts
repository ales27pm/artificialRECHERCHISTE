/**
 * Environment Configuration
 * Secure management of environment variables and API keys
 */

export interface EnvironmentConfig {
  // GitHub Configuration
  github: {
    token?: string;
    username?: string;
    repo?: string;
  };
  
  // AI API Configuration
  ai: {
    openai?: string;
    anthropic?: string;
    grok?: string;
  };
  
  // App Configuration
  app: {
    environment: 'development' | 'production' | 'test';
    apiBaseUrl: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  
  // iOS Configuration
  ios?: {
    bundleId?: string;
    teamId?: string;
    provisioningProfile?: string;
  };
}

/**
 * Load environment variables safely with validation
 */
export function loadEnvironment(): EnvironmentConfig {
  // Helper function to get environment variable with optional validation
  const getEnvVar = (key: string, required: boolean = false): string | undefined => {
    const value = process.env[key];
    
    if (required && !value) {
      console.warn(`⚠️  Required environment variable ${key} is not set`);
    }
    
    return value;
  };

  // Validate API key format (basic check)
  const validateApiKey = (key: string | undefined, service: string): string | undefined => {
    if (!key) return undefined;
    
    // Basic validation patterns
    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{32,}$/,
      anthropic: /^sk-ant-api\d{2}-[a-zA-Z0-9-_]{95}$/,
      github: /^ghp_[a-zA-Z0-9]{36}$/,
      grok: /^xai-[a-zA-Z0-9-]{32,}$/
    };
    
    const pattern = patterns[service as keyof typeof patterns];
    if (pattern && !pattern.test(key)) {
      console.warn(`⚠️  ${service} API key format appears invalid`);
    }
    
    return key;
  };

  return {
    github: {
      token: validateApiKey(getEnvVar('GITHUB_TOKEN'), 'github'),
      username: getEnvVar('GITHUB_USERNAME'),
      repo: getEnvVar('GITHUB_REPO'),
    },
    
    ai: {
      openai: validateApiKey(getEnvVar('AI_OPENAI_KEY'), 'openai'),
      anthropic: validateApiKey(getEnvVar('AI_ANTHROPIC_KEY'), 'anthropic'),
      grok: validateApiKey(getEnvVar('AI_GROK_KEY'), 'grok'),
    },
    
    app: {
      environment: (getEnvVar('NODE_ENV') as any) || 'development',
      apiBaseUrl: getEnvVar('API_BASE_URL') || 'https://api.example.com',
      logLevel: (getEnvVar('LOG_LEVEL') as any) || 'info',
    },
    
    ios: {
      bundleId: getEnvVar('IOS_BUNDLE_ID'),
      teamId: getEnvVar('IOS_TEAM_ID'),
      provisioningProfile: getEnvVar('IOS_PROVISIONING_PROFILE'),
    },
  };
}

/**
 * Get environment configuration (singleton pattern)
 */
let environmentConfig: EnvironmentConfig | null = null;

export function getEnvironment(): EnvironmentConfig {
  if (!environmentConfig) {
    environmentConfig = loadEnvironment();
  }
  return environmentConfig;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnvironment().app.environment === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnvironment().app.environment === 'production';
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return getEnvironment().app.environment === 'test';
}

/**
 * Get API key for a specific service
 */
export function getApiKey(service: 'openai' | 'anthropic' | 'grok'): string | undefined {
  const config = getEnvironment();
  return config.ai[service];
}

/**
 * Check if all required AI API keys are available
 */
export function validateAiApiKeys(): { valid: boolean; missing: string[] } {
  const config = getEnvironment();
  const missing: string[] = [];
  
  if (!config.ai.openai) missing.push('AI_OPENAI_KEY');
  if (!config.ai.anthropic) missing.push('AI_ANTHROPIC_KEY');
  if (!config.ai.grok) missing.push('AI_GROK_KEY');
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Secure logging function that masks sensitive data
 */
export function secureLog(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) {
  const config = getEnvironment();
  
  // Only log if level is appropriate
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(config.app.logLevel);
  const requestedLevelIndex = levels.indexOf(level);
  
  if (requestedLevelIndex < currentLevelIndex) {
    return;
  }
  
  // Mask sensitive data in logs
  let maskedData = data;
  if (data && typeof data === 'object') {
    maskedData = JSON.parse(JSON.stringify(data));
    
    // Recursively mask sensitive keys
    const maskSensitiveKeys = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Mask API keys and tokens
          if (key.toLowerCase().includes('key') || 
              key.toLowerCase().includes('token') || 
              key.toLowerCase().includes('secret')) {
            obj[key] = '***MASKED***';
          }
        } else if (typeof obj[key] === 'object') {
          obj[key] = maskSensitiveKeys(obj[key]);
        }
      }
      
      return obj;
    };
    
    maskedData = maskSensitiveKeys(maskedData);
  }
  
  // Log the message
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case 'debug':
      console.debug(logMessage, maskedData);
      break;
    case 'info':
      console.info(logMessage, maskedData);
      break;
    case 'warn':
      console.warn(logMessage, maskedData);
      break;
    case 'error':
      console.error(logMessage, maskedData);
      break;
  }
}