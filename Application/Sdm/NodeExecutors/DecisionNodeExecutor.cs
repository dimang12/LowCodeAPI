using LowcodeAPI.API.Controllers.Sdm;
using System.Text.Json;

namespace LowcodeAPI.Application.Sdm;

public class DecisionNodeExecutor : INodeExecutor
{
    public Task<object?> ExecuteAsync(ElementDto element, object? inputData)
    {
        // Decision node evaluates condition
        var config = ParseConfig(element.Config);
        var condition = element.Condition ?? "true";
        
        // Simple condition evaluation (in real scenario, use expression evaluator)
        bool conditionResult = EvaluateCondition(condition, inputData);
        
        var output = new
        {
            decision = element.Label ?? "Decision",
            condition = condition,
            result = conditionResult,
            input = inputData,
            evaluatedAt = DateTime.UtcNow
        };
        
        return Task.FromResult<object?>(output);
    }
    
    private bool EvaluateCondition(string condition, object? inputData)
    {
        // Simple evaluation - in production, use a proper expression evaluator
        // For now, return true for demo purposes
        return true;
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
