# Rollback Guide

## Roll Back to a Previous ECS Task Definition

Use ECS when the infrastructure is healthy but the latest app image is bad.

1. Open the ECS service in the AWS console.
2. Find the previously healthy task definition revision.
3. Update the ECS service to use that revision.
4. Wait for the service to become stable.
5. Verify:

```text
GET /
GET /api/health
```

6. Check CloudWatch logs for startup or runtime errors.

## Roll Back with AWS CLI

```bash
aws ecs update-service \
  --cluster <cluster-name> \
  --service <service-name> \
  --task-definition <task-definition-family>:<previous-revision>
```

Then wait for stability:

```bash
aws ecs wait services-stable \
  --cluster <cluster-name> \
  --services <service-name>
```

## Re-run Smoke Tests

```bash
curl --fail --location https://your-domain.example.com/
curl --fail --location https://your-domain.example.com/api/health
```

## Revert Git Commit vs. Roll Back ECS

- Roll back ECS when production is broken and needs immediate recovery.
- Revert the Git commit when the code in `main` should no longer represent the desired production state.
- Do both when the deployed image is bad and the bad commit must not deploy again.

## After Rollback

- Record the failed image tag or Git SHA.
- Check CloudWatch logs and ECS service events.
- Fix forward on a feature branch.
- Merge through `dev` or PR flow before deploying to `main` again.
