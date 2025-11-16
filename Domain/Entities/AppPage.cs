using System.Text.Json;

namespace LowcodeAPI.Domain.Entities;

public class AppPage
{
    public int PageId { get; set; }
    public int UserId { get; set; }
    public string PageName { get; set; } = string.Empty;
    public sbyte DisplayStatus { get; set; } = 0;
    public sbyte Visibility { get; set; } = 0;
    public string? Password { get; set; }
    public sbyte Recommend { get; set; } = 0;
    public sbyte Publish { get; set; } = 0;
    public string? Title { get; set; }
    public sbyte IsTwoColumn { get; set; } = 5;
    public sbyte POrder { get; set; } = 0;
    public short AutoPlaySec { get; set; } = 0;
    public sbyte IRatio { get; set; } = 0;
    public sbyte Zoom { get; set; } = 0;
    public sbyte DocPerRow { get; set; } = 0;
    public sbyte DocPerCol { get; set; } = 0;
    public sbyte DocFlowType { get; set; } = 0;
    public sbyte CanvasType { get; set; } = 0;
    public int? GeoZoom { get; set; }
    public double Lat { get; set; } = 0;
    public double Lng { get; set; } = 0;
    public float WidthCol0 { get; set; }
    public float WidthCol1 { get; set; }
    public float WidthCol2 { get; set; }
    public float WidthCol3 { get; set; }
    public float WidthCol4 { get; set; }
    public int AllowPageAvatar { get; set; } = 1;
    public string BgColor { get; set; } = string.Empty;
    public double ObjectsCacheTimeout { get; set; }
    public double ObjectsCacheTimeoutMeta { get; set; }
    public sbyte LockUnlockObjectsStatus { get; set; }
    public sbyte CollapseExpandObjectsStatus { get; set; }
    public sbyte ReportNumPages { get; set; } = 1;
    public int MaxNumAccess { get; set; } = 0;
    public int CountNumAccess { get; set; } = 0;
    public int ExpirationTime { get; set; }
    
    // JSON columns - configured as jsonb in Fluent API
    // dynamic_binding and deep_ui_meta_data are NOT NULL in schema, but we use nullable JsonDocument
    // Configuration will ensure they default to empty JSON object {} if null
    public JsonDocument? DynamicBinding { get; set; }
    public JsonDocument? ObjectEventBinding { get; set; }
    public JsonDocument? DeepUiMetaData { get; set; }
    public JsonDocument? LayoutSettings { get; set; }
    public JsonDocument? SecuritySettings { get; set; }
    
    public sbyte PageNotShareInBindle { get; set; } = 0;
    public byte[] Thumbnail { get; set; } = Array.Empty<byte>();
    public int? ThumbnailMask { get; set; }
    public DateTime? LastAccess { get; set; }
    public int EnableDoubleClickToViewImageWidgets { get; set; } = 0;
    public int? EnablePageCache { get; set; }
    public sbyte EnablePasteConfirmation { get; set; } = 0;
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}

