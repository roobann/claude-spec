# Backend Expert MCP Server

Domain-specific MCP server providing backend development tools for claude-spec.

## Features

### Tools

- **query_database**: Execute SQL queries on PostgreSQL/MySQL databases
- **test_api_endpoint**: Test HTTP endpoints with various methods (GET, POST, PUT, DELETE, PATCH)
- **run_tests**: Execute backend test suites
- **run_migration**: Run database migrations (up/down)
- **check_api_health**: Verify API service health

### Resources

- **database://schema**: View current database schema structure

## Installation

### Global Installation (Recommended)

```bash
npm install -g @claude-spec/backend-mcp-server
```

### Project-Specific Installation

```bash
npm install @claude-spec/backend-mcp-server
```

### Direct Usage (No Installation)

```bash
npx @claude-spec/backend-mcp-server
```

## Configuration

### Add to Claude Code

```bash
claude mcp add backend-expert \
  --env DATABASE_URL="postgresql://user:pass@localhost:5432/mydb" \
  --env TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/mydb_test" \
  --env TEST_COMMAND="npm test" \
  --env MIGRATION_COMMAND="npm run migrate" \
  -- npx @claude-spec/backend-mcp-server
```

### Project-Level Configuration (.mcp.json)

Create `.mcp.json` in your project root:

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
    }
  }
}
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL/MySQL connection string | Yes | - |
| `TEST_DATABASE_URL` | Test database connection string | No | - |
| `TEST_COMMAND` | Command to run tests | No | `npm test` |
| `MIGRATION_COMMAND` | Command to run migrations | No | `npm run migrate` |

## Usage

Once configured, Claude Code can use backend tools automatically:

### Query Database

```
User: "Query the users table to find active accounts"
Claude: [Uses @backend-expert query_database tool]
        SELECT * FROM users WHERE status = 'active'
        → Returns user data
```

### Test API Endpoint

```
User: "Test the POST /api/users endpoint with sample data"
Claude: [Uses @backend-expert test_api_endpoint tool]
        POST http://localhost:3000/api/users
        Body: {"name": "Test User", "email": "test@example.com"}
        → Returns 201 Created in 150ms ✅
```

### Run Tests

```
User: "Run the authentication tests"
Claude: [Uses @backend-expert run_tests tool]
        npm test auth
        → Tests passed ✅
```

### Check API Health

```
User: "Is the API healthy?"
Claude: [Uses @backend-expert check_api_health tool]
        GET http://localhost:3000/health
        → API healthy ✅ (200 in 50ms)
```

### View Database Schema

```
User: "What's the structure of the users table?"
Claude: [Reads @backend-expert database://schema resource]
        users:
          - id: uuid, not null
          - email: varchar, not null
          - created_at: timestamp, not null
```

## Integration with claude-spec

This MCP server integrates seamlessly with the claude-spec multi-agent system:

1. **During Planning** (`/cspec:task`):
   - Spec identifies this feature needs backend work
   - Sets `agent_coordination: true` and `domains: [backend]`

2. **During Implementation** (`/cspec:implement`):
   - Orchestrator detects backend-expert MCP server
   - Spawns backend-expert agent with specialized tools
   - Agent uses tools (database queries, API testing, etc.)
   - Updates progress and completes backend tasks

3. **Tools Available to Agent**:
   - Direct database access for queries
   - API endpoint testing
   - Test suite execution
   - Migration management

## Security

### Database Access

- Queries timeout after 5 seconds by default
- Connection pooling prevents resource exhaustion
- Use read-only database user for safety
- Never expose production credentials in code

### API Testing

- Requests timeout after 10 seconds by default
- No automatic authentication bypass
- Respect rate limits
- Use test environments, not production

### Secrets Management

Recommended approaches:

1. **Docker Secrets** (Recommended):
```bash
echo "postgresql://..." | docker secret create db_password -
claude mcp add backend-expert --env DATABASE_URL=SECRET:db_password ...
```

2. **Environment Files**:
```bash
# .env.local (gitignored)
DATABASE_URL=postgresql://user:pass@localhost/db

# Load and configure
source .env.local
claude mcp add backend-expert --env DATABASE_URL="${DATABASE_URL}" ...
```

3. **Secrets Manager**:
Use AWS Secrets Manager, HashiCorp Vault, or similar.

## Development

### Running Locally

```bash
cd .mcp-servers/backend-expert
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
DEBUG=mcp:* npm start
```

## Supported Databases

- PostgreSQL (recommended)
- MySQL / MariaDB
- SQLite (limited features)

## Supported Frameworks

- Node.js / Express
- Python / Django / FastAPI
- Go / Gin / Echo
- Java / Spring Boot
- Ruby / Rails

## Troubleshooting

### MCP Server Not Connecting

```bash
# Check status
claude
> /mcp

# View logs
claude mcp logs backend-expert

# Restart
claude mcp restart backend-expert
```

### Database Connection Fails

- Verify DATABASE_URL is correct
- Check database is running
- Ensure network access (Docker networking, firewall)
- Test connection manually:
  ```bash
  psql $DATABASE_URL -c "SELECT 1"
  ```

### Tools Not Working

- Verify environment variables are set
- Check MCP server logs for errors
- Ensure commands (npm test, npm run migrate) work outside MCP

## Contributing

See main project CONTRIBUTING.md for guidelines.

## License

MIT
