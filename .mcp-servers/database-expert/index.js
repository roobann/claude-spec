#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import pg from 'pg';
import mysql from 'mysql2/promise';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Database connection pools
let pgPool = null;
let mysqlPool = null;

const initPostgres = () => {
  if (!pgPool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL or POSTGRES_URL environment variable required for PostgreSQL');
    }
    pgPool = new pg.Pool({ connectionString });
  }
  return pgPool;
};

const initMySQL = () => {
  if (!mysqlPool) {
    const connectionString = process.env.MYSQL_URL;
    if (!connectionString) {
      throw new Error('MYSQL_URL environment variable required for MySQL');
    }
    mysqlPool = mysql.createPool(connectionString);
  }
  return mysqlPool;
};

const getDbType = () => {
  return process.env.DATABASE_TYPE || 'postgres';
};

const getPool = () => {
  const dbType = getDbType();
  return dbType === 'mysql' ? initMySQL() : initPostgres();
};

// Create MCP server
const server = new Server({
  name: 'database-expert',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
    resources: {},
  },
});

// ========================================
// TOOL: List
// ========================================
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'inspect_schema',
        description: 'Inspect database schema (tables, columns, constraints, relationships)',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Specific table name (optional, lists all if not provided)',
            },
            includeIndexes: {
              type: 'boolean',
              description: 'Include index information',
              default: true,
            },
            includeConstraints: {
              type: 'boolean',
              description: 'Include constraint information',
              default: true,
            },
          },
        },
      },
      {
        name: 'analyze_query',
        description: 'Analyze query execution plan and suggest optimizations',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL query to analyze',
            },
            explainOptions: {
              type: 'string',
              enum: ['ANALYZE', 'BUFFERS', 'VERBOSE', 'ALL'],
              description: 'EXPLAIN options (PostgreSQL)',
              default: 'ANALYZE',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'create_migration',
        description: 'Generate database migration file',
        inputSchema: {
          type: 'object',
          properties: {
            migrationName: {
              type: 'string',
              description: 'Migration name (e.g., "add_users_table")',
            },
            upSQL: {
              type: 'string',
              description: 'SQL for forward migration',
            },
            downSQL: {
              type: 'string',
              description: 'SQL for rollback migration',
            },
            migrationsPath: {
              type: 'string',
              description: 'Path to migrations directory',
              default: './migrations',
            },
          },
          required: ['migrationName', 'upSQL', 'downSQL'],
        },
      },
      {
        name: 'manage_indexes',
        description: 'Create, drop, or analyze database indexes',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'drop', 'analyze', 'list'],
              description: 'Index operation',
            },
            tableName: {
              type: 'string',
              description: 'Table name',
            },
            indexName: {
              type: 'string',
              description: 'Index name',
            },
            columns: {
              type: 'array',
              items: { type: 'string' },
              description: 'Columns for index creation',
            },
            indexType: {
              type: 'string',
              enum: ['btree', 'hash', 'gin', 'gist', 'brin'],
              description: 'Index type (PostgreSQL)',
              default: 'btree',
            },
            unique: {
              type: 'boolean',
              description: 'Create unique index',
              default: false,
            },
          },
          required: ['action'],
        },
      },
      {
        name: 'check_db_health',
        description: 'Check database health metrics (connections, size, performance)',
        inputSchema: {
          type: 'object',
          properties: {
            includeConnections: {
              type: 'boolean',
              description: 'Include connection stats',
              default: true,
            },
            includeSize: {
              type: 'boolean',
              description: 'Include database size info',
              default: true,
            },
            includePerformance: {
              type: 'boolean',
              description: 'Include performance metrics',
              default: true,
            },
          },
        },
      },
      {
        name: 'optimize_table',
        description: 'Optimize table (vacuum, analyze, reindex)',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Table name to optimize',
            },
            operation: {
              type: 'string',
              enum: ['vacuum', 'analyze', 'reindex', 'all'],
              description: 'Optimization operation',
              default: 'analyze',
            },
            full: {
              type: 'boolean',
              description: 'Full vacuum (PostgreSQL)',
              default: false,
            },
          },
          required: ['tableName'],
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'inspect_schema':
        return await handleInspectSchema(args);
      case 'analyze_query':
        return await handleAnalyzeQuery(args);
      case 'create_migration':
        return await handleCreateMigration(args);
      case 'manage_indexes':
        return await handleManageIndexes(args);
      case 'check_db_health':
        return await handleCheckDbHealth(args);
      case 'optimize_table':
        return await handleOptimizeTable(args);
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

