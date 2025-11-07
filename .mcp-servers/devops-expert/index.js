#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import Docker from 'dockerode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';

const execAsync = promisify(exec);

// Docker connection
let docker = null;
const initDocker = () => {
  if (!docker) {
    const dockerHost = process.env.DOCKER_HOST || '/var/run/docker.sock';
    docker = new Docker({ socketPath: dockerHost });
  }
  return docker;
};

// Create MCP server
const server = new Server({
  name: 'devops-expert',
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
        name: 'check_container_status',
        description: 'Check Docker container status',
        inputSchema: {
          type: 'object',
          properties: {
            containerName: {
              type: 'string',
              description: 'Container name or ID (optional, lists all if not provided)',
            },
          },
        },
      },
      {
        name: 'view_logs',
        description: 'View container logs',
        inputSchema: {
          type: 'object',
          properties: {
            containerName: {
              type: 'string',
              description: 'Container name or ID',
            },
            tail: {
              type: 'number',
              description: 'Number of lines to show',
              default: 100,
            },
            follow: {
              type: 'boolean',
              description: 'Follow log output',
              default: false,
            },
          },
          required: ['containerName'],
        },
      },
      {
        name: 'restart_service',
        description: 'Restart Docker container or service',
        inputSchema: {
          type: 'object',
          properties: {
            containerName: {
              type: 'string',
              description: 'Container name or ID',
            },
            graceful: {
              type: 'boolean',
              description: 'Graceful restart (stop then start)',
              default: true,
            },
          },
          required: ['containerName'],
        },
      },
      {
        name: 'run_health_check',
        description: 'Run health check on service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceUrl: {
              type: 'string',
              description: 'Health check endpoint URL',
            },
            containerName: {
              type: 'string',
              description: 'Container name (for container health)',
            },
          },
        },
      },
      {
        name: 'read_secret',
        description: 'Read secret from Docker secrets or environment',
        inputSchema: {
          type: 'object',
          properties: {
            secretName: {
              type: 'string',
              description: 'Secret name',
            },
            source: {
              type: 'string',
              enum: ['docker', 'env', 'file'],
              description: 'Secret source',
              default: 'docker',
            },
          },
          required: ['secretName'],
        },
      },
      {
        name: 'deploy_service',
        description: 'Deploy or update Docker service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceName: {
              type: 'string',
              description: 'Service name',
            },
            command: {
              type: 'string',
              description: 'Deployment command',
            },
            buildFirst: {
              type: 'boolean',
              description: 'Build images before deploying',
              default: true,
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'check_container_status':
        return await handleCheckContainerStatus(args);
      case 'view_logs':
        return await handleViewLogs(args);
      case 'restart_service':
        return await handleRestartService(args);
      case 'run_health_check':
        return await handleRunHealthCheck(args);
      case 'read_secret':
        return await handleReadSecret(args);
      case 'deploy_service':
        return await handleDeployService(args);
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

async function handleCheckContainerStatus(args) {
  const { containerName } = args;

  try {
    const dockerInstance = initDocker();

    if (containerName) {
      // Get specific container
      const container = dockerInstance.getContainer(containerName);
      const info = await container.inspect();

      return {
        content: [
          {
            type: 'text',
            text: `Container ${containerName}: ${info.State.Status} ${info.State.Running ? '✅' : '❌'}`,
          },
          {
            type: 'resource',
            resource: {
              uri: 'result://container-status',
              mimeType: 'application/json',
              text: JSON.stringify({
                name: info.Name,
                status: info.State.Status,
                running: info.State.Running,
                startedAt: info.State.StartedAt,
                health: info.State.Health?.Status,
                ports: info.NetworkSettings.Ports,
              }, null, 2),
            },
          },
        ],
      };
    } else {
      // List all containers
      const containers = await dockerInstance.listContainers({ all: true });

      const summary = containers.map(c => ({
        name: c.Names[0].replace('/', ''),
        status: c.State,
        running: c.State === 'running',
        image: c.Image,
        ports: c.Ports.map(p => `${p.PublicPort || '?'}:${p.PrivatePort}`).join(', '),
      }));

      return {
        content: [
          {
            type: 'text',
            text: `Found ${containers.length} containers (${summary.filter(c => c.running).length} running)`,
          },
          {
            type: 'resource',
            resource: {
              uri: 'result://containers',
              mimeType: 'application/json',
              text: JSON.stringify(summary, null, 2),
            },
          },
        ],
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Docker error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleViewLogs(args) {
  const { containerName, tail = 100 } = args;

  try {
    const dockerInstance = initDocker();
    const container = dockerInstance.getContainer(containerName);

    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail,
      timestamps: true,
    });

    // Convert buffer to string
    const logsStr = logs.toString('utf-8');

    return {
      content: [
        {
          type: 'text',
          text: `Logs for ${containerName} (last ${tail} lines):`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://logs',
            mimeType: 'text/plain',
            text: logsStr,
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to get logs: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleRestartService(args) {
  const { containerName, graceful = true } = args;

  try {
    const dockerInstance = initDocker();
    const container = dockerInstance.getContainer(containerName);

    if (graceful) {
      await container.stop();
      await container.start();
    } else {
      await container.restart();
    }

    return {
      content: [
        {
          type: 'text',
          text: `Container ${containerName} restarted successfully ✅`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Restart failed: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleRunHealthCheck(args) {
  const { serviceUrl, containerName } = args;

  try {
    if (serviceUrl) {
      // HTTP health check
      const axios = (await import('axios')).default;
      const startTime = Date.now();

      try {
        const response = await axios.get(serviceUrl, { timeout: 5000 });
        const duration = Date.now() - startTime;

        return {
          content: [
            {
              type: 'text',
              text: `Service healthy ✅ (${response.status} in ${duration}ms)`,
            },
            {
              type: 'resource',
              resource: {
                uri: 'result://health',
                mimeType: 'application/json',
                text: JSON.stringify({
                  healthy: true,
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
              text: `Service unhealthy ❌ (${error.message})`,
            },
          ],
          isError: true,
        };
      }
    } else if (containerName) {
      // Container health check
      const dockerInstance = initDocker();
      const container = dockerInstance.getContainer(containerName);
      const info = await container.inspect();

      const healthy = info.State.Health?.Status === 'healthy';

      return {
        content: [
          {
            type: 'text',
            text: `Container ${healthy ? 'healthy ✅' : 'unhealthy ❌'}`,
          },
          {
            type: 'resource',
            resource: {
              uri: 'result://health',
              mimeType: 'application/json',
              text: JSON.stringify({
                healthy,
                status: info.State.Health?.Status || 'no health check',
                lastCheck: info.State.Health?.Log?.[0],
              }, null, 2),
            },
          },
        ],
      };
    } else {
      throw new Error('Either serviceUrl or containerName must be provided');
    }
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

async function handleReadSecret(args) {
  const { secretName, source = 'docker' } = args;

  try {
    let secretValue = null;

    switch (source) {
      case 'docker':
        // Read from Docker secrets
        const dockerInstance = initDocker();
        const secrets = await dockerInstance.listSecrets();
        const secret = secrets.find(s => s.Spec.Name === secretName);

        if (!secret) {
          throw new Error(`Secret ${secretName} not found`);
        }

        // Note: Docker API doesn't return secret values for security
        secretValue = '[SECRET VALUE HIDDEN - Available in containers only]';
        break;

      case 'env':
        // Read from environment variable
        secretValue = process.env[secretName];
        if (!secretValue) {
          throw new Error(`Environment variable ${secretName} not set`);
        }
        // Mask the value for security
        secretValue = secretValue.substring(0, 4) + '****' + secretValue.substring(secretValue.length - 4);
        break;

      case 'file':
        // Read from secrets file
        const secretPath = process.env.SECRETS_PATH || '/run/secrets';
        secretValue = await readFile(`${secretPath}/${secretName}`, 'utf-8');
        // Mask the value
        secretValue = secretValue.substring(0, 4) + '****';
        break;
    }

    return {
      content: [
        {
          type: 'text',
          text: `Secret ${secretName} retrieved from ${source} ✅`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://secret',
            mimeType: 'application/json',
            text: JSON.stringify({
              secretName,
              source,
              valuePreview: secretValue,
              note: 'Full value available in secure context only',
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
          text: `Failed to read secret: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleDeployService(args) {
  const { serviceName, command, buildFirst = true } = args;

  try {
    const deployCmd = command || process.env.DEPLOY_COMMAND || 'docker compose up -d';

    let fullCmd = deployCmd;
    if (buildFirst) {
      fullCmd = 'docker compose build && ' + fullCmd;
    }

    if (serviceName) {
      fullCmd += ` ${serviceName}`;
    }

    const { stdout, stderr } = await execAsync(fullCmd, {
      cwd: process.cwd(),
      timeout: 300000, // 5 minutes for deployment
    });

    const success = !stderr.includes('ERROR') && !stderr.includes('error:');

    return {
      content: [
        {
          type: 'text',
          text: `Deployment ${success ? 'completed successfully ✅' : 'completed with warnings ⚠️'}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://deployment',
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
          text: `Deployment failed ❌: ${error.message}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://deployment-error',
            mimeType: 'text/plain',
            text: error.stdout || error.stderr || error.message,
          },
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
        uri: 'docker://info',
        name: 'Docker System Info',
        description: 'Docker daemon and system information',
        mimeType: 'application/json',
      },
      {
        uri: 'docker://compose',
        name: 'Docker Compose Configuration',
        description: 'Current docker-compose.yml configuration',
        mimeType: 'text/yaml',
      },
    ],
  };
});

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;

  if (uri === 'docker://info') {
    try {
      const dockerInstance = initDocker();
      const info = await dockerInstance.info();

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              containers: info.Containers,
              containersRunning: info.ContainersRunning,
              images: info.Images,
              serverVersion: info.ServerVersion,
              operatingSystem: info.OperatingSystem,
              architecture: info.Architecture,
            }, null, 2),
          },
        ],
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

  if (uri === 'docker://compose') {
    try {
      const composePath = process.env.COMPOSE_FILE || 'docker-compose.yml';
      const composeContent = await readFile(composePath, 'utf-8');

      return {
        contents: [
          {
            uri,
            mimeType: 'text/yaml',
            text: composeContent,
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `docker-compose.yml not found`,
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
  console.error('DevOps Expert MCP Server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
