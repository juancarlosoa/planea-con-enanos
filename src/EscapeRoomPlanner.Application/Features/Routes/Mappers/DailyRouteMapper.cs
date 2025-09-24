using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using Riok.Mapperly.Abstractions;

namespace EscapeRoomPlanner.Application.Features.Routes.Mappers;

[Mapper]
public static partial class DailyRouteMapper
{
    // Entity to DTO mappings
    public static partial DailyRouteDto ToDto(DailyRoute dailyRoute);
    public static partial List<DailyRouteDto> ToDto(List<DailyRoute> dailyRoutes);
    public static partial IEnumerable<DailyRouteDto> ToDto(IEnumerable<DailyRoute> dailyRoutes);

    // DTO to Entity mappings
    [MapperIgnoreTarget(nameof(DailyRoute.Id))]
    [MapperIgnoreTarget(nameof(DailyRoute.CreatedAt))]
    [MapperIgnoreTarget(nameof(DailyRoute.UpdatedAt))]
    [MapperIgnoreTarget(nameof(DailyRoute.EstimatedTotalTime))]
    [MapperIgnoreTarget(nameof(DailyRoute.EstimatedCost))]
    [MapperIgnoreTarget(nameof(DailyRoute.Stops))]
    public static DailyRoute ToEntity(CreateDailyRouteDto dto)
    {
        return new DailyRoute(
            dto.Date,
            dto.PlanId,
            MapStringToTransportMode(dto.PreferredTransportMode),
            MapStringToMultiModalStrategy(dto.MultiModalStrategy)
        );
    }

    // Custom enum mappings
    [MapProperty(nameof(DailyRoute.PreferredTransportMode), nameof(DailyRouteDto.PreferredTransportMode))]
    private static string MapTransportModeToString(TransportMode transportMode) => transportMode.ToString();

    [MapProperty(nameof(DailyRoute.MultiModalStrategy), nameof(DailyRouteDto.MultiModalStrategy))]
    private static string MapMultiModalStrategyToString(MultiModalStrategy strategy) => strategy.ToString();

    [MapProperty(nameof(CreateDailyRouteDto.PreferredTransportMode), nameof(DailyRoute.PreferredTransportMode))]
    private static TransportMode MapStringToTransportMode(string transportMode) => 
        Enum.Parse<TransportMode>(transportMode, ignoreCase: true);

    [MapProperty(nameof(CreateDailyRouteDto.MultiModalStrategy), nameof(DailyRoute.MultiModalStrategy))]
    private static MultiModalStrategy MapStringToMultiModalStrategy(string strategy) => 
        Enum.Parse<MultiModalStrategy>(strategy, ignoreCase: true);

    [MapProperty(nameof(UpdateDailyRouteTransportDto.PreferredTransportMode), nameof(DailyRoute.PreferredTransportMode))]
    private static TransportMode MapUpdateTransportModeToEnum(string transportMode) => 
        Enum.Parse<TransportMode>(transportMode, ignoreCase: true);

    [MapProperty(nameof(UpdateDailyRouteTransportDto.MultiModalStrategy), nameof(DailyRoute.MultiModalStrategy))]
    private static MultiModalStrategy MapUpdateMultiModalStrategyToEnum(string strategy) => 
        Enum.Parse<MultiModalStrategy>(strategy, ignoreCase: true);

    // Custom collection mappings for RouteStops
    public static List<RouteStopDto> MapStopsToDto(IReadOnlyList<RouteStop> stops)
    {
        return stops.Select(RouteStopMapper.ToDto).ToList();
    }
}