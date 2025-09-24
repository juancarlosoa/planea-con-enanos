namespace EscapeRoomPlanner.Application.Features.Routes.DTOs;

public record DailyRouteDto
{
    public Guid Id { get; init; }
    public DateOnly Date { get; init; }
    public Guid PlanId { get; init; }
    public TimeSpan EstimatedTotalTime { get; init; }
    public decimal EstimatedCost { get; init; }
    public string PreferredTransportMode { get; init; } = string.Empty;
    public string MultiModalStrategy { get; init; } = string.Empty;
    public List<RouteStopDto> Stops { get; init; } = new();
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record CreateDailyRouteDto
{
    public DateOnly Date { get; init; }
    public Guid PlanId { get; init; }
    public string PreferredTransportMode { get; init; } = "Driving";
    public string MultiModalStrategy { get; init; } = "SingleMode";
}

public record UpdateDailyRouteTransportDto
{
    public string PreferredTransportMode { get; init; } = string.Empty;
    public string MultiModalStrategy { get; init; } = string.Empty;
}

public record RouteStopDto
{
    public Guid Id { get; init; }
    public Guid EscapeRoomId { get; init; }
    public Guid DailyRouteId { get; init; }
    public int Order { get; init; }
    public TimeSpan EstimatedArrivalTime { get; init; }
    public TimeSpan EstimatedTravelTime { get; init; }
    public string? Notes { get; init; }
    public string? TransportModeToNext { get; init; }
    public bool IsMultiModalSegment { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record CreateRouteStopDto
{
    public Guid EscapeRoomId { get; init; }
    public int Order { get; init; }
    public Guid DailyRouteId { get; init; }
}

public record UpdateRouteStopTimesDto
{
    public TimeSpan EstimatedArrivalTime { get; init; }
    public TimeSpan EstimatedTravelTime { get; init; }
}

public record UpdateRouteStopNotesDto
{
    public string? Notes { get; init; }
}

public record UpdateRouteStopTransportDto
{
    public string? TransportModeToNext { get; init; }
    public bool IsMultiModalSegment { get; init; }
}