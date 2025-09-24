using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.Interfaces;
using EscapeRoomPlanner.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace EscapeRoomPlanner.Infrastructure.Services;

public class RouteOptimizationService : IRouteOptimizationService
{
    private readonly IGoogleMapsService _googleMapsService;
    private readonly ILogger<RouteOptimizationService> _logger;

    public RouteOptimizationService(IGoogleMapsService googleMapsService, ILogger<RouteOptimizationService> logger)
    {
        _googleMapsService = googleMapsService;
        _logger = logger;
    }

    public async Task<OptimizedRoute> OptimizeRouteAsync(List<EscapeRoom> escapeRooms, RoutePreferences preferences, CancellationToken cancellationToken = default)
    {
        if (escapeRooms.Count == 0)
            return new OptimizedRoute();

        if (escapeRooms.Count == 1)
            return CreateSingleRoomRoute(escapeRooms.First());

        try
        {
            var waypoints = escapeRooms.Select(er => er.Location).ToList();
            
            // Add start and end locations if specified
            if (preferences.StartLocation != null)
                waypoints.Insert(0, preferences.StartLocation);
            
            if (preferences.EndLocation != null && preferences.EndLocation != preferences.StartLocation)
                waypoints.Add(preferences.EndLocation);

            // Optimize waypoints using Google Maps
            var optimizedWaypoints = await _googleMapsService.OptimizeWaypointsAsync(waypoints, preferences.PreferredTransportMode, cancellationToken);
            
            // Map back to escape room IDs
            var optimizedEscapeRoomIds = MapWaypointsToEscapeRoomIds(optimizedWaypoints, escapeRooms, preferences);
            
            // Calculate route segments
            var segments = await CalculateRouteSegmentsAsync(optimizedWaypoints, preferences, cancellationToken);
            
            var totalTravelTime = segments.Sum(s => s.TravelTime.Ticks);
            var totalCost = segments.Sum(s => s.Cost);
            
            return new OptimizedRoute
            {
                EscapeRoomIds = optimizedEscapeRoomIds,
                TotalTravelTime = TimeSpan.FromTicks(totalTravelTime),
                TotalCost = totalCost,
                Segments = segments,
                OptimizationScore = CalculateOptimizationScore(segments, preferences)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error optimizing route for {Count} escape rooms", escapeRooms.Count);
            return CreateFallbackRoute(escapeRooms, preferences);
        }
    }

    public async Task<TimeSpan> CalculateTravelTimeAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default)
    {
        return await _googleMapsService.CalculateTravelTimeAsync(from, to, mode, cancellationToken);
    }

