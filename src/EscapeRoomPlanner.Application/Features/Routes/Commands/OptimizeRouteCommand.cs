using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.Routes.Commands;

public class OptimizeRouteCommand : IRequest<OptimizedRouteDto>
{
    public List<Guid> EscapeRoomIds { get; set; } = new();
    public RoutePreferencesDto Preferences { get; set; } = new();
}

public class RoutePreferencesDto
{
    public List<string> AllowedTransportModes { get; set; } = new() { "Driving" };
    public string PreferredTransportMode { get; set; } = "Driving";
    public string Strategy { get; set; } = "SingleMode";
    public int? MaxTotalTimeMinutes { get; set; }
    public decimal? MaxBudget { get; set; }
    public bool OptimizeForTime { get; set; } = true;
    public bool OptimizeForCost { get; set; } = false;
    public CoordinatesDto? StartLocation { get; set; }
    public CoordinatesDto? EndLocation { get; set; }
    public MultiModalPreferencesDto? MultiModalSettings { get; set; }
}

public class MultiModalPreferencesDto
{
    public double MaxWalkingDistanceKm { get; set; } = 1.0;
    public double MaxCyclingDistanceKm { get; set; } = 5.0;
    public bool PreferParkAndWalk { get; set; } = false;
    public bool AllowPublicTransportTransfers { get; set; } = true;
    public int MaxTransfers { get; set; } = 2;
    public int MaxTransferWaitTimeMinutes { get; set; } = 15;
}

public class CoordinatesDto
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}