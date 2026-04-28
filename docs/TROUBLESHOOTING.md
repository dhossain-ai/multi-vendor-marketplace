# Troubleshooting

## Docker Build Fails in GitHub Actions

- Open the failed `Docker build` step in the CI or deploy workflow.
- Check whether `npm ci` failed because `package-lock.json` is out of sync with `package.json`.
- Check whether `npm run build` failed inside the Docker builder stage.
- Confirm the public build args are available:
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## npm Build Fails

- Run `npm run typecheck` and `npm run lint` locally if possible.
- Check whether a route is trying to read missing environment variables during build.
- Confirm `next.config.ts` contains `output: "standalone"`.
- Review the GitHub Actions build logs for the first real TypeScript or Next.js error.

## Missing Environment Variables

- Public browser variables must start with `NEXT_PUBLIC_`.
- Private values must not be committed to Git.
- GitHub Actions deploy-time values belong in GitHub Secrets.
- ECS runtime secrets should come from SSM Parameter Store or Secrets Manager.
- The ECS task definition must reference the right secret ARNs.

## ECR Login Fails

- Confirm `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` are set correctly.
- Confirm the IAM user or role can call ECR APIs.
- Confirm the ECR repository exists in the same AWS region used by the workflow.

## ECS Task Keeps Restarting

- Open the ECS service events.
- Open the CloudWatch log group for the task.
- Confirm the container starts on port `3000`.
- Confirm the task has outbound internet access to Supabase and Stripe.
- Confirm private secrets are readable by the ECS task execution role.
- Check whether the app is failing because a required Supabase or Stripe variable is missing.

## ALB Health Check Failing

- Confirm the target group health check path is `/api/health`.
- Confirm the target group port is `3000`.
- Confirm the ECS task security group allows inbound traffic from the ALB security group.
- Confirm the ALB security group allows inbound HTTP or HTTPS from your browser.
- Open `http://<alb-dns-name>/api/health` and check for a `200` response.

## CloudWatch Logs Location

The default scaffold uses a log group like:

```text
/ecs/marketplace-prod
```

Streams are prefixed with `ecs`. Check the newest stream for startup errors, missing environment variables, Supabase errors, or Stripe webhook failures.

## Supabase Connection Issues

- Confirm `NEXT_PUBLIC_SUPABASE_URL` is the correct project URL.
- Confirm `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the public anon key.
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is stored as an ECS secret and is not exposed to the browser.
- Confirm Supabase RLS policies match the intended customer, seller, and admin workflows.
- Confirm the ECS task can make outbound HTTPS requests.

## Stripe Webhook or Env Issues

- Confirm `STRIPE_SECRET_KEY` is a test-mode secret key.
- Confirm `STRIPE_WEBHOOK_SECRET` matches the deployed webhook endpoint, not a local Stripe CLI secret.
- Confirm the webhook URL points to:

```text
https://your-domain.example.com/api/webhooks/stripe
```

- Check CloudWatch logs for `[stripe-webhook]` messages.
