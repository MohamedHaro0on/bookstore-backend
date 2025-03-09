resource "aws_instance" "Bookec2" {
  ami                         = "ami-04b4f1a9cf54c11d0"
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.public_sub1.id
  vpc_security_group_ids      = [aws_security_group.BookSG.id]
  associate_public_ip_address = true
  key_name                    = aws_key_pair.pubkey.key_name

  tags = {
    Name = "BookStore"
  }
}
