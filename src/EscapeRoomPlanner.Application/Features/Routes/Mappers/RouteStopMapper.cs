using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using Riok.Mapperly.Abstractions;

namespace EscapeRoomPlanner.Application.Features.Routes.Mappers;

[Mapper]
public static partial class RouteStopMapper
{
    // Entity to DTO mappings
    public static partial RouteStopDto ToDto(RouteStop routeStop);
    public static partial List<RouteStopDto> ToDto(List<RouteStop> routeStops);
    public static partial IEnumerable<RouteStopDto> ToDto(IEnumerable<RouteStop> routeStops);

    // DTO to Entity mappings
    public static RouteStop ToEntity(CreateRouteStopDto dto)
    {
        return new RouteStop(
            dto.EscapeRoomId,
            dto.Order,
            dto.DailyRouteId
        );
    }

    // Custom enum mappings for nullable TransportMode
    [MapProperty(nameof(RouteStop.TransportModeToNext), nameof(RouteStopDto.TransportModeToNext))]
    private static string? MapTransportModeToString(TransportMode? transportMode) => 
        transportMode?.ToString();

    [MapProperty(nameof(UpdateRouteStopTransportDto.TransportModeToNext), nameof(RouteStop.TransportModeToNext))]
    private static TransportMode? MapStringToTransportMode(string? transportMode) => 
        string.IsNullOrEmpty(transportMode) ? null : Enum.Parse<TransportMode>(transportMode, ignoreCase: true);
}