variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Short application name used in AWS resource names."
  type        = string
  default     = "marketplace"
}

variable "environment" {
  description = "Deployment environment name, such as dev, staging, or prod."
  type        = string
  default     = "prod"
}

variable "vpc_id" {
  description = "Existing VPC ID where ALB and ECS tasks will run."
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for the ALB and public Fargate tasks. For production, consider private ECS subnets plus NAT."
  type        = list(string)
}

variable "container_port" {
  description = "Container port exposed by the Next.js server."
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Number of ECS tasks to keep running."
  type        = number
  default     = 1
}

variable "cpu" {
  description = "Fargate task CPU units."
  type        = number
  default     = 512
}

variable "memory" {
  description = "Fargate task memory in MiB."
  type        = number
  default     = 1024
}

variable "image_uri" {
  description = "Initial container image URI. GitHub Actions replaces this on deploy."
  type        = string
}

variable "environment_variables" {
  description = "Non-sensitive environment variables for the ECS task."
  type        = map(string)
  default = {
    NODE_ENV                     = "production"
    PORT                         = "3000"
    HOSTNAME                     = "0.0.0.0"
    NEXT_PUBLIC_APP_URL          = "https://your-domain.example.com"
    NEXT_PUBLIC_SUPABASE_URL     = "https://your-project-ref.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY = "replace-with-public-anon-key"
  }
}

variable "secret_arns" {
  description = "Map of ECS secret names to SSM Parameter Store or Secrets Manager ARNs."
  type        = map(string)
  default     = {}
}

variable "health_check_path" {
  description = "ALB target group health check path."
  type        = string
  default     = "/api/health"
}

variable "certificate_arn" {
  description = "Optional ACM certificate ARN for HTTPS. Leave empty to create HTTP only."
  type        = string
  default     = ""
}
