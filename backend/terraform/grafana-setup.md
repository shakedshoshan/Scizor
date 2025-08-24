# Grafana Cloud Setup for Scizor AI Backend Monitoring

This guide walks you through setting up Grafana Cloud monitoring for your Scizor AI Backend deployed on AWS.

## Prerequisites

1. **Grafana Cloud Account**: Sign up at [grafana.com/cloud](https://grafana.com/cloud)
2. **AWS Backend Deployed**: Your Scizor AI backend should already be deployed using the existing Terraform configuration
3. **Terraform**: Version 1.0+ with the Grafana provider

## Step 1: Create Grafana Cloud Stack

1. Log into your Grafana Cloud account
2. Create a new stack (or use an existing one)
3. Note down your **stack slug** (e.g., `yourcompany-monitoring`)

## Step 2: Generate Access Tokens

### Cloud Access Policy Token
1. Go to **Administration** → **Cloud Access Policies**
2. Create a new policy with these scopes:
   - `stacks:read`
   - `stacks:write` 
   - `accesspolicies:read`
   - `accesspolicies:write`
3. Generate a token for this policy

### Service Account Key
1. In your Grafana stack, go to **Administration** → **Service Accounts**
2. Create a new service account with **Admin** role
3. Generate a service account token

## Step 3: Generate External ID

Generate a unique external ID for cross-account access:
```bash
# Generate a random external ID
openssl rand -hex 32
```

## Step 4: Configure Terraform Variables

Copy the example variables file and fill in your values:
```bash
cd backend/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:
```hcl
# Grafana Cloud Configuration
grafana_cloud_access_token   = "your-cloud-access-policy-token"
grafana_stack_slug          = "your-stack-slug"
grafana_service_account_key = "your-service-account-token"
grafana_external_id         = "your-generated-external-id"
```

## Step 5: Deploy Monitoring Infrastructure

Deploy the monitoring components:
```bash
# Initialize Terraform with the new provider
terraform init

# Plan the deployment
terraform plan

# Apply the changes
terraform apply
```

## Step 6: Configure AWS Integration in Grafana Cloud

1. In Grafana Cloud, go to **Connections** → **Infrastructure** → **AWS**
2. Click **Add new connection**
3. Use these values from your Terraform outputs:
   - **Role ARN**: `terraform output grafana_cloudwatch_role_arn`
   - **External ID**: The external ID you generated in Step 3
   - **Regions**: Your AWS region (default: us-east-1)

## Step 7: Access Your Dashboard

Your monitoring dashboard will be available at:
```bash
terraform output monitoring_dashboard_url
```

## What You Get

### CloudWatch Metrics Collection
- **API Gateway**: Request count, latency, error rates
- **Lambda Functions**: Duration, invocations, errors, concurrent executions
- **Custom Metrics**: Application-specific KPIs

### Pre-built Dashboard
- Real-time API performance visualization
- Error rate monitoring
- Lambda function performance metrics
- Success rate calculations

### Alerting Rules
- High API error rate alerts
- Lambda duration warnings
- Automatic notification setup ready

### Log Monitoring
- API Gateway execution logs
- Lambda function logs
- Centralized log analysis

## Troubleshooting

### Common Issues

1. **"Role cannot be assumed"**
   - Verify the external ID matches exactly
   - Check that the Grafana account ID is correct (008923505280 for Grafana Cloud)

2. **"No metrics appearing"**
   - Ensure your API is receiving traffic to generate metrics
   - Check that the AWS integration is properly configured
   - Verify the scrape jobs are running in Grafana Cloud

3. **"Dashboard not loading"**
   - Confirm the service account has sufficient permissions
   - Check that the Grafana stack URL is correct

### Getting Help

1. Check Terraform outputs for configuration details:
   ```bash
   terraform output grafana_integration_info
   ```

2. Verify CloudWatch metrics are being generated:
   ```bash
   aws cloudwatch list-metrics --namespace AWS/ApiGateway
   aws cloudwatch list-metrics --namespace AWS/Lambda
   ```

3. Check CloudWatch logs:
   ```bash
   terraform output cloudwatch_log_groups
   ```

## Cost Considerations

- CloudWatch metrics and logs incur AWS charges
- Grafana Cloud has different pricing tiers
- Log retention is set to 14 days to manage costs
- Consider adjusting scrape intervals based on your needs

## Security Notes

- The IAM role follows least privilege principles
- Cross-account access uses external ID for additional security
- All sensitive values are marked as sensitive in Terraform
- Regular rotation of access tokens is recommended
