using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LowcodeAPI.API.Controllers.App;
using LowcodeAPI.Domain.Entities;
using LowcodeAPI.Infrastructure.Persistence;
using LowcodeAPI.Tests.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace LowcodeAPI.Tests.Controllers.App;

public class AppPackagesControllerTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly AppPackagesController _controller;
    private readonly Mock<ILogger<AppPackagesController>> _mockLogger;

    public AppPackagesControllerTests()
    {
        // Create TestApplicationDbContext with InMemory database (ignores JsonDocument properties)
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new TestApplicationDbContext(options);
        _mockLogger = new Mock<ILogger<AppPackagesController>>();
        _controller = new AppPackagesController(_context, _mockLogger.Object);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task GetAppPackages_ReturnsEmptyList_WhenNoPackagesExist()
    {
        // Act
        var result = await _controller.GetAppPackages();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var packages = Assert.IsAssignableFrom<System.Collections.IEnumerable>(okResult.Value);
        Assert.Empty(packages.Cast<object>());
    }

    [Fact]
    public async Task GetAppPackages_ReturnsPackageList_WhenPackagesExist()
    {
        // Arrange - Create a fresh context for this test to avoid tracking conflicts
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        using var testContext = new TestApplicationDbContext(options);
        var testController = new AppPackagesController(testContext, _mockLogger.Object);
        
        var package1 = new AppPackage 
        { 
            Id = 1, // Explicit ID required since AppPackage uses ValueGeneratedNever()
            AppName = "Test App 1", 
            AppCredential = "cred1",
            Uuid = "uuid1",
            Version = 1,
            CreateTime = DateTime.UtcNow 
        };
        var package2 = new AppPackage 
        { 
            Id = 2, // Explicit ID required since AppPackage uses ValueGeneratedNever()
            AppName = "Test App 2", 
            AppCredential = "cred2",
            Uuid = "uuid2",
            Version = 1,
            CreateTime = DateTime.UtcNow 
        };
        
        testContext.AppPackages.AddRange(package1, package2);
        await testContext.SaveChangesAsync();

        // Act
        var result = await testController.GetAppPackages();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var packages = Assert.IsAssignableFrom<System.Collections.IEnumerable>(okResult.Value);
        Assert.Equal(2, packages.Cast<object>().Count());
    }

}

