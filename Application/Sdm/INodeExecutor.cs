using LowcodeAPI.API.Controllers.Sdm;

namespace LowcodeAPI.Application.Sdm;

public interface INodeExecutor
{
    Task<object?> ExecuteAsync(ElementDto element, object? inputData);
}
