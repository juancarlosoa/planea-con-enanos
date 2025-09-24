namespace EscapeRoomPlanner.Application.Features.Routes.DTOs;

public class OptimizedRouteDto
{
    public List<Guid> EscapeRoomIds { get; set; } = new();
    public int TotalTravelTimeMinutes { get; set; }
    public decimal TotalCost { get; set; }
    public List<RouteSegmentDto> Segments { get; set; } = new();
    public double OptimizationScore { get; set; }
}

public class RouteSegmentDto
{
    public CoordinatesDto From { get; set; } = new();
    public CoordinatesDto To { get; set; } = new();
    public int TravelTimeMinutes { get; set; }
    public decimal Cost { get; set; }
    public double Distance { get; set; }
    public string Mode { get; set; } = string.Empty;
    public List<CoordinatesDto> RoutePoints { get; set; } = new();
    public string? Instructions { get; set; }
    public List<TransportLegDto> Legs { get; set; } = new();
}

public class TransportLegDto
{
    public CoordinatesDto From { get; set; } = new();
    public CoordinatesDto To { get; set; } = new();
    public string Mode { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal Cost { get; set; }
    public double Distance { get; set; }
    public string? Instructions { get; set; }
    public List<CoordinatesDto> Path { get; set; } = new();
}

public class TravelTimeDto
{
    public int TravelTimeMinutes { get; set; }
    public decimal EstimatedCost { get; set; }
    public double Distance { get; set; }
}

public class CoordinatesDto
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
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