    public async Task<decimal> CalculateTravelCostAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default)
    {
        return await _googleMapsService.CalculateTravelCostAsync(from, to, mode, cancellationToken);
    }

    public async Task<RouteSegment> GetRouteSegmentAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default)
    {
        return await _googleMapsService.GetRouteSegmentAsync(from, to, mode, cancellationToken);
    }

    public async Task<RouteSegment> GetMultiModalRouteSegmentAsync(Coordinates from, Coordinates to, RoutePreferences preferences, CancellationToken cancellationToken = default)
    {
        if (preferences.Strategy == MultiModalStrategy.SingleMode)
        {
            return await GetRouteSegmentAsync(from, to, preferences.PreferredTransportMode, cancellationToken);
        }

        try
        {
            var bestSegment = await GetRouteSegmentAsync(from, to, preferences.PreferredTransportMode, cancellationToken);
            var bestScore = CalculateSegmentScore(bestSegment, preferences);

            // Try alternative transport modes
            foreach (var mode in preferences.AllowedTransportModes.Where(m => m != preferences.PreferredTransportMode))
            {
                var segment = await GetRouteSegmentAsync(from, to, mode, cancellationToken);
                var score = CalculateSegmentScore(segment, preferences);

                if (score > bestScore)
                {
                    bestSegment = segment;
                    bestScore = score;
                }
            }

            return bestSegment;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting multi-modal route segment from {From} to {To}", from, to);
            return await GetRouteSegmentAsync(from, to, preferences.PreferredTransportMode, cancellationToken);
        }
    }

    public async Task<List<TransportMode>> GetOptimalTransportModesAsync(List<Coordinates> waypoints, RoutePreferences preferences, CancellationToken cancellationToken = default)
    {
        var transportModes = new List<TransportMode>();

        for (int i = 0; i < waypoints.Count - 1; i++)
        {
            var from = waypoints[i];
            var to = waypoints[i + 1];

            var bestMode = preferences.PreferredTransportMode;
            var bestScore = 0.0;

            foreach (var mode in preferences.AllowedTransportModes)
            {
                try
                {
                    var segment = await GetRouteSegmentAsync(from, to, mode, cancellationToken);
                    var score = CalculateSegmentScore(segment, preferences);

                    if (score > bestScore)
                    {
                        bestMode = mode;
                        bestScore = score;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error calculating segment for mode {Mode} from {From} to {To}", mode, from, to);
                }
            }

            transportModes.Add(bestMode);
        }

        return transportModes;
    }

    private static OptimizedRoute CreateSingleRoomRoute(EscapeRoom escapeRoom)
    {
        return new OptimizedRoute
        {
            EscapeRoomIds = new List<Guid> { escapeRoom.Id },
            TotalTravelTime = TimeSpan.Zero,
            TotalCost = 0,
            Segments = new List<RouteSegment>(),
            OptimizationScore = 1.0
        };
    }

    private List<Guid> MapWaypointsToEscapeRoomIds(List<Coordinates> optimizedWaypoints, List<EscapeRoom> escapeRooms, RoutePreferences preferences)
    {
        var escapeRoomIds = new List<Guid>();
        var startOffset = preferences.StartLocation != null ? 1 : 0;
        var endOffset = preferences.EndLocation != null ? 1 : 0;
        
        var relevantWaypoints = optimizedWaypoints
            .Skip(startOffset)
            .Take(optimizedWaypoints.Count - startOffset - endOffset)
            .ToList();

        foreach (var waypoint in relevantWaypoints)
        {
            var escapeRoom = escapeRooms
                .OrderBy(er => CalculateDistance(er.Location, waypoint))
                .First();
            
            if (!escapeRoomIds.Contains(escapeRoom.Id))
                escapeRoomIds.Add(escapeRoom.Id);
        }

        return escapeRoomIds;
    }

    private async Task<List<RouteSegment>> CalculateRouteSegmentsAsync(List<Coordinates> waypoints, RoutePreferences preferences, CancellationToken cancellationToken)
    {
        var segments = new List<RouteSegment>();

        for (int i = 0; i < waypoints.Count - 1; i++)
        {
            var from = waypoints[i];
            var to = waypoints[i + 1];

            RouteSegment segment;
            if (preferences.Strategy == MultiModalStrategy.SingleMode)
            {
                segment = await GetRouteSegmentAsync(from, to, preferences.PreferredTransportMode, cancellationToken);
            }
            else
            {
                segment = await GetMultiModalRouteSegmentAsync(from, to, preferences, cancellationToken);
            }

            segments.Add(segment);
        }

        return segments;
    }

    private static double CalculateOptimizationScore(List<RouteSegment> segments, RoutePreferences preferences)
    {
        if (segments.Count == 0) return 1.0;

        var totalTime = segments.Sum(s => s.TravelTime.TotalMinutes);
        var totalCost = (double)segments.Sum(s => s.Cost);
        var totalDistance = segments.Sum(s => s.Distance);

        // Normalize scores (lower is better, so we invert)
        var timeScore = totalTime > 0 ? 1.0 / (1.0 + totalTime / 60.0) : 1.0; // Hours
        var costScore = totalCost > 0 ? 1.0 / (1.0 + totalCost / 50.0) : 1.0; // €50 reference
        var distanceScore = totalDistance > 0 ? 1.0 / (1.0 + totalDistance / 50.0) : 1.0; // 50km reference

        // Weight based on preferences
        var timeWeight = preferences.OptimizeForTime ? 0.5 : 0.3;
        var costWeight = preferences.OptimizeForCost ? 0.4 : 0.2;
        var distanceWeight = 0.5 - timeWeight - costWeight;

        return timeScore * timeWeight + costScore * costWeight + distanceScore * distanceWeight;
    }

    private static double CalculateSegmentScore(RouteSegment segment, RoutePreferences preferences)
    {
        var timeScore = segment.TravelTime.TotalMinutes > 0 ? 1.0 / (1.0 + segment.TravelTime.TotalMinutes / 30.0) : 1.0;
        var costScore = segment.Cost > 0 ? 1.0 / (1.0 + (double)segment.Cost / 10.0) : 1.0;
        var distanceScore = segment.Distance > 0 ? 1.0 / (1.0 + segment.Distance / 10.0) : 1.0;

        var timeWeight = preferences.OptimizeForTime ? 0.5 : 0.3;
        var costWeight = preferences.OptimizeForCost ? 0.4 : 0.2;
        var distanceWeight = 0.5 - timeWeight - costWeight;

        return timeScore * timeWeight + costScore * costWeight + distanceScore * distanceWeight;
    }

    private OptimizedRoute CreateFallbackRoute(List<EscapeRoom> escapeRooms, RoutePreferences preferences)
    {
        _logger.LogWarning("Creating fallback route for {Count} escape rooms", escapeRooms.Count);
        
        return new OptimizedRoute
        {
            EscapeRoomIds = escapeRooms.Select(er => er.Id).ToList(),
            TotalTravelTime = TimeSpan.FromMinutes(escapeRooms.Count * 15), // Estimate 15 min between each
            TotalCost = escapeRooms.Count * 5, // Estimate €5 between each
            Segments = new List<RouteSegment>(),
            OptimizationScore = 0.5
        };
    }

    private static double CalculateDistance(Coordinates from, Coordinates to)
    {
        const double R = 6371; // Earth's radius in km
        var dLat = ToRadians(to.Latitude - from.Latitude);
        var dLon = ToRadians(to.Longitude - from.Longitude);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(from.Latitude)) * Math.Cos(ToRadians(to.Latitude)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180;
}