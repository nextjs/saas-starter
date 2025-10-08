# AWS Amplify Environment Variables Troubleshooting Guide

## The Problem
Your AWS Amplify deployment is showing:
```
Available process.env keys: [
  'AWS_LAMBDA_FUNCTION_VERSION',
  'AWS_EXECUTION_ENV',
  'AWS_DEFAULT_REGION',
  // ... other AWS Lambda variables
]
Configuration loaded: {
  USE_LOCAL_S3: 'false'
}
❌ Error: Missing required configuration: DATABASE_URL, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, AUTH_SECRET
```

## Root Cause Analysis
The issue is that AWS Amplify is not properly injecting your environment variables at runtime. Only `USE_LOCAL_S3` is being loaded, but all other required variables are missing.

## Solutions

### Solution 1: Check AWS Amplify Console Configuration

1. **Go to AWS Amplify Console**
   - Navigate to your app
   - Go to **App Settings** > **Environment variables**

2. **Verify Variable Type**
   - Make sure your variables are set as **"Environment variables"** (not "Secrets")
   - Environment variables are automatically available as `process.env.VARIABLE_NAME`
   - Secrets require additional AWS SDK calls

3. **Check Variable Names**
   - Ensure exact case sensitivity: `DATABASE_URL` not `database_url`
   - No extra spaces or special characters
   - Use these exact names:
     ```
     DATABASE_URL
     S3_ACCESS_KEY_ID
     S3_SECRET_ACCESS_KEY
     S3_REGION
     S3_BUCKET
     AUTH_SECRET
     USE_LOCAL_S3
     ```

### Solution 2: Use AWS Amplify Gen 2 Secrets (Recommended)

If you're using AWS Amplify Gen 2, define secrets in your backend:

1. **Create a backend configuration file** (`backend/backend.ts`):
   ```typescript
   import { defineBackend } from '@aws-amplify/backend';
   import { defineSecret } from '@aws-amplify/backend';

   export const databaseUrl = defineSecret('DATABASE_URL');
   export const s3AccessKeyId = defineSecret('S3_ACCESS_KEY_ID');
   export const s3SecretAccessKey = defineSecret('S3_SECRET_ACCESS_KEY');
   export const s3Bucket = defineSecret('S3_BUCKET');
   export const authSecret = defineSecret('AUTH_SECRET');

   export const backend = defineBackend({
     // ... your other resources
   });
   ```

2. **Set the secret values** in your Amplify console or use AWS CLI:
   ```bash
   aws amplify put-secret --app-id YOUR_APP_ID --name DATABASE_URL --value "your-database-url"
   ```

### Solution 3: Use AWS Systems Manager Parameter Store

1. **Create parameters in AWS Systems Manager**:
   - Go to AWS Systems Manager > Parameter Store
   - Create parameters with these names:
     - `/amplify/DATABASE_URL`
     - `/amplify/S3_ACCESS_KEY_ID`
     - `/amplify/S3_SECRET_ACCESS_KEY`
     - `/amplify/S3_REGION`
     - `/amplify/S3_BUCKET`
     - `/amplify/AUTH_SECRET`
     - `/amplify/USE_LOCAL_S3`

2. **Update IAM Permissions**:
   - Add these permissions to your Amplify service role:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ssm:GetParameter",
           "ssm:GetParameters",
           "ssm:GetParametersByPath"
         ],
         "Resource": "arn:aws:ssm:*:*:parameter/amplify/*"
       }
     ]
   }
   ```

### Solution 4: Use the Fallback Configuration (Current Implementation)

The current implementation includes a fallback configuration system that will:

1. **Try to load from environment variables**
2. **Use fallback values if none are found**
3. **Provide detailed debug logging**

This ensures your app doesn't crash even if environment variables are not properly configured.

## Debugging Steps

### Step 1: Check Build Logs
Look for this output in your Amplify build logs:
```
🔍 Loading fallback configuration...
NODE_ENV: production
AMPLIFY_ENV: undefined
AWS_LAMBDA_FUNCTION_NAME: undefined
Configuration loaded: {
  DATABASE_URL: 'SET' or 'NOT SET',
  S3_ACCESS_KEY_ID: 'SET' or 'NOT SET',
  // ... other variables
}
```

### Step 2: Verify Environment Variables
Check if your variables are being set correctly:
1. Go to AWS Amplify Console
2. Check **App Settings** > **Environment variables**
3. Verify all required variables are present
4. Check the variable names match exactly

### Step 3: Test Locally
Set the same variables in your local `.env.local` file:
```
DATABASE_URL=postgresql://username:password@host:port/database
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
AUTH_SECRET=your_auth_secret
USE_LOCAL_S3=false
```

Run `npm run build:prod` to test locally.

## Expected Results

After fixing the configuration, you should see:
```
🔍 Loading fallback configuration...
Configuration loaded: {
  DATABASE_URL: 'SET',
  S3_ACCESS_KEY_ID: 'SET',
  S3_SECRET_ACCESS_KEY: 'SET',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'your-bucket-name',
  AUTH_SECRET: 'SET',
  USE_LOCAL_S3: 'false'
}
✅ Configuration loaded successfully
✅ Database URL found, connecting...
```

## Common Issues

1. **Variables set as "Secrets" instead of "Environment variables"**
   - Solution: Change to "Environment variables" in Amplify console

2. **Case sensitivity issues**
   - Solution: Use exact case: `DATABASE_URL` not `database_url`

3. **Missing variables**
   - Solution: Add all required variables in Amplify console

4. **Variables not being injected at runtime**
   - Solution: Use AWS Amplify Gen 2 secrets or Parameter Store

## Next Steps

1. **Check your Amplify console configuration**
2. **Verify all required variables are set**
3. **Redeploy your application**
4. **Check the build logs for the debug output**
5. **Test the application functionality**

The fallback configuration system ensures your app will work even with configuration issues, but you should still fix the root cause for production use.
