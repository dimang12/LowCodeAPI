using Asp.Versioning;
using LowcodeAPI.Application.Sdm;
using LowcodeAPI.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace LowcodeAPI.API.Controllers.Sdm;

[ApiVersion("1.0")]
[Route("api/[controller]")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
public class SdmExecuteController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SdmExecuteController> _logger;
    private readonly ISdmExecutor _executor;

    public SdmExecuteController(
        ApplicationDbContext context, 
        ILogger<SdmExecuteController> logger,
        ISdmExecutor executor)
    {
        _context = context;
        _logger = logger;
        _executor = executor;
    }

    // POST: api/sdmexecute/run/{sdmId}
    [HttpPost("run/{sdmId}")]
    public async Task<ActionResult<ExecutionResultDto>> RunFromStart(int sdmId)
    {
        try
        {
            var sdm = await _context.Sdms.FindAsync(sdmId);
            if (sdm == null)
            {
                return NotFound(new { error = $"SDM with id {sdmId} not found" });
            }

            if (sdm.Config == null)
            {
                return BadRequest(new { error = "SDM configuration is empty" });
            }

            var config = JsonSerializer.Deserialize<DiagramConfig>(sdm.Config.RootElement.GetRawText());
            if (config == null || config.Elements.Count == 0)
            {
                return BadRequest(new { error = "SDM has no elements to execute" });
            }

            var result = await _executor.ExecuteAsync(config, null);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing SDM {SdmId}", sdmId);
            return StatusCode(500, new { error = "Execution failed", message = ex.Message });
        }
    }

    // POST: api/sdmexecute/run/{sdmId}/from/{nodeId}
    [HttpPost("run/{sdmId}/from/{nodeId}")]
    public async Task<ActionResult<ExecutionResultDto>> RunFromNode(int sdmId, string nodeId)
    {
        try
        {
            var sdm = await _context.Sdms.FindAsync(sdmId);
            if (sdm == null)
            {
                return NotFound(new { error = $"SDM with id {sdmId} not found" });
            }

            if (sdm.Config == null)
            {
                return BadRequest(new { error = "SDM configuration is empty" });
            }

            var config = JsonSerializer.Deserialize<DiagramConfig>(sdm.Config.RootElement.GetRawText());
            if (config == null || config.Elements.Count == 0)
            {
                return BadRequest(new { error = "SDM has no elements to execute" });
            }

            // Validate node exists
            if (!double.TryParse(nodeId, out var parsedNodeId))
            {
                return BadRequest(new { error = $"Invalid node ID format: {nodeId}" });
            }
            
            var startNode = config.Elements.FirstOrDefault(e => e.Id == parsedNodeId);
            if (startNode == null)
            {
                return NotFound(new { error = $"Node {nodeId} not found in SDM" });
            }

            var result = await _executor.ExecuteAsync(config, nodeId);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing SDM {SdmId} from node {NodeId}", sdmId, nodeId);
            return StatusCode(500, new { error = "Execution failed", message = ex.Message });
        }
    }
}