async function handleInspectSchema(args) {
  const { tableName, includeIndexes = true, includeConstraints = true } = args;
  const dbType = getDbType();

  try {
    const pool = getPool();
    let schemaInfo = {};

    if (dbType === 'postgres') {
      if (tableName) {
        // Get specific table schema
        const tableQuery = `
          SELECT
            c.column_name,
            c.data_type,
            c.character_maximum_length,
            c.is_nullable,
            c.column_default
          FROM information_schema.columns c
          WHERE c.table_name = $1
          ORDER BY c.ordinal_position;
        `;
        const result = await pool.query(tableQuery, [tableName]);

        schemaInfo[tableName] = {
          columns: result.rows,
        };

        // Get indexes
        if (includeIndexes) {
          const indexQuery = `
            SELECT
              i.indexname as index_name,
              i.indexdef as definition
            FROM pg_indexes i
            WHERE i.tablename = $1;
          `;
          const indexes = await pool.query(indexQuery, [tableName]);
          schemaInfo[tableName].indexes = indexes.rows;
        }

        // Get constraints
        if (includeConstraints) {
          const constraintQuery = `
            SELECT
              tc.constraint_name,
              tc.constraint_type,
              kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = $1;
          `;
          const constraints = await pool.query(constraintQuery, [tableName]);
          schemaInfo[tableName].constraints = constraints.rows;
        }
      } else {
        // Get all tables
        const tablesQuery = `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          ORDER BY table_name;
        `;
        const tables = await pool.query(tablesQuery);

        for (const table of tables.rows) {
          const tn = table.table_name;
          const columnsQuery = `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = $1
            ORDER BY ordinal_position;
          `;
          const columns = await pool.query(columnsQuery, [tn]);
          schemaInfo[tn] = { columns: columns.rows };
        }
      }
    } else if (dbType === 'mysql') {
      // MySQL implementation
      if (tableName) {
        const [columns] = await pool.query('DESCRIBE ??', [tableName]);
        schemaInfo[tableName] = { columns };

        if (includeIndexes) {
          const [indexes] = await pool.query('SHOW INDEXES FROM ??', [tableName]);
          schemaInfo[tableName].indexes = indexes;
        }
      } else {
        const [tables] = await pool.query('SHOW TABLES');
        for (const tableRow of tables) {
          const tn = Object.values(tableRow)[0];
          const [columns] = await pool.query('DESCRIBE ??', [tn]);
          schemaInfo[tn] = { columns };
        }
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: tableName
            ? `Schema for table '${tableName}' retrieved successfully`
            : `Schema for ${Object.keys(schemaInfo).length} tables retrieved successfully`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://schema',
            mimeType: 'application/json',
            text: JSON.stringify(schemaInfo, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to inspect schema: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleAnalyzeQuery(args) {
  const { query, explainOptions = 'ANALYZE' } = args;
  const dbType = getDbType();

  try {
    const pool = getPool();
    let analysis = {};

    if (dbType === 'postgres') {
      // Run EXPLAIN ANALYZE
      const explainQuery = `EXPLAIN (${explainOptions}, FORMAT JSON) ${query}`;
      const result = await pool.query(explainQuery);
      const plan = result.rows[0]['QUERY PLAN'][0];

      analysis = {
        executionTime: plan['Execution Time'],
        planningTime: plan['Planning Time'],
        plan: plan.Plan,
        suggestions: generateOptimizationSuggestions(plan.Plan),
      };
    } else if (dbType === 'mysql') {
      // MySQL EXPLAIN
      const [result] = await pool.query(`EXPLAIN ${query}`);
      analysis = {
        plan: result,
        suggestions: generateOptimizationSuggestions(result),
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Query analysis completed${analysis.executionTime ? ` (${analysis.executionTime.toFixed(2)}ms)` : ''}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://query-analysis',
            mimeType: 'application/json',
            text: JSON.stringify(analysis, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to analyze query: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

function generateOptimizationSuggestions(plan) {
  const suggestions = [];

  // Analyze plan for common issues
  if (typeof plan === 'object' && plan !== null) {
    // Sequential scans on large tables
    if (plan['Node Type'] === 'Seq Scan' && plan['Plan Rows'] > 1000) {
      suggestions.push({
        type: 'index',
        severity: 'high',
        message: `Sequential scan on large table. Consider adding an index on the filter column.`,
      });
    }

    // Nested loops with large datasets
    if (plan['Node Type'] === 'Nested Loop' && plan['Plan Rows'] > 10000) {
      suggestions.push({
        type: 'join',
        severity: 'medium',
        message: `Nested loop with large dataset. Consider using hash join or merge join.`,
      });
    }

    // Recursive analysis of child plans
    if (plan.Plans) {
      for (const childPlan of plan.Plans) {
        suggestions.push(...generateOptimizationSuggestions(childPlan));
      }
    }
  }

  return suggestions;
}

async function handleCreateMigration(args) {
  const { migrationName, upSQL, downSQL, migrationsPath = './migrations' } = args;

  try {
    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const fileName = `${timestamp}_${migrationName}.sql`;
    const filePath = join(migrationsPath, fileName);

    // Create migrations directory if needed
    await mkdir(migrationsPath, { recursive: true });

    // Create migration file with UP and DOWN sections
    const migrationContent = `-- Migration: ${migrationName}
-- Created: ${new Date().toISOString()}

-- ========================================
-- UP Migration
-- ========================================

${upSQL}

-- ========================================
-- DOWN Migration (Rollback)
-- ========================================

${downSQL}
`;

    await writeFile(filePath, migrationContent);

    return {
      content: [
        {
          type: 'text',
          text: `Migration file created successfully: ${fileName}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://migration',
            mimeType: 'text/plain',
            text: `File: ${filePath}\n\n${migrationContent}`,
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to create migration: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleManageIndexes(args) {
  const { action, tableName, indexName, columns, indexType = 'btree', unique = false } = args;
  const dbType = getDbType();

  try {
    const pool = getPool();
    let result;

    switch (action) {
      case 'create':
        if (!tableName || !indexName || !columns) {
          throw new Error('tableName, indexName, and columns required for create action');
        }

        if (dbType === 'postgres') {
          const uniqueKeyword = unique ? 'UNIQUE' : '';
          const columnList = columns.join(', ');
          const createQuery = `CREATE ${uniqueKeyword} INDEX ${indexName} ON ${tableName} USING ${indexType} (${columnList})`;
          await pool.query(createQuery);
          result = { created: indexName, table: tableName, columns, type: indexType };
        } else if (dbType === 'mysql') {
          const uniqueKeyword = unique ? 'UNIQUE' : '';
          const columnList = columns.join(', ');
          await pool.query(`CREATE ${uniqueKeyword} INDEX ?? ON ?? (${columnList})`, [indexName, tableName]);
          result = { created: indexName, table: tableName, columns };
        }
        break;

      case 'drop':
        if (!indexName) {
          throw new Error('indexName required for drop action');
        }

        if (dbType === 'postgres') {
          await pool.query(`DROP INDEX ${indexName}`);
        } else if (dbType === 'mysql') {
          if (!tableName) {
            throw new Error('tableName required for MySQL drop index');
          }
          await pool.query(`DROP INDEX ?? ON ??`, [indexName, tableName]);
        }
        result = { dropped: indexName };
        break;

      case 'list':
        if (dbType === 'postgres') {
          const query = tableName
            ? `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = $1`
            : `SELECT indexname, tablename, indexdef FROM pg_indexes WHERE schemaname = 'public'`;
          const queryResult = tableName ? await pool.query(query, [tableName]) : await pool.query(query);
          result = queryResult.rows;
        } else if (dbType === 'mysql') {
          if (!tableName) {
            throw new Error('tableName required for MySQL list indexes');
          }
          const [indexes] = await pool.query('SHOW INDEXES FROM ??', [tableName]);
          result = indexes;
        }
        break;

      case 'analyze':
        if (!tableName) {
          throw new Error('tableName required for analyze action');
        }

        if (dbType === 'postgres') {
          const query = `
            SELECT
              schemaname, tablename, indexname,
              idx_scan as scans,
              idx_tup_read as tuples_read,
              idx_tup_fetch as tuples_fetched
            FROM pg_stat_user_indexes
            WHERE tablename = $1
            ORDER BY idx_scan DESC;
          `;
          const queryResult = await pool.query(query, [tableName]);
          result = {
            table: tableName,
            indexes: queryResult.rows,
            analysis: queryResult.rows.length > 0
              ? 'Index usage statistics retrieved'
              : 'No index statistics available (table may not have been queried yet)',
          };
        } else {
          result = { message: 'Index analysis not available for MySQL in this version' };
        }
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Index operation '${action}' completed successfully`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://index-operation',
            mimeType: 'application/json',
            text: JSON.stringify(result, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to ${action} index: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleCheckDbHealth(args) {
  const { includeConnections = true, includeSize = true, includePerformance = true } = args;
  const dbType = getDbType();

  try {
    const pool = getPool();
    const health = {};

    if (dbType === 'postgres') {
      // Connection stats
      if (includeConnections) {
        const connQuery = `
          SELECT
            count(*) as total_connections,
            count(*) FILTER (WHERE state = 'active') as active_connections,
            count(*) FILTER (WHERE state = 'idle') as idle_connections
          FROM pg_stat_activity;
        `;
        const connResult = await pool.query(connQuery);
        health.connections = connResult.rows[0];
      }

      // Database size
      if (includeSize) {
        const sizeQuery = `
          SELECT
            pg_database.datname,
            pg_size_pretty(pg_database_size(pg_database.datname)) as size
          FROM pg_database
          WHERE datname = current_database();
        `;
        const sizeResult = await pool.query(sizeQuery);
        health.size = sizeResult.rows[0];
      }

      // Performance metrics
      if (includePerformance) {
        const perfQuery = `
          SELECT
            blks_hit,
            blks_read,
            CASE WHEN (blks_hit + blks_read) > 0
              THEN round(blks_hit::numeric / (blks_hit + blks_read) * 100, 2)
              ELSE 0
            END as cache_hit_ratio
          FROM pg_stat_database
          WHERE datname = current_database();
        `;
        const perfResult = await pool.query(perfQuery);
        health.performance = perfResult.rows[0];
      }
    } else if (dbType === 'mysql') {
      // MySQL health checks
      if (includeConnections) {
        const [result] = await pool.query('SHOW STATUS LIKE "Threads_connected"');
        health.connections = { total_connections: result[0].Value };
      }

      if (includeSize) {
        const [result] = await pool.query(`
          SELECT
            table_schema AS database_name,
            ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
          FROM information_schema.tables
          WHERE table_schema = DATABASE()
          GROUP BY table_schema
        `);
        health.size = result[0];
      }
    }

    health.healthy = true;
    health.timestamp = new Date().toISOString();

    return {
      content: [
        {
          type: 'text',
          text: `Database health check completed ✅`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://health',
            mimeType: 'application/json',
            text: JSON.stringify(health, null, 2),
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

async function handleOptimizeTable(args) {
  const { tableName, operation = 'analyze', full = false } = args;
  const dbType = getDbType();

  try {
    const pool = getPool();
    const results = [];

    if (dbType === 'postgres') {
      switch (operation) {
        case 'vacuum':
          const vacuumCmd = full ? `VACUUM FULL ${tableName}` : `VACUUM ${tableName}`;
          await pool.query(vacuumCmd);
          results.push({ operation: 'vacuum', status: 'completed', full });
          break;

        case 'analyze':
          await pool.query(`ANALYZE ${tableName}`);
          results.push({ operation: 'analyze', status: 'completed' });
          break;

        case 'reindex':
          await pool.query(`REINDEX TABLE ${tableName}`);
          results.push({ operation: 'reindex', status: 'completed' });
          break;

        case 'all':
          await pool.query(`VACUUM ANALYZE ${tableName}`);
          await pool.query(`REINDEX TABLE ${tableName}`);
          results.push(
            { operation: 'vacuum analyze', status: 'completed' },
            { operation: 'reindex', status: 'completed' }
          );
          break;
      }
    } else if (dbType === 'mysql') {
      switch (operation) {
        case 'analyze':
          await pool.query(`ANALYZE TABLE ??`, [tableName]);
          results.push({ operation: 'analyze', status: 'completed' });
          break;

        case 'vacuum':
        case 'all':
          await pool.query(`OPTIMIZE TABLE ??`, [tableName]);
          results.push({ operation: 'optimize', status: 'completed' });
          break;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Table '${tableName}' optimization completed ✅`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://optimize',
            mimeType: 'application/json',
            text: JSON.stringify({ table: tableName, results }, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to optimize table: ${error.message}`,
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
        uri: 'db://schema',
        name: 'Database Schema',
        description: 'Complete database schema information',
        mimeType: 'application/json',
      },
      {
        uri: 'db://health',
        name: 'Database Health',
        description: 'Current database health metrics',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;

  if (uri === 'db://schema') {
    try {
      const result = await handleInspectSchema({ includeIndexes: true, includeConstraints: true });
      return {
        contents: result.content.filter(c => c.type === 'resource').map(c => ({
          uri,
          mimeType: c.resource.mimeType,
          text: c.resource.text,
        })),
      };
    } catch (error) {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  }

  if (uri === 'db://health') {
    try {
      const result = await handleCheckDbHealth({ includeConnections: true, includeSize: true, includePerformance: true });
      return {
        contents: result.content.filter(c => c.type === 'resource').map(c => ({
          uri,
          mimeType: c.resource.mimeType,
          text: c.resource.text,
        })),
      };
    } catch (error) {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `Error: ${error.message}`,
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
  console.error('Database Expert MCP Server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
