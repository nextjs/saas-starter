import { defineAuth, secret } from '@aws-amplify/backend';
import { getAzureConfig as getRuntimeAzureConfig } from '../amplify-runtime-env';

/**
 * AWS Amplify Auth Configuration with Azure AD Integration
 * 
 * This configuration uses AWS Amplify secrets to securely manage Azure AD credentials
 * instead of relying on environment variables.
 * 
 * Note: The externalProviders.microsoft configuration is a conceptual example.
 * In practice, you would need to implement custom OAuth2 provider configuration
 * or use a supported provider like Google, Facebook, etc.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    // Custom OAuth2 providers would be configured here
    // For now, we'll handle Azure AD through our custom implementation
  }
});

/**
 * Azure AD Configuration Interface
 * 
 * This interface defines the structure for Azure AD configuration
 * that will be resolved from AWS Amplify secrets at runtime.
 */
export interface AzureConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
  scopes: string[];
  authority: string;
}

/**
 * Get Azure AD configuration from AWS Amplify secrets
 * 
 * This function resolves the secrets at runtime and returns a complete
 * Azure AD configuration object.
 */
export async function getAzureConfig(): Promise<AzureConfig> {
  try {
    // Get configuration from runtime environment handler
    const runtimeConfig = getRuntimeAzureConfig();
    
    if (!runtimeConfig.clientId || !runtimeConfig.clientSecret) {
      throw new Error('Azure AD configuration is missing. Please ensure AZURE_CLIENT_ID and AZURE_CLIENT_SECRET are set in AWS Amplify secrets.');
    }

    return {
      clientId: runtimeConfig.clientId,
      clientSecret: runtimeConfig.clientSecret,
      tenantId: runtimeConfig.tenantId,
      redirectUri: runtimeConfig.redirectUri,
      scopes: ['User.Read'],
      authority: `https://login.microsoftonline.com/${runtimeConfig.tenantId}`,
    };
  } catch (error) {
    console.error('Failed to get Azure configuration:', error);
    throw new Error('Azure AD configuration is not available. Please check your AWS Amplify secrets configuration.');
  }
}

/**
 * Validate Azure AD configuration
 * 
 * Ensures all required Azure AD configuration values are present.
 */
export function validateAzureConfig(config: AzureConfig): boolean {
  return !!(
    config.clientId &&
    config.clientSecret &&
    config.tenantId &&
    config.redirectUri &&
    config.scopes.length > 0
  );
}
