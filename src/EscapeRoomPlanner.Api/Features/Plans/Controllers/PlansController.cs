using MediatR;
using Microsoft.AspNetCore.Mvc;
using EscapeRoomPlanner.Application.Features.Plans.Commands;
using EscapeRoomPlanner.Application.Features.Plans.Queries;
using EscapeRoomPlanner.Application.Features.Plans.DTOs;
using EscapeRoomPlanner.Application.Features.Routes.DTOs;

namespace EscapeRoomPlanner.Api.Features.Plans.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlansController : ControllerBase
{
    private readonly IMediator _mediator;

    public PlansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<PlanDto>>> GetPlans()
    {
        var query = new GetAllPlansQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlanDto>> GetPlan(Guid id)
    {
        var query = new GetPlanByIdQuery(id);
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PlanDto>> CreatePlan(CreatePlanDto dto)
    {
        var command = new CreatePlanCommand(dto.Name, dto.Description, dto.StartDate, dto.EndDate, dto.CreatedBy);
        var result = await _mediator.Send(command);
        
        return CreatedAtAction(nameof(GetPlan), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PlanDto>> UpdatePlan(Guid id, UpdatePlanDto dto)
    {
        var command = new UpdatePlanCommand(id, dto.Name, dto.Description);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPut("{id}/date-range")]
    public async Task<ActionResult<PlanDto>> UpdatePlanDateRange(Guid id, UpdatePlanDateRangeDto dto)
    {
        var command = new UpdatePlanDateRangeCommand(id, dto.StartDate, dto.EndDate);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePlan(Guid id)
    {
        var command = new DeletePlanCommand(id);
        var result = await _mediator.Send(command);
        
        if (!result)
            return NotFound();
            
        return NoContent();
    }

    [HttpPost("{id}/activate")]
    public async Task<ActionResult<PlanDto>> ActivatePlan(Guid id)
    {
        var command = new ActivatePlanCommand(id);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost("{id}/complete")]
    public async Task<ActionResult<PlanDto>> CompletePlan(Guid id)
    {
        var command = new CompletePlanCommand(id);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<PlanDto>> CancelPlan(Guid id)
    {
        var command = new CancelPlanCommand(id);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    // Daily Route endpoints
    [HttpGet("{id}/daily-routes/{date}")]
    public async Task<ActionResult<DailyRouteDto>> GetDailyRoute(Guid id, DateOnly date)
    {
        var query = new GetDailyRouteQuery(id, date);
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost("{id}/daily-routes/{date}/stops")]
    public async Task<ActionResult<DailyRouteDto>> AddStopToDay(Guid id, DateOnly date, AddStopToDayDto dto)
    {
        var command = new AddStopToDayCommand(id, date, dto.EscapeRoomId);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpDelete("{id}/daily-routes/{date}/stops/{escapeRoomId}")]
    public async Task<ActionResult<DailyRouteDto>> RemoveStopFromDay(Guid id, DateOnly date, Guid escapeRoomId)
    {
        var command = new RemoveStopFromDayCommand(id, date, escapeRoomId);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost("{id}/daily-routes/{date}/stops/{escapeRoomId}/move")]
    public async Task<ActionResult<MoveStopBetweenDaysResultDto>> MoveStopBetweenDays(
        Guid id, 
        DateOnly date, 
        Guid escapeRoomId, 
        MoveStopBetweenDaysDto dto)
    {
        var command = new MoveStopBetweenDaysCommand(id, date, escapeRoomId, dto.TargetDate);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPut("{id}/daily-routes/{date}/stops/reorder")]
    public async Task<ActionResult<DailyRouteDto>> ReorderStopsInDay(Guid id, DateOnly date, ReorderStopsInDayDto dto)
    {
        var command = new ReorderStopsInDayCommand(id, date, dto.EscapeRoomIds);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPut("{id}/daily-routes/{date}/transport")]
    public async Task<ActionResult<DailyRouteDto>> UpdateDailyRouteTransport(
        Guid id, 
        DateOnly date, 
        UpdateDailyRouteTransportDto dto)
    {
        var command = new UpdateDailyRouteTransportCommand(id, date, dto.PreferredTransportMode, dto.MultiModalStrategy);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    // Route optimization
    [HttpPost("{id}/daily-routes/{date}/optimize")]
    public async Task<ActionResult<DailyRouteDto>> OptimizeDailyRoute(Guid id, DateOnly date)
    {
        var command = new OptimizeDailyRouteCommand(id, date);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost("{id}/optimize-all")]
    public async Task<ActionResult<PlanDto>> OptimizeAllRoutes(Guid id)
    {
        var command = new OptimizeAllRoutesCommand(id);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    // Sharing and export
    [HttpPost("{id}/share")]
    public async Task<ActionResult<GeneratePublicLinkResultDto>> GeneratePublicLink(Guid id)
    {
        var command = new GeneratePublicLinkCommand(id);
        var result = await _mediator.Send(command);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpGet("{id}/export/pdf")]
    public async Task<ActionResult> ExportToPdf(Guid id)
    {
        var query = new ExportPlanToPdfQuery(id);
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();
            
        return File(result.Content, "application/pdf", result.FileName);
    }

    [HttpGet("{id}/export/json")]
    public async Task<ActionResult<PlanDto>> ExportToJson(Guid id)
    {
        var query = new GetPlanByIdQuery(id);
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }
}

// Additional DTOs for specific endpoints
public record AddStopToDayDto(Guid EscapeRoomId);
public record MoveStopBetweenDaysDto(DateOnly TargetDate);
public record ReorderStopsInDayDto(List<Guid> EscapeRoomIds);
public record UpdateDailyRouteTransportDto(string PreferredTransportMode, string MultiModalStrategy);
public record MoveStopBetweenDaysResultDto(DailyRouteDto FromRoute, DailyRouteDto ToRoute);
public record GeneratePublicLinkResultDto(string PublicUrl, DateTime ExpiresAt);