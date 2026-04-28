# Deployment Guide

This project is prepared for a DevOps-style AWS deployment:

```text
GitHub Actions -> Docker -> Amazon ECR -> ECS Fargate -> ALB -> CloudWatch Logs
```

## Architecture

- GitHub Actions runs CI on pull requests to `main`, pushes to `dev`, and pushes to `feature/**`.
- Docker builds happen remotely in GitHub Actions, which keeps local laptop storage usage low.
- Successful pushes to `main` trigger the ECS deployment workflow.
- The workflow builds a production Docker image, tags it with the Git SHA and `latest`, and pushes both tags to Amazon ECR.
- ECS Fargate runs the Next.js standalone server on port `3000`.
- An Application Load Balancer routes public traffic to the ECS service.
- CloudWatch Logs receives container logs through the `awslogs` driver.

## Branch Flow

- `feature/*`: individual changes and CI verification.
- `dev`: daily development branch and CI verification.
- `main`: production deployment branch. A push or merge to `main` starts the AWS deploy workflow.

## Required GitHub Secrets

Create these in GitHub repository settings before enabling deployment:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_REPOSITORY`
- `ECS_CLUSTER`
- `ECS_SERVICE`
- `ECS_TASK_DEFINITION`
- `ECS_CONTAINER_NAME`
- `LIVE_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`LIVE_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public/runtime configuration values, but storing them in GitHub Secrets keeps the workflow simple and avoids accidental environment drift.

## AWS Resources Required

Provision these manually or with the Terraform scaffold in `infra/`:

- ECR repository for the Docker image.
- ECS cluster.
- ECS Fargate task definition and service.
- Application Load Balancer, listener, target group, and security groups.
- CloudWatch log group, such as `/ecs/marketplace-prod`.
- ECS task execution role and task role.
- SSM Parameter Store or Secrets Manager values for private runtime secrets:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`

## Deployment Workflow

The deployment workflow in `.github/workflows/deploy-ecs.yml` runs only on pushes to `main`.

1. Checks out the repository.
2. Configures AWS credentials from GitHub Secrets.
3. Logs in to Amazon ECR.
4. Builds the Docker image from `Dockerfile`.
5. Tags the image as `<git-sha>` and `latest`.
6. Pushes both image tags to ECR.
7. Renders the ECS task definition with the new image URI.
8. Deploys the task definition to the ECS service.
9. Waits for ECS service stability.
10. Runs smoke tests against:
    - `GET /`
    - `GET /api/health`

## Docker Notes

The Dockerfile uses Next.js standalone output and starts the app with `node server.js`. Local Docker is optional:

```bash
npm run docker:build
npm run docker:run
```

GitHub Actions is the primary Docker build environment for this project.

## Health Check

The unauthenticated health endpoint is:

```text
GET /api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "marketplace",
  "timestamp": "2026-04-29T00:00:00.000Z"
}
```

Use this endpoint for ALB target group checks, ECS container checks, and post-deployment smoke tests.
