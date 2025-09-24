using EscapeRoomPlanner.Application.Features.Routes.Commands;
using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using EscapeRoomPlanner.Application.Features.Routes.Mappers;
using EscapeRoomPlanner.Domain.Interfaces;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.Routes.Handlers;

public class OptimizeRouteHandler : IRequestHandler<OptimizeRouteCommand, OptimizedRouteDto>
{
    private readonly IRouteOptimizationService _routeOptimizationService;
    private readonly IEscapeRoomRepository _escapeRoomRepository;

    public OptimizeRouteHandler(IRouteOptimizationService routeOptimizationService, IEscapeRoomRepository escapeRoomRepository)
    {
        _routeOptimizationService = routeOptimizationService;
        _escapeRoomRepository = escapeRoomRepository;
    }

    public async Task<OptimizedRouteDto> Handle(OptimizeRouteCommand request, CancellationToken cancellationToken)
    {
        // Get escape rooms
        var escapeRooms = new List<Domain.Entities.EscapeRoom>();
        foreach (var id in request.EscapeRoomIds)
        {
            var escapeRoom = await _escapeRoomRepository.GetByIdAsync(id, cancellationToken);
            if (escapeRoom != null)
                escapeRooms.Add(escapeRoom);
        }

        if (escapeRooms.Count == 0)
            return new OptimizedRouteDto();

        // Map preferences
        var preferences = RouteMapper.ToRoutePreferences(request.Preferences);

        // Optimize route
        var optimizedRoute = await _routeOptimizationService.OptimizeRouteAsync(escapeRooms, preferences, cancellationToken);

        // Map to DTO
        return RouteMapper.ToOptimizedRouteDto(optimizedRoute);
    }
}