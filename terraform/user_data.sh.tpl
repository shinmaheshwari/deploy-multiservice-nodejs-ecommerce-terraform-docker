#!/bin/bash
exec > >(tee /var/log/user-data.log) 2>&1
set -x

# 1 GB swap so MongoDB + 4 Node services are safe on small instances
fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Install Docker
apt-get update -y
apt-get install -y docker.io
systemctl enable --now docker

# Shared network: containers reach each other by name
docker network create ecom || true

# Database
docker run -d --name mongo --restart always --network ecom \
  -v mongo-data:/data/db mongo:6.0

# Backend services
docker run -d --name user-service --restart always --network ecom \
  -e PORT=3001 -e MONGODB_URI=mongodb://mongo:27017/ecommerce_users -e JWT_SECRET='${jwt_secret}' \
  ${dockerhub_username}/ecom-user-service:${image_tag}

docker run -d --name product-service --restart always --network ecom \
  -e PORT=3002 -e MONGODB_URI=mongodb://mongo:27017/ecommerce_products \
  ${dockerhub_username}/ecom-product-service:${image_tag}

docker run -d --name cart-service --restart always --network ecom \
  -e PORT=3003 -e MONGODB_URI=mongodb://mongo:27017/ecommerce_carts \
  -e PRODUCT_SERVICE_URL=http://product-service:3002 \
  ${dockerhub_username}/ecom-cart-service:${image_tag}

docker run -d --name order-service --restart always --network ecom \
  -e PORT=3004 -e MONGODB_URI=mongodb://mongo:27017/ecommerce_orders \
  -e CART_SERVICE_URL=http://cart-service:3003 \
  -e PRODUCT_SERVICE_URL=http://product-service:3002 \
  -e USER_SERVICE_URL=http://user-service:3001 \
  ${dockerhub_username}/ecom-order-service:${image_tag}

# Frontend (nginx) - the only container published to the internet
docker run -d --name frontend --restart always --network ecom -p 80:80 \
  ${dockerhub_username}/ecom-frontend:${image_tag}

docker ps
