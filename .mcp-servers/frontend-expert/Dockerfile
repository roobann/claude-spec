# Frontend Expert MCP Server
FROM node:18-alpine

# Install Playwright dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Playwright to use installed Chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

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

ENV NODE_ENV="production"

EXPOSE 3000

CMD ["node", "index.js"]
