# DevOps Expert MCP Server

Domain-specific MCP server providing DevOps and infrastructure tools for claude-spec.

## Features

### Tools

- **check_container_status**: Check Docker container status (specific or all containers)
- **view_logs**: View container logs with tail support
- **restart_service**: Restart Docker containers or services
- **run_health_check**: Run health checks on services (HTTP or container-based)
- **read_secret**: Read secrets from Docker secrets, environment, or files
- **deploy_service**: Deploy or update Docker services with optional build

### Resources

- **docker://info**: Docker daemon and system information
- **docker://compose**: Current docker-compose.yml configuration

## Installation

### Global Installation (Recommended)

```bash
npm install -g @claude-spec/devops-mcp-server
```

### Project-Specific Installation

```bash
npm install @claude-spec/devops-mcp-server
```

### Direct Usage (No Installation)

```bash
npx @claude-spec/devops-mcp-server
```

## Configuration

### Add to Claude Code

```bash
claude mcp add devops-expert \
  --env DOCKER_HOST="unix:///var/run/docker.sock" \
  --env DEPLOY_COMMAND="docker compose up -d" \
  --env SECRETS_PATH="/run/secrets" \
  -- npx @claude-spec/devops-mcp-server
```

### Project-Level Configuration (.mcp.json)

```json
{
  "mcpServers": {
    "devops-expert": {
      "command": "npx",
      "args": ["@claude-spec/devops-mcp-server"],
      "env": {
        "DOCKER_HOST": "unix:///var/run/docker.sock",
        "DEPLOY_COMMAND": "docker compose up -d",
        "COMPOSE_FILE": "docker-compose.yml",
        "SECRETS_PATH": "/run/secrets"
      }
    }
  }
}
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DOCKER_HOST` | Docker daemon socket | No | unix:///var/run/docker.sock |
| `DEPLOY_COMMAND` | Command to run for deployment | No | docker compose up -d |
| `COMPOSE_FILE` | Path to docker-compose.yml | No | docker-compose.yml |
| `SECRETS_PATH` | Path to secrets directory | No | /run/secrets |

## Usage

Once configured, Claude Code can use DevOps tools automatically:

### Check Container Status

```
User: "What containers are running?"
Claude: [Uses @devops-expert check_container_status tool]
        Found 5 containers (3 running)
        - backend: running ✅
        - frontend: running ✅
        - database: running ✅
        - redis: exited ❌
        - worker: exited ❌
```

### View Logs

```
User: "Show me the backend logs"
Claude: [Uses @devops-expert view_logs tool]
        Container: backend
        Tail: 100 lines
        → [Displays last 100 log lines]
```

### Restart Service

```
User: "Restart the backend service"
Claude: [Uses @devops-expert restart_service tool]
        Container: backend
        → Container backend restarted successfully ✅
```

### Run Health Check

```
User: "Is the API healthy?"
Claude: [Uses @devops-expert run_health_check tool]
        URL: http://localhost:3000/health
        → Service healthy ✅ (200 in 50ms)
```

### Read Secret

```
User: "What's the database password?"
Claude: [Uses @devops-expert read_secret tool]
        Secret: db_password
        Source: docker
        → Secret retrieved ✅ (value masked for security)
```

### Deploy Service

```
User: "Deploy the updated backend"
Claude: [Uses @devops-expert deploy_service tool]
        Service: backend
        Build first: true
        → Building backend...
        → Deploying backend...
        → Deployment completed successfully ✅
```

## Integration with claude-spec

This MCP server integrates with the claude-spec multi-agent system:

1. **During Planning** (`/cspec:plan`):
   - Spec identifies feature needs DevOps work
   - Sets `domains: [devops]` or `domains: [backend, devops]`

2. **During Implementation** (`/cspec:implement`):
   - Orchestrator detects devops-expert MCP server
   - Spawns devops-expert agent with Docker tools
   - Agent uses tools (container management, deployment, secrets)
   - Updates progress and completes DevOps tasks

3. **Tools Available to Agent**:
   - Check container status before/after changes
   - View logs for debugging
   - Restart services after updates
   - Verify health after deployment
   - Manage secrets securely
   - Deploy services with builds

## Common Workflows

### Deploying a New Feature

```javascript
// Agent workflow:
1. Use check_container_status to verify current state
2. Use deploy_service(buildFirst: true) to deploy changes
3. Use run_health_check to verify deployment
4. Use view_logs to check for errors
5. Update progress.yml with deployment status
```

### Debugging Production Issues

```javascript
// Agent workflow:
1. Use check_container_status to find problematic container
2. Use view_logs(tail: 500) to see recent errors
3. Use restart_service if needed
4. Use run_health_check to verify fix
5. Document issue in context.yml
```

