using LowcodeAPI.API.Controllers.Sdm;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace LowcodeAPI.Application.Sdm;

public class DataTemplateNodeExecutor : INodeExecutor
{
    private static readonly Random _random = new Random();
    private int _sequenceCounter = 0;

    public async Task<object?> ExecuteAsync(ElementDto element, object? inputData)
    {
        var config = ParseConfig(element.Config);
        
        // Transform data based on template configuration
        var transformedData = await TransformDataAsync(config, inputData);
        
        var output = new
        {
            template = element.Label ?? "Data Template",
            inputData = inputData,
            transformedData = transformedData,
            rowCount = transformedData is List<Dictionary<string, object?>> list ? list.Count : (transformedData != null ? 1 : 0),
            transformedAt = DateTime.UtcNow,
            outputType = "tabular" // Indicates data should be displayed as a table/grid
        };
        
        return output;
    }
    
    private async Task<object?> TransformDataAsync(DataTemplateConfig? config, object? inputData)
    {
        if (config == null || config.Fields == null || config.Fields.Count == 0)
        {
            return inputData;
        }

        // Parse input data as rows
        var inputRows = ParseInputData(inputData);
        var outputRows = new List<Dictionary<string, object?>>();

        // Determine data generation mode
        if (config.GenerateOption == "enter" && config.EntryData != null && config.EntryData.Count > 0)
        {
            // Use manual entry data
            outputRows = ProcessManualEntryData(config);
        }
        else if (config.GenerateOption == "auto" && config.AutoData != null && config.AutoData.RowsNum > 0)
        {
            // Generate auto data
            outputRows = await GenerateAutoDataAsync(config);
        }
        else if (config.MappingFields != null && config.MappingFields.Count > 0)
        {
            // Map from input data
            outputRows = MapInputData(config, inputRows);
        }
        else
        {
            // Pass through with field filtering
            outputRows = FilterFields(config, inputRows);
        }

        return outputRows;
    }

    private List<Dictionary<string, object?>> ParseInputData(object? inputData)
    {
        if (inputData == null) return new List<Dictionary<string, object?>>();

        if (inputData is JsonElement jsonElement)
        {
            if (jsonElement.ValueKind == JsonValueKind.Array)
            {
                var result = new List<Dictionary<string, object?>>();
                foreach (var item in jsonElement.EnumerateArray())
                {
                    result.Add(JsonElementToDictionary(item));
                }
                return result;
            }
            else if (jsonElement.ValueKind == JsonValueKind.Object)
            {
                return new List<Dictionary<string, object?>> { JsonElementToDictionary(jsonElement) };
            }
        }
        else if (inputData is List<Dictionary<string, object?>> list)
        {
            return list;
        }
        else if (inputData is Dictionary<string, object?> dict)
        {
            return new List<Dictionary<string, object?>> { dict };
        }

        return new List<Dictionary<string, object?>>();
    }

    private Dictionary<string, object?> JsonElementToDictionary(JsonElement element)
    {
        var dict = new Dictionary<string, object?>();
        foreach (var property in element.EnumerateObject())
        {
            dict[property.Name] = GetJsonValue(property.Value);
        }
        return dict;
    }

