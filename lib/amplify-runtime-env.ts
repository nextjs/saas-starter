// AWS Amplify Runtime Environment Variables Handler
// This handles the specific case where AWS Amplify doesn't inject env vars at runtime

interface RuntimeEnvConfig {
  DATABASE_URL: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  S3_REGION: string;
  S3_BUCKET: string;
  AUTH_SECRET: string;
  USE_LOCAL_S3: boolean;
  // Azure AD Configuration
  AZURE_CLIENT_ID: string;
  AZURE_CLIENT_SECRET: string;
  AZURE_TENANT_ID: string;
  AZURE_REDIRECT_URI: string;
}

// Production fallback values - these should be replaced with real values
const PRODUCTION_FALLBACKS: RuntimeEnvConfig = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/postgres',
  S3_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
  S3_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'amplify-fallback-bucket',
  AUTH_SECRET: 'amplify-fallback-auth-secret-32-chars',
  USE_LOCAL_S3: false,
  // Azure AD fallbacks
  AZURE_CLIENT_ID: 'amplify-fallback-azure-client-id',
  AZURE_CLIENT_SECRET: 'amplify-fallback-azure-client-secret',
  AZURE_TENANT_ID: 'common',
  AZURE_REDIRECT_URI: 'https://partner-storage.infra.sunlighten.com/api/auth/microsoft/callback',
};

// Development fallback values
const DEVELOPMENT_FALLBACKS: RuntimeEnvConfig = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
  S3_ACCESS_KEY_ID: 'test-access-key',
  S3_SECRET_ACCESS_KEY: 'test-secret-key',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'test-bucket',
  AUTH_SECRET: 'test-auth-secret',
  USE_LOCAL_S3: true,
  // Azure AD development fallbacks
  AZURE_CLIENT_ID: 'test-azure-client-id',
  AZURE_CLIENT_SECRET: 'test-azure-client-secret',
  AZURE_TENANT_ID: 'common',
  AZURE_REDIRECT_URI: 'http://localhost:3000/api/auth/microsoft/callback',
};

let cachedConfig: RuntimeEnvConfig | null = null;

// Detect if we're running in AWS Amplify/Lambda
function isAmplifyEnvironment(): boolean {
  return !!(process.env.AWS_LAMBDA_FUNCTION_NAME || 
           process.env.AWS_EXECUTION_ENV || 
           process.env.AWS_LAMBDA_RUNTIME_API);
}

// Detect if we're in development
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || 
         process.env.NODE_ENV === 'test' ||
         process.env.AMPLIFY_ENV === 'dev';
}

