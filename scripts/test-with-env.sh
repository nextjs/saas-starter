#!/bin/bash

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Set default values if not provided
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:54322/postgres}"
export AUTH_SECRET="${AUTH_SECRET:-test-secret-key}"
export USE_LOCAL_S3="${USE_LOCAL_S3:-true}"
export S3_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID:-test}"
export S3_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY:-test}"
export S3_REGION="${S3_REGION:-us-east-1}"
export S3_BUCKET="${S3_BUCKET:-test-bucket}"
export S3_ENDPOINT="${S3_ENDPOINT:-http://localhost:4566}"

# Run the test with the environment variables
npx playwright test "$@"
