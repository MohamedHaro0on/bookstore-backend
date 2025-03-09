terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

output "Bookec2pubIP" {
  value = aws_instance.Bookec2.public_ip
}

