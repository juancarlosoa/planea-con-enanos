using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.ValueObjects;

namespace EscapeRoomPlanner.Domain.Interfaces;

public interface IGoogleMapsService
{
    Task<TimeSpan> CalculateTravelTimeAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default);
    Task<decimal> CalculateTravelCostAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default);
    Task<RouteSegment> GetRouteSegmentAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default);
    Task<List<Coordinates>> OptimizeWaypointsAsync(List<Coordinates> waypoints, TransportMode mode, CancellationToken cancellationToken = default);
}