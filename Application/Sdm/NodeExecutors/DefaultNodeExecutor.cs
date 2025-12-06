using LowcodeAPI.API.Controllers.Sdm;

namespace LowcodeAPI.Application.Sdm;

public class DefaultNodeExecutor : INodeExecutor
{
    public Task<object?> ExecuteAsync(ElementDto element, object? inputData)
    {
        // Default executor for unknown node types
        var output = new
        {
            nodeType = element.Type,
            label = element.Label,
            passthrough = inputData,
            executedAt = DateTime.UtcNow
        };
        
        return Task.FromResult<object?>(output);
    }
}
