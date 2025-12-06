# Azure Deployment Guide for LowCodeAPI

## Prerequisites

1. **Azure Account** - [Sign up](https://azure.microsoft.com/free/)
2. **Azure CLI** - [Install](https://docs.microsoft.com/cli/azure/install-azure-cli)

## Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
# Login to Azure
az login

# Make script executable
chmod +x deploy-azure.sh

# Edit the script to customize names (must be globally unique):
# - WEB_APP_NAME
# - POSTGRES_SERVER
# - REDIS_NAME
# - POSTGRES_ADMIN_PASSWORD (use strong password!)

# Run deployment
./deploy-azure.sh
```

### Option 2: Manual Azure Portal Setup

#### Step 1: Create Resources

1. **Create Resource Group**
   - Go to Azure Portal → Resource Groups → Create
   - Name: `lowcodeapi-rg`
   - Region: `East US`

2. **Create PostgreSQL Database**
   - Search "Azure Database for PostgreSQL flexible servers"
   - Click Create
   - Server name: `lowcodeapi-postgres` (must be unique)
   - Admin username: `lowcodeadmin`
   - Admin password: (strong password)
   - Version: `14`
   - Compute + storage: `Burstable, B1ms, 32 GB storage`
   - Networking: Allow public access (configure firewall rules)

3. **Create Redis Cache**
   - Search "Azure Cache for Redis"
   - Click Create
   - DNS name: `lowcodeapi-redis` (must be unique)
   - Pricing tier: `Basic C0 (250 MB)`
   - Enable non-SSL port: Yes (for development)

4. **Create App Service**
   - Search "App Services"
   - Click Create
   - Name: `lowcodeapi-app` (must be unique)
   - Runtime stack: `.NET 8 (LTS)`
   - Operating System: `Linux`
   - Region: `East US`
   - Pricing plan: `Basic B1` or higher

#### Step 2: Configure App Service

1. Go to your App Service → Configuration → Application settings
2. Add connection strings:

```
ConnectionStrings__DefaultConnection = Host=lowcodeapi-postgres.postgres.database.azure.com;Database=lowcodeapi;Username=lowcodeadmin;Password=YOUR_PASSWORD;Port=5432;SSL Mode=Require;

ConnectionStrings__Redis = lowcodeapi-redis.redis.cache.windows.net:6380,password=YOUR_REDIS_KEY,ssl=True,abortConnect=False

ASPNETCORE_ENVIRONMENT = Production
```

3. Get Redis key from: Redis Cache → Access keys → Primary

#### Step 3: Deploy Application

**Using Azure CLI:**
```bash
# Build and publish
dotnet publish -c Release -o ./publish

# Deploy
az webapp deployment source config-zip \
  --resource-group lowcodeapi-rg \
  --name lowcodeapi-app \
  --src publish.zip
```

**Using Visual Studio:**
1. Right-click project → Publish
2. Select Azure → Azure App Service (Linux)
3. Select your app service
4. Click Publish

**Using VS Code:**
1. Install Azure App Service extension
2. Right-click on App Service
3. Deploy to Web App

#### Step 4: Run Database Migrations

```bash
# Update connection string in appsettings.json temporarily
# Or use environment variable
export ConnectionStrings__DefaultConnection="Host=lowcodeapi-postgres.postgres.database.azure.com;..."

# Run migrations
dotnet ef database update

# Or run from SSH in Azure Portal (App Service → SSH)
```

### Option 3: GitHub Actions CI/CD

1. In Azure Portal, go to App Service → Deployment Center
2. Select GitHub as source
3. Authorize GitHub and select repository
4. Azure will create workflow file automatically

Or use the provided `.github/workflows/azure-deploy.yml`

**Setup secrets in GitHub:**
1. Go to repository Settings → Secrets and variables → Actions
2. Add `AZURE_WEBAPP_PUBLISH_PROFILE`:
   - Get from Azure Portal: App Service → Download publish profile
   - Paste entire XML content

## Cost Estimates (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| App Service | B1 (Basic) | ~$13 |
| PostgreSQL | B1ms (Burstable) | ~$12 |
| Redis Cache | C0 (Basic) | ~$16 |
| **Total** | | **~$41/month** |

**Production Tier (Recommended):**
- App Service: P1V2 (~$73/month)
- PostgreSQL: D2s_v3 (~$140/month)
- Redis: C1 Standard (~$61/month)

## Post-Deployment

### 1. Configure Custom Domain (Optional)
```bash
az webapp config hostname add \
  --webapp-name lowcodeapi-app \
  --resource-group lowcodeapi-rg \
  --hostname yourdomain.com
```

### 2. Enable Application Insights
```bash
az monitor app-insights component create \
  --app lowcodeapi-insights \
  --location eastus \
  --resource-group lowcodeapi-rg \
  --application-type web
```

### 3. Configure Auto-scaling
- Go to App Service → Scale out (App Service plan)
- Add rule: Scale up when CPU > 70%

### 4. Set up Backup
- Go to App Service → Backups
- Configure storage account and schedule

### 5. Enable Authentication (Optional)
- App Service → Authentication
- Add identity provider (Microsoft, Google, etc.)

## Monitoring

**View Logs:**
```bash
az webapp log tail \
  --name lowcodeapi-app \
  --resource-group lowcodeapi-rg
```

**Access SSH:**
- Azure Portal → App Service → SSH

**Application Insights:**
- View metrics, traces, and errors in Azure Portal

## Troubleshooting

### App won't start
1. Check logs: `az webapp log tail`
2. Verify connection strings in Configuration
3. Check firewall rules for PostgreSQL
4. Ensure .NET 8 runtime is selected

### Database connection fails
1. Add your IP to PostgreSQL firewall rules
2. Verify connection string format
3. Check SSL Mode=Require is set

### Redis connection fails
1. Verify non-SSL port is enabled (or use SSL port 6380)
2. Get fresh access key from portal
3. Check connection string format

## Scaling Recommendations

**Small (<100 users):** Basic tier (B1)
**Medium (<1000 users):** Standard tier (S1-S2)
**Large (>1000 users):** Premium tier (P1V2-P3V2) with auto-scaling

## Security Checklist

- [ ] Use strong passwords for PostgreSQL
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Enable Azure AD authentication
- [ ] Set up Key Vault for secrets
- [ ] Configure firewall rules
- [ ] Enable DDoS protection
- [ ] Regular backups configured
- [ ] Application Insights enabled

## Support

For issues:
1. Check Azure Service Health
2. Review Application Insights logs
3. Check deployment logs in Deployment Center
4. Contact Azure Support

## Clean Up Resources

To delete everything:
```bash
az group delete --name lowcodeapi-rg --yes --no-wait
```
