using System.Text.Json;

namespace LowcodeAPI.Domain.Entities;

public class Sdm
{
    public int Id { get; set; }
    public string UUID { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public JsonDocument? Config { get; set; }
    public string Status { get; set; } = "active";
    public int CreatedBy { get; set; }
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? CreateDate { get; set; } = DateTime.UtcNow;
    public int TestDataLimit { get; set; } = 100;
    public string MostRecent { get; set; } = "[]";
    public JsonDocument? Settings { get; set; }
    public string? Groups { get; set; }
}
