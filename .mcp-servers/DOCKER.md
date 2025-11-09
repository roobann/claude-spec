# Docker Deployment for MCP Servers

Complete guide for deploying claude-spec MCP servers using Docker and Docker Compose.

## Quick Start

### Build All Images

```bash
cd .mcp-servers
docker compose build
```

### Start All Servers

```bash
# Create .env file with your configuration
cp .env.example .env
# Edit .env with your credentials

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Start Individual Server

```bash
# Backend expert only
docker compose up -d backend-expert

# Frontend expert only
docker compose up -d frontend-expert

# DevOps expert only
docker compose up -d devops-expert
```

## Environment Configuration

### Create .env File

```bash
# .mcp-servers/.env

# Database Configuration (for backend-expert and database-expert)
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_TYPE=postgres

# MySQL (alternative)
MYSQL_URL=mysql://user:password@host:3306/database

# AWS Configuration (for infrastructure-expert)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Docker Configuration (for devops-expert)
DOCKER_HOST=unix:///var/run/docker.sock
DEPLOY_COMMAND=docker compose up -d
COMPOSE_FILE=docker compose.yml
SECRETS_PATH=/run/secrets

# Frontend Configuration (for frontend-expert)
HEADLESS=true
```

### Example .env.example

Create this file for reference:

```bash
# .mcp-servers/.env.example

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
DATABASE_TYPE=postgres

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Docker
DOCKER_HOST=unix:///var/run/docker.sock
DEPLOY_COMMAND=docker compose up -d

# Frontend
HEADLESS=true
```

## Individual Server Configuration

### Backend Expert

```bash
docker run -d \
  --name mcp-backend-expert \
  -e DATABASE_URL="postgresql://user:password@localhost:5432/db" \
  -e DATABASE_TYPE="postgres" \
  -p 3000:3000 \
  claude-spec/backend-expert:latest
```

### Frontend Expert

```bash
docker run -d \
  --name mcp-frontend-expert \
  -e HEADLESS=true \
  -p 3001:3000 \
  claude-spec/frontend-expert:latest
```

### DevOps Expert

```bash
docker run -d \
  --name mcp-devops-expert \
  -e DOCKER_HOST="unix:///var/run/docker.sock" \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -p 3002:3000 \
  claude-spec/devops-expert:latest
```

### Database Expert

```bash
docker run -d \
  --name mcp-database-expert \
  -e DATABASE_URL="postgresql://user:password@localhost:5432/db" \
  -e DATABASE_TYPE="postgres" \
  -p 3003:3000 \
  claude-spec/database-expert:latest
```

### Infrastructure Expert

```bash
docker run -d \
  --name mcp-infrastructure-expert \
  -e AWS_REGION="us-east-1" \
  -e AWS_ACCESS_KEY_ID="your_key" \
  -e AWS_SECRET_ACCESS_KEY="your_secret" \
  -p 3004:3000 \
  claude-spec/infrastructure-expert:latest

# Or mount AWS credentials
docker run -d \
  --name mcp-infrastructure-expert \
  -e AWS_REGION="us-east-1" \
  -v ~/.aws:/home/mcp/.aws:ro \
  -p 3004:3000 \
  claude-spec/infrastructure-expert:latest
```

## Building Images

### Build All Images

```bash
cd .mcp-servers
docker compose build
```

### Build Individual Images

```bash
# Backend expert
cd backend-expert
docker build -t claude-spec/backend-expert:latest .

# Frontend expert
cd frontend-expert
docker build -t claude-spec/frontend-expert:latest .

# DevOps expert
cd devops-expert
docker build -t claude-spec/devops-expert:latest .

# Database expert
cd database-expert
docker build -t claude-spec/database-expert:latest .

# Infrastructure expert
cd infrastructure-expert
docker build -t claude-spec/infrastructure-expert:latest .
```

### Build with Version Tags

```bash
VERSION=1.0.0
docker build -t claude-spec/backend-expert:$VERSION -t claude-spec/backend-expert:latest .
```

## Health Checks

All servers include health checks. Check status:

```bash
# Via docker compose
docker compose ps

# Via docker
docker ps --filter health=healthy
docker ps --filter health=unhealthy

# Inspect specific container
docker inspect --format='{{.State.Health.Status}}' mcp-backend-expert
```

## Networking

### Default Network

All services run on `mcp-network` bridge network:

```bash
# List networks
docker network ls | grep mcp

# Inspect network
docker network inspect mcp-network

# Services can communicate via service names
# Example: backend-expert can reach database-expert at http://database-expert:3000
```

### External Access

Map ports to host for external access:

```yaml
services:
  backend-expert:
    ports:
      - "3000:3000"  # Host:Container
```

## Volumes

### Persistent Data

```yaml
services:
  database-expert:
    volumes:
      # Mount migrations directory
      - ./migrations:/app/migrations

  devops-expert:
    volumes:
      # Mount Docker socket (read-only recommended)
      - /var/run/docker.sock:/var/run/docker.sock:ro
      # Mount workspace for docker compose files
      - ${PWD}:/workspace:ro

  infrastructure-expert:
    volumes:
      # Mount AWS credentials
      - ${HOME}/.aws:/home/mcp/.aws:ro
