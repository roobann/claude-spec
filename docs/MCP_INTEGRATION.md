# MCP Integration Guide

Complete guide for setting up Model Context Protocol (MCP) domain expert servers in claude-spec.

## Table of Contents

- [What is MCP Integration?](#what-is-mcp-integration)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Domain Expert Servers](#domain-expert-servers)
- [Usage with claude-spec](#usage-with-claude-spec)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## What is MCP Integration?

MCP (Model Context Protocol) integration enhances the claude-spec multi-agent system by providing domain experts with specialized tools:

**Without MCP (Prompt-Based - Default):**
- Domain experts are general-purpose agents with specialized prompts
- No direct database access
- No API testing tools
- No specialized environment

**With MCP (Tool-Enhanced - Optional):**
- Domain experts have specialized tools (database queries, API testing, etc.)
- Direct access to external systems
- Isolated execution environments
- Better security with secrets management

**Key Benefits:**
- 🔧 **Specialized Tools**: Database queries, API testing, browser automation
- 🔒 **Better Security**: Secrets managed via Docker/MCP, not environment variables
- 🎯 **Domain Expertise**: Each expert has tools specific to their domain
- ⚡ **Faster Development**: Direct access to systems speeds up implementation
- 🧪 **Testing Integration**: Run tests and verify code during implementation

**When to Use MCP:**
- Production projects requiring database access
- API-driven features needing endpoint testing
- Complex multi-domain features (backend + frontend + DevOps)
- Projects with strict security requirements

**When to Skip MCP:**
- Simple single-domain features
- Prototyping and exploration
- Projects without external dependencies
- Learning claude-spec basics

## Prerequisites

### Required

- **Node.js 18+**: MCP servers are Node.js applications
- **Claude Code CLI**: Installed and configured
- **Git**: For version control

### Optional (Domain-Specific)

- **PostgreSQL/MySQL**: For backend-expert database tools
- **Docker**: For devops-expert container tools
- **Browser (Chromium)**: For frontend-expert testing tools

## Quick Start

### 1. Install MCP Servers

```bash
# Install all domain experts globally
npm install -g @claude-spec/backend-mcp-server
npm install -g @claude-spec/frontend-mcp-server
npm install -g @claude-spec/devops-mcp-server
```

### 2. Configure Claude Code

```bash
# Backend expert with database access
claude mcp add backend-expert \
  --env DATABASE_URL="postgresql://localhost:5432/myapp" \
  -- npx @claude-spec/backend-mcp-server

# Frontend expert with browser testing
claude mcp add frontend-expert \
  --env BASE_URL="http://localhost:3000" \
  -- npx @claude-spec/frontend-mcp-server

# DevOps expert with Docker access
claude mcp add devops-expert \
  --env DOCKER_HOST="unix:///var/run/docker.sock" \
  -- npx @claude-spec/devops-mcp-server
```

### 3. Verify Installation

```bash
# Start Claude Code
claude

# Check MCP servers
> /mcp

# You should see:
# - backend-expert (connected)
# - frontend-expert (connected)
# - devops-expert (connected)
```

### 4. Use with claude-spec

```bash
# Plan a feature with multi-agent mode
> /cspec:plan user-authentication

# When asked: "Does this feature span multiple domains?"
# Answer: "Yes - Enable multi-agent mode with domain experts"

# When asked: "Enable MCP integration?"
# Answer: "Yes" (if MCP servers installed)

# Implement feature
> /cspec:implement

# Claude will detect MCP servers and use enhanced domain experts!
```

## Installation

### Global Installation (Recommended)

Install MCP servers globally for use across all projects:

```bash
npm install -g @claude-spec/backend-mcp-server
npm install -g @claude-spec/frontend-mcp-server
npm install -g @claude-spec/devops-mcp-server
npm install -g @claude-spec/database-mcp-server
npm install -g @claude-spec/infrastructure-mcp-server
```

**Pros:**
- ✅ Install once, use everywhere
- ✅ Easy updates: `npm update -g @claude-spec/*`
- ✅ Consistent versions across projects

**Cons:**
- ❌ Requires npm global permissions
- ❌ Can't have different versions per project

### Project-Local Installation

Install in your project for version control:

```bash
cd your-project
npm install --save-dev @claude-spec/backend-mcp-server
npm install --save-dev @claude-spec/frontend-mcp-server
```

**Pros:**
- ✅ Project-specific versions
- ✅ Tracked in package.json
- ✅ Team consistency

**Cons:**
- ❌ Must install per project
- ❌ Takes up project space

### Direct Usage (No Installation)

Use `npx` to fetch on-demand:

```bash
# No installation needed, npx fetches automatically
claude mcp add backend-expert -- npx @claude-spec/backend-mcp-server
```

**Pros:**
- ✅ No installation needed
- ✅ Always latest version

**Cons:**
- ❌ Slower first run (download time)
- ❌ Requires internet connection

## Configuration

### Method 1: CLI Configuration (Quick)

Add servers via Claude Code CLI:

```bash
# Add with environment variables
claude mcp add backend-expert \
  --env DATABASE_URL="postgresql://localhost/db" \
  --env TEST_DATABASE_URL="postgresql://localhost/test_db" \
  --env TEST_COMMAND="npm test" \
  -- npx @claude-spec/backend-mcp-server
```

**Stored in:** `~/.claude.json` (user-level configuration)

### Method 2: User Configuration File

Edit `~/.claude.json` directly:

```json
{
  "mcpServers": {
    "backend-expert": {
      "command": "npx",
      "args": ["@claude-spec/backend-mcp-server"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}",
        "TEST_DATABASE_URL": "${TEST_DATABASE_URL}",
        "TEST_COMMAND": "npm test",
        "MIGRATION_COMMAND": "npm run migrate"
      }
    },
    "frontend-expert": {
      "command": "npx",
      "args": ["@claude-spec/frontend-mcp-server"],
      "env": {
        "BASE_URL": "http://localhost:3000",
        "BROWSER_TYPE": "chromium",
        "HEADLESS": "true"
      }
    }
  }
}
```

**Usage:** Variables are expanded from your shell environment.

### Method 3: Project Configuration (Team Sharing)

Create `.mcp.json` in project root:

```json
{
  "mcpServers": {
    "backend-expert": {
      "command": "npx",
      "args": ["@claude-spec/backend-mcp-server"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}",
        "TEST_COMMAND": "npm run test:backend"
      }
    }
  }
}
```

**Commit this file** so team members share the same configuration.

**Environment variables** (actual credentials) go in `.env` (gitignored):

```bash
# .env (gitignored, not committed)
DATABASE_URL=postgresql://localhost:5432/myapp
TEST_DATABASE_URL=postgresql://localhost:5432/myapp_test
```

## Domain Expert Servers

### Backend Expert

**Tools:**
- `query_database`: Execute SQL queries
- `test_api_endpoint`: Test HTTP endpoints
- `run_tests`: Execute backend test suite
- `run_migration`: Run database migrations
- `check_api_health`: Verify service health

**Resources:**
- `database://schema`: Database schema structure

**Configuration:**

```bash
claude mcp add backend-expert \
  --env DATABASE_URL="postgresql://user:pass@localhost:5432/db" \
  --env TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/test_db" \
  --env TEST_COMMAND="npm test" \
  --env MIGRATION_COMMAND="npm run migrate" \
  -- npx @claude-spec/backend-mcp-server
```

**Use Cases:**
- Querying database during implementation
- Testing API endpoints as you build them
- Running migrations to set up schema
- Verifying tests pass after changes

### Frontend Expert

**Tools:**
- `run_browser`: Launch Playwright browser
- `test_component`: Render and test React/Vue component
- `take_screenshot`: Capture UI state
- `measure_performance`: Check page load times
- `validate_accessibility`: WCAG compliance checks
- `run_e2e_tests`: Execute end-to-end tests

**Configuration:**

```bash
claude mcp add frontend-expert \
  --env BASE_URL="http://localhost:3000" \
  --env BROWSER_TYPE="chromium" \
  --env HEADLESS="true" \
  --env VIEWPORT_WIDTH="1920" \
  --env VIEWPORT_HEIGHT="1080" \
  -- npx @claude-spec/frontend-mcp-server
```

**Use Cases:**
- Testing components visually
- Capturing screenshots for review
- Running E2E tests during development
- Validating accessibility

### DevOps Expert

**Tools:**
- `read_secret`: Fetch from secrets manager
- `deploy_service`: Trigger deployment
- `check_container_status`: Docker/Kubernetes status
- `view_logs`: Fetch service logs
- `run_health_check`: Check service health
- `restart_service`: Restart containers

**Configuration:**

```bash
claude mcp add devops-expert \
  --env DOCKER_HOST="unix:///var/run/docker.sock" \
  --env DEPLOYMENT_TOKEN="${DEPLOYMENT_TOKEN}" \
  -- npx @claude-spec/devops-mcp-server
```

**Use Cases:**
- Deploying services during implementation
- Checking container status
- Reading logs for debugging
- Managing secrets securely

### Database Expert

**Tools:**
- `inspect_schema`: Inspect database schema (tables, columns, constraints, indexes)
- `analyze_query`: Analyze query execution plans and suggest optimizations
- `create_migration`: Generate database migration files with up/down SQL
- `manage_indexes`: Create, drop, list, or analyze database indexes
- `check_db_health`: Monitor database health (connections, size, performance)
- `optimize_table`: Optimize tables (vacuum, analyze, reindex operations)

**Resources:**
- `db://schema`: Complete database schema information
- `db://health`: Current database health metrics

**Configuration:**

```bash
# PostgreSQL
claude mcp add database-expert \
  --env DATABASE_URL="postgresql://user:password@localhost:5432/db" \
  --env DATABASE_TYPE="postgres" \
  -- npx @claude-spec/database-mcp-server

# MySQL
claude mcp add database-expert \
  --env MYSQL_URL="mysql://user:password@localhost:3306/db" \
  --env DATABASE_TYPE="mysql" \
  -- npx @claude-spec/database-mcp-server
```

**Use Cases:**
- Inspecting schema before making changes
- Analyzing and optimizing slow queries
- Generating migration files for schema changes
- Creating and managing indexes for performance
- Monitoring database health and performance
- Optimizing tables after bulk operations

### Infrastructure Expert

**Tools:**
- `list_resources`: List cloud resources (EC2, RDS, S3, and more)
- `inspect_network`: Inspect network configuration (VPC, subnets, security groups)
- `manage_dns`: Manage DNS records (Route53 operations)
- `monitor_metrics`: Monitor CloudWatch metrics (CPU, memory, network, custom)
- `check_load_balancer`: Check load balancer status and target health
- `generate_terraform`: Generate Terraform configuration for infrastructure

**Resources:**
- `aws://resources`: List of all AWS resources
- `aws://network`: VPC and network configuration

**Configuration:**

```bash
# Using AWS credentials
claude mcp add infrastructure-expert \
  --env AWS_REGION="us-east-1" \
  --env AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" \
  --env AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" \
  -- npx @claude-spec/infrastructure-mcp-server

# Using AWS CLI profile (recommended)
claude mcp add infrastructure-expert \
  --env AWS_REGION="us-east-1" \
  --env AWS_PROFILE="my-profile" \
  -- npx @claude-spec/infrastructure-mcp-server
```

**Use Cases:**
- Listing and inspecting cloud resources
- Inspecting network configuration for planning
- Managing DNS records for services
- Monitoring resource utilization and performance
- Checking load balancer health
- Generating Infrastructure-as-Code (Terraform) configurations

## Usage with claude-spec

### 1. Planning with MCP

```bash
claude
> /cspec:plan user-authentication

# Claude will ask:
"Does this feature span multiple domains (backend, frontend, DevOps)?"
Answer: "Yes - Enable multi-agent mode with domain experts"

# Claude will ask:
"Enable MCP integration for enhanced domain expert capabilities?"
Answer: "Yes" (if you installed MCP servers)
```

**Result:**
- `spec.yml` created with `mcp_integration.enabled: true`
- Domain-specific technical design sections populated
- Tasks labeled with domains and assigned agents

### 2. Implementation with MCP

```bash
> /cspec:implement

# Claude detects MCP servers:
"✅ Detected MCP servers: backend-expert, frontend-expert, devops-expert"
"Using MCP-based domain experts with specialized tools"

# During implementation:
"Spawning backend-expert for tasks T1, T2, T3"
"Using @backend-expert:query_database to check schema"
"Using @backend-expert:test_api_endpoint to verify /api/auth/login"
"Using @backend-expert:run_tests to validate changes"
```

**Benefits:**
- Real database queries during implementation
- API endpoint testing with actual HTTP calls
- Test execution and verification
- Faster development cycle

### 3. Fallback Behavior

If MCP servers are NOT installed, claude-spec automatically falls back:

```bash
> /cspec:implement

# Claude detects no MCP servers:
"ℹ️ MCP servers not detected. Using prompt-based agent spawning."

# Shows installation instructions:
"📦 Install MCP Servers: npm install -g @claude-spec/backend-mcp-server"
"⚙️ Configure: claude mcp add backend-expert ..."

# Then continues with prompt-based agents:
"Spawning general-purpose agent with backend expertise"
```

**Result:** Feature still works, just without specialized tools.

## Troubleshooting

### MCP Server Not Connecting

**Symptom:** `/mcp` shows server as disconnected

**Solutions:**

1. Check MCP server logs:
```bash
claude mcp logs backend-expert
```

2. Restart MCP server:
```bash
claude mcp restart backend-expert
```

3. Remove and re-add:
```bash
claude mcp remove backend-expert
claude mcp add backend-expert -- npx @claude-spec/backend-mcp-server
```

4. Verify package is installed:
```bash
npm list -g @claude-spec/backend-mcp-server
```

### Environment Variables Not Loading

**Symptom:** MCP tools fail with "DATABASE_URL not configured"

**Solutions:**

1. Check variables are set in shell:
```bash
echo $DATABASE_URL
```

2. Use direct values (not variables) for testing:
```bash
claude mcp add backend-expert \
  --env DATABASE_URL="postgresql://localhost/db" \
  -- npx @claude-spec/backend-mcp-server
```

3. Verify variable expansion syntax:
```json
{
  "env": {
    "DATABASE_URL": "${DATABASE_URL}"  // ← Uses shell variable
  }
}
```

### Database Connection Fails

**Symptom:** `query_database` tool returns connection error

**Solutions:**

1. Test connection manually:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

2. Check database is running:
```bash
docker ps  # If using Docker
pg_ctl status  # If local PostgreSQL
```

3. Verify connection string format:
```
postgresql://user:password@host:port/database
```

4. Check network access (Docker networking, firewall rules)

### Tools Not Working

**Symptom:** MCP tools return errors or don't execute

**Solutions:**

1. Verify commands work outside MCP:
```bash
npm test  # Test command
npm run migrate  # Migration command
```

2. Check environment variables are set correctly in MCP config

3. Review MCP server logs for specific errors:
```bash
claude mcp logs backend-expert | tail -50
```

4. Increase timeout if tools are slow:
```json
{
  "env": {
    "TIMEOUT": "30000"  // 30 seconds
  }
}
```

## Advanced Configuration

### Docker-Based MCP Servers

Run MCP servers in Docker for better isolation:

```bash
# Build Docker image
docker build -t backend-mcp-server .mcp-servers/backend-expert

# Configure Claude Code to use Docker
claude mcp add backend-expert \
  -- docker run --rm -i --network host \
     -e DATABASE_URL="$DATABASE_URL" \
     backend-mcp-server
```

**Benefits:**
- Complete isolation from host system
- Consistent environment across team
- Can use Docker networking

### Secrets Management with Docker Secrets

Use Docker Desktop's secrets for secure credential storage:

```bash
# Create secret
echo "postgresql://..." | docker secret create db_url -

# Configure MCP server to use secret
claude mcp add backend-expert \
  -- docker run --rm -i --secret db_url \
     -e DATABASE_URL="$(docker secret inspect db_url -f '{{.Spec.Data}}')" \
     backend-mcp-server
```

### Multiple Environment Profiles

Different configurations for dev/staging/production:

```json
{
  "mcpServers": {
    "backend-expert-dev": {
      "command": "npx",
      "args": ["@claude-spec/backend-mcp-server"],
      "env": {
        "DATABASE_URL": "${DEV_DATABASE_URL}"
      }
    },
    "backend-expert-staging": {
      "command": "npx",
      "args": ["@claude-spec/backend-mcp-server"],
      "env": {
        "DATABASE_URL": "${STAGING_DATABASE_URL}"
      }
    }
  }
}
```

**Usage:**
```bash
# Use dev environment
export DEV_DATABASE_URL="postgresql://localhost/dev"
claude
> @backend-expert-dev:query_database "SELECT..."

# Switch to staging
export STAGING_DATABASE_URL="postgresql://staging-host/db"
> @backend-expert-staging:query_database "SELECT..."
```

### Custom MCP Server Development

Create your own domain expert for specialized needs:

1. Copy backend-expert template:
```bash
cp -r .mcp-servers/backend-expert .mcp-servers/custom-expert
```

2. Modify `index.js` to add custom tools:
```javascript
server.registerTool('custom_tool', {
  // Your custom tool implementation
});
```

3. Install and configure:
```bash
cd .mcp-servers/custom-expert
npm install
claude mcp add custom-expert -- node index.js
```

## Next Steps

- ✅ Install MCP servers globally
- ✅ Configure Claude Code with your environment
- ✅ Test with `/mcp` command
- ✅ Plan a feature with multi-agent mode
- ✅ Implement and see MCP in action
- 📖 Read [DOMAIN_EXPERTS.md](./DOMAIN_EXPERTS.md) for tool capabilities
- 🔧 Explore [backend-expert README](./.mcp-servers/backend-expert/README.md)

## Support

- **Issues**: https://github.com/your-org/claude-spec/issues
- **Discussions**: https://github.com/your-org/claude-spec/discussions
- **MCP Docs**: https://modelcontextprotocol.io

## License

MIT
