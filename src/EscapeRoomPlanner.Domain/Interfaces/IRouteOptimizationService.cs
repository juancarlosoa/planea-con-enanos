using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.ValueObjects;

namespace EscapeRoomPlanner.Domain.Interfaces;

public interface IRouteOptimizationService
{
    Task<OptimizedRoute> OptimizeRouteAsync(List<EscapeRoom> escapeRooms, RoutePreferences preferences, CancellationToken cancellationToken = default);
    Task<TimeSpan> CalculateTravelTimeAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default);
    Task<decimal> CalculateTravelCostAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default);
    Task<RouteSegment> GetRouteSegmentAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default);
    Task<RouteSegment> GetMultiModalRouteSegmentAsync(Coordinates from, Coordinates to, RoutePreferences preferences, CancellationToken cancellationToken = default);
    Task<List<TransportMode>> GetOptimalTransportModesAsync(List<Coordinates> waypoints, RoutePreferences preferences, CancellationToken cancellationToken = default);
}

public class RoutePreferences
{
    public List<TransportMode> AllowedTransportModes { get; set; } = new() { TransportMode.Driving };
    public TransportMode PreferredTransportMode { get; set; } = TransportMode.Driving;
    public MultiModalStrategy Strategy { get; set; } = MultiModalStrategy.SingleMode;
    public TimeSpan? MaxTotalTime { get; set; }
    public decimal? MaxBudget { get; set; }
    public bool OptimizeForTime { get; set; } = true;
    public bool OptimizeForCost { get; set; } = false;
    public Coordinates? StartLocation { get; set; }
    public Coordinates? EndLocation { get; set; }
    public MultiModalPreferences? MultiModalSettings { get; set; }
}

public class MultiModalPreferences
{
    public double MaxWalkingDistanceKm { get; set; } = 1.0; // Máxima distancia caminando
    public double MaxCyclingDistanceKm { get; set; } = 5.0; // Máxima distancia en bici
    public bool PreferParkAndWalk { get; set; } = false; // Preferir aparcar y caminar en centros
    public bool AllowPublicTransportTransfers { get; set; } = true;
    public int MaxTransfers { get; set; } = 2; // Máximo número de transbordos
    public TimeSpan MaxTransferWaitTime { get; set; } = TimeSpan.FromMinutes(15);
}

public class OptimizedRoute
{
    public List<Guid> EscapeRoomIds { get; set; } = new();
    public TimeSpan TotalTravelTime { get; set; }
    public decimal TotalCost { get; set; }
    public List<RouteSegment> Segments { get; set; } = new();
    public double OptimizationScore { get; set; }
}

public class RouteSegment
{
    public Coordinates From { get; set; } = null!;
    public Coordinates To { get; set; } = null!;
    public TimeSpan TravelTime { get; set; }
    public decimal Cost { get; set; }
    public double Distance { get; set; }
    public TransportMode Mode { get; set; }
    public List<Coordinates> RoutePoints { get; set; } = new();
    public string? Instructions { get; set; }
    public List<TransportLeg> Legs { get; set; } = new(); // Para rutas multimodales
}

public class TransportLeg
{
    public Coordinates From { get; set; } = null!;
    public Coordinates To { get; set; } = null!;
    public TransportMode Mode { get; set; }
    public TimeSpan Duration { get; set; }
    public decimal Cost { get; set; }
    public double Distance { get; set; }
    public string? Instructions { get; set; }
    public List<Coordinates> Path { get; set; } = new();
}