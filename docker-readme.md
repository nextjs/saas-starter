# Docker Setup for ClinicDesk

This guide explains how to use Docker to run the ClinicDesk application locally and deploy it to AWS ECS/ECR.

## Local Development

### Prerequisites
- Docker and Docker Compose installed on your machine
- AWS CLI configured (for deployment)

### Running Locally

1. Create a `.env` file in the root directory with your environment variables (see `.env.example` for reference)

2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

3. Access the application at http://localhost:3000

4. To run database migrations and seed data:
   ```bash
   docker-compose exec web npm run db:setup
   docker-compose exec web npm run db:seed
   ```

## AWS Deployment

### Pushing to ECR

1. Authenticate Docker to your Amazon ECR registry:
   ```bash
   aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.<your-region>.amazonaws.com
   ```

2. Create an ECR repository (if you haven't already):
   ```bash
   aws ecr create-repository --repository-name clinicdesk --region <your-region>
   ```

3. Build, tag, and push the Docker image:
   ```bash
   docker build -t clinicdesk .
   docker tag clinicdesk:latest <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/clinicdesk:latest
   docker push <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/clinicdesk:latest
   ```

### Deploying to ECS

1. Create an ECS task definition (example):
   ```json
   {
     "family": "clinicdesk",
     "networkMode": "awsvpc",
     "executionRoleArn": "arn:aws:iam::<your-account-id>:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "clinicdesk",
         "image": "<your-account-id>.dkr.ecr.<your-region>.amazonaws.com/clinicdesk:latest",
         "essential": true,
         "portMappings": [
           {
             "containerPort": 3000,
             "hostPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           { "name": "NODE_ENV", "value": "production" },
           { "name": "BASE_URL", "value": "https://your-domain.com" }
         ],
         "secrets": [
           { "name": "POSTGRES_URL", "valueFrom": "arn:aws:ssm:region:account-id:parameter/clinicdesk/POSTGRES_URL" },
           { "name": "AUTH_SECRET", "valueFrom": "arn:aws:ssm:region:account-id:parameter/clinicdesk/AUTH_SECRET" },
           { "name": "STRIPE_SECRET_KEY", "valueFrom": "arn:aws:ssm:region:account-id:parameter/clinicdesk/STRIPE_SECRET_KEY" },
           { "name": "STRIPE_WEBHOOK_SECRET", "valueFrom": "arn:aws:ssm:region:account-id:parameter/clinicdesk/STRIPE_WEBHOOK_SECRET" }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/clinicdesk",
             "awslogs-region": "<your-region>",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ],
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "1024",
     "memory": "2048"
   }
   ```

2. Create a service in your ECS cluster using the AWS Management Console or CLI

3. For production deployments, consider setting up a CI/CD pipeline using AWS CodePipeline or GitHub Actions

## Environment Variables

For security, store your production environment variables in AWS Systems Manager Parameter Store or AWS Secrets Manager, and reference them in your ECS task definition.

## Database Considerations

For production, use Amazon RDS for PostgreSQL instead of the containerized database. Update your `POSTGRES_URL` environment variable accordingly.
