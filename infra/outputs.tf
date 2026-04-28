output "ecr_repository_url" {
  description = "ECR repository URL for Docker images."
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.app.name
}

output "ecs_service_name" {
  description = "ECS service name."
  value       = aws_ecs_service.app.name
}

output "ecs_task_definition_arn" {
  description = "ECS task definition ARN."
  value       = aws_ecs_task_definition.app.arn
}

output "ecs_container_name" {
  description = "Container name used by GitHub Actions render step."
  value       = var.app_name
}

output "alb_dns_name" {
  description = "Public ALB DNS name."
  value       = aws_lb.app.dns_name
}

output "cloudwatch_log_group_name" {
  description = "CloudWatch log group for ECS task logs."
  value       = aws_cloudwatch_log_group.app.name
}
