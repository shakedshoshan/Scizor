# scizor/terraform/secrets.tf
resource "aws_secretsmanager_secret" "openai_api_key_secret" {
  name        = "scizor/openai_api_key/${var.environment}"
  description = "OpenAI API Key for Scizor backend in ${var.environment} environment"
  tags = {
    Project = "Scizor"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "openai_api_key_secret_version" {
  secret_id     = aws_secretsmanager_secret.openai_api_key_secret.id
  secret_string = jsonencode({
    OPENAI_API_KEY = var.openai_api_key
  })
}
