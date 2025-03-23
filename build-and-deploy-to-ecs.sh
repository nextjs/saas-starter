#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

AWS_REGION="us-east-2"
AWS_ACCOUNT_ID="209479264707"
APP_NAME="clinicdesk-web-test"
ECR_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_TAG="latest"

echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_URL}"

echo "Building Docker image..."
docker build \
  --platform linux/amd64 \
  --target prod \
  -t "${APP_NAME}:${IMAGE_TAG}" \
  --no-cache \
  .

echo "Tagging image..."
docker tag "${APP_NAME}:${IMAGE_TAG}" "${ECR_URL}/${APP_NAME}:${IMAGE_TAG}"

echo "Pushing image to ECR..."
docker push "${ECR_URL}/${APP_NAME}:${IMAGE_TAG}"

echo "Successfully pushed ${APP_NAME}:${IMAGE_TAG} to ECR"

echo "Updating ECS service..."
aws ecs update-service \
  --region "${AWS_REGION}" \
  --cluster "${APP_NAME}" \
  --service "${APP_NAME}" \
  --force-new-deployment

echo "Successfully updated ECS service ${APP_NAME}"
echo "Done..."
