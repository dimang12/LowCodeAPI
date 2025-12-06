#!/bin/bash

# Azure Deployment Script for LowCodeAPI
# Prerequisites: Azure CLI installed (az login completed)

set -e

# Configuration Variables
RESOURCE_GROUP="lowcodeapi-rg"
LOCATION="eastus"
APP_SERVICE_PLAN="lowcodeapi-plan"
WEB_APP_NAME="lowcodeapi-app"  # Must be globally unique
POSTGRES_SERVER="lowcodeapi-postgres"  # Must be globally unique
POSTGRES_ADMIN_USER="lowcodeadmin"
POSTGRES_ADMIN_PASSWORD="YourSecurePassword123!"  # Change this!
POSTGRES_DB_NAME="lowcodeapi"
REDIS_NAME="lowcodeapi-redis"  # Must be globally unique

echo "🚀 Starting Azure deployment for LowCodeAPI..."

# 1. Create Resource Group
echo "📦 Creating resource group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# 2. Create Azure Database for PostgreSQL
echo "🐘 Creating PostgreSQL database..."
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --location $LOCATION \
  --admin-user $POSTGRES_ADMIN_USER \
  --admin-password $POSTGRES_ADMIN_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --storage-size 32 \
  --public-access 0.0.0.0

# Create database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $POSTGRES_SERVER \
  --database-name $POSTGRES_DB_NAME

# 3. Create Azure Cache for Redis
echo "🔴 Creating Redis cache..."
az redis create \
  --resource-group $RESOURCE_GROUP \
  --name $REDIS_NAME \
  --location $LOCATION \
  --sku Basic \
  --vm-size c0 \
  --enable-non-ssl-port

# 4. Create App Service Plan
echo "📋 Creating App Service Plan..."
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku B1 \
  --is-linux

# 5. Create Web App
echo "🌐 Creating Web App..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $WEB_APP_NAME \
  --runtime "DOTNET:8.0"

# 6. Get connection strings
echo "🔗 Getting connection strings..."
POSTGRES_CONN_STRING="Host=$POSTGRES_SERVER.postgres.database.azure.com;Database=$POSTGRES_DB_NAME;Username=$POSTGRES_ADMIN_USER;Password=$POSTGRES_ADMIN_PASSWORD;Port=5432;SSL Mode=Require;"

REDIS_KEY=$(az redis list-keys \
  --resource-group $RESOURCE_GROUP \
  --name $REDIS_NAME \
  --query primaryKey \
  --output tsv)

REDIS_CONN_STRING="$REDIS_NAME.redis.cache.windows.net:6380,password=$REDIS_KEY,ssl=True,abortConnect=False"

# 7. Configure App Settings
echo "⚙️  Configuring application settings..."
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $WEB_APP_NAME \
  --settings \
    ASPNETCORE_ENVIRONMENT="Production" \
    "ConnectionStrings__DefaultConnection=$POSTGRES_CONN_STRING" \
    "ConnectionStrings__Redis=$REDIS_CONN_STRING" \
    "Cors__AllowedOrigins__0=https://$WEB_APP_NAME.azurewebsites.net"

# 8. Enable HTTPS only
az webapp update \
  --resource-group $RESOURCE_GROUP \
  --name $WEB_APP_NAME \
  --https-only true

# 9. Build and Deploy Application
echo "🏗️  Building and deploying application..."
dotnet publish -c Release -o ./publish

# Create zip file
cd publish
zip -r ../deploy.zip .
cd ..

# Deploy zip
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $WEB_APP_NAME \
  --src deploy.zip

# Cleanup
rm deploy.zip

echo "✅ Deployment complete!"
echo ""
echo "📍 Application URL: https://$WEB_APP_NAME.azurewebsites.net"
echo "🐘 PostgreSQL Server: $POSTGRES_SERVER.postgres.database.azure.com"
echo "🔴 Redis Cache: $REDIS_NAME.redis.cache.windows.net"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Run database migrations"
echo "  2. Update CORS settings if needed"
echo "  3. Configure custom domain (optional)"
echo "  4. Set up Application Insights for monitoring"
