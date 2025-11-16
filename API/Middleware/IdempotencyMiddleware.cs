using System.Text;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Primitives;

namespace LowcodeAPI.API.Middleware;

public class IdempotencyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<IdempotencyMiddleware> _logger;
    private readonly IDistributedCache _cache;

    public IdempotencyMiddleware(
        RequestDelegate next,
        ILogger<IdempotencyMiddleware> logger,
        IDistributedCache cache)
    {
        _next = next;
        _logger = logger;
        _cache = cache;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only apply idempotency to POST, PUT, PATCH
        if (context.Request.Method is not ("POST" or "PUT" or "PATCH"))
        {
            await _next(context);
            return;
        }

        // Check for Idempotency-Key header
        if (!context.Request.Headers.TryGetValue("Idempotency-Key", out var idempotencyKey) ||
            StringValues.IsNullOrEmpty(idempotencyKey))
        {
            await _next(context);
            return;
        }

        var key = $"idempotency:{idempotencyKey}";
        var cachedResponse = await _cache.GetStringAsync(key);

        if (cachedResponse != null)
        {
            _logger.LogInformation("Idempotency key {Key} found, returning cached response", idempotencyKey);
            
            var response = System.Text.Json.JsonSerializer.Deserialize<IdempotencyResponse>(cachedResponse);
            if (response != null)
            {
                context.Response.StatusCode = response.StatusCode;
                context.Response.ContentType = response.ContentType;
                await context.Response.WriteAsync(response.Body);
                return;
            }
        }

        // Store original response stream
        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        await _next(context);

        // Cache successful responses
        if (context.Response.StatusCode is >= 200 and < 300)
        {
            responseBody.Seek(0, SeekOrigin.Begin);
            var responseBodyText = await new StreamReader(responseBody).ReadToEndAsync();

            var idempotencyResponse = new IdempotencyResponse
            {
                StatusCode = context.Response.StatusCode,
                ContentType = context.Response.ContentType ?? "application/json",
                Body = responseBodyText
            };

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            };

            await _cache.SetStringAsync(key, System.Text.Json.JsonSerializer.Serialize(idempotencyResponse), options);
            _logger.LogInformation("Cached response for idempotency key {Key}", idempotencyKey);
        }

        // Copy response back to original stream
        responseBody.Seek(0, SeekOrigin.Begin);
        await responseBody.CopyToAsync(originalBodyStream);
    }

    private class IdempotencyResponse
    {
        public int StatusCode { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
    }
}

