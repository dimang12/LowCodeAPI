using LowcodeAPI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace LowcodeAPI.Infrastructure.Persistence.Configurations;

public class AppPageConfiguration : IEntityTypeConfiguration<AppPage>
{
    public void Configure(EntityTypeBuilder<AppPage> builder)
    {
        builder.ToTable("app_pages");

        builder.HasKey(e => e.PageId);
        builder.Property(e => e.PageId)
            .HasColumnName("page_id")
            .ValueGeneratedOnAdd();

        builder.Property(e => e.UserId)
            .HasColumnName("userid")
            .IsRequired();

        builder.Property(e => e.PageName)
            .HasColumnName("pagename")
            .HasMaxLength(550)
            .IsRequired();

        builder.Property(e => e.DisplayStatus)
            .HasColumnName("display_status")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.Visibility)
            .HasColumnName("visibility")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.Password)
            .HasColumnName("password")
            .HasMaxLength(15);

        builder.Property(e => e.Recommend)
            .HasColumnName("recommend")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.Publish)
            .HasColumnName("publish")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.Title)
            .HasColumnName("title")
            .HasMaxLength(1000);

        builder.Property(e => e.IsTwoColumn)
            .HasColumnName("istwocolumn")
            .HasDefaultValue((sbyte)5)
            .IsRequired();

        builder.Property(e => e.POrder)
            .HasColumnName("porder")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.AutoPlaySec)
            .HasColumnName("auto_play_sec")
            .HasDefaultValue((short)0)
            .IsRequired();

        builder.Property(e => e.IRatio)
            .HasColumnName("iratio")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.Zoom)
            .HasColumnName("zoom")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.DocPerRow)
            .HasColumnName("docperrow")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.DocPerCol)
            .HasColumnName("docpercol")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.DocFlowType)
            .HasColumnName("docflowtype")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.CanvasType)
            .HasColumnName("canvastype")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.GeoZoom)
            .HasColumnName("geozoom")
            .HasDefaultValue(0);

        builder.Property(e => e.Lat)
            .HasColumnName("lat")
            .HasDefaultValue(0.0)
            .IsRequired();

        builder.Property(e => e.Lng)
            .HasColumnName("lng")
            .HasDefaultValue(0.0)
            .IsRequired();

        builder.Property(e => e.WidthCol0)
            .HasColumnName("width_col0")
            .IsRequired();

        builder.Property(e => e.WidthCol1)
            .HasColumnName("width_col1")
            .IsRequired();

        builder.Property(e => e.WidthCol2)
            .HasColumnName("width_col2")
            .IsRequired();

        builder.Property(e => e.WidthCol3)
            .HasColumnName("width_col3")
            .IsRequired();

        builder.Property(e => e.WidthCol4)
            .HasColumnName("width_col4")
            .IsRequired();

        builder.Property(e => e.AllowPageAvatar)
            .HasColumnName("allowPageAvatar")
            .HasDefaultValue(1)
            .IsRequired();

        builder.Property(e => e.BgColor)
            .HasColumnName("bgcolor")
            .HasMaxLength(2500)
            .IsRequired();

        builder.Property(e => e.ObjectsCacheTimeout)
            .HasColumnName("objects_cache_timeout")
            .IsRequired();

        builder.Property(e => e.ObjectsCacheTimeoutMeta)
            .HasColumnName("objects_cache_timeout_meta")
            .IsRequired();

        builder.Property(e => e.LockUnlockObjectsStatus)
            .HasColumnName("lock_unlock_objects_status")
            .IsRequired();

        builder.Property(e => e.CollapseExpandObjectsStatus)
            .HasColumnName("collapse_expand_objects_status")
            .IsRequired();

        builder.Property(e => e.ReportNumPages)
            .HasColumnName("report_num_pages")
            .HasDefaultValue((sbyte)1)
            .IsRequired();

        builder.Property(e => e.MaxNumAccess)
            .HasColumnName("max_num_access")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(e => e.CountNumAccess)
            .HasColumnName("count_num_access")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(e => e.ExpirationTime)
            .HasColumnName("expiration_time")
            .IsRequired();

        // JSONB columns
        // dynamic_binding and deep_ui_meta_data are NOT NULL in schema
        var jsonOptions = new JsonDocumentOptions();
        builder.Property(e => e.DynamicBinding)
            .HasColumnName("dynamic_binding")
            .HasColumnType("jsonb")
            .IsRequired()
            .HasDefaultValueSql("'{}'::jsonb")
            .HasConversion(
                v => v == null ? "{}" : v.RootElement.GetRawText(),
                v => string.IsNullOrEmpty(v) || v == "{}" ? JsonDocument.Parse("{}", jsonOptions) : JsonDocument.Parse(v, jsonOptions));

        builder.Property(e => e.ObjectEventBinding)
            .HasColumnName("object_event_binding")
            .HasColumnType("jsonb")
            .HasConversion(
                v => v == null ? null : v.RootElement.GetRawText(),
                v => string.IsNullOrEmpty(v) ? null : JsonDocument.Parse(v, jsonOptions));

        builder.Property(e => e.DeepUiMetaData)
            .HasColumnName("deep_ui_meta_data")
            .HasColumnType("jsonb")
            .IsRequired()
            .HasDefaultValueSql("'{}'::jsonb")
            .HasConversion(
                v => v == null ? "{}" : v.RootElement.GetRawText(),
                v => string.IsNullOrEmpty(v) || v == "{}" ? JsonDocument.Parse("{}", jsonOptions) : JsonDocument.Parse(v, jsonOptions));

        builder.Property(e => e.LayoutSettings)
            .HasColumnName("layout_settings")
            .HasColumnType("jsonb")
            .HasConversion(
                v => v == null ? null : v.RootElement.GetRawText(),
                v => string.IsNullOrEmpty(v) ? null : JsonDocument.Parse(v, jsonOptions));

        builder.Property(e => e.SecuritySettings)
            .HasColumnName("security_settings")
            .HasColumnType("jsonb")
            .HasConversion(
                v => v == null ? null : v.RootElement.GetRawText(),
                v => string.IsNullOrEmpty(v) ? null : JsonDocument.Parse(v, jsonOptions));

        builder.Property(e => e.PageNotShareInBindle)
            .HasColumnName("pageNotShareInBindle")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        builder.Property(e => e.Thumbnail)
            .HasColumnName("thumbnail")
            .HasColumnType("bytea")
            .IsRequired();

        builder.Property(e => e.ThumbnailMask)
            .HasColumnName("thumbnailmask");

        builder.Property(e => e.LastAccess)
            .HasColumnName("lastaccess");

        builder.Property(e => e.EnableDoubleClickToViewImageWidgets)
            .HasColumnName("enableDoubleClickToViewImageWidgets")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(e => e.EnablePageCache)
            .HasColumnName("enablePageCache");

        builder.Property(e => e.EnablePasteConfirmation)
            .HasColumnName("enablePasteConfirmation")
            .HasDefaultValue((sbyte)0)
            .IsRequired();

        // Audit fields
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt);
        builder.Property(e => e.CreatedBy).HasMaxLength(255);
        builder.Property(e => e.UpdatedBy).HasMaxLength(255);

        // Indexes
        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => e.PageName);
        builder.HasIndex(e => e.Publish);
        builder.HasIndex(e => e.DisplayStatus);
    }
}

