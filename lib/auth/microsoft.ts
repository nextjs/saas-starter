import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { getAzureConfig, validateAzureConfig, type AzureConfig } from './amplify-config';

// Microsoft 365 Configuration - using AWS Amplify secrets
let msalInstance: ConfidentialClientApplication | null = null;
let azureConfig: AzureConfig | null = null;

// Initialize Azure configuration from AWS Amplify secrets
async function initializeAzureConfig(): Promise<AzureConfig> {
  if (azureConfig) {
    return azureConfig;
  }

  try {
    azureConfig = await getAzureConfig();
    
    if (!validateAzureConfig(azureConfig)) {
      throw new Error('Invalid Azure AD configuration');
    }

    return azureConfig;
  } catch (error) {
    console.error('Failed to initialize Azure configuration:', error);
    throw new Error('Microsoft authentication not configured properly');
  }
}

// Initialize MSAL instance with Azure configuration
async function getMsalInstance(): Promise<ConfidentialClientApplication> {
  if (msalInstance) {
    return msalInstance;
  }

  const config = await initializeAzureConfig();
  
  const msalConfig = {
    auth: {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      authority: config.authority,
    },
  };

  msalInstance = new ConfidentialClientApplication(msalConfig);
  return msalInstance;
}

// Custom authentication provider for Microsoft Graph
class GraphAuthProvider implements AuthenticationProvider {
  private accessToken: string = '';

  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const msal = await getMsalInstance();
      const clientCredentialRequest = {
        scopes: ['https://graph.microsoft.com/.default'],
      };

      const response = await msal.acquireTokenByClientCredential(clientCredentialRequest);
      this.accessToken = response!.accessToken;
      return this.accessToken;
    } catch (error) {
      console.error('Error acquiring token:', error);
      throw new Error('Failed to acquire access token');
    }
  }
}

// Initialize Microsoft Graph client
const graphClient = Client.initWithMiddleware({
  authProvider: new GraphAuthProvider(),
});

export interface MicrosoftUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
}

export interface MicrosoftTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<MicrosoftTokenResponse> {
  try {
    const msal = await getMsalInstance();
    const tokenRequest = {
      code,
      scopes: ['User.Read'],
      redirectUri,
    };

    const response = await msal.acquireTokenByCode(tokenRequest);
    
    return {
      access_token: response!.accessToken,
      token_type: 'Bearer',
      expires_in: response!.expiresOn ? Math.floor((response!.expiresOn.getTime() - Date.now()) / 1000) : 3600,
      scope: 'User.Read',
    };
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw new Error('Failed to exchange authorization code for access token');
  }
}

/**
 * Get user information from Microsoft Graph using access token
 */
export async function getMicrosoftUser(accessToken: string): Promise<MicrosoftUser> {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const user = await response.json();

    return {
      id: user.id!,
      displayName: user.displayName || '',
      mail: user.mail || user.userPrincipalName || '',
      userPrincipalName: user.userPrincipalName || '',
    };
  } catch (error) {
    console.error('Error getting Microsoft user:', error);
    throw new Error('Failed to get user information from Microsoft Graph');
  }
}

/**
 * Validate that the user's email domain is sunlighten.com
 */
export function validateDomain(email: string): boolean {
  const domain = email.split('@')[1];
  return domain === 'sunlighten.com';
}

/**
 * Generate Microsoft OAuth2 authorization URL
 */
export async function getMicrosoftAuthUrl(redirectUri: string): Promise<string> {
  try {
    const msal = await getMsalInstance();
    const authUrlParameters = {
      scopes: ['User.Read'],
      redirectUri,
      prompt: 'select_account',
    };

    return await msal.getAuthCodeUrl(authUrlParameters);
  } catch (error) {
    console.error('Error generating Microsoft auth URL:', error);
    throw new Error('Failed to generate Microsoft authentication URL');
  }
}
