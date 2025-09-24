using EscapeRoomPlanner.Application.Features.EscapeRooms.Commands;
using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using EscapeRoomPlanner.Application.Features.EscapeRooms.Queries;
using EscapeRoomPlanner.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EscapeRoomPlanner.Api.Features.EscapeRooms.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EscapeRoomsController : ControllerBase
{
    private readonly IMediator _mediator;

    public EscapeRoomsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all active escape rooms
    /// </summary>
    /// <returns>List of escape rooms</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<EscapeRoomDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<EscapeRoomDto>>> GetAllEscapeRooms(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAllEscapeRoomsQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get escape room by ID
    /// </summary>
    /// <param name="id">Escape room ID</param>
    /// <returns>Escape room details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(EscapeRoomDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EscapeRoomDto>> GetEscapeRoomById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetEscapeRoomByIdQuery(id), cancellationToken);
        
        if (result == null)
        {
            return NotFound($"Escape room with ID {id} not found");
        }

        return Ok(result);
    }

    /// <summary>
    /// Search escape rooms with filters
    /// </summary>
    /// <param name="name">Filter by name (partial match)</param>
    /// <param name="city">Filter by city (partial match)</param>
    /// <param name="difficulty">Filter by difficulty level</param>
    /// <param name="latitude">Location latitude for proximity search</param>
    /// <param name="longitude">Location longitude for proximity search</param>
    /// <param name="radiusKm">Search radius in kilometers</param>
    /// <param name="minPrice">Minimum price filter</param>
    /// <param name="maxPrice">Maximum price filter</param>
    /// <param name="maxDuration">Maximum duration filter (in minutes)</param>
    /// <param name="minRating">Minimum rating filter</param>
    /// <returns>Filtered list of escape rooms</returns>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<EscapeRoomDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<EscapeRoomDto>>> SearchEscapeRooms(
        [FromQuery] string? name = null,
        [FromQuery] string? city = null,
        [FromQuery] string? difficulty = null,
        [FromQuery] double? latitude = null,
        [FromQuery] double? longitude = null,
        [FromQuery] double? radiusKm = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] int? maxDurationMinutes = null,
        [FromQuery] double? minRating = null,
        CancellationToken cancellationToken = default)
    {
        var filters = new EscapeRoomSearchFilters
        {
            Name = name,
            City = city,
            Difficulty = !string.IsNullOrEmpty(difficulty) ? Enum.Parse<Domain.Enums.DifficultyLevel>(difficulty, true) : null,
            Location = latitude.HasValue && longitude.HasValue ? new Domain.ValueObjects.Coordinates(latitude.Value, longitude.Value) : null,
            RadiusKm = radiusKm,
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            MaxDuration = maxDurationMinutes.HasValue ? TimeSpan.FromMinutes(maxDurationMinutes.Value) : null,
            MinRating = minRating,
            IsActive = true
        };

        var result = await _mediator.Send(new SearchEscapeRoomsQuery(filters), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Create a new escape room
    /// </summary>
    /// <param name="createDto">Escape room creation data</param>
    /// <returns>Created escape room</returns>
    [HttpPost]
    [ProducesResponseType(typeof(EscapeRoomDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EscapeRoomDto>> CreateEscapeRoom(
        [FromBody] CreateEscapeRoomDto createDto, 
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateEscapeRoomCommand(createDto), cancellationToken);
        return CreatedAtAction(nameof(GetEscapeRoomById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update an existing escape room
    /// </summary>
    /// <param name="id">Escape room ID</param>
    /// <param name="updateDto">Escape room update data</param>
    /// <returns>Updated escape room</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(EscapeRoomDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EscapeRoomDto>> UpdateEscapeRoom(
        Guid id, 
        [FromBody] UpdateEscapeRoomDto updateDto, 
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _mediator.Send(new UpdateEscapeRoomCommand(id, updateDto), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Escape room with ID {id} not found");
        }
    }

    /// <summary>
    /// Delete an escape room
    /// </summary>
    /// <param name="id">Escape room ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteEscapeRoom(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteEscapeRoomCommand(id), cancellationToken);
        
        if (!result)
        {
            return NotFound($"Escape room with ID {id} not found");
        }

        return NoContent();
    }
}