namespace LowcodeAPI.API.Controllers.Sdm;

public class ExecutionResultDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public List<NodeExecutionResult> NodeResults { get; set; } = new();
    public string? FailedNodeId { get; set; }
}

public class NodeExecutionResult
{
    public string NodeId { get; set; } = string.Empty;
    public string NodeType { get; set; } = string.Empty;
    public string NodeLabel { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? Error { get; set; }
    public object? OutputData { get; set; }
    public DateTime ExecutedAt { get; set; }
    public long ExecutionTimeMs { get; set; }
}
