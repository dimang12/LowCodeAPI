using LowcodeAPI.API.Controllers.Sdm;

namespace LowcodeAPI.Application.Sdm;

public class StartNodeExecutor : INodeExecutor
{
    public Task<object?> ExecuteAsync(ElementDto element, object? inputData)
    {
        // Start node just initializes the workflow
        var output = new
        {
            status = "started",
            timestamp = DateTime.UtcNow,
            data = inputData ?? new { }
        };
        
        return Task.FromResult<object?>(output);
    }
}
