using LowcodeAPI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LowcodeAPI.Infrastructure.Persistence.Configurations;

public class SdmConfiguration : IEntityTypeConfiguration<Sdm>
{
    public void Configure(EntityTypeBuilder<Sdm> builder)
    {
        builder.ToTable("sdm_config");
        
        builder.HasKey(s => s.Id);
        
        builder.Property(s => s.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();
        
        builder.Property(s => s.UUID)
            .HasColumnName("UUID")
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(s => s.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(300);
        
        builder.Property(s => s.Config)
            .HasColumnName("config")
            .HasColumnType("json");
        
        builder.Property(s => s.Status)
            .HasColumnName("status")
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(s => s.CreatedBy)
            .HasColumnName("created_by")
            .IsRequired();
        
        builder.Property(s => s.UpdatedDate)
            .HasColumnName("updated_date")
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .ValueGeneratedOnAddOrUpdate();
        
        builder.Property(s => s.CreateDate)
            .HasColumnName("create_date");
        
        builder.Property(s => s.TestDataLimit)
            .HasColumnName("test_data_limit")
            .IsRequired()
            .HasDefaultValue(100);
        
        builder.Property(s => s.MostRecent)
            .HasColumnName("most_recent")
            .HasMaxLength(1000)
            .HasDefaultValue("[]");
        
        builder.Property(s => s.Settings)
            .HasColumnName("settings")
            .HasColumnType("json");
        
        builder.Property(s => s.Groups)
            .HasColumnName("groups")
            .HasColumnType("text");
    }
}
