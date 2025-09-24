using EscapeRoomPlanner.Application.Features.Routes.Commands;
using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using EscapeRoomPlanner.Application.Features.Routes.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EscapeRoomPlanner.Api.Features.Routes.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoutesController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoutesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Optimizes a route for the given escape rooms
    /// </summary>
    [HttpPost("optimize")]
    public async Task<ActionResult<OptimizedRouteDto>> OptimizeRoute([FromBody] OptimizeRouteCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Calculates travel time between two coordinates
    /// </summary>
    [HttpPost("travel-time")]
    public async Task<ActionResult<TravelTimeDto>> CalculateTravelTime([FromBody] CalculateTravelTimeQuery query, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets a detailed route segment between two coordinates
    /// </summary>
    [HttpPost("route-segment")]
    public async Task<ActionResult<RouteSegmentDto>> GetRouteSegment([FromBody] GetRouteSegmentQuery query, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets optimal transport modes for a multi-waypoint route
    /// </summary>
    [HttpPost("optimal-transport-modes")]
    public async Task<ActionResult<List<string>>> GetOptimalTransportModes([FromBody] GetOptimalTransportModesQuery query, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }
}