using MediatR;
using Microsoft.AspNetCore.Mvc;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.Create;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.Delete;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.GetAll;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.GetBySlug;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.Update;

namespace PCE.Modules.EscapeManagement.Api.EscapeRooms;

[ApiController]
[Route("api/escaperooms")]
public class EscapeRoomController : ControllerBase
{
    private readonly IMediator _mediator;

    public EscapeRoomController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllEscapeRoomsQuery(), ct);

        return result.IsSuccess
            ? Ok(result.Value)
            : StatusCode(500, new { error = result.Error });
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetEscapeRoomBySlugQuery(slug), cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEscapeRoomCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpPut("{slug}")]
    public async Task<IActionResult> Update(string slug, [FromBody] UpdateEscapeRoomCommand command, CancellationToken ct)
    {
        if (slug != command.Slug)
        {
            return BadRequest(new { error = "Slug mismatch" });
        }

        var result = await _mediator.Send(command, ct);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpDelete("{slug}")]
    public async Task<IActionResult> Delete(string slug, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteEscapeRoomCommand(slug), ct);

        return result.IsSuccess
            ? NoContent()
            : BadRequest(new { error = result.Error });
    }
}