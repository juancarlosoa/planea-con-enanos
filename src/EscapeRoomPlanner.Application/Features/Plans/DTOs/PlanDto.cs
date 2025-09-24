using EscapeRoomPlanner.Application.Features.Routes.DTOs;

namespace EscapeRoomPlanner.Application.Features.Plans.DTOs;

public record PlanDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public Guid CreatedBy { get; init; }
    public string Status { get; init; } = string.Empty;
    public List<DailyRouteDto> DailyRoutes { get; init; } = new();
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record CreatePlanDto
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public Guid CreatedBy { get; init; }
}

public record UpdatePlanDto
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}

public record UpdatePlanDateRangeDto
{
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
}