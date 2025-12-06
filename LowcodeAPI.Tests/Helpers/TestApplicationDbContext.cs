using LowcodeAPI.Domain.Entities;
using LowcodeAPI.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LowcodeAPI.Tests.Helpers;

public class TestApplicationDbContext : ApplicationDbContext
{
    public TestApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Ignore JsonDocument properties that InMemory provider can't handle
        modelBuilder.Entity<Sdm>()
            .Ignore(s => s.Config)
            .Ignore(s => s.Settings);
        
        // Ignore JsonDocument properties in AppPackage if any exist
        // (Add here if AppPackage has JsonDocument properties)
    }
}
