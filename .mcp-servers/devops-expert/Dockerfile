# DevOps Expert MCP Server
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy server code
COPY . .

# Create non-root user
RUN addgroup -g 1001 mcp && \
    adduser -D -u 1001 -G mcp mcp && \
    chown -R mcp:mcp /app

USER mcp

# Environment variables (override at runtime)
ENV DOCKER_HOST="unix:///var/run/docker.sock" \
    DEPLOY_COMMAND="docker compose up -d" \
    COMPOSE_FILE="docker-compose.yml" \
    SECRETS_PATH="/run/secrets" \
    NODE_ENV="production"

# Note: Docker socket must be mounted at runtime
# docker run -v /var/run/docker.sock:/var/run/docker.sock ...

EXPOSE 3000

CMD ["node", "index.js"]
