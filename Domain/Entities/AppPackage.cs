using System.Text.Json;

namespace LowcodeAPI.Domain.Entities;

public class AppPackage
{
    public int Id { get; set; }
    public string AppCredential { get; set; } = string.Empty;
    public string Uuid { get; set; } = string.Empty;
    public string AppName { get; set; } = string.Empty;
    public int Version { get; set; }
    public string AppDesc { get; set; } = string.Empty;
    public int PageLayout { get; set; }
    public DateTime CreateTime { get; set; }
    public DateTime ViewTime { get; set; }
    public int CreateMethod { get; set; }
    public string CreateSource { get; set; } = string.Empty;
    public int CreateBy { get; set; }
    public string? Thumnail { get; set; }
    public string DeployMeta { get; set; } = string.Empty;
    public int AppVersion { get; set; }
    
    // JSON columns - configured as jsonb in Fluent API
    public JsonDocument? ExportSetting { get; set; }
    public JsonDocument? DeploySetting { get; set; }
    public JsonDocument? App_Settings { get; set; }
    public JsonDocument? Role { get; set; }
    
    public int Maintenance_Status { get; set; }
    public string? Maintenance_Title { get; set; }
    public string? Maintenance_Message { get; set; }
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}

