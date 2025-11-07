# Infrastructure Expert MCP Server

Domain-specific MCP server providing cloud infrastructure management and Infrastructure-as-Code tools for claude-spec.

## Features

### Tools

- **list_resources**: List cloud resources (EC2, RDS, S3, and more)
- **inspect_network**: Inspect network configuration (VPC, subnets, security groups)
- **manage_dns**: Manage DNS records (Route53 operations)
- **monitor_metrics**: Monitor CloudWatch metrics (CPU, memory, network, custom metrics)
- **check_load_balancer**: Check load balancer status and target health
- **generate_terraform**: Generate Terraform configuration for infrastructure

### Resources

- **aws://resources**: List of all AWS resources
- **aws://network**: VPC and network configuration

## Installation

### Global Installation (Recommended)

```bash
npm install -g @claude-spec/infrastructure-mcp-server
```

### Project-Specific Installation

```bash
npm install @claude-spec/infrastructure-mcp-server
```

### Direct Usage (No Installation)

```bash
npx @claude-spec/infrastructure-mcp-server
```

## Configuration

### Add to Claude Code

```bash
claude mcp add infrastructure-expert \
  --env AWS_REGION="us-east-1" \
  --env AWS_ACCESS_KEY_ID="your-access-key" \
  --env AWS_SECRET_ACCESS_KEY="your-secret-key" \
  -- npx @claude-spec/infrastructure-mcp-server
```

### Project-Level Configuration (.mcp.json)

```json
{
  "mcpServers": {
    "infrastructure-expert": {
      "command": "npx",
      "args": ["@claude-spec/infrastructure-mcp-server"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_ACCESS_KEY_ID": "${AWS_ACCESS_KEY_ID}",
        "AWS_SECRET_ACCESS_KEY": "${AWS_SECRET_ACCESS_KEY}"
      }
    }
  }
}
```

### Using AWS Profiles

```bash
# Use AWS CLI profile (no need to set credentials)
export AWS_PROFILE=my-profile
claude mcp add infrastructure-expert --env AWS_REGION="us-east-1" -- npx @claude-spec/infrastructure-mcp-server
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `AWS_REGION` | AWS region | No | us-east-1 |
| `AWS_ACCESS_KEY_ID` | AWS access key | No* | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | No* | - |
| `AWS_PROFILE` | AWS CLI profile name | No | default |

*Not required if using AWS CLI profile or EC2 instance role

## Usage

Once configured, Claude Code can use infrastructure tools automatically:

### List Resources

```
User: "What EC2 instances are running?"
Claude: [Uses @infrastructure-expert list_resources tool]
        Found 5 resources (ec2: 3, rds: 1, s3: 1)

        EC2 Instances:
        - i-abc123 (t2.micro, running) - web-server-1
        - i-def456 (t2.small, running) - api-server-1
        - i-ghi789 (t2.micro, stopped) - worker-1
```

### Inspect Network

```
User: "Show me the VPC configuration"
Claude: [Uses @infrastructure-expert inspect_network tool]
        Network: vpc-abc123

        Subnets (3):
        - subnet-1a (10.0.1.0/24) - us-east-1a
        - subnet-1b (10.0.2.0/24) - us-east-1b
        - subnet-1c (10.0.3.0/24) - us-east-1c

        Security Groups (5):
        - sg-web (22, 80, 443 from 0.0.0.0/0)
        - sg-db (5432 from sg-web)
```

### Monitor Metrics

```
User: "What's the CPU usage on i-abc123?"
Claude: [Uses @infrastructure-expert monitor_metrics tool]
        CPU Utilization (i-abc123) - Last hour:

        Average: 45.2%
        Maximum: 78.5%
        Minimum: 12.3%

        [Datapoints chart/table]
```

### Generate Terraform

```
User: "Generate Terraform for an EC2 instance"
Claude: [Uses @infrastructure-expert generate_terraform tool]
        Terraform configuration generated: ./terraform/main.tf

        resource "aws_instance" "web-server" {
          ami           = "ami-0c55b159cbfafe1f0"
          instance_type = "t2.micro"
          subnet_id     = "subnet-abc123"

          tags = {
            Name = "web-server"
          }
        }
