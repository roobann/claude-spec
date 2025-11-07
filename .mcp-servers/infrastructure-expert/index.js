#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { EC2Client, DescribeInstancesCommand, DescribeSecurityGroupsCommand, DescribeSubnetsCommand } from '@aws-sdk/client-ec2';
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { S3Client, ListBucketsCommand, GetBucketLocationCommand } from '@aws-sdk/client-s3';
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import { Route53Client, ListResourceRecordSetsCommand } from '@aws-sdk/client-route53';
import { ElasticLoadBalancingV2Client, DescribeLoadBalancersCommand, DescribeTargetHealthCommand } from '@aws-sdk/client-elastic-load-balancing-v2';
import { writeFile } from 'fs/promises';

// AWS clients
let ec2Client = null;
let rdsClient = null;
let s3Client = null;
let cloudWatchClient = null;
let route53Client = null;
let elbClient = null;

const initAWSClients = () => {
  const region = process.env.AWS_REGION || 'us-east-1';
  const config = {
    region,
    credentials: process.env.AWS_ACCESS_KEY_ID ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    } : undefined,
  };

  if (!ec2Client) ec2Client = new EC2Client(config);
  if (!rdsClient) rdsClient = new RDSClient(config);
  if (!s3Client) s3Client = new S3Client(config);
  if (!cloudWatchClient) cloudWatchClient = new CloudWatchClient(config);
  if (!route53Client) route53Client = new Route53Client(config);
  if (!elbClient) elbClient = new ElasticLoadBalancingV2Client(config);

  return { ec2Client, rdsClient, s3Client, cloudWatchClient, route53Client, elbClient };
};

