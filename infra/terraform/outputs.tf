output "server_ecr_repository_url" {
  description = "ECR Repository URL for Server"
  value       = aws_ecr_repository.server.repository_url
}

output "client_ecr_repository_url" {
  description = "ECR Repository URL for Client"
  value       = aws_ecr_repository.client.repository_url
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}
