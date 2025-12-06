using LowcodeAPI.API.Configuration;
using LowcodeAPI.Infrastructure.Persistence;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.FeatureManagement;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using OpenTelemetry.Instrumentation.AspNetCore;
using OpenTelemetry.Instrumentation.Http;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Events;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
    .MinimumLevel.Override("System", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithEnvironmentName()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.Seq(builder.Configuration.GetConnectionString("Seq") ?? "http://localhost:5341")
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Configure OpenTelemetry
builder.Services.AddOpenTelemetry()
    .WithTracing(tracerProviderBuilder =>
        tracerProviderBuilder
            .AddAspNetCoreInstrumentation(options =>
            {
                options.RecordException = true;
            })
            .AddHttpClientInstrumentation()
            .AddConsoleExporter())
    .WithMetrics(metricsProviderBuilder =>
        metricsProviderBuilder
            .AddHttpClientInstrumentation()
            .AddConsoleExporter());

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var problemDetails = new Microsoft.AspNetCore.Mvc.ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Title = "One or more validation errors occurred.",
                Status = StatusCodes.Status400BadRequest,
                Detail = "See errors property for details",
                Instance = context.HttpContext.Request.Path
            };

            problemDetails.Extensions.Add("traceId", context.HttpContext.TraceIdentifier);
            
            if (context.ModelState.Any())
            {
                var errors = new Dictionary<string, string[]>();
                foreach (var state in context.ModelState)
                {
                    var stateErrors = state.Value.Errors.Select(e => e.ErrorMessage).ToArray();
                    if (stateErrors.Any())
                    {
                        errors[state.Key] = stateErrors;
                    }
                }
                problemDetails.Extensions.Add("errors", errors);
            }

            return new Microsoft.AspNetCore.Mvc.ObjectResult(problemDetails)
            {
                StatusCode = StatusCodes.Status400BadRequest,
                ContentTypes = { "application/problem+json" }
            };
        };
    });

// Add Feature Management
builder.Services.AddFeatureManagement();

// Add SDM Execution Services
builder.Services.AddScoped<LowcodeAPI.Application.Sdm.ISdmExecutor, LowcodeAPI.Application.Sdm.SdmExecutor>();

// Configure API services
builder.Services.AddApiServices(builder.Configuration);

// Configure Infrastructure
builder.Services.AddInfrastructureServices(builder.Configuration);

// Configure Authentication
builder.Services.AddAuthenticationServices(builder.Configuration);

// Add FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

var app = builder.Build();

// Configure pipeline
app.ConfigureRequestPipeline();

// Run database migrations in development (if database is available)
if (app.Environment.IsDevelopment())
{
    try
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.MigrateAsync();
        Log.Information("Database migrations completed successfully");
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Database migrations skipped - database may not be available. This is OK for development.");
    }
}

try
{
    Log.Information("Starting LowcodeAPI");
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
