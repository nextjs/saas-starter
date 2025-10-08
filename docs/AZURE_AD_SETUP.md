# Azure AD App Registration Setup

This guide will help you set up an Azure AD application for Microsoft 365 authentication in the Sunlighten - Partner Storage.

## Prerequisites

- Azure AD tenant with admin access
- Microsoft 365 subscription (for testing with @sunlighten.com domain)

## Step 1: Create Azure AD App Registration

1. **Navigate to Azure Portal**
   - Go to [Azure Portal](https://portal.azure.com)
   - Sign in with your admin account

2. **Access Azure Active Directory**
   - In the left sidebar, click "Azure Active Directory"
   - Click "App registrations" in the left menu
   - Click "New registration"

3. **Configure App Registration**
   - **Name**: `Sunlighten - Partner Storage`
   - **Supported account types**: Select "Accounts in this organizational directory only"
   - **Redirect URI**: 
     - Platform: `Web`
     - URI: `   ` (for development)
     - Add production URI: `https://partner-storage.infra.sunlighten.com/api/auth/microsoft/callback`

4. **Complete Registration**
   - Click "Register"
   - Note down the **Application (client) ID** and **Directory (tenant) ID**

## Step 2: Configure Authentication

1. **Set Redirect URIs**
   - In your app registration, go to "Authentication"
   - Under "Redirect URIs", add:
     - `http://localhost:3000/api/auth/microsoft/callback` (development)
     - `https://partner-storage.infra.sunlighten.com/api/auth/microsoft/callback` (production)
   - Under "Logout URL", add:
     - `http://localhost:3000/sign-in` (development)
     - `https://partner-storage.infra.sunlighten.com/sign-in` (production)

2. **Configure Implicit Grant**
   - Under "Implicit grant and hybrid flows"
   - Check "Access tokens" and "ID tokens"
   - Click "Save"

## Step 3: Create Client Secret

1. **Generate Secret**
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Add description: `Partner Storage Secret`
   - Choose expiration (recommend 24 months)
   - Click "Add"

2. **Copy Secret Value**
   - **IMPORTANT**: Copy the secret value immediately (it won't be shown again)
   - Store it securely for environment variables

## Step 4: Configure API Permissions

1. **Add Microsoft Graph Permissions**
   - Go to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Choose "Delegated permissions"
   - Add the following permissions:
     - `User.Read` (to read user profile)
   - Click "Add permissions"

2. **Grant Admin Consent**
   - Click "Grant admin consent for [Your Organization]"
   - Confirm the consent

## Step 5: Configure Domain Restrictions (Optional)

1. **Set Domain Restrictions**
   - Go to "Authentication"
   - Under "Advanced settings"
   - In "Restrict access to users in specific organizations"
   - Add your tenant ID or domain: `sunlighten.com`

## Step 6: Configuration

### Option A: AWS Amplify Secrets (Recommended for Production)

The application now supports AWS Amplify secrets for secure credential management. See [AWS Amplify Secrets Integration](./AWS_AMPLIFY_SECRETS_INTEGRATION.md) for detailed setup instructions.

**Required AWS Amplify Secrets:**
- `AZURE_CLIENT_ID` - Your Azure AD Application Client ID
- `AZURE_CLIENT_SECRET` - Your Azure AD Application Client Secret  
- `AZURE_TENANT_ID` - Your Azure AD Tenant ID
- `AZURE_REDIRECT_URI` - OAuth2 Redirect URI

### Option B: Environment Variables (Development)

For local development, you can still use environment variables in your `.env.local` file:

```bash
# Azure AD Configuration
AZURE_CLIENT_ID=your_application_client_id
AZURE_CLIENT_SECRET=your_client_secret_value
AZURE_TENANT_ID=your_directory_tenant_id

# Application URL (for redirects)
NEXTAUTH_URL=http://localhost:3000  # Change to production URL in production
# Production URL: https://partner-storage.infra.sunlighten.com
```

**Note**: The application will automatically detect and use AWS Amplify secrets when available, falling back to environment variables for development.

## Step 7: Test Configuration

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Microsoft Login**
   - Navigate to `/sign-in`
   - Click "Login with Microsoft 365"
   - Verify you're redirected to Microsoft login
   - Complete authentication with @sunlighten.com account
   - Verify redirect back to dashboard

## Production Deployment

1. **Update Redirect URIs**
   - Add your production domain to redirect URIs in Azure AD:
     - `https://partner-storage.infra.sunlighten.com/api/auth/microsoft/callback`
   - Update `NEXTAUTH_URL` environment variable to:
     - `https://partner-storage.infra.sunlighten.com`

2. **Security Considerations**
   - Use HTTPS in production
   - Rotate client secrets regularly
   - Monitor sign-in logs in Azure AD
   - Consider implementing additional security policies

## Troubleshooting

### Common Issues

1. **"AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application"**
   - Solution: Ensure redirect URI in Azure AD matches exactly with your application URL

2. **"AADSTS65001: The user or administrator has not consented to use the application"**
   - Solution: Grant admin consent for the required permissions

3. **"User not found" error after successful Microsoft login**
   - Solution: Ensure the user exists in your database with the correct email address

4. **Domain validation fails**
   - Solution: Verify the user's email domain is exactly `sunlighten.com`

### Debug Steps

1. Check Azure AD sign-in logs
2. Verify environment variables are set correctly
3. Check application logs for detailed error messages
4. Ensure user exists in database before attempting Microsoft login

## Security Best Practices

1. **Client Secret Management**
   - Store secrets in secure environment variable management
   - Rotate secrets regularly
   - Never commit secrets to version control

2. **Token Security**
   - Tokens are handled server-side only
   - Implement proper token validation
   - Use HTTPS in production

3. **User Management**
   - Only pre-approved users can access the system
   - Regular audit of user access
   - Implement proper logout functionality

## Support

For additional help with Azure AD configuration:
- [Microsoft Graph Documentation](https://docs.microsoft.com/en-us/graph/)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [MSAL Node.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)
