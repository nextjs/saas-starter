# AWS Amplify Secrets Integration for Azure AD

This document describes the integration of AWS Amplify secrets to securely manage Azure AD credentials in the Sunlighten - Partner Storage application.

## Overview

The application now uses AWS Amplify secrets to securely store and retrieve Azure AD configuration instead of relying on environment variables. This provides better security and centralized secret management.

## Architecture

### Components

1. **`lib/auth/amplify-config.ts`** - AWS Amplify auth configuration with secret definitions
2. **`lib/auth/microsoft.ts`** - Updated Microsoft authentication to use secrets
3. **`lib/amplify-runtime-env.ts`** - Enhanced runtime environment handler with Azure support

### Secret Management Flow

```
AWS Amplify Secrets → Runtime Environment Handler → Azure Configuration → Microsoft Authentication
```

## Configuration

### Required AWS Amplify Secrets

The following secrets must be configured in your AWS Amplify console:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AZURE_CLIENT_ID` | Azure AD Application Client ID | `12345678-1234-1234-1234-123456789abc` |
| `AZURE_CLIENT_SECRET` | Azure AD Application Client Secret | `your-client-secret-value` |
| `AZURE_TENANT_ID` | Azure AD Tenant ID | `87654321-4321-4321-4321-cba987654321` |
| `AZURE_REDIRECT_URI` | OAuth2 Redirect URI | `https://your-app.com/api/auth/microsoft/callback` |

### Setting Up Secrets in AWS Amplify

1. **Navigate to AWS Amplify Console**
   - Go to your app in the AWS Amplify console
   - Click on "App settings" → "Environment variables"

2. **Add Secrets**
   - Click "Manage secrets"
   - Add each secret with the exact names listed above
   - Set appropriate values for your environment

3. **Deploy Changes**
   - Save the secrets
   - Redeploy your application to apply the changes

## Implementation Details

### AWS Amplify Auth Configuration

```typescript
// lib/auth/amplify-config.ts
import { defineAuth, secret } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    // Custom OAuth2 providers would be configured here
    // For now, we'll handle Azure AD through our custom implementation
  }
});
```

### Azure Configuration Interface

```typescript
export interface AzureConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
  scopes: string[];
  authority: string;
}
```

### Runtime Environment Handler

The runtime environment handler (`lib/amplify-runtime-env.ts`) has been enhanced to:

1. **Load Azure secrets** from AWS Amplify
2. **Provide fallback values** for development
3. **Support multiple naming conventions** for compatibility
4. **Log configuration status** for debugging

### Microsoft Authentication Updates

The Microsoft authentication module (`lib/auth/microsoft.ts`) now:

1. **Uses async initialization** to load secrets
2. **Provides better error handling** for missing configuration
3. **Supports dynamic configuration** loading
4. **Maintains backward compatibility** with environment variables

## Usage

### Getting Azure Configuration

```typescript
import { getAzureConfig } from './lib/auth/amplify-config';

// Get Azure configuration (resolves secrets at runtime)
const azureConfig = await getAzureConfig();
console.log('Client ID:', azureConfig.clientId);
```

### Using Runtime Environment Handler

```typescript
import { getAzureConfig } from './lib/amplify-runtime-env';

// Get Azure configuration from runtime handler
const azureConfig = getAzureConfig();
console.log('Tenant ID:', azureConfig.tenantId);
```

## Development vs Production

### Development Environment

- Uses fallback values for missing secrets
- Logs warnings when using fallbacks
- Supports local environment variables as backup

### Production Environment

- Requires all secrets to be configured in AWS Amplify
- Fails gracefully with helpful error messages
- Uses production-specific fallback values

## Error Handling

### Common Issues

1. **Missing Secrets**
   ```
   Error: Azure AD configuration is missing. Please ensure AZURE_CLIENT_ID and AZURE_CLIENT_SECRET are set in AWS Amplify secrets.
   ```
   - **Solution**: Configure the required secrets in AWS Amplify console

2. **Invalid Configuration**
   ```
   Error: Invalid Azure AD configuration
   ```
   - **Solution**: Verify all required fields are present and valid

3. **Runtime Errors**
   ```
   Error: Microsoft authentication not configured properly
   ```
   - **Solution**: Check AWS Amplify secrets configuration and deployment

### Debugging

The application provides comprehensive logging:

```typescript
// Check configuration status
console.log('Azure configuration status:', {
  clientId: config.clientId ? 'SET' : 'NOT SET',
  clientSecret: config.clientSecret ? 'SET' : 'NOT SET',
  tenantId: config.tenantId || 'NOT SET',
  redirectUri: config.redirectUri || 'NOT SET',
});
```

## Migration from Environment Variables

### Before (Environment Variables)

```typescript
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
```

### After (AWS Amplify Secrets)

```typescript
const config = await getAzureConfig();
const clientId = config.clientId;
const clientSecret = config.clientSecret;
```

## Security Benefits

1. **Centralized Secret Management** - All secrets managed in AWS Amplify
2. **Encryption at Rest** - Secrets encrypted using AWS KMS
3. **Access Control** - Fine-grained permissions for secret access
4. **Audit Logging** - Track secret access and modifications
5. **Rotation Support** - Easy secret rotation without code changes

## Best Practices

1. **Use Descriptive Secret Names** - Clear naming convention for easy management
2. **Regular Secret Rotation** - Rotate secrets periodically for security
3. **Least Privilege Access** - Grant minimal required permissions
4. **Monitor Secret Usage** - Track access patterns and anomalies
5. **Backup Configuration** - Keep backup of secret values in secure location

## Troubleshooting

### Check Secret Configuration

1. Verify secrets are set in AWS Amplify console
2. Check secret names match exactly (case-sensitive)
3. Ensure application is redeployed after secret changes

### Debug Runtime Issues

1. Check application logs for configuration status
2. Verify fallback values are appropriate for your environment
3. Test secret resolution in development environment first

### Common Solutions

1. **Secrets not loading**: Redeploy application after setting secrets
2. **Invalid configuration**: Check secret values and naming
3. **Runtime errors**: Verify all required secrets are configured

## Support

For additional help with AWS Amplify secrets:

- [AWS Amplify Secrets Documentation](https://docs.amplify.aws/react/build-a-backend/auth/)
- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

## Example Implementation

Here's a complete example of using AWS Amplify secrets for Azure AD:

```typescript
// lib/auth/amplify-config.ts
import { defineAuth, secret } from '@aws-amplify/backend';
import { getAzureConfig as getRuntimeAzureConfig } from '../amplify-runtime-env';

export const auth = defineAuth({
  loginWith: {
    email: true,
  }
});

export async function getAzureConfig(): Promise<AzureConfig> {
  try {
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
```

This implementation provides a robust, secure way to manage Azure AD credentials using AWS Amplify secrets while maintaining backward compatibility and providing comprehensive error handling.