// Get configuration with comprehensive fallback handling
function getRuntimeConfig(): RuntimeEnvConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  console.log('🔍 Loading AWS Amplify runtime configuration...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('AMPLIFY_ENV:', process.env.AMPLIFY_ENV);
  console.log('AWS_LAMBDA_FUNCTION_NAME:', process.env.AWS_LAMBDA_FUNCTION_NAME);
  console.log('isAmplifyEnvironment:', isAmplifyEnvironment());
  console.log('isDevelopment:', isDevelopment());

  // Get all available environment variables for debugging
  const allEnvVars = Object.keys(process.env).sort();
  console.log('All available environment variables:', allEnvVars.slice(0, 20), '...');
  
  // Filter for relevant variables
  const relevantVars = allEnvVars.filter(key => 
    key.includes('DATABASE') || 
    key.includes('S3_') || 
    key.includes('AUTH_') || 
    key.includes('AWS_') ||
    key.includes('AMPLIFY_')
  );
  console.log('Relevant environment variables:', relevantVars);

  // Try to get configuration from environment variables
  const envConfig: Partial<RuntimeEnvConfig> = {
    DATABASE_URL: process.env.DATABASE_URL,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_REGION: process.env.S3_REGION || 'us-east-1',
    S3_BUCKET: process.env.S3_BUCKET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    USE_LOCAL_S3: process.env.USE_LOCAL_S3 === 'true',
    // Azure AD configuration
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
    AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
    AZURE_REDIRECT_URI: process.env.AZURE_REDIRECT_URI || process.env.NEXTAUTH_URL + '/api/auth/microsoft/callback',
  };

  // Try alternative naming conventions
  if (!envConfig.DATABASE_URL) {
    envConfig.DATABASE_URL = process.env.POSTGRES_URL || 
                             process.env.DATABASE_CONNECTION_STRING ||
                             process.env.POSTGRES_CONNECTION_STRING;
  }

  if (!envConfig.S3_ACCESS_KEY_ID) {
    envConfig.S3_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  }

  if (!envConfig.S3_SECRET_ACCESS_KEY) {
    envConfig.S3_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  }

  if (!envConfig.S3_BUCKET) {
    envConfig.S3_BUCKET = process.env.AWS_S3_BUCKET;
  }

  // Try Amplify-specific patterns
  if (!envConfig.DATABASE_URL) {
    envConfig.DATABASE_URL = process.env.AMPLIFY_DATABASE_URL || 
                             process.env.AMPLIFY_SECRET_DATABASE_URL;
  }

  if (!envConfig.S3_ACCESS_KEY_ID) {
    envConfig.S3_ACCESS_KEY_ID = process.env.AMPLIFY_S3_ACCESS_KEY_ID || 
                                 process.env.AMPLIFY_SECRET_S3_ACCESS_KEY_ID;
  }

  if (!envConfig.S3_SECRET_ACCESS_KEY) {
    envConfig.S3_SECRET_ACCESS_KEY = process.env.AMPLIFY_S3_SECRET_ACCESS_KEY || 
                                     process.env.AMPLIFY_SECRET_S3_SECRET_ACCESS_KEY;
  }

  if (!envConfig.S3_BUCKET) {
    envConfig.S3_BUCKET = process.env.AMPLIFY_S3_BUCKET || 
                          process.env.AMPLIFY_SECRET_S3_BUCKET;
  }

  if (!envConfig.AUTH_SECRET) {
    envConfig.AUTH_SECRET = process.env.AMPLIFY_AUTH_SECRET || 
                            process.env.AMPLIFY_SECRET_AUTH_SECRET;
  }

  // Try Azure AD alternative naming conventions
  if (!envConfig.AZURE_CLIENT_ID) {
    envConfig.AZURE_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || 
                               process.env.MSAL_CLIENT_ID;
  }

  if (!envConfig.AZURE_CLIENT_SECRET) {
    envConfig.AZURE_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || 
                                   process.env.MSAL_CLIENT_SECRET;
  }

  if (!envConfig.AZURE_TENANT_ID) {
    envConfig.AZURE_TENANT_ID = process.env.MICROSOFT_TENANT_ID || 
                               process.env.MSAL_TENANT_ID;
  }

  if (!envConfig.AZURE_REDIRECT_URI) {
    envConfig.AZURE_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || 
                                  process.env.MSAL_REDIRECT_URI;
  }

  // Try Amplify-specific patterns for Azure AD
  if (!envConfig.AZURE_CLIENT_ID) {
    envConfig.AZURE_CLIENT_ID = process.env.AMPLIFY_AZURE_CLIENT_ID || 
                               process.env.AMPLIFY_SECRET_AZURE_CLIENT_ID;
  }

  if (!envConfig.AZURE_CLIENT_SECRET) {
    envConfig.AZURE_CLIENT_SECRET = process.env.AMPLIFY_AZURE_CLIENT_SECRET || 
                                   process.env.AMPLIFY_SECRET_AZURE_CLIENT_SECRET;
  }

  if (!envConfig.AZURE_TENANT_ID) {
    envConfig.AZURE_TENANT_ID = process.env.AMPLIFY_AZURE_TENANT_ID || 
                               process.env.AMPLIFY_SECRET_AZURE_TENANT_ID;
  }

  if (!envConfig.AZURE_REDIRECT_URI) {
    envConfig.AZURE_REDIRECT_URI = process.env.AMPLIFY_AZURE_REDIRECT_URI || 
                                  process.env.AMPLIFY_SECRET_AZURE_REDIRECT_URI;
  }

  // Choose appropriate fallback values
  const fallbackConfig = isDevelopment() ? DEVELOPMENT_FALLBACKS : PRODUCTION_FALLBACKS;

  // Always use fallback values for missing configuration - never throw errors
  const finalConfig: RuntimeEnvConfig = {
    DATABASE_URL: envConfig.DATABASE_URL || fallbackConfig.DATABASE_URL,
    S3_ACCESS_KEY_ID: envConfig.S3_ACCESS_KEY_ID || fallbackConfig.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: envConfig.S3_SECRET_ACCESS_KEY || fallbackConfig.S3_SECRET_ACCESS_KEY,
    S3_REGION: envConfig.S3_REGION || fallbackConfig.S3_REGION,
    S3_BUCKET: envConfig.S3_BUCKET || fallbackConfig.S3_BUCKET,
    AUTH_SECRET: envConfig.AUTH_SECRET || fallbackConfig.AUTH_SECRET,
    USE_LOCAL_S3: envConfig.USE_LOCAL_S3 ?? fallbackConfig.USE_LOCAL_S3,
    // Azure AD configuration
    AZURE_CLIENT_ID: envConfig.AZURE_CLIENT_ID || fallbackConfig.AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET: envConfig.AZURE_CLIENT_SECRET || fallbackConfig.AZURE_CLIENT_SECRET,
    AZURE_TENANT_ID: envConfig.AZURE_TENANT_ID || fallbackConfig.AZURE_TENANT_ID,
    AZURE_REDIRECT_URI: envConfig.AZURE_REDIRECT_URI || fallbackConfig.AZURE_REDIRECT_URI,
  };

  // Log which values are using fallbacks
  const usingFallbacks = [];
  if (!envConfig.DATABASE_URL) usingFallbacks.push('DATABASE_URL');
  if (!envConfig.S3_ACCESS_KEY_ID) usingFallbacks.push('S3_ACCESS_KEY_ID');
  if (!envConfig.S3_SECRET_ACCESS_KEY) usingFallbacks.push('S3_SECRET_ACCESS_KEY');
  if (!envConfig.S3_BUCKET) usingFallbacks.push('S3_BUCKET');
  if (!envConfig.AUTH_SECRET) usingFallbacks.push('AUTH_SECRET');
  if (!envConfig.AZURE_CLIENT_ID) usingFallbacks.push('AZURE_CLIENT_ID');
  if (!envConfig.AZURE_CLIENT_SECRET) usingFallbacks.push('AZURE_CLIENT_SECRET');
  if (!envConfig.AZURE_TENANT_ID) usingFallbacks.push('AZURE_TENANT_ID');
  if (!envConfig.AZURE_REDIRECT_URI) usingFallbacks.push('AZURE_REDIRECT_URI');

  if (usingFallbacks.length > 0) {
    console.log('⚠️ Using fallback values for:', usingFallbacks.join(', '));
    console.log('This indicates AWS Amplify environment variables are not properly configured');
    console.log('Please check your Amplify console: App Settings > Environment variables');
    console.log('Required variables: DATABASE_URL, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, AUTH_SECRET, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID');
  } else {
    console.log('✅ All configuration loaded from environment variables');
  }

  console.log('Final configuration:', {
    DATABASE_URL: finalConfig.DATABASE_URL ? 'SET' : 'NOT SET',
    S3_ACCESS_KEY_ID: finalConfig.S3_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
    S3_SECRET_ACCESS_KEY: finalConfig.S3_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
    S3_REGION: finalConfig.S3_REGION || 'NOT SET',
    S3_BUCKET: finalConfig.S3_BUCKET || 'NOT SET',
    AUTH_SECRET: finalConfig.AUTH_SECRET ? 'SET' : 'NOT SET',
    USE_LOCAL_S3: finalConfig.USE_LOCAL_S3 ? 'true' : 'false',
    AZURE_CLIENT_ID: finalConfig.AZURE_CLIENT_ID ? 'SET' : 'NOT SET',
    AZURE_CLIENT_SECRET: finalConfig.AZURE_CLIENT_SECRET ? 'SET' : 'NOT SET',
    AZURE_TENANT_ID: finalConfig.AZURE_TENANT_ID || 'NOT SET',
    AZURE_REDIRECT_URI: finalConfig.AZURE_REDIRECT_URI || 'NOT SET',
  });

  cachedConfig = finalConfig;
  return finalConfig;
}

// Export functions for accessing configuration
export function getDatabaseUrl(): string {
  return getRuntimeConfig().DATABASE_URL;
}

export function getS3Config() {
  const config = getRuntimeConfig();
  return {
    accessKeyId: config.S3_ACCESS_KEY_ID,
    secretAccessKey: config.S3_SECRET_ACCESS_KEY,
    region: config.S3_REGION,
    bucket: config.S3_BUCKET,
    useLocalS3: config.USE_LOCAL_S3
  };
}

export function getAuthSecret(): string {
  return getRuntimeConfig().AUTH_SECRET;
}

export function getAllConfig(): RuntimeEnvConfig {
  return getRuntimeConfig();
}

export function getAzureConfig(): {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
} {
  const config = getRuntimeConfig();
  return {
    clientId: config.AZURE_CLIENT_ID,
    clientSecret: config.AZURE_CLIENT_SECRET,
    tenantId: config.AZURE_TENANT_ID,
    redirectUri: config.AZURE_REDIRECT_URI,
  };
}
