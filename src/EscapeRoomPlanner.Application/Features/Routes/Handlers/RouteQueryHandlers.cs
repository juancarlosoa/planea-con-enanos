using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using EscapeRoomPlanner.Application.Features.Routes.Mappers;
using EscapeRoomPlanner.Application.Features.Routes.Queries;
using EscapeRoomPlanner.Domain.Interfaces;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.Routes.Handlers;

public class CalculateTravelTimeHandler : IRequestHandler<CalculateTravelTimeQuery, TravelTimeDto>
{
    private readonly IRouteOptimizationService _routeOptimizationService;

    public CalculateTravelTimeHandler(IRouteOptimizationService routeOptimizationService)
    {
        _routeOptimizationService = routeOptimizationService;
    }

    public async Task<TravelTimeDto> Handle(CalculateTravelTimeQuery request, CancellationToken cancellationToken)
    {
        var from = RouteMapper.ToCoordinates(request.From);
        var to = RouteMapper.ToCoordinates(request.To);
        var mode = RouteMapper.ToTransportMode(request.TransportMode);

        var travelTime = await _routeOptimizationService.CalculateTravelTimeAsync(from, to, mode, cancellationToken);
        var cost = await _routeOptimizationService.CalculateTravelCostAsync(from, to, mode, cancellationToken);

        return new TravelTimeDto
        {
            TravelTimeMinutes = (int)travelTime.TotalMinutes,
            EstimatedCost = cost,
            Distance = CalculateHaversineDistance(from, to)
        };
    }

    private static double CalculateHaversineDistance(Domain.ValueObjects.Coordinates from, Domain.ValueObjects.Coordinates to)
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

public class GetRouteSegmentHandler : IRequestHandler<GetRouteSegmentQuery, RouteSegmentDto>
{
    private readonly IRouteOptimizationService _routeOptimizationService;

    public GetRouteSegmentHandler(IRouteOptimizationService routeOptimizationService)
    {
        _routeOptimizationService = routeOptimizationService;
    }

    public async Task<RouteSegmentDto> Handle(GetRouteSegmentQuery request, CancellationToken cancellationToken)
    {
        var from = RouteMapper.ToCoordinates(request.From);
        var to = RouteMapper.ToCoordinates(request.To);
        var mode = RouteMapper.ToTransportMode(request.TransportMode);

        var segment = await _routeOptimizationService.GetRouteSegmentAsync(from, to, mode, cancellationToken);

        return RouteMapper.ToRouteSegmentDto(segment);
    }
}

public class GetOptimalTransportModesHandler : IRequestHandler<GetOptimalTransportModesQuery, List<string>>
{
    private readonly IRouteOptimizationService _routeOptimizationService;

    public GetOptimalTransportModesHandler(IRouteOptimizationService routeOptimizationService)
    {
        _routeOptimizationService = routeOptimizationService;
    }

    public async Task<List<string>> Handle(GetOptimalTransportModesQuery request, CancellationToken cancellationToken)
    {
        var waypoints = request.Waypoints.Select(RouteMapper.ToCoordinates).ToList();
        var preferences = RouteMapper.ToRoutePreferences(request.Preferences);

        var transportModes = await _routeOptimizationService.GetOptimalTransportModesAsync(waypoints, preferences, cancellationToken);

        return transportModes.Select(mode => mode.ToString()).ToList();
    }
}