### Managing Secrets

```javascript
// Agent workflow:
1. Use read_secret to verify secret exists
2. Use deploy_service to redeploy with new secret
3. Use run_health_check to verify service works with secret
4. Document secret usage in spec.yml
```

## Security

### Docker Socket Access

**Important:** Running with Docker socket access gives significant system privileges.

**Best Practices:**
- Use Docker socket mapping carefully
- Consider Docker-in-Docker for isolation
- Limit MCP server to specific containers/networks
- Use Docker contexts for remote access

**Socket Configuration:**

```bash
# Local Docker socket
DOCKER_HOST=unix:///var/run/docker.sock

# Remote Docker daemon
DOCKER_HOST=tcp://remote-host:2376

# Docker Desktop on Windows/Mac
DOCKER_HOST=npipe:////./pipe/docker_engine  # Windows
```

### Secrets Management

**Never expose secrets in logs or responses:**

```javascript
// ✅ Good: Secrets are masked
read_secret('api_key') → 'sk_t****xyz123'

// ❌ Bad: Don't return full secret values
```

**Recommended secret sources:**
1. Docker Secrets (most secure)
2. Kubernetes Secrets
3. HashiCorp Vault
4. AWS Secrets Manager
5. Environment variables (least secure)

### Deployment Security

**Pre-deployment checks:**
- Verify images are from trusted registries
- Scan for vulnerabilities
- Review deployment configurations
- Test in staging first

## Docker Configuration

### Docker Socket Permissions

**Linux:**

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Or grant socket access
sudo chmod 666 /var/run/docker.sock  # Not recommended for production
```

**Docker Desktop (Mac/Windows):**
Socket access is automatic.

### Docker Compose Integration

The server works with any Docker Compose file:

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Docker Swarm Support

For Swarm mode, use service commands:

```bash
# Configure for Swarm
claude mcp add devops-expert \
  --env DEPLOY_COMMAND="docker stack deploy -c docker-compose.yml myapp" \
  -- npx @claude-spec/devops-mcp-server
```

## Troubleshooting

### Cannot Connect to Docker Daemon

**Symptom:** "Error: connect ENOENT /var/run/docker.sock"

**Solutions:**

1. Verify Docker is running:
```bash
docker ps
```

2. Check Docker socket path:
```bash
# Linux
ls -l /var/run/docker.sock

# Windows/Mac with Docker Desktop
docker context ls
```

3. Set correct DOCKER_HOST:
```bash
# Linux
export DOCKER_HOST=unix:///var/run/docker.sock

# Windows
export DOCKER_HOST=npipe:////./pipe/docker_engine
```

4. Check permissions:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Container Not Found

**Symptom:** Container name not recognized

**Solutions:**

1. List all containers:
```bash
docker ps -a
```

2. Use container ID instead of name:
```javascript
check_container_status({ containerName: 'abc123def456' })
```

3. Include compose project prefix:
```javascript
// If using docker-compose
check_container_status({ containerName: 'myproject_backend_1' })
```

### Deployment Fails

**Symptom:** deploy_service returns error

**Solutions:**

1. Test deployment command manually:
```bash
docker compose up -d
```

2. Check docker-compose.yml syntax:
```bash
docker compose config
```

3. Build images separately:
```bash
docker compose build
docker compose up -d
```

4. Check logs for specific errors:
```bash
docker compose logs backend
```

### Secrets Not Found

**Symptom:** read_secret returns "not found"

**Solutions:**

1. List Docker secrets:
```bash
docker secret ls
```

2. Create missing secret:
```bash
echo "secret-value" | docker secret create my_secret -
```

3. Use correct source:
```javascript
// Try different sources
read_secret({ secretName: 'API_KEY', source: 'env' })
read_secret({ secretName: 'api-key', source: 'docker' })
read_secret({ secretName: 'api_key.txt', source: 'file' })
```

## Supported Platforms

- **Docker**: Docker Engine 20.10+
- **Docker Compose**: V2 (recommended) or V1
- **Docker Swarm**: Swarm mode services
- **Kubernetes**: Via Docker Desktop integration
- **Platforms**: Linux, macOS (Docker Desktop), Windows (Docker Desktop, WSL2)

## Development

### Running Locally

```bash
cd .mcp-servers/devops-expert
npm install
npm start
```

### Testing

```bash
npm test
```

### Debugging

Set environment variable:

```bash
DEBUG=dockerode npm start  # Docker API debug logs
```

## Contributing

See main project CONTRIBUTING.md for guidelines.

## License

MIT
