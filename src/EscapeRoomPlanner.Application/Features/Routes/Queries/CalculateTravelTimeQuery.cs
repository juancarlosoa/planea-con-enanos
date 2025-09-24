using EscapeRoomPlanner.Application.Features.Routes.Commands;
using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.Routes.Queries;

public class CalculateTravelTimeQuery : IRequest<TravelTimeDto>
{
    public CoordinatesDto From { get; set; } = new();
    public CoordinatesDto To { get; set; } = new();
    public string TransportMode { get; set; } = "Driving";
}

public class GetRouteSegmentQuery : IRequest<RouteSegmentDto>
{
    public CoordinatesDto From { get; set; } = new();
    public CoordinatesDto To { get; set; } = new();
    public string TransportMode { get; set; } = "Driving";
}

public class GetOptimalTransportModesQuery : IRequest<List<string>>
{
    public List<CoordinatesDto> Waypoints { get; set; } = new();
    public RoutePreferencesDto Preferences { get; set; } = new();
}