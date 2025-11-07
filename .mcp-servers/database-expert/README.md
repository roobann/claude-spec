# Database Expert MCP Server

Domain-specific MCP server providing database schema management and optimization tools for claude-spec.

## Features

### Tools

- **inspect_schema**: Inspect database schema (tables, columns, constraints, indexes, relationships)
- **analyze_query**: Analyze query execution plans and suggest optimizations
- **create_migration**: Generate database migration files with up/down SQL
- **manage_indexes**: Create, drop, list, or analyze database indexes
- **check_db_health**: Monitor database health (connections, size, performance metrics)
- **optimize_table**: Optimize tables (vacuum, analyze, reindex operations)

### Resources

- **db://schema**: Complete database schema information
- **db://health**: Current database health metrics

## Installation

### Global Installation (Recommended)

```bash
npm install -g @claude-spec/database-mcp-server
```

### Project-Specific Installation

```bash
npm install @claude-spec/database-mcp-server
```

### Direct Usage (No Installation)

```bash
npx @claude-spec/database-mcp-server
```

## Configuration

### Add to Claude Code

#### PostgreSQL

```bash
claude mcp add database-expert \
  --env DATABASE_URL="postgresql://user:password@localhost:5432/mydb" \
  --env DATABASE_TYPE="postgres" \
  -- npx @claude-spec/database-mcp-server
```

#### MySQL

```bash
claude mcp add database-expert \
  --env MYSQL_URL="mysql://user:password@localhost:3306/mydb" \
  --env DATABASE_TYPE="mysql" \
  -- npx @claude-spec/database-mcp-server
```

### Project-Level Configuration (.mcp.json)

```json
{
  "mcpServers": {
    "database-expert": {
      "command": "npx",
      "args": ["@claude-spec/database-mcp-server"],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/mydb",
        "DATABASE_TYPE": "postgres"
      }
    }
  }
}
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes (for Postgres) | - |
| `MYSQL_URL` | MySQL connection string | Yes (for MySQL) | - |
| `DATABASE_TYPE` | Database type (`postgres` or `mysql`) | No | postgres |

## Usage

Once configured, Claude Code can use database tools automatically:

### Inspect Schema

```
User: "Show me the users table schema"
Claude: [Uses @database-expert inspect_schema tool]
        Table: users
        Columns:
        - id (uuid, NOT NULL, PRIMARY KEY)
        - email (varchar, NOT NULL, UNIQUE)
        - created_at (timestamp, NOT NULL)
        Indexes:
        - users_pkey (PRIMARY KEY btree: id)
        - users_email_idx (UNIQUE btree: email)
```

### Analyze Query Performance

```
User: "Is this query optimized? SELECT * FROM orders WHERE user_id = 123"
Claude: [Uses @database-expert analyze_query tool]
        Execution Time: 45.2ms
        Plan: Index Scan using orders_user_id_idx
        Suggestions:
        ✅ Query is using index - well optimized
        ⚠️  Consider selecting specific columns instead of SELECT *
```

### Create Migration

```
User: "Create a migration to add status column to orders table"
Claude: [Uses @database-expert create_migration tool]
        Migration created: 20250107123045_add_status_to_orders.sql

        UP:
        ALTER TABLE orders ADD COLUMN status VARCHAR(50) DEFAULT 'pending';

        DOWN:
        ALTER TABLE orders DROP COLUMN status;
```

### Manage Indexes

```
User: "Create an index on orders.created_at"
Claude: [Uses @database-expert manage_indexes tool]
        Created index: orders_created_at_idx
        Table: orders
        Columns: [created_at]
        Type: btree
```

### Check Database Health

```
User: "How healthy is the database?"
Claude: [Uses @database-expert check_db_health tool]
        Database Health: ✅ Healthy

        Connections:
        - Total: 25
        - Active: 5
        - Idle: 20

        Size: 2.5 GB

        Performance:
        - Cache Hit Ratio: 98.5% ✅
```

### Optimize Table

```
User: "Optimize the large_table table"
Claude: [Uses @database-expert optimize_table tool]
        Table 'large_table' optimized ✅

        Operations completed:
        - VACUUM ANALYZE
        - REINDEX
