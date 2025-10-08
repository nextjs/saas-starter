#!/bin/bash

# Setup LocalStack for S3 emulation
echo "🚀 Setting up LocalStack S3 emulator..."

# Check if LocalStack is installed
if ! command -v localstack &> /dev/null; then
    echo "Installing LocalStack..."
    pip install localstack
fi

# Start LocalStack in the background
echo "Starting LocalStack..."
localstack start -d

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
sleep 10

# Create S3 bucket
echo "Creating S3 bucket..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://test-bucket --region us-east-1

# Verify bucket creation
echo "Verifying bucket creation..."
aws --endpoint-url=http://localhost:4566 s3 ls

# Configure CORS for the bucket
echo "Configuring CORS..."
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors --bucket test-bucket --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag", "x-amz-version-id"],
      "MaxAgeSeconds": 3000
    }
  ]
}'

echo "✅ LocalStack S3 emulator is ready!"
echo "S3 Endpoint: http://localhost:4566"
echo "Bucket: test-bucket"
echo "CORS: Configured for all origins"
