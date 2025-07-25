# scizor/terraform/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "scizor-tf-state-${var.aws_account_id}-${var.aws_region}" # Unique bucket name
    key            = "backend/terraform.tfstate"
    region         = "us-east-1" # Must match your provider region
    encrypt        = true
    dynamodb_table = "scizor-tf-state-lock"
  }
}

provider "aws" {
  region = var.aws_region
} 