```

## Security

### Best Practices

1. **Non-root User**: All containers run as non-root user (UID 1001)
2. **Read-only Mounts**: Use `:ro` for sensitive mounts
3. **Secrets Management**: Use Docker secrets or environment variables
4. **Network Isolation**: Use bridge networks, not host networking
5. **Image Scanning**: Scan images for vulnerabilities

### Using Docker Secrets

```bash
# Create secrets
echo "postgresql://user:password@host:5432/db" | docker secret create db_url -

# Use in docker compose.yml
services:
  backend-expert:
    secrets:
      - db_url
    environment:
      - DATABASE_URL_FILE=/run/secrets/db_url

secrets:
  db_url:
    external: true
```

### Security Scanning

```bash
# Scan image with Docker Scout
docker scout cves claude-spec/backend-expert:latest

# Or use Trivy
trivy image claude-spec/backend-expert:latest
```

## Production Deployment

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker compose.yml mcp-stack

# List services
docker service ls

# Scale service
docker service scale mcp-stack_backend-expert=3

# Remove stack
docker stack rm mcp-stack
```

### Kubernetes

Convert docker compose to Kubernetes manifests:

```bash
# Using kompose
kompose convert -f docker compose.yml

# Apply to cluster
kubectl apply -f .
```

### Resource Limits

Add resource constraints in docker compose.yml:

```yaml
services:
  backend-expert:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Logging

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend-expert

# Last 100 lines
docker compose logs --tail=100 backend-expert

# Since timestamp
docker compose logs --since="2025-01-07T10:00:00" backend-expert
```

### Log Drivers

Configure logging in docker compose.yml:

```yaml
services:
  backend-expert:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Centralized Logging

```yaml
services:
  backend-expert:
    logging:
      driver: "syslog"
      options:
        syslog-address: "tcp://192.168.0.42:514"
        tag: "backend-expert"
```

## Monitoring

### Prometheus Metrics

Add metrics exporter:

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - mcp-network
```

### Grafana Dashboard

```yaml
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    networks:
      - mcp-network
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs backend-expert

# Check container status
docker compose ps

# Inspect container
docker inspect mcp-backend-expert

# Try running interactively
docker run -it --rm claude-spec/backend-expert:latest sh
```

### Permission Denied Errors

```bash
# Docker socket permission (for devops-expert)
sudo chmod 666 /var/run/docker.sock

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Network Issues

```bash
# Recreate network
docker network rm mcp-network
docker compose up -d

# Check network connectivity
docker exec mcp-backend-expert ping database-expert
```

### Database Connection Failed

```bash
# Check DATABASE_URL
docker exec mcp-backend-expert env | grep DATABASE_URL

# Test database connection
docker exec mcp-backend-expert node -e "
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(() => console.log('Connected!')).catch(console.error);
"
```

## Updating Images

### Pull Latest Changes

```bash
git pull origin main

# Rebuild images
docker compose build

# Restart services
docker compose down
docker compose up -d
```

### Zero-Downtime Update

```bash
# Scale up new version
docker compose up -d --scale backend-expert=2

# Wait for health check
sleep 30

# Remove old container
docker compose up -d --scale backend-expert=1
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .mcp-servers/backend-expert
          push: true
          tags: your-org/backend-expert:latest
```

## Performance Optimization

### Multi-stage Builds

Already implemented in Dockerfile.base:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
COPY --from=builder /app/node_modules ./node_modules
```

### Image Size

```bash
# Check image sizes
docker images | grep claude-spec

# Remove unused images
docker image prune -a

# Use alpine base (already using)
# node:18-alpine is ~180MB vs node:18 ~900MB
```

### Build Cache

```bash
# Use BuildKit for better caching
export DOCKER_BUILDKIT=1
docker compose build
```

## Registry Publishing

### Docker Hub

```bash
# Tag images
docker tag claude-spec/backend-expert:latest your-org/backend-expert:1.0.0

# Push to Docker Hub
docker push your-org/backend-expert:1.0.0
```

### Private Registry

```bash
# Tag for private registry
docker tag claude-spec/backend-expert:latest registry.example.com/mcp/backend-expert:1.0.0

# Login to registry
docker login registry.example.com

# Push
docker push registry.example.com/mcp/backend-expert:1.0.0
```

## Backup and Restore

### Export Images

```bash
# Save image to tar file
docker save claude-spec/backend-expert:latest > backend-expert.tar

# Load image from tar
docker load < backend-expert.tar
```

### Volume Backup

```bash
# Backup volume data
docker run --rm \
  -v mcp-postgres-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore volume data
docker run --rm \
  -v mcp-postgres-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

## Development Workflow

### Local Development with Docker

```bash
# Start services in development mode
docker compose -f docker compose.yml -f docker compose.dev.yml up

# Watch mode (rebuild on code change)
docker compose watch
```

### Hot Reload

```yaml
# docker compose.dev.yml
services:
  backend-expert:
    volumes:
      - ./backend-expert:/app
      - /app/node_modules
    command: npm run dev  # Uses nodemon
```

## License

MIT
