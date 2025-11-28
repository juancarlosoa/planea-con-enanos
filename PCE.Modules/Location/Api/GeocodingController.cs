using MediatR;
using Microsoft.AspNetCore.Mvc;
using PCE.Modules.Location.Application.SearchLocation;

namespace PCE.Modules.Location.Api;

[ApiController]
[Route("api/location")]
public class LocationController : ControllerBase
{
    private readonly IMediator _mediator;

    public LocationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchLocation([FromQuery] SearchLocationQuery query, CancellationToken ct)
    {
        var result = await _mediator.Send(query, ct);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error });
        }

        return Ok(result.Value);
    }
}

