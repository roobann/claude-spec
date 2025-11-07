# Domain Expert Agents - Tool Reference

Comprehensive reference for all tools available in claude-spec domain expert MCP servers.

## Overview

Domain experts are specialized MCP servers that provide tools for specific development domains. Each expert has access to domain-specific tools that enable direct interaction with systems, databases, browsers, and infrastructure.

**Available Experts:**
- [Backend Expert](#backend-expert) - Database, API testing, tests, migrations
- [Frontend Expert](#frontend-expert) - Browser automation, component testing, accessibility
- [DevOps Expert](#devops-expert) - Docker, deployment, logs, health checks
- [Database Expert](#database-expert) - Schema management, query optimization, migrations
- [Infrastructure Expert](#infrastructure-expert) - Cloud resources, networking, IaC generation

## Quick Reference

| Domain | Tools | Primary Use Cases |
|--------|-------|-------------------|
| **Backend** | 5 tools | Database queries, API testing, running tests |
| **Frontend** | 6 tools | Browser automation, UI testing, screenshots |
| **DevOps** | 6 tools | Container management, deployment, logs |
| **Database** | 6 tools | Schema inspection, migrations, query optimization |
| **Infrastructure** | 6 tools | Cloud resources, networking, Terraform generation |
| **Total** | **29 tools** | Multi-domain feature implementation |

---

## Backend Expert

MCP Server for backend/API development with database and testing tools.

### Tools

#### 1. query_database

Execute SQL queries on PostgreSQL or MySQL databases.

**Input Schema:**
```typescript
{
  query: string;           // SQL query to execute
  database?: string;       // Database name (optional, uses default)
  timeout?: number;        // Query timeout in ms (default: 5000)
}
```

**Output:**
```typescript
{
  rows: Array<any>;        // Query result rows
  rowCount: number;        // Number of rows returned
  fields: string[];        // Column names
  duration: number;        // Execution time in ms
}
```

**Example Usage:**
```javascript
// Check if users table exists
query_database({
  query: "SELECT * FROM users WHERE status = 'active' LIMIT 10"
})
// Returns: { rows: [...], rowCount: 10, fields: ['id', 'email', ...], duration: 45 }

// Count active users
query_database({
  query: "SELECT COUNT(*) as total FROM users WHERE status = 'active'"
})
// Returns: { rows: [{ total: 1234 }], rowCount: 1, ... }

// Check schema
query_database({
  query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
})
// Returns: List of all tables
```

**Use Cases:**
- Verify data exists before implementation
- Check schema structure
- Validate data insertion/updates
- Debug database issues
- Query test data

**Security:**
- Read-only access recommended
- Queries timeout after 5 seconds (configurable)
- Use parameterized queries to prevent SQL injection
- Never expose production credentials

---

#### 2. test_api_endpoint

Send HTTP requests to API endpoints and analyze responses.

**Input Schema:**
```typescript
{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;             // Full URL to test
  headers?: object;        // HTTP headers
  body?: any;              // Request body (for POST/PUT/PATCH)
  timeout?: number;        // Request timeout in ms (default: 10000)
}
```

**Output:**
```typescript
{
  status: number;          // HTTP status code (200, 404, etc.)
  statusText: string;      // Status text ("OK", "Not Found", etc.)
  headers: object;         // Response headers
  data: any;               // Response body
  responseTime: number;    // Time taken in ms
  success: boolean;        // true if 2xx status
}
```

**Example Usage:**
```javascript
// Test GET endpoint
test_api_endpoint({
  method: 'GET',
  url: 'http://localhost:3000/api/users/123'
})
// Returns: { status: 200, data: { id: 123, name: "John" }, ... }

// Test POST with authentication
test_api_endpoint({
  method: 'POST',
  url: 'http://localhost:3000/api/auth/login',
  headers: { 'Content-Type': 'application/json' },
  body: { email: 'test@example.com', password: 'test123' }
})
// Returns: { status: 200, data: { access_token: "...", refresh_token: "..." }, responseTime: 150 }

// Test error handling
test_api_endpoint({
  method: 'GET',
  url: 'http://localhost:3000/api/nonexistent'
})
// Returns: { status: 404, data: { error: "Not found" }, ... }
```

**Use Cases:**
- Test endpoints during implementation
- Verify authentication works
- Check error handling (4xx, 5xx responses)
- Measure API response times
- Validate request/response formats

**Best Practices:**
- Test with various inputs (valid, invalid, edge cases)
- Check both success and error paths
- Verify response times are acceptable
- Test authentication/authorization

---

#### 3. run_tests

Execute backend test suites (Jest, Pytest, Go test, etc.).

**Input Schema:**
```typescript
{
  testPath?: string;       // Specific test file or directory
  pattern?: string;        // Test name pattern to match
  coverage?: boolean;      // Run with coverage (default: false)
}
```

**Output:**
```typescript
{
  passed: boolean;         // All tests passed
  output: string;          // Full test output
  errors?: string;         // Error output if failed
}
```

**Example Usage:**
```javascript
// Run all tests
run_tests({})
// Returns: Full test suite output

// Run specific test file
run_tests({
  testPath: 'tests/auth/login.test.js'
})

// Run tests matching pattern
run_tests({
  pattern: 'authentication'
})

// Run with coverage
run_tests({
  coverage: true
})
// Returns: Test results + coverage report
```

**Use Cases:**
- Verify tests pass after changes
- Run specific test suites
- Check code coverage
- Validate bug fixes
- Test-driven development

**Configuration:**
Set `TEST_COMMAND` environment variable:
```bash
export TEST_COMMAND="npm test"       # Node.js
export TEST_COMMAND="pytest"         # Python
export TEST_COMMAND="go test ./..."  # Go
export TEST_COMMAND="cargo test"     # Rust
```

---

#### 4. run_migration

Execute database migrations (up or down).

**Input Schema:**
```typescript
{
  direction?: 'up' | 'down';  // Migration direction (default: 'up')
  steps?: number;              // Number of migrations to run (default: 1)
}
```

**Output:**
```typescript
{
  direction: 'up' | 'down';
  steps: number;
  output: string;              // Migration execution output
}
```

**Example Usage:**
```javascript
// Run next migration
run_migration({
  direction: 'up'
})
// Returns: Output of migration execution

// Rollback last migration
run_migration({
  direction: 'down',
  steps: 1
})

// Run multiple migrations
run_migration({
  direction: 'up',
  steps: 3
})
```

**Use Cases:**
- Create database schema during setup
- Update schema during feature development
- Rollback problematic migrations
- Test migration scripts
- Setup test databases

**Configuration:**
Set `MIGRATION_COMMAND` environment variable:
```bash
export MIGRATION_COMMAND="npm run migrate"         # Node.js
export MIGRATION_COMMAND="alembic upgrade head"    # Python/Alembic
export MIGRATION_COMMAND="migrate -path ./migrations -database \$DATABASE_URL up"  # Go
```

---

#### 5. check_api_health

Verify API service is healthy and responding.

**Input Schema:**
```typescript
{
  url: string;             // Health check endpoint URL
  timeout?: number;        // Request timeout in ms (default: 5000)
}
```

**Output:**
```typescript
{
  healthy: boolean;        // Service is healthy (2xx response)
  status: number;          // HTTP status code
  responseTime: number;    // Response time in ms
  data: any;               // Health check response data
}
```

**Example Usage:**
```javascript
// Check API health
check_api_health({
  url: 'http://localhost:3000/health'
})
// Returns: {
//   healthy: true,
//   status: 200,
//   responseTime: 50,
//   data: { status: "healthy", database: "connected", uptime: 3600 }
// }

// Check specific service
check_api_health({
  url: 'http://localhost:3000/api/v1/health'
})
```

**Use Cases:**
- Verify API is running before tests
- Check service health after deployment
- Monitor uptime during implementation
- Validate infrastructure changes
- Debug connection issues

**Health Endpoint Best Practices:**
```javascript
// Good health endpoint response:
{
  "status": "healthy",
  "timestamp": "2025-01-07T12:00:00Z",
  "database": "connected",
  "redis": "connected",
  "uptime": 3600,
  "version": "1.2.3"
}
```

---

### Backend Expert Resources

#### database://schema

Read current database schema structure.

**Returns:**
```typescript
{
  [tableName: string]: Array<{
    column: string;
    type: string;
    nullable: boolean;
  }>;
}
```

**Example:**
```javascript
// Access: @backend-expert:database://schema
{
  "users": [
    { "column": "id", "type": "uuid", "nullable": false },
    { "column": "email", "type": "varchar", "nullable": false },
    { "column": "created_at", "type": "timestamp", "nullable": false }
  ],
  "sessions": [...]
}
```

**Use Cases:**
- Review existing schema before migrations
- Verify table structure
- Check column types
- Document database design

---

## Frontend Expert

MCP Server for frontend/UI development with browser automation and testing tools.

### Tools

#### 1. run_browser

Launch browser and perform actions (navigate, click, fill, screenshot, get content).

**Input Schema:**
```typescript
{
  url: string;                           // URL to navigate to
  action?: 'navigate' | 'click' | 'fill' | 'screenshot' | 'get_content';
  selector?: string;                     // CSS selector for actions
  value?: string;                        // Value for fill action
  waitFor?: number;                      // Wait time in ms (default: 1000)
}
```

**Output:**
```typescript
{
  action: string;
  url: string;
  title?: string;          // Page title (navigate)
  clicked?: string;        // Selector clicked
  filled?: string;         // Selector filled
  value?: string;          // Value filled
  screenshot?: string;     // Screenshot path
  content?: string;        // Page or element content
}
```

**Example Usage:**
```javascript
// Navigate to page
run_browser({
  url: 'http://localhost:3000/login',
  action: 'navigate'
})
// Returns: { action: 'navigate', url: '...', title: 'Login Page' }

// Fill login form
run_browser({
  url: 'http://localhost:3000/login',
  action: 'fill',
  selector: '#email',
  value: 'test@example.com'
})

run_browser({
  url: 'http://localhost:3000/login',
  action: 'fill',
  selector: '#password',
  value: 'password123'
})

// Click login button
run_browser({
  url: 'http://localhost:3000/login',
  action: 'click',
  selector: 'button[type="submit"]'
})

// Take screenshot
run_browser({
  url: 'http://localhost:3000/dashboard',
  action: 'screenshot'
})
// Returns: { screenshot: '/path/to/screenshot-temp.png' }

// Get page content
run_browser({
  url: 'http://localhost:3000/api-docs',
  action: 'get_content',
  selector: '.api-endpoint'
})
// Returns: { content: 'API endpoint text...' }
```

**Use Cases:**
- Test user flows
- Verify UI elements exist
- Fill and submit forms
- Capture UI state
- Extract page content
- Debug rendering issues

**Browser Configuration:**
```bash
export BROWSER_TYPE="chromium"  # or "firefox", "webkit"
export HEADLESS="true"          # or "false" for visible browser
```

---

#### 2. test_component

Test frontend components (React, Vue, Angular, etc.).

**Input Schema:**
```typescript
{
  componentPath?: string;      // Path to component file
  testCommand: string;          // Command to run tests
  pattern?: string;             // Test pattern to match
}
```

**Output:**
```typescript
{
  passed: boolean;
  output: string;               // Test output
}
```

**Example Usage:**
```javascript
// Test specific component
test_component({
  componentPath: 'src/components/LoginForm.test.tsx',
  testCommand: 'npm test'
})

// Test components matching pattern
test_component({
  testCommand: 'npm test',
  pattern: 'LoginForm'
})

// Run all component tests
test_component({
  testCommand: 'npm run test:components'
})
```

**Use Cases:**
- Verify component rendering
- Test user interactions
- Check props handling
- Validate state management
- Test-driven component development

---

#### 3. take_screenshot

Capture screenshots of pages or specific elements.

**Input Schema:**
```typescript
{
  url: string;                  // URL to capture
  selector?: string;            // CSS selector (optional, full page if not provided)
  filename?: string;            // Output filename (default: 'screenshot.png')
  fullPage?: boolean;           // Capture full page (default: false)
}
```

**Output:**
```typescript
{
  path: string;                 // Saved screenshot path
  url: string;                  // Captured URL
}
```

**Example Usage:**
```javascript
// Full page screenshot
take_screenshot({
  url: 'http://localhost:3000',
  filename: 'homepage.png',
  fullPage: true
})

// Specific element
take_screenshot({
  url: 'http://localhost:3000/login',
  selector: '.login-form',
  filename: 'login-form.png'
})

// Mobile viewport screenshot
take_screenshot({
  url: 'http://localhost:3000',
  filename: 'mobile-view.png'
})
```

**Use Cases:**
- Visual regression testing
- UI documentation
- Bug reports
- Design review
- CI/CD visual validation

---

#### 4. validate_accessibility

Run WCAG accessibility checks using axe-core.

**Input Schema:**
```typescript
{
  url: string;                              // URL to check
  standard?: 'wcag2a' | 'wcag2aa' | 'wcag2aaa';  // WCAG level (default: 'wcag2aa')
}
```

**Output:**
```typescript
{
  url: string;
  standard: string;
  passed: boolean;
  violations: Array<{
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    nodes: number;
  }>;
}
```

**Example Usage:**
```javascript
// Check WCAG 2.1 AA compliance
validate_accessibility({
  url: 'http://localhost:3000/login',
  standard: 'wcag2aa'
})
// Returns: {
//   passed: false,
//   violations: [
//     { id: 'label', impact: 'critical', description: 'Form elements must have labels', nodes: 2 },
//     { id: 'color-contrast', impact: 'serious', description: 'Elements must have sufficient color contrast', nodes: 1 }
//   ]
// }

// Check AAA compliance
validate_accessibility({
  url: 'http://localhost:3000',
  standard: 'wcag2aaa'
})
```

**Use Cases:**
- Ensure accessibility compliance
- Find accessibility issues early
- Validate ARIA attributes
- Check color contrast
- Verify keyboard navigation

---

#### 5. measure_performance

Measure page load performance metrics.

**Input Schema:**
```typescript
{
  url: string;                  // URL to measure
  runs?: number;                // Number of test runs (default: 3)
}
```

**Output:**
```typescript
{
  runs: number;
  averageLoadTime: number;
  averageDomContentLoaded: number;
  averageLoadComplete: number;
  measurements: Array<{
    run: number;
    loadTime: number;
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
  }>;
}
```

**Example Usage:**
```javascript
// Measure page performance
measure_performance({
  url: 'http://localhost:3000',
  runs: 5
})
// Returns: {
//   runs: 5,
//   averageLoadTime: 850,
//   averageDomContentLoaded: 720,
//   averageLoadComplete: 900,
//   measurements: [...]
// }
```

**Use Cases:**
- Benchmark page load times
- Compare before/after optimization
- Identify performance bottlenecks
- Set performance budgets
- Monitor performance regressions

---

#### 6. run_e2e_tests

Execute end-to-end tests (Playwright, Cypress, etc.).

**Input Schema:**
```typescript
{
  testPath?: string;            // Test file or directory
  pattern?: string;             // Test pattern to match
  headless?: boolean;           // Run headless (default: true)
}
```

**Output:**
```typescript
{
  passed: boolean;
  output: string;               // Test execution output
}
```

**Example Usage:**
```javascript
// Run all E2E tests
run_e2e_tests({})

// Run specific test file
run_e2e_tests({
  testPath: 'e2e/auth-flow.spec.ts'
})

// Run tests matching pattern
run_e2e_tests({
  pattern: 'checkout'
})

// Run in headed mode (visible browser)
run_e2e_tests({
  headless: false
})
```

**Use Cases:**
- Test complete user flows
- Verify multi-step processes
- Integration testing
- Smoke testing
- Regression testing

**Configuration:**
```bash
export E2E_TEST_COMMAND="npm run test:e2e"  # or "playwright test", "cypress run", etc.
```

---

### Frontend Expert Resources

#### browser://viewport

Get current browser viewport configuration.

**Returns:**
```typescript
{
  browserType: string;      // chromium, firefox, or webkit
  headless: boolean;
  viewportWidth: number;
  viewportHeight: number;
}
```

---

## DevOps Expert

MCP Server for DevOps/infrastructure with Docker and deployment tools.

### Tools

#### 1. check_container_status

Check Docker container status (specific container or all containers).

**Input Schema:**
```typescript
{
  containerName?: string;       // Container name or ID (optional, lists all if not provided)
}
```

**Output (single container):**
```typescript
{
  name: string;
  status: string;               // running, exited, paused, etc.
  running: boolean;
  startedAt: string;
  health?: string;              // healthy, unhealthy, starting, or undefined
  ports: object;
}
```

**Output (all containers):**
```typescript
{
  containers: Array<{
    name: string;
    status: string;
    running: boolean;
    image: string;
    ports: string;
  }>;
  total: number;
  running: number;
}
```

**Example Usage:**
```javascript
// Check specific container
check_container_status({
  containerName: 'backend'
})
// Returns: { name: 'backend', status: 'running', running: true, health: 'healthy', ... }

// List all containers
check_container_status({})
// Returns: {
//   containers: [
//     { name: 'backend', status: 'running', running: true, ... },
//     { name: 'frontend', status: 'running', running: true, ... },
//     { name: 'database', status: 'exited', running: false, ... }
//   ],
//   total: 3,
//   running: 2
// }
```

**Use Cases:**
- Verify containers are running
- Debug deployment issues
- Monitor service status
- Check health status
- Identify stopped containers

---

#### 2. view_logs

View Docker container logs.

**Input Schema:**
```typescript
{
  containerName: string;        // Container name or ID
  tail?: number;                // Number of lines (default: 100)
  follow?: boolean;             // Follow log output (default: false)
}
```

**Output:**
```typescript
{
  containerName: string;
  logs: string;                 // Log output
}
```

**Example Usage:**
```javascript
// View last 100 lines
view_logs({
  containerName: 'backend'
})

// View last 500 lines
view_logs({
  containerName: 'backend',
  tail: 500
})

// View and follow logs
view_logs({
  containerName: 'backend',
  follow: true
})
```

**Use Cases:**
- Debug errors
- Monitor application output
- Check startup logs
- Investigate crashes
- Verify deployment success

---

#### 3. restart_service

Restart Docker container or service.

**Input Schema:**
```typescript
{
  containerName: string;        // Container name or ID
  graceful?: boolean;           // Graceful restart (stop then start) (default: true)
}
```

**Output:**
```typescript
{
  containerName: string;
  success: boolean;
}
```

**Example Usage:**
```javascript
// Graceful restart
restart_service({
  containerName: 'backend',
  graceful: true
})

// Quick restart
restart_service({
  containerName: 'backend',
  graceful: false
})
```

**Use Cases:**
- Apply configuration changes
- Clear memory leaks
- Restart after code changes
- Recover from errors
- Test startup behavior

---

#### 4. run_health_check

Run health checks on services (HTTP or container-based).

**Input Schema:**
```typescript
{
  serviceUrl?: string;          // HTTP health check URL
  containerName?: string;       // Container to check (if no URL)
}
```

**Output:**
```typescript
{
  healthy: boolean;
  status: number | string;
  responseTime?: number;        // For HTTP checks
  data?: any;                   // Health check response
}
```

**Example Usage:**
```javascript
// HTTP health check
run_health_check({
  serviceUrl: 'http://localhost:3000/health'
})
// Returns: { healthy: true, status: 200, responseTime: 50, data: {...} }

// Container health check
run_health_check({
  containerName: 'backend'
})
// Returns: { healthy: true, status: 'healthy', lastCheck: {...} }
```

**Use Cases:**
- Verify deployment success
- Check service availability
- Monitor uptime
- Validate infrastructure
- Debug connection issues

---

#### 5. read_secret

Read secrets from Docker secrets, environment variables, or files.

**Input Schema:**
```typescript
{
  secretName: string;           // Secret name
  source?: 'docker' | 'env' | 'file';  // Secret source (default: 'docker')
}
```

**Output:**
```typescript
{
  secretName: string;
  source: string;
  valuePreview: string;         // Masked value (first/last 4 chars)
  note: string;
}
```

**Example Usage:**
```javascript
// Read from Docker secrets
read_secret({
  secretName: 'db_password',
  source: 'docker'
})
// Returns: { valuePreview: 'post****word', note: 'Full value available in secure context only' }

// Read from environment
read_secret({
  secretName: 'API_KEY',
  source: 'env'
})
// Returns: { valuePreview: 'sk_t****123', ... }

// Read from file
read_secret({
  secretName: 'jwt_secret.txt',
  source: 'file'
})
```

**Use Cases:**
- Verify secrets exist
- Check secret configuration
- Debug authentication issues
- Validate deployment secrets
- Document secret requirements

**Security:**
- Full values NEVER returned (always masked)
- Only accessible in secure contexts
- Use for verification only, not retrieval

---

#### 6. deploy_service

Deploy or update Docker services.

**Input Schema:**
```typescript
{
  serviceName?: string;         // Specific service (optional, deploys all if not provided)
  command?: string;             // Custom deployment command
  buildFirst?: boolean;         // Build before deploy (default: true)
}
```

**Output:**
```typescript
{
  success: boolean;
  output: string;               // Deployment output
}
```

**Example Usage:**
```javascript
// Deploy all services
deploy_service({
  buildFirst: true
})

// Deploy specific service
deploy_service({
  serviceName: 'backend',
  buildFirst: true
})

// Deploy without building
deploy_service({
  serviceName: 'backend',
  buildFirst: false
})

// Custom deployment
deploy_service({
  command: 'docker stack deploy -c docker-compose.yml myapp'
})
```

**Use Cases:**
- Deploy after code changes
- Update running services
- Rollout new versions
- Test deployment process
- CI/CD integration

**Configuration:**
```bash
export DEPLOY_COMMAND="docker compose up -d"  # Default
export DEPLOY_COMMAND="docker stack deploy -c docker-compose.yml app"  # Swarm
export DEPLOY_COMMAND="kubectl apply -f k8s/"  # Kubernetes
```

---

### DevOps Expert Resources

#### docker://info

Get Docker system information.

**Returns:**
```typescript
{
  containers: number;
  containersRunning: number;
  images: number;
  serverVersion: string;
  operatingSystem: string;
  architecture: string;
}
```

#### docker://compose

Read current docker-compose.yml configuration.

**Returns:**
Full docker-compose.yml file content as YAML.

---

## Database Expert

MCP Server for database schema management, query optimization, and migrations.

### Tools

#### 1. inspect_schema

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

**Example:**
```javascript
@database-expert:inspect_schema({ tableName: 'users', includeIndexes: true })
```

#### 2. analyze_query

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

**Example:**
```javascript
@database-expert:analyze_query({
  query: "SELECT * FROM users WHERE email = 'test@example.com'",
  explainOptions: 'ANALYZE'
})
```

#### 3. create_migration

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

**Example:**
```javascript
@database-expert:create_migration({
  migrationName: 'add_status_to_users',
  upSQL: 'ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT \'active\';',
  downSQL: 'ALTER TABLE users DROP COLUMN status;'
})
```

#### 4. manage_indexes

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

  // list action:
  indexes: Array<{
    indexname: string;
    tablename: string;
    indexdef: string;
  }>;
}
```

**Example:**
```javascript
@database-expert:manage_indexes({
  action: 'create',
  tableName: 'users',
  indexName: 'users_email_idx',
  columns: ['email'],
  unique: true
})
```

#### 5. check_db_health

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
    cache_hit_ratio: number;         // Percentage
  };
}
```

**Example:**
```javascript
@database-expert:check_db_health({ includePerformance: true })
```

#### 6. optimize_table

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
  }>;
}
```

**Example:**
```javascript
@database-expert:optimize_table({ tableName: 'users', operation: 'all' })
```

---

### Database Expert Resources

#### db://schema

Complete database schema information for all tables.

**Returns:**
```typescript
{
  [tableName]: {
    columns: Array<ColumnInfo>;
    indexes: Array<IndexInfo>;
    constraints: Array<ConstraintInfo>;
  }
}
```

#### db://health

Current database health metrics.

**Returns:**
```typescript
{
  healthy: boolean;
  connections: ConnectionStats;
  size: DatabaseSize;
  performance: PerformanceMetrics;
}
```

---

## Infrastructure Expert

MCP Server for cloud infrastructure management and Infrastructure-as-Code.

### Tools

#### 1. list_resources

List cloud resources across AWS services.

**Input:**
```typescript
{
  resourceType?: 'ec2' | 'rds' | 's3' | 'all';  // Default: 'all'
  filters?: {                        // AWS filters
    Name: string;
    Values: string[];
  };
}
```

**Output:**
```typescript
{
  ec2?: Array<{
    instanceId: string;
    instanceType: string;
    state: string;
    publicIp?: string;
    privateIp?: string;
    tags: Record<string, string>;
  }>;
  rds?: Array<{
    dbInstanceIdentifier: string;
    dbInstanceClass: string;
    engine: string;
    status: string;
    endpoint?: string;
  }>;
  s3?: Array<{
    name: string;
    creationDate: Date;
  }>;
}
```

**Example:**
```javascript
@infrastructure-expert:list_resources({ resourceType: 'ec2' })
```

#### 2. inspect_network

Inspect VPC network configuration.

**Input:**
```typescript
{
  vpcId?: string;                    // Specific VPC (optional)
  includeSubnets?: boolean;          // Default: true
  includeSecurityGroups?: boolean;   // Default: true
}
```

**Output:**
```typescript
{
  subnets?: Array<{
    subnetId: string;
    cidrBlock: string;
    availabilityZone: string;
    availableIpAddressCount: number;
  }>;
  securityGroups?: Array<{
    groupId: string;
    groupName: string;
    ingressRules: number;
    egressRules: number;
  }>;
}
```

**Example:**
```javascript
@infrastructure-expert:inspect_network({ vpcId: 'vpc-abc123' })
```

#### 3. manage_dns

Manage Route53 DNS records.

**Input:**
```typescript
{
  action: 'list' | 'create' | 'update' | 'delete';
  hostedZoneId: string;
  recordName?: string;
  recordType?: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';
  recordValue?: string;
  ttl?: number;                      // Default: 300
}
```

**Output:**
```typescript
{
  records: Array<{
    name: string;
    type: string;
    ttl: number;
    values: string[];
  }>;
}
```

**Example:**
```javascript
@infrastructure-expert:manage_dns({
  action: 'list',
  hostedZoneId: 'Z1234567890ABC'
})
```

#### 4. monitor_metrics

Monitor CloudWatch metrics.

**Input:**
```typescript
{
  resourceId: string;                // Instance ID, DB instance ID, etc.
  metricName: string;                // CPUUtilization, NetworkIn, etc.
  namespace?: string;                // Default: 'AWS/EC2'
  period?: number;                   // Default: 300 (5 minutes)
  statistics?: 'Average' | 'Sum' | 'Maximum';
  startTime?: string;                // ISO 8601
  endTime?: string;                  // ISO 8601
}
```

**Output:**
```typescript
{
  resourceId: string;
  metricName: string;
  datapoints: Array<{
    timestamp: Date;
    value: number;
    unit: string;
  }>;
}
```

**Example:**
```javascript
@infrastructure-expert:monitor_metrics({
  resourceId: 'i-abc123',
  metricName: 'CPUUtilization',
  namespace: 'AWS/EC2'
})
```

#### 5. check_load_balancer

Check load balancer status and health.

**Input:**
```typescript
{
  loadBalancerArn?: string;          // Specific LB (optional)
  includeTargetHealth?: boolean;     // Default: true
}
```

**Output:**
```typescript
{
  loadBalancers: Array<{
    loadBalancerArn: string;
    loadBalancerName: string;
    dnsName: string;
    scheme: string;
    state: string;
  }>;
}
```

**Example:**
```javascript
@infrastructure-expert:check_load_balancer()
```

#### 6. generate_terraform

Generate Terraform IaC configuration.

**Input:**
```typescript
{
  resourceType: 'ec2' | 'rds' | 's3' | 'vpc' | 'security_group' | 'load_balancer';
  resourceConfig: {
    // Type-specific configuration
    name?: string;
    ami?: string;           // EC2
    instanceType?: string;  // EC2, RDS
    cidrBlock?: string;     // VPC
  };
  outputFile?: string;      // Default: './terraform/main.tf'
}
```

**Output:**
```typescript
{
  filePath: string;
  terraformConfig: string;  // Generated HCL code
}
```

**Example:**
```javascript
@infrastructure-expert:generate_terraform({
  resourceType: 'ec2',
  resourceConfig: {
    name: 'web-server',
    ami: 'ami-0c55b159cbfafe1f0',
    instanceType: 't2.micro'
  }
})
```

---

### Infrastructure Expert Resources

#### aws://resources

List of all AWS resources (EC2, RDS, S3, etc.).

**Returns:**
```typescript
{
  ec2: Array<EC2Instance>;
  rds: Array<RDSInstance>;
  s3: Array<S3Bucket>;
}
```

#### aws://network

VPC and network configuration.

**Returns:**
```typescript
{
  subnets: Array<Subnet>;
  securityGroups: Array<SecurityGroup>;
}
```

---

## Integration Examples

### Example 1: User Authentication Feature (All 3 Domains)

```javascript
// Planning: domains: [backend, frontend, devops]

// BACKEND EXPERT
// 1. Check schema
@backend-expert:query_database("SELECT table_name FROM information_schema.tables")

// 2. Run migration
@backend-expert:run_migration({ direction: 'up' })

// 3. Test auth endpoint
@backend-expert:test_api_endpoint({
  method: 'POST',
  url: 'http://localhost:3000/api/auth/login',
  body: { email: 'test@example.com', password: 'test123' }
})

// 4. Run tests
@backend-expert:run_tests({ pattern: 'auth' })

// FRONTEND EXPERT
// 5. Test login form
@frontend-expert:run_browser({
  url: 'http://localhost:3000/login',
  action: 'navigate'
})

// 6. Test form submission
@frontend-expert:test_component({
  testCommand: 'npm test',
  pattern: 'LoginForm'
})

// 7. Check accessibility
@frontend-expert:validate_accessibility({
  url: 'http://localhost:3000/login'
})

// 8. Take screenshot
@frontend-expert:take_screenshot({
  url: 'http://localhost:3000/login',
  filename: 'login-form.png'
})

// DEVOPS EXPERT
// 9. Deploy services
@devops-expert:deploy_service({ buildFirst: true })

// 10. Check containers
@devops-expert:check_container_status({})

// 11. Verify health
@devops-expert:run_health_check({
  serviceUrl: 'http://localhost:3000/health'
})

// 12. Check logs
@devops-expert:view_logs({
  containerName: 'backend',
  tail: 100
})
```

### Example 2: Performance Optimization (Frontend + Backend)

```javascript
// FRONTEND: Measure baseline
@frontend-expert:measure_performance({
  url: 'http://localhost:3000/dashboard',
  runs: 5
})
// Baseline: 1200ms average

// BACKEND: Optimize query
@backend-expert:query_database({
  query: "EXPLAIN ANALYZE SELECT * FROM users WHERE status = 'active'"
})

// BACKEND: Add index
@backend-expert:run_migration({ direction: 'up' })

// BACKEND: Verify improvement
@backend-expert:query_database({
  query: "SELECT * FROM users WHERE status = 'active' LIMIT 100"
})
// Query time: 45ms → 5ms

// FRONTEND: Measure after optimization
@frontend-expert:measure_performance({
  url: 'http://localhost:3000/dashboard',
  runs: 5
})
// After: 800ms average (33% improvement!)
```

### Example 3: Deployment Pipeline (All 3 Domains)

```javascript
// BACKEND: Run tests
@backend-expert:run_tests({ coverage: true })

// FRONTEND: Run E2E tests
@frontend-expert:run_e2e_tests({ headless: true })

// DEVOPS: Deploy if tests pass
@devops-expert:deploy_service({
  serviceName: 'backend',
  buildFirst: true
})

// DEVOPS: Verify deployment
@devops-expert:check_container_status({ containerName: 'backend' })

// DEVOPS: Check health
@devops-expert:run_health_check({
  serviceUrl: 'http://localhost:3000/health'
})

// BACKEND: Smoke test
@backend-expert:test_api_endpoint({
  method: 'GET',
  url: 'http://localhost:3000/api/health'
})

// DEVOPS: Monitor logs
@devops-expert:view_logs({
  containerName: 'backend',
  tail: 50
})
```

---

## Tool Comparison Matrix

| Capability | Backend | Frontend | DevOps | Database | Infrastructure |
|------------|---------|----------|--------|----------|----------------|
| Database Query | ✅ | ❌ | ❌ | ✅ | ❌ |
| Schema Inspection | ❌ | ❌ | ❌ | ✅ | ❌ |
| Query Optimization | ❌ | ❌ | ❌ | ✅ | ❌ |
| Migrations | ✅ | ❌ | ❌ | ✅ | ❌ |
| Index Management | ❌ | ❌ | ❌ | ✅ | ❌ |
| API Testing | ✅ | ❌ | ✅ (health) | ❌ | ❌ |
| Test Execution | ✅ | ✅ | ❌ | ❌ | ❌ |
| Browser Automation | ❌ | ✅ | ❌ | ❌ | ❌ |
| Screenshots | ❌ | ✅ | ❌ | ❌ | ❌ |
| Accessibility | ❌ | ✅ | ❌ | ❌ | ❌ |
| Performance Metrics | ❌ | ✅ (page load) | ❌ | ✅ (DB health) | ✅ (CloudWatch) |
| Container Management | ❌ | ❌ | ✅ | ❌ | ❌ |
| Deployment | ❌ | ❌ | ✅ | ❌ | ❌ |
| Log Viewing | ❌ | ❌ | ✅ | ❌ | ❌ |
| Secret Management | ❌ | ❌ | ✅ | ❌ | ❌ |
| Cloud Resources | ❌ | ❌ | ❌ | ❌ | ✅ |
| Network Config | ❌ | ❌ | ❌ | ❌ | ✅ |
| DNS Management | ❌ | ❌ | ❌ | ❌ | ✅ |
| IaC Generation | ❌ | ❌ | ❌ | ❌ | ✅ (Terraform) |

---

## Best Practices

### General

1. **Use the right expert for the task**
   - Backend for database queries, API testing, running tests
   - Frontend for UI/browser work, accessibility, performance
   - DevOps for infrastructure/deployment, containers, logs
   - Database for schema management, query optimization, migrations
   - Infrastructure for cloud resources, networking, IaC generation

2. **Chain tools logically**
   - Check → Test → Deploy → Verify
   - Query → Validate → Update → Test

3. **Handle errors gracefully**
   - Check status before operations
   - Verify success after operations
   - Log issues for debugging

4. **Document decisions**
   - Update progress.yml after tool use
   - Add notes to context.yml
   - Log important findings

### Security

1. **Never expose secrets**
   - Use environment variables
   - Read from secure storage
   - Mask values in logs

2. **Use read-only when possible**
   - Database queries (read-only user)
   - Container inspection (no modifications)
   - Log viewing (no tampering)

3. **Validate inputs**
   - Check URLs before requests
   - Sanitize SQL queries
   - Verify file paths

### Performance

1. **Use appropriate timeouts**
   - Short for health checks (5s)
   - Medium for API tests (10s)
   - Long for deployments (5min)

2. **Run tests in parallel when possible**
   - Different domains simultaneously
   - Independent test suites
   - Multiple environments

3. **Cache results**
   - Schema information
   - Container status
   - Configuration data

---

## Troubleshooting

### Backend Expert

**Problem:** Database connection fails
- ✅ Check DATABASE_URL is set correctly
- ✅ Verify database is running
- ✅ Test connection manually: `psql $DATABASE_URL`

**Problem:** Tests don't run
- ✅ Check TEST_COMMAND is correct
- ✅ Verify tests work outside MCP: `npm test`
- ✅ Check test files exist

### Frontend Expert

**Problem:** Browser doesn't launch
- ✅ Install Playwright browsers: `npx playwright install`
- ✅ Check system dependencies (Linux)
- ✅ Try non-headless mode: `HEADLESS=false`

**Problem:** Screenshots not saving
- ✅ Check file permissions
- ✅ Use absolute paths
- ✅ Verify directory exists

### DevOps Expert

**Problem:** Cannot connect to Docker
- ✅ Check Docker is running: `docker ps`
- ✅ Verify socket path: `ls /var/run/docker.sock`
- ✅ Check user permissions: `sudo usermod -aG docker $USER`

**Problem:** Deployment fails
- ✅ Test command manually
- ✅ Check docker-compose.yml syntax
- ✅ Verify images exist

### Database Expert

**Problem:** Cannot connect to database
- ✅ Check DATABASE_URL or MYSQL_URL is set
- ✅ Verify database is running
- ✅ Test connection: `psql $DATABASE_URL` or `mysql -h host -u user -p`

**Problem:** Migration creation fails
- ✅ Check migrationsPath directory exists
- ✅ Verify upSQL and downSQL are valid
- ✅ Test SQL manually before generating migration

**Problem:** Query analysis returns no suggestions
- ✅ Ensure query runs successfully first
- ✅ Check EXPLAIN permissions
- ✅ Try with simpler query to verify tool works

### Infrastructure Expert

**Problem:** Cannot connect to AWS
- ✅ Check AWS_REGION is set
- ✅ Verify AWS credentials: `aws sts get-caller-identity`
- ✅ Check IAM permissions for the service

**Problem:** Resources not found
- ✅ Verify correct region
- ✅ Check resource exists: `aws ec2 describe-instances`
- ✅ Confirm IAM permissions for describe operations

**Problem:** Terraform generation fails
- ✅ Check resourceConfig is complete
- ✅ Verify outputFile directory exists
- ✅ Review required fields for resource type

---

## See Also

- [MCP Integration Guide](./MCP_INTEGRATION.md) - Installation and setup
- [Backend Expert README](../.mcp-servers/backend-expert/README.md) - Backend tools
- [Frontend Expert README](../.mcp-servers/frontend-expert/README.md) - Frontend tools
- [DevOps Expert README](../.mcp-servers/devops-expert/README.md) - DevOps tools
- [Database Expert README](../.mcp-servers/database-expert/README.md) - Database tools
- [Infrastructure Expert README](../.mcp-servers/infrastructure-expert/README.md) - Infrastructure tools
- [Docker Deployment Guide](../.mcp-servers/DOCKER.md) - Docker configuration

---

**Total: 29 Tools | 5 Domain Experts | Full Stack Coverage**
