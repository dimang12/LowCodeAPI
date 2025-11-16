# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Install Node.js for SPA build (do this before copying files for better caching)
RUN apt-get update && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/* && \
    node --version && \
    npm --version

# Copy csproj and restore dependencies
COPY ["LowcodeAPI.csproj", "./"]
RUN dotnet restore "LowcodeAPI.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "LowcodeAPI.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "LowcodeAPI.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install Node.js for SPA build (if needed at runtime)
# For production, pre-build the SPA and copy files

COPY --from=publish /app/publish .

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "LowcodeAPI.dll"]

