# Database Expert MCP Server
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
ENV DATABASE_URL="" \
    MYSQL_URL="" \
    DATABASE_TYPE="postgres" \
    NODE_ENV="production"

EXPOSE 3000

CMD ["node", "index.js"]
