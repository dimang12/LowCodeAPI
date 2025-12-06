using Asp.Versioning;
using LowcodeAPI.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using SdmEntity = LowcodeAPI.Domain.Entities.Sdm;

namespace LowcodeAPI.API.Controllers.Sdm;

[ApiVersion("1.0")]
[Route("api/[controller]")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
public class SdmController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SdmController> _logger;

    public SdmController(ApplicationDbContext context, ILogger<SdmController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/sdm
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SdmDto>>> GetAll()
    {
        var sdms = await _context.Sdms
            .OrderByDescending(s => s.CreateDate ?? s.UpdatedDate)
            .Select(s => new SdmDto
            {
                Id = s.Id,
                UUID = s.UUID,
                Name = s.Name,
                Status = s.Status,
                CreatedBy = s.CreatedBy,
                UpdatedDate = s.UpdatedDate,
                CreateDate = s.CreateDate
            })
            .ToListAsync();

        return Ok(sdms);
    }

    // GET: api/sdm/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<SdmDetailDto>> GetById(int id)
    {
        var sdm = await _context.Sdms.FirstOrDefaultAsync(s => s.Id == id);

        if (sdm == null)
        {
            return NotFound(new { error = $"SDM with id {id} not found" });
        }

        var diagramConfig = new DiagramConfig();
        if (sdm.Config != null)
        {
            try
            {
                diagramConfig = JsonSerializer.Deserialize<DiagramConfig>(sdm.Config.RootElement.GetRawText()) 
                    ?? new DiagramConfig();
            }
            catch
            {
                // If config is invalid, return empty arrays
            }
        }

        var dto = new SdmDetailDto
        {
            Id = sdm.Id,
            UUID = sdm.UUID,
            Name = sdm.Name,
            Status = sdm.Status,
            Elements = diagramConfig.Elements,
            Connections = diagramConfig.Connections
        };

        return Ok(dto);
    }

    // POST: api/sdm
    [HttpPost]
    public async Task<ActionResult<SdmDto>> Create([FromBody] CreateSdmDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { error = "Name is required" });
        }

        var sdm = new SdmEntity
        {
            UUID = Guid.NewGuid().ToString(),
            Name = dto.Name,
            Status = "active",
            CreatedBy = dto.CreatedBy,
            CreateDate = DateTime.UtcNow,
            Config = JsonDocument.Parse(JsonSerializer.Serialize(new DiagramConfig()))
        };

        _context.Sdms.Add(sdm);
        await _context.SaveChangesAsync();

        var result = new SdmDto
        {
            Id = sdm.Id,
            UUID = sdm.UUID,
            Name = sdm.Name,
            Status = sdm.Status,
            CreatedBy = sdm.CreatedBy,
            UpdatedDate = sdm.UpdatedDate,
            CreateDate = sdm.CreateDate
        };

        return CreatedAtAction(nameof(GetById), new { id = sdm.Id }, result);
    }

    // PUT: api/sdm/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSdmDto dto)
    {
        var sdm = await _context.Sdms.FindAsync(id);
        if (sdm == null)
        {
            return NotFound(new { error = $"SDM with id {id} not found" });
        }

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { error = "Name is required" });
        }

        sdm.Name = dto.Name;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/sdm/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var sdm = await _context.Sdms.FindAsync(id);
        if (sdm == null)
        {
            return NotFound(new { error = $"SDM with id {id} not found" });
        }

        _context.Sdms.Remove(sdm);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/sdm/{id}/elements
    [HttpPost("{id}/elements")]
    public async Task<IActionResult> SaveElement(int id, [FromBody] ElementDto dto)
    {
        var sdm = await _context.Sdms.FindAsync(id);
        if (sdm == null)
        {
            return NotFound(new { error = $"SDM with id {id} not found" });
        }

        // Get current config
        var diagramConfig = new DiagramConfig();
        if (sdm.Config != null)
        {
            try
            {
                diagramConfig = JsonSerializer.Deserialize<DiagramConfig>(sdm.Config.RootElement.GetRawText()) 
                    ?? new DiagramConfig();
            }
            catch { }
        }

        // Update or add element
        var existingElement = diagramConfig.Elements.FirstOrDefault(e => e.Id == dto.Id);
        if (existingElement != null)
        {
            existingElement.Type = dto.Type;
            existingElement.X = dto.X;
            existingElement.Y = dto.Y;
            existingElement.Width = dto.Width;
            existingElement.Height = dto.Height;
            existingElement.Label = dto.Label;
            existingElement.ExternalLabel = dto.ExternalLabel;
            existingElement.Description = dto.Description;
            existingElement.Condition = dto.Condition;
            existingElement.Config = dto.Config;
        }
        else
        {
            diagramConfig.Elements.Add(dto);
        }

        // Save updated config
        sdm.Config = JsonDocument.Parse(JsonSerializer.Serialize(diagramConfig));
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/sdm/{id}/connections
    [HttpPost("{id}/connections")]
    public async Task<IActionResult> SaveConnection(int id, [FromBody] ConnectionDto dto)
    {
        var sdm = await _context.Sdms.FindAsync(id);
        if (sdm == null)
        {
            return NotFound(new { error = $"SDM with id {id} not found" });
        }

        // Get current config
        var diagramConfig = new DiagramConfig();
        if (sdm.Config != null)
        {
            try
            {
                diagramConfig = JsonSerializer.Deserialize<DiagramConfig>(sdm.Config.RootElement.GetRawText()) 
                    ?? new DiagramConfig();
            }
            catch { }
        }

        // Add connection if it doesn't exist
        var existingConnection = diagramConfig.Connections
            .FirstOrDefault(c => c.From == dto.From && c.To == dto.To);
        
        if (existingConnection == null)
        {
            diagramConfig.Connections.Add(dto);
            sdm.Config = JsonDocument.Parse(JsonSerializer.Serialize(diagramConfig));
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }

    // PUT: api/sdm/{id}/state
    [HttpPut("{id}/state")]
    public async Task<IActionResult> SaveState(int id, [FromBody] SaveStateDto dto)
    {
        var sdm = await _context.Sdms.FindAsync(id);
        if (sdm == null)
        {
            return NotFound(new { error = $"SDM with id {id} not found" });
        }

        // Create new diagram config
        var diagramConfig = new DiagramConfig
        {
            Elements = dto.Elements,
            Connections = dto.Connections
        };

        // Save as JSON
        sdm.Config = JsonDocument.Parse(JsonSerializer.Serialize(diagramConfig));
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
