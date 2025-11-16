# LowcodeAPI - Scalable Architecture Blueprint

This application has been structured following Clean/Hexagonal Architecture principles with scalability and maintainability in mind.

## Architecture Overview

### Layers

- **Domain**: Core business entities and domain events
- **Application**: Use cases, CQRS commands/queries, interfaces, behaviors
- **Infrastructure**: Database, caching, external services, messaging
- **API**: Controllers, middleware, configuration, DTOs

### Key Patterns Implemented

1. **Clean Architecture**: Separation of concerns with dependency inversion
2. **CQRS**: Ready for command/query separation with MediatR
3. **Repository Pattern**: Through DbContext abstraction
4. **Middleware Pipeline**: Correlation IDs, Idempotency, Rate Limiting
5. **Observability**: OpenTelemetry, Serilog structured logging
6. **Health Checks**: Liveness and readiness probes
7. **API Versioning**: Built-in version management

## Configuration

### Connection Strings

Configure in `appsettings.json`:
- `DefaultConnection`: PostgreSQL database
- `Redis`: Redis cache connection
- `Seq`: Serilog Seq sink (optional)

### Features

- Rate Limiting: 100 requests/minute per user/IP
- Idempotency: Use `Idempotency-Key` header for POST/PUT/PATCH
- Correlation IDs: Automatic tracking with `X-Correlation-ID` header
- Health Checks: `/health` and `/ready` endpoints

## Development

### Database Migrations

```bash
dotnet ef migrations add MigrationName --project LowcodeAPI.csproj
dotnet ef database update
```

### Running

```bash
dotnet run
```

Swagger UI available at root in Development mode.

## Future Enhancements

- Event bus integration (Kafka/RabbitMQ/Azure Service Bus)
- Outbox pattern for reliable event publishing
- Background workers for async processing
- Advanced CQRS with separate read/write models
- Authentication/Authorization (OIDC)
- Feature flags integration
- API gateway patterns (YARP)

