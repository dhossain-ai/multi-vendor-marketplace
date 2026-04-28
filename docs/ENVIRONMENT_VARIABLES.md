# Environment Variables

Environment variables are split across local development, GitHub Actions, and ECS runtime.

## Local Development

Copy the example file:

```powershell
Copy-Item .env.example .env.local
```

Never commit `.env.local`. The `.gitignore` already ignores `.env*` except `.env.example`.

## Public vs. Private Variables

Public variables are exposed to browser code when prefixed with `NEXT_PUBLIC_`.

Private variables must stay server-side and should be stored in GitHub Secrets, AWS SSM Parameter Store, or AWS Secrets Manager.

## Application Variables

| Name                            | Scope                       | Notes                                                                   |
| ------------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`           | Public                      | Public application base URL.                                            |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public                      | Supabase project URL. Required for browser and server Supabase clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public                      | Supabase anon key. Public, but environment-specific.                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Private                     | Server-only privileged Supabase key. Never expose to browser code.      |
| `STRIPE_SECRET_KEY`             | Private                     | Stripe test-mode secret key for server-side checkout/session work.      |
| `STRIPE_PUBLISHABLE_KEY`        | Public or future client use | Present in `.env.example`; currently keep environment-specific.         |
| `STRIPE_WEBHOOK_SECRET`         | Private                     | Signing secret for deployed Stripe webhook endpoint.                    |

## GitHub Actions Secrets

Deployment requires:

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

The CI workflow uses safe placeholder public values and does not need private Supabase or Stripe secrets.

## ECS Task Environment

Use plain ECS environment variables only for non-sensitive values:

- `NODE_ENV`
- `PORT`
- `HOSTNAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use ECS secrets for sensitive values:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Supabase Notes

- The anon key is designed for browser use, but it still belongs to a specific Supabase project and should be handled intentionally.
- The service role key bypasses Row Level Security and must only be available to trusted server-side runtime code.

## Stripe Notes

- Use Stripe test-mode keys for portfolio/demo deployments.
- Use a webhook secret generated for the live deployed endpoint, not a local Stripe CLI forwarding secret.