    private object? GetJsonValue(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Number => element.TryGetInt64(out var l) ? l : element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Null => null,
            JsonValueKind.Array => element.EnumerateArray().Select(GetJsonValue).ToList(),
            JsonValueKind.Object => JsonElementToDictionary(element),
            _ => null
        };
    }

    private List<Dictionary<string, object?>> ProcessManualEntryData(DataTemplateConfig config)
    {
        var result = new List<Dictionary<string, object?>>();
        
        foreach (var entryRow in config.EntryData!)
        {
            var row = new Dictionary<string, object?>();
            foreach (var field in config.Fields!)
            {
                var fieldName = field.PubField ?? field.DsField;
                if (entryRow.ContainsKey(fieldName))
                {
                    row[fieldName] = entryRow[fieldName];
                }
                else
                {
                    row[fieldName] = null;
                }
            }
            result.Add(row);
        }
        
        return result;
    }

    private async Task<List<Dictionary<string, object?>>> GenerateAutoDataAsync(DataTemplateConfig config)
    {
        var result = new List<Dictionary<string, object?>>();
        var rowsNum = config.AutoData!.RowsNum;
        
        for (int i = 0; i < rowsNum; i++)
        {
            var row = new Dictionary<string, object?>();
            
            foreach (var field in config.Fields!)
            {
                var fieldName = field.PubField ?? field.DsField;
                var autoConfig = config.AutoData.Rows?.GetValueOrDefault(fieldName);
                
                if (autoConfig != null)
                {
                    row[fieldName] = await GenerateRandomValueAsync(autoConfig);
                }
                else
                {
                    row[fieldName] = GetDefaultValue(field.DataType);
                }
            }
            
            result.Add(row);
        }
        
        return result;
    }

    private async Task<object?> GenerateRandomValueAsync(AutoGenerateConfig autoConfig)
    {
        if (string.IsNullOrEmpty(autoConfig.Function)) return null;

        var parameters = autoConfig.Parameters ?? new List<string>();

        return autoConfig.Function.ToLower() switch
        {
            "random_int" => RandomInt(parameters),
            "random_num" => RandomNum(parameters),
            "random_from_list" => RandomFromList(parameters),
            "random_date" => RandomDate(parameters, "yyyy-MM-dd"),
            "random_datetime" => RandomDate(parameters, "yyyy-MM-dd HH:mm:ss"),
            "random_sentence" => RandomSentence(parameters),
            "random_latlng" => RandomLatLng(parameters),
            "now" => Now(parameters),
            "sequence" => Sequence(parameters),
            _ => null
        };
    }

    private long RandomInt(List<string> parameters)
    {
        var min = parameters.Count > 0 && long.TryParse(parameters[0], out var minVal) ? minVal : 0;
        var max = parameters.Count > 1 && long.TryParse(parameters[1], out var maxVal) ? maxVal : 100;
        return _random.NextInt64(min, max + 1);
    }

    private double RandomNum(List<string> parameters)
    {
        var min = parameters.Count > 0 && double.TryParse(parameters[0], out var minVal) ? minVal : 0;
        var max = parameters.Count > 1 && double.TryParse(parameters[1], out var maxVal) ? maxVal : 100;
        return min + (_random.NextDouble() * (max - min));
    }

    private string RandomFromList(List<string> parameters)
    {
        if (parameters.Count == 0) return "";
        
        var items = parameters.Count == 1 
            ? parameters[0].Split(',').Select(s => s.Trim()).ToList()
            : parameters;
        
        return items.Count > 0 ? items[_random.Next(items.Count)] : "";
    }

    private string RandomDate(List<string> parameters, string format)
    {
        var minDate = parameters.Count > 0 && DateTime.TryParse(parameters[0], out var min) ? min : DateTime.Now.AddYears(-1);
        var maxDate = parameters.Count > 1 && DateTime.TryParse(parameters[1], out var max) ? max : DateTime.Now;
        
        var range = (maxDate - minDate).TotalSeconds;
        var randomSeconds = _random.NextDouble() * range;
        var randomDate = minDate.AddSeconds(randomSeconds);
        
        return randomDate.ToString(format);
    }

    private string RandomSentence(List<string> parameters)
    {
        var minWords = parameters.Count > 0 && int.TryParse(parameters[0], out var minW) ? minW : 5;
        var maxWords = parameters.Count > 1 && int.TryParse(parameters[1], out var maxW) ? maxW : 10;
        var minChars = parameters.Count > 2 && int.TryParse(parameters[2], out var minC) ? minC : 3;
        var maxChars = parameters.Count > 3 && int.TryParse(parameters[3], out var maxC) ? maxC : 8;
        
        var wordCount = _random.Next(minWords, maxWords + 1);
        var words = new List<string>();
        
        for (int i = 0; i < wordCount; i++)
        {
            var charCount = _random.Next(minChars, maxChars + 1);
            var word = new string(Enumerable.Range(0, charCount)
                .Select(_ => (char)_random.Next('a', 'z' + 1))
                .ToArray());
            words.Add(word);
        }
        
        if (words.Count > 0)
        {
            words[0] = char.ToUpper(words[0][0]) + words[0].Substring(1);
        }
        
        return string.Join(" ", words);
    }

    private string RandomLatLng(List<string> parameters)
    {
        var lat1 = parameters.Count > 0 && double.TryParse(parameters[0], out var lat1Val) ? lat1Val : 38.5;
        var lat2 = parameters.Count > 1 && double.TryParse(parameters[1], out var lat2Val) ? lat2Val : 39.5;
        var lng1 = parameters.Count > 2 && double.TryParse(parameters[2], out var lng1Val) ? lng1Val : -78.0;
        var lng2 = parameters.Count > 3 && double.TryParse(parameters[3], out var lng2Val) ? lng2Val : -77.0;
        
        var lat = lat1 + (_random.NextDouble() * (lat2 - lat1));
        var lng = lng1 + (_random.NextDouble() * (lng2 - lng1));
        
        return $"{lat:F6},{lng:F6}";
    }

    private string Now(List<string> parameters)
    {
        var format = parameters.Count > 0 && !string.IsNullOrEmpty(parameters[0]) ? parameters[0] : "yyyy-MM-dd HH:mm:ss";
        return DateTime.Now.ToString(format);
    }

    private long Sequence(List<string> parameters)
    {
        var start = parameters.Count > 0 && long.TryParse(parameters[0], out var startVal) ? startVal : 1;
        var end = parameters.Count > 1 && long.TryParse(parameters[1], out var endVal) ? endVal : 100;
        var gap = parameters.Count > 2 && long.TryParse(parameters[2], out var gapVal) ? gapVal : 1;
        
        var value = start + (gap * _sequenceCounter);
        
        if (value > end)
        {
            _sequenceCounter = 0;
            value = start;
        }
        
        _sequenceCounter++;
        return value;
    }

    private List<Dictionary<string, object?>> MapInputData(DataTemplateConfig config, List<Dictionary<string, object?>> inputRows)
    {
        var result = new List<Dictionary<string, object?>>();
        
        foreach (var inputRow in inputRows)
        {
            var outputRow = new Dictionary<string, object?>();
            
            foreach (var mapping in config.MappingFields!)
            {
                var targetField = mapping.TargetField;
                var sourceField = mapping.SourceField;
                
                if (mapping.IsExpression)
                {
                    // Evaluate expression
                    outputRow[targetField] = EvaluateExpression(mapping.Expression, inputRow);
                }
                else if (!string.IsNullOrEmpty(sourceField) && inputRow.ContainsKey(sourceField))
                {
                    // Direct mapping
                    outputRow[targetField] = inputRow[sourceField];
                }
                else
                {
                    // Use default value or null
                    outputRow[targetField] = mapping.DefaultValue;
                }
            }
            
            result.Add(outputRow);
        }
        
        return result;
    }

    private object? EvaluateExpression(string? expression, Dictionary<string, object?> row)
    {
        if (string.IsNullOrEmpty(expression)) return null;
        
        // Replace field references [fieldName] with actual values
        var evaluatedExpression = Regex.Replace(expression, @"\[([^\]]+)\]", match =>
        {
            var fieldName = match.Groups[1].Value;
            if (row.ContainsKey(fieldName))
            {
                var value = row[fieldName];
                return value?.ToString() ?? "null";
            }
            return match.Value;
        });
        
        // For now, return the expression as-is
        // In production, you would use an expression evaluator library
        return evaluatedExpression;
    }

    private List<Dictionary<string, object?>> FilterFields(DataTemplateConfig config, List<Dictionary<string, object?>> inputRows)
    {
        var result = new List<Dictionary<string, object?>>();
        
        foreach (var inputRow in inputRows)
        {
            var outputRow = new Dictionary<string, object?>();
            
            foreach (var field in config.Fields!)
            {
                var fieldName = field.PubField ?? field.DsField;
                if (inputRow.ContainsKey(fieldName))
                {
                    outputRow[fieldName] = inputRow[fieldName];
                }
                else
                {
                    outputRow[fieldName] = GetDefaultValue(field.DataType);
                }
            }
            
            result.Add(outputRow);
        }
        
        return result;
    }

    private object? GetDefaultValue(string? dataType)
    {
        return dataType?.ToLower() switch
        {
            "number" or "int" or "integer" or "decimal" or "double" or "float" => 0,
            "boolean" or "bool" => false,
            "date" or "datetime" => DateTime.Now.ToString("yyyy-MM-dd"),
            _ => ""
        };
    }

    private DataTemplateConfig? ParseConfig(object? config)
    {
        if (config == null) return null;
        
        try
        {
            JsonElement jsonElement;
            
            if (config is JsonElement je)
            {
                jsonElement = je;
            }
            else if (config is string jsonString)
            {
                jsonElement = JsonSerializer.Deserialize<JsonElement>(jsonString);
            }
            else
            {
                return null;
            }
            
            return JsonSerializer.Deserialize<DataTemplateConfig>(jsonElement.GetRawText(), new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch
        {
            return null;
        }
    }
}

// Configuration classes
public class DataTemplateConfig
{
    public string? GenerateOption { get; set; } // "enter", "auto", "parent"
    public List<FieldConfig>? Fields { get; set; }
    public List<MappingFieldConfig>? MappingFields { get; set; }
    public List<Dictionary<string, object?>>? EntryData { get; set; }
    public AutoDataConfig? AutoData { get; set; }
}

public class FieldConfig
{
    public string DsField { get; set; } = "";
    public string? PubField { get; set; }
    public string? DataType { get; set; }
    public string? DataSubType { get; set; }
}

public class MappingFieldConfig
{
    public string TargetField { get; set; } = "";
    public string? SourceField { get; set; }
    public bool IsExpression { get; set; }
    public string? Expression { get; set; }
    public object? DefaultValue { get; set; }
}

public class AutoDataConfig
{
    public int RowsNum { get; set; }
    public Dictionary<string, AutoGenerateConfig>? Rows { get; set; }
}

public class AutoGenerateConfig
{
    public string? Function { get; set; }
    public List<string>? Parameters { get; set; }
}