```

## Integration with claude-spec

This MCP server integrates with the claude-spec multi-agent system:

1. **During Planning** (`/cspec:plan`):
   - Spec identifies infrastructure work needed
   - Sets `domains: [infrastructure]` or `domains: [backend, infrastructure]`
   - Enables MCP integration: `mcp_integration.enabled: true`

2. **During Implementation** (`/cspec:implement`):
   - Orchestrator detects infrastructure-expert MCP server
   - Spawns infrastructure-expert agent with AWS tools
   - Agent uses tools to provision, inspect, and monitor infrastructure
   - Updates progress and completes infrastructure tasks

3. **Tools Available to Agent**:
   - List existing resources before provisioning
   - Inspect network configuration for planning
   - Monitor metrics for capacity planning
   - Generate IaC for version control
   - Check load balancer health

## Common Workflows

### Provisioning New Infrastructure

```javascript
// Agent workflow:
1. Use list_resources to check existing resources
2. Use inspect_network to find available subnets
3. Use generate_terraform to create infrastructure code
4. Review and apply Terraform configuration
5. Use list_resources to verify resources created
6. Use monitor_metrics to establish baseline
7. Update spec.yml with infrastructure details
```

### Network Configuration

```javascript
// Agent workflow:
1. Use inspect_network to understand current setup
2. Identify security group changes needed
3. Use generate_terraform for security group updates
4. Apply changes via Terraform or AWS console
5. Use inspect_network to verify changes
6. Document in context.yml
```

### Monitoring and Optimization

```javascript
// Agent workflow:
1. Use monitor_metrics to get current resource utilization
2. Identify over/under-provisioned resources
3. Use generate_terraform to adjust instance types/sizes
4. Apply changes during maintenance window
5. Use monitor_metrics to verify optimization
6. Update progress.yml with results
```

### Load Balancer Setup

```javascript
// Agent workflow:
1. Use list_resources to find target instances
2. Use generate_terraform for load balancer config
3. Apply Terraform configuration
4. Use check_load_balancer to verify setup
5. Use monitor_metrics for load balancer metrics
6. Document configuration in spec.yml
```

## Tool Reference

### 1. list_resources

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
    launchTime: Date;
    tags: Record<string, string>;
  }>;
  rds?: Array<{
    dbInstanceIdentifier: string;
    dbInstanceClass: string;
    engine: string;
    engineVersion: string;
    status: string;
    endpoint?: string;
    port?: number;
    allocatedStorage: number;
  }>;
  s3?: Array<{
    name: string;
    creationDate: Date;
  }>;
}
```

### 2. inspect_network

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
    vpcId: string;
    cidrBlock: string;
    availabilityZone: string;
    availableIpAddressCount: number;
    state: string;
    tags: Record<string, string>;
  }>;
  securityGroups?: Array<{
    groupId: string;
    groupName: string;
    vpcId: string;
    description: string;
    ingressRules: number;
    egressRules: number;
    rules: {
      ingress: Array<Rule>;
      egress: Array<Rule>;
    };
  }>;
}
```

### 3. manage_dns

Manage Route53 DNS records.

**Input:**
```typescript
{
  action: 'list' | 'create' | 'update' | 'delete';
  hostedZoneId: string;
  recordName?: string;
  recordType?: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SOA' | 'SRV';
  recordValue?: string;
  ttl?: number;                      // Default: 300
}
```

**Output:**
```typescript
{
  // list action:
  records: Array<{
    name: string;
    type: string;
    ttl: number;
    values: string[];
  }>;

  // create/update/delete actions:
  action: string;
  hostedZoneId: string;
  recordName: string;
  note: string;  // Dry-run confirmation
}
```

### 4. monitor_metrics

Monitor CloudWatch metrics.

**Input:**
```typescript
{
  resourceId: string;                // Instance ID, DB instance ID, etc.
  metricName: string;                // CPUUtilization, NetworkIn, etc.
  namespace?: string;                // Default: 'AWS/EC2'
  period?: number;                   // Default: 300 (5 minutes)
  statistics?: 'Average' | 'Sum' | 'Minimum' | 'Maximum' | 'SampleCount';
  startTime?: string;                // ISO 8601 (default: 1 hour ago)
  endTime?: string;                  // ISO 8601 (default: now)
}
```

**Output:**
```typescript
{
  resourceId: string;
  metricName: string;
  namespace: string;
  statistics: string;
  datapoints: Array<{
    timestamp: Date;
    value: number;
    unit: string;
  }>;
}
```

### 5. check_load_balancer

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
    type: string;
    state: string;
    vpcId: string;
    availabilityZones: string[];
  }>;
}
```

### 6. generate_terraform

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
    // ... (see examples below)
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

**Resource Config Examples:**

```typescript
// EC2
{
  name: 'web-server',
  ami: 'ami-0c55b159cbfafe1f0',
  instanceType: 't2.micro',
  subnetId: 'subnet-abc123',
  securityGroupIds: ['sg-123'],
  keyName: 'my-key',
  tags: { Environment: 'production' }
}

// RDS
{
  identifier: 'mydb',
  engine: 'postgres',
  engineVersion: '14.7',
  instanceClass: 'db.t3.micro',
  allocatedStorage: 20,
  dbName: 'app_db',
  username: 'admin'
}

// VPC
{
  vpcName: 'my-vpc',
  cidrBlock: '10.0.0.0/16',
  enableDnsHostnames: true
}

// Security Group
{
  name: 'web-sg',
  vpcId: 'vpc-123',
  description: 'Web server security group',
  ingressRules: [
    { fromPort: 80, toPort: 80, protocol: 'tcp', cidrBlocks: ['0.0.0.0/0'] }
  ],
  egressRules: [
    { fromPort: 0, toPort: 0, protocol: '-1', cidrBlocks: ['0.0.0.0/0'] }
  ]
}
```

