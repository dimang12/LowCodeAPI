using Asp.Versioning;
using LowcodeAPI.Domain.Entities;
using LowcodeAPI.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LowcodeAPI.API.Controllers;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
public class AppPackagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AppPackagesController> _logger;

    public AppPackagesController(ApplicationDbContext context, ILogger<AppPackagesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppPackageDto>>> GetAppPackages()
    {
        var appPackages = await _context.AppPackages
            .OrderByDescending(a => a.CreateTime)
            .ToListAsync();

        var dtos = appPackages.Select(a => new AppPackageDto
        {
            Id = a.Id,
            AppCredential = a.AppCredential,
            Uuid = a.Uuid,
            AppName = a.AppName,
            Version = a.Version,
            AppDesc = a.AppDesc,
            PageLayout = a.PageLayout,
            CreateTime = a.CreateTime,
            ViewTime = a.ViewTime,
            CreateMethod = a.CreateMethod,
            CreateSource = a.CreateSource,
            CreateBy = a.CreateBy,
            Thumnail = a.Thumnail,
            DeployMeta = a.DeployMeta,
            AppVersion = a.AppVersion,
            ExportSetting = a.ExportSetting?.RootElement.GetRawText(),
            DeploySetting = a.DeploySetting?.RootElement.GetRawText(),
            App_Settings = a.App_Settings?.RootElement.GetRawText(),
            Role = a.Role?.RootElement.GetRawText(),
            Maintenance_Status = a.Maintenance_Status,
            Maintenance_Title = a.Maintenance_Title,
            Maintenance_Message = a.Maintenance_Message
        });

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AppPackageDto>> GetAppPackage(int id)
    {
        var appPackage = await _context.AppPackages.FindAsync(id);

        if (appPackage == null)
        {
            return NotFound();
        }

        var dto = new AppPackageDto
        {
            Id = appPackage.Id,
            AppCredential = appPackage.AppCredential,
            Uuid = appPackage.Uuid,
            AppName = appPackage.AppName,
            Version = appPackage.Version,
            AppDesc = appPackage.AppDesc,
            PageLayout = appPackage.PageLayout,
            CreateTime = appPackage.CreateTime,
            ViewTime = appPackage.ViewTime,
            CreateMethod = appPackage.CreateMethod,
            CreateSource = appPackage.CreateSource,
            CreateBy = appPackage.CreateBy,
            Thumnail = appPackage.Thumnail,
            DeployMeta = appPackage.DeployMeta,
            AppVersion = appPackage.AppVersion,
            ExportSetting = appPackage.ExportSetting?.RootElement.GetRawText(),
            DeploySetting = appPackage.DeploySetting?.RootElement.GetRawText(),
            App_Settings = appPackage.App_Settings?.RootElement.GetRawText(),
            Role = appPackage.Role?.RootElement.GetRawText(),
            Maintenance_Status = appPackage.Maintenance_Status,
            Maintenance_Title = appPackage.Maintenance_Title,
            Maintenance_Message = appPackage.Maintenance_Message
        };

        return Ok(dto);
    }
}

public class AppPackageDto
{
    public int Id { get; set; }
    public string AppCredential { get; set; } = string.Empty;
    public string Uuid { get; set; } = string.Empty;
    public string AppName { get; set; }
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
    public string? ExportSetting { get; set; }
    public string? DeploySetting { get; set; }
    public string? App_Settings { get; set; }
    public string? Role { get; set; }
    public int Maintenance_Status { get; set; }
    public string? Maintenance_Title { get; set; }
    public string? Maintenance_Message { get; set; }
}

