using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.Routes.Commands;

public class OptimizeRouteCommand : IRequest<OptimizedRouteDto>
{
    public List<Guid> EscapeRoomIds { get; set; } = new();
    public RoutePreferencesDto Preferences { get; set; } = new();
}