```

## Integration with claude-spec

This MCP server integrates with the claude-spec multi-agent system:

1. **During Planning** (`/cspec:plan`):
   - Spec identifies database work needed
   - Sets `domains: [database]` or `domains: [backend, database]`
   - Enables MCP integration: `mcp_integration.enabled: true`

2. **During Implementation** (`/cspec:implement`):
   - Orchestrator detects database-expert MCP server
   - Spawns database-expert agent with schema/migration tools
   - Agent uses tools to inspect, create, and optimize database
   - Updates progress and completes database tasks

3. **Tools Available to Agent**:
   - Inspect existing schema before making changes
   - Analyze query performance for optimization
   - Generate migration files for schema changes
   - Create/manage indexes for performance
   - Check database health before/after operations
   - Optimize tables after bulk operations

## Common Workflows

### Adding a New Table

```javascript
// Agent workflow:
1. Use inspect_schema to check existing schema patterns
2. Use create_migration to generate migration file
3. Review migration SQL
4. Use check_db_health to verify database ready
5. Apply migration (via backend-expert or manual)
6. Use inspect_schema to verify new table created
7. Update progress.yml with completion
```

### Optimizing Slow Queries

```javascript
// Agent workflow:
1. Use analyze_query to get execution plan
2. Review optimization suggestions
3. Use manage_indexes(action: 'create') to add missing indexes
4. Use analyze_query again to verify improvement
5. Document optimization in context.yml
```

### Schema Refactoring

```javascript
// Agent workflow:
1. Use inspect_schema to understand current structure
2. Use create_migration for each schema change
3. Use manage_indexes to update index definitions
4. Use optimize_table after bulk changes
5. Use check_db_health to verify system healthy
6. Document changes in spec.yml
```

## Tool Reference

### 1. inspect_schema

Inspect database schema with detailed table/column information.

**Input:**
```typescript
{
  tableName?: string;           // Specific table (optional)
  includeIndexes?: boolean;     // Include indexes (default: true)
  includeConstraints?: boolean; // Include constraints (default: true)
}
```

**Output:**
```typescript
{
  [tableName]: {
    columns: Array<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }>;
    indexes?: Array<{
      index_name: string;
      definition: string;
    }>;
    constraints?: Array<{
      constraint_name: string;
      constraint_type: string;
      column_name: string;
    }>;
  }
}
```

### 2. analyze_query

Analyze SQL query execution plan and suggest optimizations.

**Input:**
```typescript
{
  query: string;                     // SQL query to analyze
  explainOptions?: 'ANALYZE' | 'BUFFERS' | 'VERBOSE' | 'ALL'; // PostgreSQL only
}
```

**Output:**
```typescript
{
  executionTime: number;             // Execution time in ms
  planningTime: number;              // Planning time in ms
  plan: object;                      // Execution plan tree
  suggestions: Array<{
    type: string;                    // 'index' | 'join' | 'scan'
    severity: string;                // 'high' | 'medium' | 'low'
    message: string;                 // Suggestion description
  }>;
}
```

### 3. create_migration

Generate database migration file with up/down SQL.

**Input:**
```typescript
{
  migrationName: string;             // Migration name (e.g., "add_users_table")
  upSQL: string;                     // Forward migration SQL
  downSQL: string;                   // Rollback migration SQL
  migrationsPath?: string;           // Path to migrations dir (default: ./migrations)
}
```

**Output:**
```typescript
{
  fileName: string;                  // Generated filename with timestamp
  filePath: string;                  // Full file path
  content: string;                   // Migration file content
}
```

### 4. manage_indexes

Create, drop, list, or analyze database indexes.

**Input:**
```typescript
{
  action: 'create' | 'drop' | 'analyze' | 'list';
  tableName?: string;                // Table name
  indexName?: string;                // Index name
  columns?: string[];                // Columns for index creation
  indexType?: 'btree' | 'hash' | 'gin' | 'gist' | 'brin'; // PostgreSQL
  unique?: boolean;                  // Create unique index (default: false)
}
```

**Output:**
```typescript
{
  // create action:
  created: string;                   // Index name
  table: string;
  columns: string[];
  type: string;

  // drop action:
  dropped: string;                   // Index name

  // list action:
  indexes: Array<{
    indexname: string;
    tablename: string;
    indexdef: string;
  }>;

  // analyze action:
  table: string;
  indexes: Array<{
    indexname: string;
    scans: number;
    tuples_read: number;
    tuples_fetched: number;
  }>;
  analysis: string;
}
```

### 5. check_db_health

Monitor database health metrics.

**Input:**
```typescript
{
  includeConnections?: boolean;      // Include connection stats (default: true)
  includeSize?: boolean;             // Include size info (default: true)
  includePerformance?: boolean;      // Include performance metrics (default: true)
}
```

**Output:**
```typescript
{
  healthy: boolean;
  timestamp: string;
  connections?: {
    total_connections: number;
    active_connections: number;
    idle_connections: number;
  };
  size?: {
    datname: string;
    size: string;                    // Human-readable size
  };
  performance?: {
    blks_hit: number;
    blks_read: number;
    cache_hit_ratio: number;         // Percentage
  };
}
```

### 6. optimize_table

Optimize table with vacuum, analyze, or reindex operations.

**Input:**
```typescript
{
  tableName: string;                 // Table to optimize
  operation?: 'vacuum' | 'analyze' | 'reindex' | 'all'; // Default: analyze
  full?: boolean;                    // Full vacuum (PostgreSQL, default: false)
}
```

**Output:**
```typescript
{
  table: string;
  results: Array<{
    operation: string;
    status: string;
    full?: boolean;
  }>;
}
```

## Best Practices

### Schema Inspection
- Always inspect schema before making changes
- Use `includeIndexes` and `includeConstraints` for complete picture
- Check related tables to understand foreign key relationships

### Query Optimization
- Run EXPLAIN ANALYZE on production-like data volumes
- Review all optimization suggestions before implementing
- Test index creation on staging environment first
- Monitor cache hit ratio (aim for >90%)

### Migration Management
- Always provide both up and down SQL
- Test migrations on staging environment
- Keep migrations small and focused
- Use descriptive migration names
- Version control all migration files

### Index Management
- Analyze index usage before creating new indexes
- Drop unused indexes to reduce write overhead
- Use appropriate index types (btree for most cases)
- Consider unique constraints for data integrity
- Create indexes on foreign key columns

### Database Health
- Monitor regularly, not just when problems occur
- Alert on low cache hit ratio (<90%)
- Watch connection count vs max connections
- Track database size growth trends
- Schedule regular VACUUM ANALYZE operations

### Table Optimization
- Run ANALYZE after bulk data changes
- Use VACUUM to reclaim space after large deletes
- Schedule REINDEX during low-traffic periods
- VACUUM FULL requires table lock (use sparingly)

## Supported Databases

- **PostgreSQL**: 12.0+ (full feature support)
- **MySQL**: 8.0+ (core features, some PostgreSQL-specific features unavailable)

## Development

### Running Locally

```bash
cd .mcp-servers/database-expert
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
DEBUG=* npm start  # All debug logs
```

## Security

### Connection String Security

**Never expose credentials in code or logs:**

```bash
# ✅ Good: Use environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# ❌ Bad: Hardcoded credentials
DATABASE_URL="postgresql://admin:admin123@prod-db:5432/production"
```

**Use secrets management:**
- Docker Secrets
- Kubernetes Secrets
- AWS Secrets Manager
- HashiCorp Vault
- Environment variables (encrypted at rest)

### Query Safety

**Read-only by default:**
- Most operations are read-only (inspect, analyze, check health)
- Write operations (create migration, manage indexes, optimize) are explicit
- Always review generated SQL before applying

**SQL Injection Prevention:**
- All queries use parameterized statements
- Input validation via Zod schemas
- No dynamic SQL construction from user input

### Database Permissions

**Least privilege principle:**
```sql
-- Create read-only user for inspect/analyze operations
CREATE USER claude_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE mydb TO claude_readonly;
GRANT USAGE ON SCHEMA public TO claude_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO claude_readonly;