// Create MCP server
const server = new Server({
  name: 'infrastructure-expert',
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
        name: 'list_resources',
        description: 'List cloud resources (EC2, RDS, S3, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            resourceType: {
              type: 'string',
              enum: ['ec2', 'rds', 's3', 'all'],
              description: 'Type of resources to list',
              default: 'all',
            },
            filters: {
              type: 'object',
              description: 'Resource filters (e.g., {Name: "tag:Environment", Values: ["production"]})',
            },
          },
        },
      },
      {
        name: 'inspect_network',
        description: 'Inspect network configuration (VPC, subnets, security groups)',
        inputSchema: {
          type: 'object',
          properties: {
            vpcId: {
              type: 'string',
              description: 'VPC ID (optional, lists all if not provided)',
            },
            includeSubnets: {
              type: 'boolean',
              description: 'Include subnet information',
              default: true,
            },
            includeSecurityGroups: {
              type: 'boolean',
              description: 'Include security group rules',
              default: true,
            },
          },
        },
      },
      {
        name: 'manage_dns',
        description: 'Manage DNS records (list, create, update, delete)',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'create', 'update', 'delete'],
              description: 'DNS operation',
            },
            hostedZoneId: {
              type: 'string',
              description: 'Route53 hosted zone ID',
            },
            recordName: {
              type: 'string',
              description: 'DNS record name',
            },
            recordType: {
              type: 'string',
              enum: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'SRV'],
              description: 'DNS record type',
            },
            recordValue: {
              type: 'string',
              description: 'DNS record value',
            },
            ttl: {
              type: 'number',
              description: 'TTL in seconds',
              default: 300,
            },
          },
          required: ['action'],
        },
      },
      {
        name: 'monitor_metrics',
        description: 'Monitor CloudWatch metrics (CPU, memory, network, custom)',
        inputSchema: {
          type: 'object',
          properties: {
            resourceId: {
              type: 'string',
              description: 'Resource ID (instance-id, db-instance-id, etc.)',
            },
            metricName: {
              type: 'string',
              description: 'Metric name (CPUUtilization, NetworkIn, etc.)',
            },
            namespace: {
              type: 'string',
              description: 'CloudWatch namespace (AWS/EC2, AWS/RDS, etc.)',
              default: 'AWS/EC2',
            },
            period: {
              type: 'number',
              description: 'Period in seconds',
              default: 300,
            },
            statistics: {
              type: 'string',
              enum: ['Average', 'Sum', 'Minimum', 'Maximum', 'SampleCount'],
              description: 'Statistic type',
              default: 'Average',
            },
            startTime: {
              type: 'string',
              description: 'Start time (ISO 8601)',
            },
            endTime: {
              type: 'string',
              description: 'End time (ISO 8601)',
            },
          },
          required: ['resourceId', 'metricName'],
        },
      },
      {
        name: 'check_load_balancer',
        description: 'Check load balancer status and target health',
        inputSchema: {
          type: 'object',
          properties: {
            loadBalancerArn: {
              type: 'string',
              description: 'Load balancer ARN (optional, lists all if not provided)',
            },
            includeTargetHealth: {
              type: 'boolean',
              description: 'Include target health status',
              default: true,
            },
          },
        },
      },
      {
        name: 'generate_terraform',
        description: 'Generate Terraform configuration for infrastructure',
        inputSchema: {
          type: 'object',
          properties: {
            resourceType: {
              type: 'string',
              enum: ['ec2', 'rds', 's3', 'vpc', 'security_group', 'load_balancer'],
              description: 'Resource type to generate config for',
            },
            resourceConfig: {
              type: 'object',
              description: 'Resource configuration parameters',
            },
            outputFile: {
              type: 'string',
              description: 'Output file path',
              default: './terraform/main.tf',
            },
          },
          required: ['resourceType', 'resourceConfig'],
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_resources':
        return await handleListResources(args);
      case 'inspect_network':
        return await handleInspectNetwork(args);
      case 'manage_dns':
        return await handleManageDNS(args);
      case 'monitor_metrics':
        return await handleMonitorMetrics(args);
      case 'check_load_balancer':
        return await handleCheckLoadBalancer(args);
      case 'generate_terraform':
        return await handleGenerateTerraform(args);
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

async function handleListResources(args) {
  const { resourceType = 'all', filters } = args;

  try {
    const clients = initAWSClients();
    const resources = {};

    if (resourceType === 'ec2' || resourceType === 'all') {
      const command = new DescribeInstancesCommand({ Filters: filters });
      const response = await clients.ec2Client.send(command);

      resources.ec2 = response.Reservations?.flatMap(r =>
        r.Instances?.map(i => ({
          instanceId: i.InstanceId,
          instanceType: i.InstanceType,
          state: i.State?.Name,
          publicIp: i.PublicIpAddress,
          privateIp: i.PrivateIpAddress,
          launchTime: i.LaunchTime,
          tags: i.Tags?.reduce((acc, tag) => ({ ...acc, [tag.Key]: tag.Value }), {}),
        }))
      ) || [];
    }

    if (resourceType === 'rds' || resourceType === 'all') {
      const command = new DescribeDBInstancesCommand({});
      const response = await clients.rdsClient.send(command);

      resources.rds = response.DBInstances?.map(db => ({
        dbInstanceIdentifier: db.DBInstanceIdentifier,
        dbInstanceClass: db.DBInstanceClass,
        engine: db.Engine,
        engineVersion: db.EngineVersion,
        status: db.DBInstanceStatus,
        endpoint: db.Endpoint?.Address,
        port: db.Endpoint?.Port,
        allocatedStorage: db.AllocatedStorage,
      })) || [];
    }

    if (resourceType === 's3' || resourceType === 'all') {
      const command = new ListBucketsCommand({});
      const response = await clients.s3Client.send(command);

      resources.s3 = response.Buckets?.map(b => ({
        name: b.Name,
        creationDate: b.CreationDate,
      })) || [];
    }

    const totalCount = Object.values(resources).reduce((acc, arr) => acc + arr.length, 0);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${totalCount} resources (${Object.entries(resources).map(([k, v]) => `${k}: ${v.length}`).join(', ')})`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://resources',
            mimeType: 'application/json',
            text: JSON.stringify(resources, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to list resources: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleInspectNetwork(args) {
  const { vpcId, includeSubnets = true, includeSecurityGroups = true } = args;

  try {
    const clients = initAWSClients();
    const network = {};

    if (includeSubnets) {
      const filters = vpcId ? [{ Name: 'vpc-id', Values: [vpcId] }] : undefined;
      const command = new DescribeSubnetsCommand({ Filters: filters });
      const response = await clients.ec2Client.send(command);

      network.subnets = response.Subnets?.map(s => ({
        subnetId: s.SubnetId,
        vpcId: s.VpcId,
        cidrBlock: s.CidrBlock,
        availabilityZone: s.AvailabilityZone,
        availableIpAddressCount: s.AvailableIpAddressCount,
        state: s.State,
        tags: s.Tags?.reduce((acc, tag) => ({ ...acc, [tag.Key]: tag.Value }), {}),
      })) || [];
    }

    if (includeSecurityGroups) {
      const filters = vpcId ? [{ Name: 'vpc-id', Values: [vpcId] }] : undefined;
      const command = new DescribeSecurityGroupsCommand({ Filters: filters });
      const response = await clients.ec2Client.send(command);

      network.securityGroups = response.SecurityGroups?.map(sg => ({
        groupId: sg.GroupId,
        groupName: sg.GroupName,
        vpcId: sg.VpcId,
        description: sg.Description,
        ingressRules: sg.IpPermissions?.length || 0,
        egressRules: sg.IpPermissionsEgress?.length || 0,
        rules: {
          ingress: sg.IpPermissions?.map(r => ({
            protocol: r.IpProtocol,
            fromPort: r.FromPort,
            toPort: r.ToPort,
            sources: r.IpRanges?.map(ip => ip.CidrIp) || [],
          })),
          egress: sg.IpPermissionsEgress?.map(r => ({
            protocol: r.IpProtocol,
            fromPort: r.FromPort,
            toPort: r.ToPort,
            destinations: r.IpRanges?.map(ip => ip.CidrIp) || [],
          })),
        },
      })) || [];
    }

    return {
      content: [
        {
          type: 'text',
          text: `Network inspection completed (${network.subnets?.length || 0} subnets, ${network.securityGroups?.length || 0} security groups)`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://network',
            mimeType: 'application/json',
            text: JSON.stringify(network, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to inspect network: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleManageDNS(args) {
  const { action, hostedZoneId, recordName, recordType, recordValue, ttl = 300 } = args;

  try {
    const clients = initAWSClients();

    if (action === 'list') {
      if (!hostedZoneId) {
        throw new Error('hostedZoneId required for list action');
      }

      const command = new ListResourceRecordSetsCommand({ HostedZoneId: hostedZoneId });
      const response = await clients.route53Client.send(command);

      const records = response.ResourceRecordSets?.map(r => ({
        name: r.Name,
        type: r.Type,
        ttl: r.TTL,
        values: r.ResourceRecords?.map(rr => rr.Value) || [],
      })) || [];

      return {
        content: [
          {
            type: 'text',
            text: `Found ${records.length} DNS records in hosted zone ${hostedZoneId}`,
          },
          {
            type: 'resource',
            resource: {
              uri: 'result://dns-records',
              mimeType: 'application/json',
              text: JSON.stringify(records, null, 2),
            },
          },
        ],
      };
    }

    // For create/update/delete, return instructions (actual operations require careful handling)
    return {
      content: [
        {
          type: 'text',
          text: `DNS ${action} operation prepared. Review configuration before applying.`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://dns-operation',
            mimeType: 'application/json',
            text: JSON.stringify({
              action,
              hostedZoneId,
              recordName,
              recordType,
              recordValue,
              ttl,
              note: 'This is a dry-run. Apply changes manually or via AWS SDK.',
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
          text: `Failed to manage DNS: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleMonitorMetrics(args) {
  const {
    resourceId,
    metricName,
    namespace = 'AWS/EC2',
    period = 300,
    statistics = 'Average',
    startTime,
    endTime,
  } = args;

  try {
    const clients = initAWSClients();

    const start = startTime ? new Date(startTime) : new Date(Date.now() - 3600000); // 1 hour ago
    const end = endTime ? new Date(endTime) : new Date();

    const command = new GetMetricStatisticsCommand({
      Namespace: namespace,
      MetricName: metricName,
      Dimensions: [
        {
          Name: 'InstanceId',
          Value: resourceId,
        },
      ],
      StartTime: start,
      EndTime: end,
      Period: period,
      Statistics: [statistics],
    });

    const response = await clients.cloudWatchClient.send(command);

    const datapoints = response.Datapoints?.sort((a, b) =>
      new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime()
    ).map(dp => ({
      timestamp: dp.Timestamp,
      value: dp[statistics],
      unit: dp.Unit,
    })) || [];

    return {
      content: [
        {
          type: 'text',
          text: `Retrieved ${datapoints.length} datapoints for ${metricName} on ${resourceId}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://metrics',
            mimeType: 'application/json',
            text: JSON.stringify({
              resourceId,
              metricName,
              namespace,
              statistics,
              datapoints,
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
          text: `Failed to monitor metrics: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleCheckLoadBalancer(args) {
  const { loadBalancerArn, includeTargetHealth = true } = args;

  try {
    const clients = initAWSClients();

    const lbCommand = loadBalancerArn
      ? new DescribeLoadBalancersCommand({ LoadBalancerArns: [loadBalancerArn] })
      : new DescribeLoadBalancersCommand({});

    const lbResponse = await clients.elbClient.send(lbCommand);

    const loadBalancers = await Promise.all(
      (lbResponse.LoadBalancers || []).map(async (lb) => {
        const lbInfo = {
          loadBalancerArn: lb.LoadBalancerArn,
          loadBalancerName: lb.LoadBalancerName,
          dnsName: lb.DNSName,
          scheme: lb.Scheme,
          type: lb.Type,
          state: lb.State?.Code,
          vpcId: lb.VpcId,
          availabilityZones: lb.AvailabilityZones?.map(az => az.ZoneName),
        };

        if (includeTargetHealth && lb.LoadBalancerArn) {
          // Note: Requires target group ARN, simplified for demo
          lbInfo.note = 'Target health check requires target group ARN';
        }

        return lbInfo;
      })
    );

    return {
      content: [
        {
          type: 'text',
          text: `Found ${loadBalancers.length} load balancer(s)`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://load-balancers',
            mimeType: 'application/json',
            text: JSON.stringify(loadBalancers, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to check load balancer: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleGenerateTerraform(args) {
  const { resourceType, resourceConfig, outputFile = './terraform/main.tf' } = args;

  try {
    let terraformConfig = '';

    switch (resourceType) {
      case 'ec2':
        terraformConfig = generateEC2Terraform(resourceConfig);
        break;
      case 'rds':
        terraformConfig = generateRDSTerraform(resourceConfig);
        break;
      case 's3':
        terraformConfig = generateS3Terraform(resourceConfig);
        break;
      case 'vpc':
        terraformConfig = generateVPCTerraform(resourceConfig);
        break;
      case 'security_group':
        terraformConfig = generateSecurityGroupTerraform(resourceConfig);
        break;
      case 'load_balancer':
        terraformConfig = generateLoadBalancerTerraform(resourceConfig);
        break;
      default:
        throw new Error(`Unsupported resource type: ${resourceType}`);
    }

    // Write to file
    await writeFile(outputFile, terraformConfig);

    return {
      content: [
        {
          type: 'text',
          text: `Terraform configuration generated: ${outputFile}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://terraform',
            mimeType: 'text/plain',
            text: terraformConfig,
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to generate Terraform: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

// ========================================
// Terraform Generators
// ========================================

function generateEC2Terraform(config) {
  const {
    name = 'example-instance',
    ami = 'ami-0c55b159cbfafe1f0',
    instanceType = 't2.micro',
    subnetId,
    securityGroupIds = [],
    keyName,
    tags = {},
  } = config;

  return `
resource "aws_instance" "${name}" {
  ami           = "${ami}"
  instance_type = "${instanceType}"
  ${subnetId ? `subnet_id     = "${subnetId}"` : ''}
  ${securityGroupIds.length > 0 ? `vpc_security_group_ids = ${JSON.stringify(securityGroupIds)}` : ''}
  ${keyName ? `key_name      = "${keyName}"` : ''}

  tags = ${JSON.stringify(tags, null, 2)}
}
`.trim();
}

function generateRDSTerraform(config) {
  const {
    identifier = 'example-db',
    engine = 'postgres',
    engineVersion = '14.7',
    instanceClass = 'db.t3.micro',
    allocatedStorage = 20,
    dbName,
    username = 'admin',
    password,
    skipFinalSnapshot = true,
  } = config;

  return `
resource "aws_db_instance" "${identifier}" {
  identifier     = "${identifier}"
  engine         = "${engine}"
  engine_version = "${engineVersion}"
  instance_class = "${instanceClass}"
  allocated_storage = ${allocatedStorage}
  ${dbName ? `db_name        = "${dbName}"` : ''}
  username       = "${username}"
  ${password ? `password       = "${password}"` : '# password = var.db_password'}
  skip_final_snapshot = ${skipFinalSnapshot}
}
`.trim();
}

function generateS3Terraform(config) {
  const { bucketName = 'example-bucket', acl = 'private', versioning = false } = config;

  return `
resource "aws_s3_bucket" "${bucketName}" {
  bucket = "${bucketName}"
  acl    = "${acl}"

  ${versioning ? `versioning {
    enabled = true
  }` : ''}
}
`.trim();
}

function generateVPCTerraform(config) {
  const { vpcName = 'example-vpc', cidrBlock = '10.0.0.0/16', enableDnsHostnames = true } = config;

  return `
resource "aws_vpc" "${vpcName}" {
  cidr_block = "${cidrBlock}"
  enable_dns_hostnames = ${enableDnsHostnames}

  tags = {
    Name = "${vpcName}"
  }
}
`.trim();
}

function generateSecurityGroupTerraform(config) {
  const { name = 'example-sg', vpcId, description = 'Security group', ingressRules = [], egressRules = [] } = config;

  const ingress = ingressRules.map(rule => `
  ingress {
    from_port   = ${rule.fromPort}
    to_port     = ${rule.toPort}
    protocol    = "${rule.protocol}"
    cidr_blocks = ${JSON.stringify(rule.cidrBlocks)}
  }`).join('');

  const egress = egressRules.map(rule => `
  egress {
    from_port   = ${rule.fromPort}
    to_port     = ${rule.toPort}
    protocol    = "${rule.protocol}"
    cidr_blocks = ${JSON.stringify(rule.cidrBlocks)}
  }`).join('');

  return `
resource "aws_security_group" "${name}" {
  name        = "${name}"
  description = "${description}"
  ${vpcId ? `vpc_id      = "${vpcId}"` : ''}
${ingress}
${egress}
}
`.trim();
}

function generateLoadBalancerTerraform(config) {
  const { name = 'example-lb', internal = false, loadBalancerType = 'application', subnetIds = [], securityGroupIds = [] } = config;

  return `
resource "aws_lb" "${name}" {
  name               = "${name}"
  internal           = ${internal}
  load_balancer_type = "${loadBalancerType}"
  security_groups    = ${JSON.stringify(securityGroupIds)}
  subnets            = ${JSON.stringify(subnetIds)}

  tags = {
    Name = "${name}"
  }
}
`.trim();
}

// ========================================
// Resources
// ========================================

server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'aws://resources',
        name: 'AWS Resources',
        description: 'List of all AWS resources',
        mimeType: 'application/json',
      },
      {
        uri: 'aws://network',
        name: 'Network Configuration',
        description: 'VPC, subnets, and security group configuration',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;

  if (uri === 'aws://resources') {
    try {
      const result = await handleListResources({ resourceType: 'all' });
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

  if (uri === 'aws://network') {
    try {
      const result = await handleInspectNetwork({ includeSubnets: true, includeSecurityGroups: true });
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
  console.error('Infrastructure Expert MCP Server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
