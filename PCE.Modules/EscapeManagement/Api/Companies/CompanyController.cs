using MediatR;
using Microsoft.AspNetCore.Mvc;
using PCE.Modules.EscapeManagement.Application.Companies.Create;
using PCE.Modules.EscapeManagement.Application.Companies.Delete;
using PCE.Modules.EscapeManagement.Application.Companies.GetAll;
using PCE.Modules.EscapeManagement.Application.Companies.GetBySlug;
using PCE.Modules.EscapeManagement.Application.Companies.GetEscapeRooms;
using PCE.Modules.EscapeManagement.Application.Companies.Update;

namespace PCE.Modules.EscapeManagement.Api.Companies;

[ApiController]
[Route("api/companies")]
public class CompaniesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CompaniesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetCompanyBySlugQuery(slug), ct);

        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllCompaniesQuery(), ct);

        return result.IsSuccess
            ? Ok(result.Value)
            : StatusCode(500, new { error = result.Error });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCompanyCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpPut("{slug}")]
    public async Task<IActionResult> Update(string slug, [FromBody] UpdateCompanyCommand command, CancellationToken ct)
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
        var result = await _mediator.Send(new DeleteCompanyCommand(slug), ct);

        return result.IsSuccess
            ? NoContent()
            : BadRequest(new { error = result.Error });
    }

    [HttpGet("{slug}/rooms")]
    public async Task<IActionResult> GetEscapeRoomsByCompany(string slug, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetEscapeRoomsByCompanyQuery(slug), ct);

        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }
}