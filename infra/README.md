# AWS Terraform Scaffold

This directory is a realistic starting scaffold for deploying the marketplace to AWS with:

- Amazon ECR for Docker images
- Amazon ECS Fargate for containers
- Application Load Balancer for public HTTP traffic
- CloudWatch Logs for application logs
- IAM roles for ECS task execution and runtime permissions
- Security groups for ALB-to-ECS traffic

The scaffold intentionally uses variables for account-specific values. Review every variable before applying it in a real AWS account.

## Suggested Flow

1. Create a remote Terraform state backend before production use, such as S3 plus DynamoDB locking.
2. Create a `terraform.tfvars` file locally or in your CI environment.
3. Store sensitive application values in AWS SSM Parameter Store or Secrets Manager.
4. Run:

```bash
terraform init
terraform plan
terraform apply
```

## Required Inputs

- `aws_region`
- `app_name`
- `environment`
- `vpc_id`
- `public_subnet_ids`
- `image_uri`
- `environment_variables`
- `secret_arns`

Use the outputs to populate GitHub Actions secrets such as `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`, `ECS_TASK_DEFINITION`, and `ECS_CONTAINER_NAME`.

## Notes

This scaffold creates an HTTP listener by default. For production, add an ACM certificate, enable HTTPS, redirect HTTP to HTTPS, and configure your DNS records.
