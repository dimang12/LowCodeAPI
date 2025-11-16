using LowcodeAPI.API.Middleware;
using Serilog;

namespace LowcodeAPI.API.Configuration;

public static class ConfigurePipeline
{
    public static WebApplication ConfigureRequestPipeline(this WebApplication app)
    {
        // Configure Serilog
        app.UseSerilogRequestLogging(options =>
        {
            options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
            options.GetLevel = (httpContext, elapsed, ex) => ex != null
                ? Serilog.Events.LogEventLevel.Error
                : elapsed > 500
                    ? Serilog.Events.LogEventLevel.Warning
                    : Serilog.Events.LogEventLevel.Information;
        });

        // Configure the HTTP request pipeline
        if (!app.Environment.IsDevelopment())
        {
            app.UseHsts();
        }

        // Middleware pipeline
        app.UseHttpsRedirection();
        app.UseStaticFiles();
        
        // Correlation ID middleware (early in pipeline)
        app.UseMiddleware<CorrelationIdMiddleware>();
        
        // Rate limiting
        app.UseRateLimiter();
        
        // CORS
        app.UseCors();
        
        // Routing
        app.UseRouting();
        
        // Authentication & Authorization
        app.UseAuthentication();
        app.UseAuthorization();
        
        // Idempotency middleware (before controllers)
        app.UseMiddleware<IdempotencyMiddleware>();

        // Swagger/OpenAPI
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "LowcodeAPI v1");
                options.RoutePrefix = string.Empty;
            });
        }

        // Health checks
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("db") || check.Tags.Contains("cache")
        });

        // Controllers
        app.MapControllers();

        // SPA fallback
        app.MapFallbackToFile("index.html");

        return app;
    }
}

