using EscapeRoomPlanner.Application.Features.Routes.Commands;
using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.Interfaces;
using EscapeRoomPlanner.Domain.ValueObjects;
using Riok.Mapperly.Abstractions;

namespace EscapeRoomPlanner.Application.Features.Routes.Mappers;

[Mapper]
public static partial class RouteMapper
{
    // OptimizedRoute mappings
    public static partial OptimizedRouteDto ToOptimizedRouteDto(OptimizedRoute optimizedRoute);
    
    [MapProperty(nameof(OptimizedRoute.TotalTravelTime), nameof(OptimizedRouteDto.TotalTravelTimeMinutes))]
    private static int MapTotalTravelTime(TimeSpan totalTravelTime) => (int)totalTravelTime.TotalMinutes;

    // RouteSegment mappings
    public static partial RouteSegmentDto ToRouteSegmentDto(RouteSegment segment);
    public static partial List<RouteSegmentDto> ToRouteSegmentDto(List<RouteSegment> segments);
    
    [MapProperty(nameof(RouteSegment.TravelTime), nameof(RouteSegmentDto.TravelTimeMinutes))]
    private static int MapTravelTime(TimeSpan travelTime) => (int)travelTime.TotalMinutes;
    
    [MapProperty(nameof(RouteSegment.Mode), nameof(RouteSegmentDto.Mode))]
    private static string MapTransportMode(TransportMode mode) => mode.ToString();

    // TransportLeg mappings
    public static partial TransportLegDto ToTransportLegDto(TransportLeg leg);
    public static partial List<TransportLegDto> ToTransportLegDto(List<TransportLeg> legs);
    
    [MapProperty(nameof(TransportLeg.Duration), nameof(TransportLegDto.DurationMinutes))]
    private static int MapDuration(TimeSpan duration) => (int)duration.TotalMinutes;
    
    [MapProperty(nameof(TransportLeg.Mode), nameof(TransportLegDto.Mode))]
    private static string MapLegTransportMode(TransportMode mode) => mode.ToString();

    // Coordinates mappings
    public static partial CoordinatesDto ToCoordinatesDto(Coordinates coordinates);
    public static partial List<CoordinatesDto> ToCoordinatesDto(List<Coordinates> coordinates);
    public static partial Coordinates ToCoordinates(CoordinatesDto dto);
    public static partial List<Coordinates> ToCoordinates(List<CoordinatesDto> dtos);

    // RoutePreferences mappings
    public static RoutePreferences ToRoutePreferences(RoutePreferencesDto dto)
    {
        return new RoutePreferences
        {
            AllowedTransportModes = dto.AllowedTransportModes.Select(ToTransportMode).ToList(),
            PreferredTransportMode = ToTransportMode(dto.PreferredTransportMode),
            Strategy = ToMultiModalStrategy(dto.Strategy),
            MaxTotalTime = dto.MaxTotalTimeMinutes.HasValue ? TimeSpan.FromMinutes(dto.MaxTotalTimeMinutes.Value) : null,
            MaxBudget = dto.MaxBudget,
            OptimizeForTime = dto.OptimizeForTime,
            OptimizeForCost = dto.OptimizeForCost,
            StartLocation = dto.StartLocation != null ? ToCoordinates(dto.StartLocation) : null,
            EndLocation = dto.EndLocation != null ? ToCoordinates(dto.EndLocation) : null,
            MultiModalSettings = dto.MultiModalSettings != null ? ToMultiModalPreferences(dto.MultiModalSettings) : null
        };
    }

    public static MultiModalPreferences ToMultiModalPreferences(MultiModalPreferencesDto dto)
    {
        return new MultiModalPreferences
        {
            MaxWalkingDistanceKm = dto.MaxWalkingDistanceKm,
            MaxCyclingDistanceKm = dto.MaxCyclingDistanceKm,
            PreferParkAndWalk = dto.PreferParkAndWalk,
            AllowPublicTransportTransfers = dto.AllowPublicTransportTransfers,
            MaxTransfers = dto.MaxTransfers,
            MaxTransferWaitTime = TimeSpan.FromMinutes(dto.MaxTransferWaitTimeMinutes)
        };
    }

    public static TransportMode ToTransportMode(string mode) => mode switch
    {
        "Driving" => TransportMode.Driving,
        "Walking" => TransportMode.Walking,
        "Cycling" => TransportMode.Cycling,
        "PublicTransport" => TransportMode.PublicTransport,
        _ => TransportMode.Driving
    };

    public static MultiModalStrategy ToMultiModalStrategy(string strategy) => strategy switch
    {
        "SingleMode" => MultiModalStrategy.SingleMode,
        "DistanceBased" => MultiModalStrategy.DistanceBased,
        "ParkAndWalk" => MultiModalStrategy.ParkAndWalk,
        "PublicTransportAndWalk" => MultiModalStrategy.PublicTransportAndWalk,
        "Automatic" => MultiModalStrategy.Automatic,
        _ => MultiModalStrategy.SingleMode
    };
}