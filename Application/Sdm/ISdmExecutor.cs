using LowcodeAPI.API.Controllers.Sdm;

namespace LowcodeAPI.Application.Sdm;

public interface ISdmExecutor
{
    Task<ExecutionResultDto> ExecuteAsync(DiagramConfig config, string? startNodeId = null);
}
