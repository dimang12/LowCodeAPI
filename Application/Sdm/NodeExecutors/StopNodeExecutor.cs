using LowcodeAPI.API.Controllers.Sdm;

namespace LowcodeAPI.Application.Sdm;

public class StopNodeExecutor : INodeExecutor
{
    public Task<object?> ExecuteAsync(ElementDto element, object? inputData)
    {
        // Stop node finalizes the workflow
        var output = new
        {
            status = "completed",
            timestamp = DateTime.UtcNow,
            finalData = inputData
        };
        
        return Task.FromResult<object?>(output);
    }
}
