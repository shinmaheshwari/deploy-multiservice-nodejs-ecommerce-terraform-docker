output "public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.app.public_ip
}

output "public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.app.public_dns
}

output "frontend_url" {
  description = "Open this in a browser (allow 2-4 min after apply for user-data to finish)"
  value       = "http://${aws_instance.app.public_ip}"
}

output "health_check_urls" {
  description = "Backend health endpoints, proxied through the frontend's nginx"
  value = {
    user    = "http://${aws_instance.app.public_ip}/svc/user/health"
    product = "http://${aws_instance.app.public_ip}/svc/product/health"
    cart    = "http://${aws_instance.app.public_ip}/svc/cart/health"
    order   = "http://${aws_instance.app.public_ip}/svc/order/health"
  }
}
