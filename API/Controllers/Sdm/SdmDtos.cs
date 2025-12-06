using System.Text.Json.Serialization;

namespace LowcodeAPI.API.Controllers.Sdm;

public class SdmDto
{
    public int Id { get; set; }
    [JsonPropertyName("uuid")]
    public string UUID { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int CreatedBy { get; set; }
    public DateTime UpdatedDate { get; set; }
    public DateTime? CreateDate { get; set; }
}

public class SdmDetailDto
{
    public int Id { get; set; }
    [JsonPropertyName("uuid")]
    public string UUID { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<ElementDto> Elements { get; set; } = new();
    public List<ConnectionDto> Connections { get; set; } = new();
}

public class ElementDto
{
    public double Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
    public string? Label { get; set; }
    public string? ExternalLabel { get; set; }
    public string? Description { get; set; }
    public string? Condition { get; set; }
    public object? Config { get; set; }
}

public class ConnectionDto
{
    public double From { get; set; }
    public double To { get; set; }
    public string Type { get; set; } = "default";
    public string? Label { get; set; }
}

public class DiagramConfig
{
    public List<ElementDto> Elements { get; set; } = new();
    public List<ConnectionDto> Connections { get; set; } = new();
}

public class CreateSdmDto
{
    public string Name { get; set; } = string.Empty;
    public int CreatedBy { get; set; } = 1;
}

public class UpdateSdmDto
{
    public string Name { get; set; } = string.Empty;
}

public class SaveStateDto
{
    public List<ElementDto> Elements { get; set; } = new();
    public List<ConnectionDto> Connections { get; set; } = new();
}
