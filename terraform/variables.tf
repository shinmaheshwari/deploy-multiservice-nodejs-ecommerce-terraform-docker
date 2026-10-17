variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "dockerhub_username" {
  description = "Docker Hub username that owns the ecom-* images"
  type        = string
}

variable "image_tag" {
  description = "Tag of the images to deploy"
  type        = string
  default     = "latest"
}

variable "instance_type" {
  description = "EC2 instance type (MongoDB + 4 Node services + nginx need ~2 GB RAM)"
  type        = string
  default     = "t3.small"
}

variable "jwt_secret" {
  description = "JWT signing secret for the user service"
  type        = string
  default     = "change-me-in-tfvars"
  sensitive   = true
}

variable "ssh_cidr" {
  description = "CIDR allowed to SSH (use your_ip/32). Set to null to disable SSH."
  type        = string
  default     = "0.0.0.0/0"
}

variable "key_name" {
  description = "Optional existing EC2 key pair name for SSH. Leave null to use EC2 Instance Connect only."
  type        = string
  default     = null
}
