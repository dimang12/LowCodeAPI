using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LowcodeAPI.API.Controllers.Sdm;
using LowcodeAPI.Infrastructure.Persistence;
using LowcodeAPI.Tests.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using SdmEntity = LowcodeAPI.Domain.Entities.Sdm;

namespace LowcodeAPI.Tests.Controllers.Sdm;

public class SdmControllerTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly SdmController _controller;
    private readonly Mock<ILogger<SdmController>> _mockLogger;

    public SdmControllerTests()
    {
        // Create TestApplicationDbContext with InMemory database (ignores JsonDocument properties)
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new TestApplicationDbContext(options);
        _mockLogger = new Mock<ILogger<SdmController>>();
        _controller = new SdmController(_context, _mockLogger.Object);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task GetAll_ReturnsEmptyList_WhenNoSdmsExist()
    {
        // Act
        var result = await _controller.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var sdms = Assert.IsAssignableFrom<System.Collections.IEnumerable>(okResult.Value);
        Assert.Empty(sdms.Cast<object>());
    }

    [Fact]
    public async Task GetAll_ReturnsSdmList_WhenSdmsExist()
    {
        // Arrange
        var sdm1 = new SdmEntity 
        { 
            UUID = "test-uuid-1", 
            Name = "SDM 1", 
            Status = "active",
            CreateDate = DateTime.UtcNow 
        };
        var sdm2 = new SdmEntity 
        { 
            UUID = "test-uuid-2", 
            Name = "SDM 2", 
            Status = "active",
            CreateDate = DateTime.UtcNow 
        };
        
        _context.Sdms.AddRange(sdm1, sdm2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var sdms = Assert.IsAssignableFrom<System.Collections.IEnumerable>(okResult.Value);
        Assert.Equal(2, sdms.Cast<object>().Count());
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenSdmDoesNotExist()
    {
        // Act
        var result = await _controller.GetById(999);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetById_ReturnsSdm_WhenSdmExists()
    {
        // Arrange
        var sdm = new SdmEntity 
        { 
            UUID = "test-uuid", 
            Name = "Test SDM", 
            Status = "active",
            CreateDate = DateTime.UtcNow 
        };
        
        _context.Sdms.Add(sdm);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetById(sdm.Id);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

}