-- Create limited admin user for migrations/optimization
CREATE USER claude_admin WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mydb TO claude_admin;
```

## Troubleshooting

### Cannot Connect to Database

**Symptom:** "DATABASE_URL environment variable required"

**Solutions:**

1. Set environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

2. Check connection string format:
```bash
# PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/database"

# MySQL
MYSQL_URL="mysql://user:password@host:3306/database"
```

3. Test connection:
```bash
psql $DATABASE_URL  # PostgreSQL
mysql -u user -p -h host database  # MySQL
```

### Migration File Not Created

**Symptom:** "Failed to create migration: ENOENT"

**Solutions:**

1. Check migrations directory exists:
```bash
mkdir -p ./migrations
```

2. Set custom migrations path:
```javascript
create_migration({
  migrationName: "add_column",
  upSQL: "...",
  downSQL: "...",
  migrationsPath: "/absolute/path/to/migrations"
})
```

### Index Creation Fails

**Symptom:** "relation already exists"

**Solutions:**

1. List existing indexes first:
```javascript
manage_indexes({ action: 'list', tableName: 'users' })
```

2. Use unique index name:
```javascript
manage_indexes({
  action: 'create',
  tableName: 'users',
  indexName: 'users_email_idx_v2',  // New name
  columns: ['email']
})
```

### Slow Query Analysis

**Symptom:** analyze_query times out

**Solutions:**

1. Use EXPLAIN without ANALYZE for estimation:
```javascript
// Note: This requires code modification
// Default ANALYZE actually runs the query
```

2. Test on subset of data:
```sql
-- Add LIMIT to query being analyzed
SELECT * FROM large_table WHERE ... LIMIT 100
```

3. Increase timeout:
```bash
# Set statement timeout (PostgreSQL)
export PGSQL_STATEMENT_TIMEOUT=60000  # 60 seconds
```

## Contributing

See main project CONTRIBUTING.md for guidelines.

## License

MIT
