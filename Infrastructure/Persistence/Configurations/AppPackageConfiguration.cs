using LowcodeAPI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace LowcodeAPI.Infrastructure.Persistence.Configurations;

public class AppPackageConfiguration : IEntityTypeConfiguration<AppPackage>
{
    public void Configure(EntityTypeBuilder<AppPackage> builder)
    {
        builder.ToTable("app_package");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever(); // Use explicit IDs from INSERT statements

        builder.Property(e => e.AppCredential)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.Uuid)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.AppName)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.AppDesc)
            .HasMaxLength(1000);

        builder.Property(e => e.CreateSource)
            .HasMaxLength(255);

        builder.Property(e => e.Thumnail)
            .HasMaxLength(500);

        builder.Property(e => e.DeployMeta)
            .HasMaxLength(500);

        // JSONB columns
        builder.Property(e => e.ExportSetting)
            .HasColumnType("jsonb")
            .HasConversion(
                v => v == null ? null : v.RootElement.GetRawText(),
                v => string.IsNullOrEmpty(v) ? null : JsonDocument.Parse(v, new JsonDocumentOptions()));

        builder.Property(e => e.DeploySetting)
            .HasColumnType("jsonb")
            .HasConversion(
                v => v == null ? null : v.RootElement.GetRawText(),
                v => string.IsNullOrEmpty(v) ? null : JsonDocument.Parse(v, new JsonDocumentOptions()));

        builder.Property(e => e.App_Settings)
            .HasColumnType("jsonb")
            .HasConversion(
                v => v == null ? null : v.RootElement.GetRawText(),
                v => string.IsNullOrEmpty(v) ? null : JsonDocument.Parse(v, new JsonDocumentOptions()));

        builder.Property(e => e.Role)
            .HasColumnType("jsonb")
            .HasConversion(
                v => v == null ? null : v.RootElement.GetRawText(),
                v => string.IsNullOrEmpty(v) ? null : JsonDocument.Parse(v, new JsonDocumentOptions()));

        builder.Property(e => e.Maintenance_Title)
            .HasMaxLength(500);

        builder.Property(e => e.Maintenance_Message)
            .HasMaxLength(2000);

        // Audit fields
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt);
        builder.Property(e => e.CreatedBy).HasMaxLength(255);
        builder.Property(e => e.UpdatedBy).HasMaxLength(255);

        // Indexes
        builder.HasIndex(e => e.Uuid);
        builder.HasIndex(e => e.AppCredential);
        builder.HasIndex(e => e.CreateBy);
    }
}