## Best Practices

### Resource Management
- Tag all resources consistently for tracking
- Use resource naming conventions
- Document resource dependencies
- Review costs regularly

### Network Security
- Follow principle of least privilege for security groups
- Use private subnets for databases and internal services
- Implement network segmentation
- Enable VPC flow logs for monitoring

### Monitoring
- Set up CloudWatch alarms for critical metrics
- Monitor costs with AWS Cost Explorer
- Track resource utilization trends
- Use CloudWatch Logs for application logs

### Infrastructure as Code
- Always generate Terraform for infrastructure changes
- Version control all Terraform configurations
- Use Terraform workspaces for environments
- Run `terraform plan` before `terraform apply`
- Use remote state storage (S3 + DynamoDB)

### Cost Optimization
- Right-size instances based on metrics
- Use Reserved Instances for stable workloads
- Implement auto-scaling where appropriate
- Clean up unused resources regularly
- Use S3 lifecycle policies for data management

## Security

### AWS Credentials

**Never expose credentials in code:**

```bash
# ✅ Good: Use AWS CLI profile or IAM roles
export AWS_PROFILE=my-profile

# ✅ Good: EC2 instance role (no credentials needed)
# (Runs automatically on EC2 instances with IAM roles)

# ❌ Bad: Hardcoded credentials
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
```

**Credential hierarchy (AWS SDK default):**
1. Environment variables
2. AWS credentials file (~/.aws/credentials)
3. EC2 instance role (IAM role)
4. ECS task role
5. Lambda execution role

### IAM Permissions

**Least privilege example:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "rds:Describe*",
        "s3:ListAllMyBuckets",
        "cloudwatch:GetMetricStatistics",
        "elasticloadbalancing:Describe*"
      ],
      "Resource": "*"
    }
  ]
}
```

**For Terraform generation only:**
No AWS permissions needed - generates files locally.

### Network Security

**Security group best practices:**
- Restrict source IPs to minimum required
- Use security group references instead of CIDR blocks where possible
- Document all rules with descriptions
- Audit security groups regularly
- Never use 0.0.0.0/0 for SSH (port 22)

## Supported Cloud Providers

- **AWS**: Full support (EC2, RDS, S3, CloudWatch, Route53, ELB)
- **GCP**: Planned (future)
- **Azure**: Planned (future)

## Development

### Running Locally

```bash
cd .mcp-servers/infrastructure-expert
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

## Troubleshooting

### Cannot Connect to AWS

**Symptom:** "Unable to locate credentials"

**Solutions:**

1. Check AWS CLI configuration:
```bash
aws configure list
aws sts get-caller-identity
```

2. Set environment variables:
```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=my-profile
```

3. Verify IAM permissions:
```bash
aws iam get-user
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

### Resource Not Found

**Symptom:** "Resource not found in region"

**Solutions:**

1. Check region:
```bash
echo $AWS_REGION
# Or
aws configure get region
```

2. List resources in correct region:
```bash
aws ec2 describe-instances --region us-east-1
```

3. Verify resource exists:
```bash
aws ec2 describe-instances --instance-ids i-abc123
```

### Terraform Generation Fails

**Symptom:** File write permission denied

**Solutions:**

1. Check directory exists:
```bash
mkdir -p ./terraform
```

2. Set correct output path:
```javascript
generate_terraform({
  resourceType: 'ec2',
  resourceConfig: {...},
  outputFile: '/absolute/path/to/main.tf'
})
```

3. Check file permissions:
```bash
ls -l terraform/
chmod 755 terraform/
```

### Metrics Not Available

**Symptom:** No datapoints returned

**Solutions:**

1. Check resource ID is correct:
```javascript
// Correct namespace for resource type
monitor_metrics({
  resourceId: 'i-abc123',
  metricName: 'CPUUtilization',
  namespace: 'AWS/EC2'  // Not AWS/RDS
})
```

2. Extend time range:
```javascript
monitor_metrics({
  resourceId: 'i-abc123',
  metricName: 'CPUUtilization',
  startTime: new Date(Date.now() - 86400000).toISOString(),  // 24 hours ago
  endTime: new Date().toISOString()
})
```

3. Verify CloudWatch agent installed (for custom metrics):
```bash
# EC2 instance
sudo systemctl status amazon-cloudwatch-agent
```

## Contributing

See main project CONTRIBUTING.md for guidelines.

## License

MIT
