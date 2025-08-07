provider "aws" {
  region = "us-east-1"
}

data "aws_ami" "windows_2022" {
  most_recent = true
  owners = ["amazon"]
  filter {
    name = "name"
    values = ["Windows_Server-2022-English-Full-Base-*"]
  }
}

# Create VPC
resource "aws_vpc" "scizor_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "scizor-vpc"
  }
}

# Create Internet Gateway
resource "aws_internet_gateway" "scizor_igw" {
  vpc_id = aws_vpc.scizor_vpc.id

  tags = {
    Name = "scizor-igw"
  }
}

# Create public subnet
resource "aws_subnet" "scizor_public_subnet" {
  vpc_id                  = aws_vpc.scizor_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "scizor-public-subnet"
  }
}

# Create route table
resource "aws_route_table" "scizor_rt" {
  vpc_id = aws_vpc.scizor_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.scizor_igw.id
  }

  tags = {
    Name = "scizor-rt"
  }
}

# Associate route table with subnet
resource "aws_route_table_association" "scizor_rta" {
  subnet_id      = aws_subnet.scizor_public_subnet.id
  route_table_id = aws_route_table.scizor_rt.id
}

# Create security group
resource "aws_security_group" "scizor_sg" {
  name        = "scizor-security-group"
  description = "Security group for Scizor backend"
  vpc_id      = aws_vpc.scizor_vpc.id

  # Allow RDP access (Windows)
  ingress {
    description = "RDP"
    from_port   = 3389
    to_port     = 3389
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTP
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "scizor-sg"
  }
}

resource "aws_instance" "scizor_backend" {
  ami                    = data.aws_ami.windows_2022.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.scizor_public_subnet.id
  vpc_security_group_ids = [aws_security_group.scizor_sg.id]
  
  tags = {
    Name = "scizor-backend"
  }
}

# Outputs
output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.scizor_backend.public_ip
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.scizor_backend.id
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.scizor_vpc.id
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.scizor_sg.id
}