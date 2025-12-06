using LowcodeAPI.API.Controllers.Sdm;
using System.Diagnostics;

namespace LowcodeAPI.Application.Sdm;

public class SdmExecutor : ISdmExecutor
{
    private readonly ILogger<SdmExecutor> _logger;
    private readonly IServiceProvider _serviceProvider;

    public SdmExecutor(ILogger<SdmExecutor> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async Task<ExecutionResultDto> ExecuteAsync(DiagramConfig config, string? startNodeId = null)
    {
        var result = new ExecutionResultDto
        {
            Success = true,
            NodeResults = new List<NodeExecutionResult>()
        };

        try
        {
            // Find start node
            var startNode = FindStartNode(config, startNodeId);
            if (startNode == null)
            {
                result.Success = false;
                result.Message = startNodeId == null 
                    ? "No start node found in diagram" 
                    : $"Start node {startNodeId} not found";
                return result;
            }

            // Build execution graph
            var executionOrder = BuildExecutionOrder(config, startNode);
            
            // Execute nodes in order
            object? currentData = null;
            
            foreach (var nodeId in executionOrder)
            {
                var element = config.Elements.First(e => e.Id == nodeId);
                var nodeResult = await ExecuteNode(element, currentData);
                
                result.NodeResults.Add(nodeResult);
                
                if (!nodeResult.Success)
                {
                    result.Success = false;
                    result.Message = $"Execution failed at node '{nodeResult.NodeLabel}'";
                    result.FailedNodeId = nodeId.ToString();
                    break;
                }
                
                // Pass output to next node
                currentData = nodeResult.OutputData;
            }

            if (result.Success)
            {
                result.Message = $"Execution completed successfully. Processed {result.NodeResults.Count} nodes.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during SDM execution");
            result.Success = false;
            result.Message = $"Execution error: {ex.Message}";
        }

        return result;
    }

    private ElementDto? FindStartNode(DiagramConfig config, string? specificNodeId)
    {
        if (specificNodeId != null && double.TryParse(specificNodeId, out var nodeId))
        {
            return config.Elements.FirstOrDefault(e => e.Id == nodeId);
        }

        return config.Elements.FirstOrDefault(e => e.Type == "start");
    }

    private List<double> BuildExecutionOrder(DiagramConfig config, ElementDto startNode)
    {
        var order = new List<double>();
        var visited = new HashSet<double>();
        var queue = new Queue<double>();
        
        queue.Enqueue(startNode.Id);
        
        while (queue.Count > 0)
        {
            var currentId = queue.Dequeue();
            
            if (visited.Contains(currentId))
                continue;
                
            visited.Add(currentId);
            order.Add(currentId);
            
            // Find outgoing connections
            var outgoingConnections = config.Connections
                .Where(c => c.From == currentId)
                .ToList();
            
            foreach (var connection in outgoingConnections)
            {
                if (!visited.Contains(connection.To))
                {
                    queue.Enqueue(connection.To);
                }
            }
        }
        
        return order;
    }

    private async Task<NodeExecutionResult> ExecuteNode(ElementDto element, object? inputData)
    {
        var stopwatch = Stopwatch.StartNew();
        var result = new NodeExecutionResult
        {
            NodeId = element.Id.ToString(),
            NodeType = element.Type,
            NodeLabel = element.ExternalLabel ?? element.Label ?? element.Type,
            ExecutedAt = DateTime.UtcNow
        };

        try
        {
            var executor = CreateNodeExecutor(element.Type);
            result.OutputData = await executor.ExecuteAsync(element, inputData);
            result.Success = true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing node {NodeId} of type {NodeType}", element.Id, element.Type);
            result.Success = false;
            result.Error = ex.Message;
        }
        finally
        {
            stopwatch.Stop();
            result.ExecutionTimeMs = stopwatch.ElapsedMilliseconds;
        }

        return result;
    }

    private INodeExecutor CreateNodeExecutor(string nodeType)
    {
        return nodeType switch
        {
            "start" => new StartNodeExecutor(),
            "stop" => new StopNodeExecutor(),
            "process" => new ProcessNodeExecutor(),
            "decision" => new DecisionNodeExecutor(),
            "dataTemplate" => new DataTemplateNodeExecutor(),
            _ => new DefaultNodeExecutor()
        };
    }
}
