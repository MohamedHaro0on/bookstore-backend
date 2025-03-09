resource "aws_subnet" "public_sub1" {
  vpc_id                  = var.vpc_id
  cidr_block              = "172.31.96.0/20"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "Pub1"
  }
}