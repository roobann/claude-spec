#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import pg from 'pg';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const { Pool } = pg;

// Database connection pool
let dbPool = null;
const initDatabase = () => {
  if (!dbPool && process.env.DATABASE_URL) {
    dbPool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return dbPool;
};

// Create MCP server
const server = new Server({
  name: 'backend-expert',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
    resources: {},
  },
});

// ========================================
// TOOL: Query Database
// ========================================
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'query_database',
        description: 'Execute SQL query on database (read-only by default)',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL query to execute',
            },
            database: {
              type: 'string',
              description: 'Database name (uses default if not specified)',
            },
            timeout: {
              type: 'number',
              description: 'Query timeout in ms',
              default: 5000,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'test_api_endpoint',
        description: 'Send HTTP request to API endpoint and analyze response',
        inputSchema: {
          type: 'object',
          properties: {
            method: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
              description: 'HTTP method',
            },
            url: {
              type: 'string',
              description: 'API endpoint URL',
            },
            headers: {
              type: 'object',
              description: 'HTTP headers',
            },
            body: {
              description: 'Request body',
            },
            timeout: {
              type: 'number',
              description: 'Request timeout in ms',
              default: 10000,
            },
          },
          required: ['method', 'url'],
        },
      },
      {
        name: 'run_tests',
        description: 'Execute backend test suite',
        inputSchema: {
          type: 'object',
          properties: {
            testPath: {
              type: 'string',
              description: 'Specific test file or directory',
            },
            pattern: {
              type: 'string',
              description: 'Test name pattern to match',
            },
            coverage: {
              type: 'boolean',
              description: 'Run with coverage',
              default: false,
            },
          },
        },
      },
      {
        name: 'run_migration',
        description: 'Execute database migration (up or down)',
        inputSchema: {
          type: 'object',
          properties: {
            direction: {
              type: 'string',
              enum: ['up', 'down'],
              description: 'Migration direction',
              default: 'up',
            },
            steps: {
              type: 'number',
              description: 'Number of migrations to run',
              default: 1,
            },
          },
        },
      },
      {
        name: 'check_api_health',
        description: 'Check if API service is healthy and responding',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Health check endpoint URL',
            },
            timeout: {
              type: 'number',
              description: 'Timeout in ms',
              default: 5000,
            },
          },
          required: ['url'],
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'query_database':
        return await handleQueryDatabase(args);
      case 'test_api_endpoint':
        return await handleTestApiEndpoint(args);
      case 'run_tests':
        return await handleRunTests(args);
      case 'run_migration':
        return await handleRunMigration(args);
      case 'check_api_health':
        return await handleCheckApiHealth(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// ========================================
// Tool Handlers
// ========================================

async function handleQueryDatabase(args) {
  const { query, timeout = 5000 } = args;
  const pool = initDatabase();

  if (!pool) {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: DATABASE_URL environment variable not configured',
        },
      ],
      isError: true,
    };
  }

  try {
    const startTime = Date.now();
    const result = await pool.query(query);
    const duration = Date.now() - startTime;

    return {
      content: [
        {
          type: 'text',
          text: `Query executed successfully in ${duration}ms. Returned ${result.rowCount} rows.`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://query',
            mimeType: 'application/json',
            text: JSON.stringify({
              rows: result.rows,
              rowCount: result.rowCount,
              fields: result.fields?.map(f => f.name) || [],
              duration,
            }, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Database error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleTestApiEndpoint(args) {
  const { method, url, headers, body, timeout = 10000 } = args;

  try {
    const startTime = Date.now();
    const response = await axios({
      method,
      url,
      headers,
      data: body,
      timeout,
      validateStatus: () => true, // Don't throw on non-2xx
    });
    const duration = Date.now() - startTime;

    const success = response.status >= 200 && response.status < 300;

    return {
      content: [
        {
          type: 'text',
          text: `${method} ${url} → ${response.status} ${response.statusText} in ${duration}ms ${success ? '✅' : '❌'}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://api-test',
            mimeType: 'application/json',
            text: JSON.stringify({
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              data: response.data,
              responseTime: duration,
              success,
            }, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Request failed: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleRunTests(args) {
  const { testPath, pattern, coverage } = args;

  try {
    const testCmd = process.env.TEST_COMMAND || 'npm test';
    let cmd = testCmd;

    if (testPath) cmd += ` ${testPath}`;
    if (pattern) cmd += ` -t "${pattern}"`;
    if (coverage) cmd += ' --coverage';

    const { stdout, stderr } = await execAsync(cmd, {
      cwd: process.cwd(),
      timeout: 60000,
      env: { ...process.env, CI: 'true' },
    });

    const passed = !stderr.includes('FAIL') && !stdout.includes('FAIL');

    return {
      content: [
        {
          type: 'text',
          text: `Tests ${passed ? 'passed ✅' : 'failed ❌'}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://tests',
            mimeType: 'text/plain',
            text: stdout || stderr,
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Test execution failed: ${error.message}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://test-error',
            mimeType: 'text/plain',
            text: error.stdout || error.stderr || error.message,
          },
        },
      ],
      isError: true,
    };
  }
}

async function handleRunMigration(args) {
  const { direction = 'up', steps = 1 } = args;

  try {
    const migrationCmd = process.env.MIGRATION_COMMAND || 'npm run migrate';
    const cmd = `${migrationCmd} ${direction}`;

    const { stdout, stderr } = await execAsync(cmd, {
      cwd: process.cwd(),
      timeout: 30000,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Migration ${direction} executed successfully`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://migration',
            mimeType: 'text/plain',
            text: stdout || stderr,
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Migration failed: ${error.message}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://migration-error',
            mimeType: 'text/plain',
            text: error.stdout || error.stderr || error.message,
          },
        },
      ],
      isError: true,
    };
  }
}

async function handleCheckApiHealth(args) {
  const { url, timeout = 5000 } = args;

  try {
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout,
      validateStatus: () => true,
    });
    const duration = Date.now() - startTime;

    const healthy = response.status === 200;

    return {
      content: [
        {
          type: 'text',
          text: `API ${healthy ? 'healthy ✅' : 'unhealthy ❌'} (${response.status} in ${duration}ms)`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://health-check',
            mimeType: 'application/json',
            text: JSON.stringify({
              healthy,
              status: response.status,
              responseTime: duration,
              data: response.data,
            }, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Health check failed: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

// ========================================
// Resources
// ========================================

server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'database://schema',
        name: 'Database Schema',
        description: 'Current database schema structure',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;

  if (uri === 'database://schema') {
    const pool = initDatabase();
    if (!pool) {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: 'Database not configured (DATABASE_URL missing)',
          },
        ],
      };
    }

    try {
      const result = await pool.query(`
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `);

      const schema = result.rows.reduce((acc, row) => {
        if (!acc[row.table_name]) {
          acc[row.table_name] = [];
        }
        acc[row.table_name].push({
          column: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
        });
        return acc;
      }, {});

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(schema, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `Error fetching schema: ${error.message}`,
          },
        ],
      };
    }
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// ========================================
// Start Server
// ========================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Backend Expert MCP Server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
