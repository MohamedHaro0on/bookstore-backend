resource "aws_route_table" "rtb" {
  vpc_id = var.vpc_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = var.igw_id
  }

  tags = {
    Name = "MyRouteTable"
  }
}

resource "aws_route_table_association" "rt_ass1" {
  subnet_id      = aws_subnet.public_sub1.id
  route_table_id = var.rtb_id
}
