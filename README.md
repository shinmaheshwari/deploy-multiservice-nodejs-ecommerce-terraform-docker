# Multi-Service Node.js E-commerce on AWS — Terraform + Docker

Deploys the [AtharvaAI/E-CommerceStore](https://github.com/AtharvaAI/E-CommerceStore) MERN microservices app
(4 Node.js backends + React frontend + MongoDB) to AWS EC2 using **Terraform** for infrastructure and **Docker** for the services.
`terraform apply` provisions everything and prints the public URL.

## Architecture

```
Internet ──:80──▶ EC2 (Ubuntu 22.04, public subnet, 10.0.1.0/24)
                   └─ Docker network "ecom"
                        ├─ frontend  (nginx + React build)  :80   ← only public container
                        │     ├─ /svc/user/*    → user-service    :3001
                        │     ├─ /svc/product/* → product-service :3002
                        │     ├─ /svc/cart/*    → cart-service    :3003
                        │     └─ /svc/order/*   → order-service   :3004
                        └─ mongo :27017 (internal only)
```

| Service | Image | Port |
|---|---|---|
| frontend (nginx) | `<user>/ecom-frontend` | 80 |
| user-service | `<user>/ecom-user-service` | 3001 |
| product-service | `<user>/ecom-product-service` | 3002 |
| cart-service | `<user>/ecom-cart-service` | 3003 |
| order-service | `<user>/ecom-order-service` | 3004 |

### Design decisions
- **Relative API URLs in the frontend.** CRA bakes `REACT_APP_*` values at build time and the browser calls the APIs directly,
  but the EC2 IP is unknown until after `terraform apply`. The frontend is built with `/svc/<name>` base URLs and nginx proxies them
  to the right container, so the image never needs rebuilding per environment and only port 80 is public.
- **Custom VPC** with one public subnet, internet gateway and route table (all in Terraform).
- **Security group:** 80 (and 3000) public; 3001–3004 allowed only from members of the same SG; SSH 22 configurable (`ssh_cidr`).
- **MongoDB runs as a container** on the same instance (no external DB needed); data persisted in a Docker volume.
- **user-data** installs Docker, creates the network, and runs all containers with `--restart always`.

## Prerequisites
Docker, Terraform >= 1.3, AWS CLI configured (`aws configure`), a Docker Hub account, Node 18+ (only for the optional seed script).

## 1. Build, test locally, push images
```bash
export DH=<dockerhub-username>
docker login

# local end-to-end test (frontend on http://localhost:8080)
DH=$DH docker compose up -d --build
curl localhost:8080/svc/user/health
node scripts/seed.js http://localhost:8080     # optional sample data
docker compose down

# push (images were tagged by compose as $DH/ecom-*:latest)
for s in user-service product-service cart-service order-service frontend; do docker push $DH/ecom-$s:latest; done
```
Make the Docker Hub repositories **public**.

## 2. Provision and deploy
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # edit values
terraform init
terraform validate
terraform plan
terraform apply
```
Outputs: `public_ip`, `public_dns`, `frontend_url`, `health_check_urls`. Allow 2–4 minutes after apply for user-data to finish.

## 3. Verify
- Open `frontend_url` — the React storefront loads.
- `http://<public_ip>/svc/user/health` (and `product`, `cart`, `order`) return `{"status":"OK"}` for each service.
- Optional sample data: `node scripts/seed.js http://<public_ip>`
- On the server (EC2 Instance Connect): `sudo docker ps`, `sudo docker logs user-service`, `cat /var/log/user-data.log`

## Screenshots
Add images under `docs/screenshots/` and reference them here:
1. Docker Hub repositories
2. `terraform apply` complete + outputs
3. AWS Console: VPC, subnet, security group, EC2
4. Browser: storefront at the public IP
5. Health endpoints for all four backends
6. `docker ps` on the instance

## Cleanup
```bash
cd terraform && terraform destroy
```

## Credits
Application code from [AtharvaAI/E-CommerceStore](https://github.com/AtharvaAI/E-CommerceStore) (MIT).
Added here: Dockerfiles, nginx config, docker-compose, Terraform, seed script, docs.
# deploy-multiservice-nodejs-ecommerce-terraform-docker
