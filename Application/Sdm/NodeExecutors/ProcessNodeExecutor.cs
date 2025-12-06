using LowcodeAPI.API.Controllers.Sdm;
using System.Text.Json;

namespace LowcodeAPI.Application.Sdm;

public class ProcessNodeExecutor : INodeExecutor
{
    public Task<object?> ExecuteAsync(ElementDto element, object? inputData)
    {
        // Process node performs business logic based on config
        var config = ParseConfig(element.Config);
        
        // Simulate processing logic
        var output = new
        {
            processedBy = element.Label ?? "Process",
            input = inputData,
            config = config,
            processedAt = DateTime.UtcNow,
            result = "processed"
        };
        
        return Task.FromResult<object?>(output);
    }
    
    private object? ParseConfig(object? config)
    {
        if (config == null) return null;
        
        if (config is JsonElement jsonElement)
        {
            return JsonSerializer.Deserialize<object>(jsonElement.GetRawText());
        }
        
        return config;
    }
}
