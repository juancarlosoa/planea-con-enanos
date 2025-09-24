using Riok.Mapperly.Abstractions;
using EscapeRoomPlanner.Application.Features.Plans.DTOs;
using EscapeRoomPlanner.Application.Features.Routes.Mappers;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;

namespace EscapeRoomPlanner.Application.Features.Plans.Mappers;

[Mapper]
public static partial class PlanMapper
{
    // Plan entity to DTO mapping
    public static partial PlanDto ToDto(Plan plan);
    public static partial List<PlanDto> ToDto(List<Plan> plans);
    
    // Custom mapping for Status enum
    [MapProperty(nameof(Plan.Status), nameof(PlanDto.Status))]
    private static string MapStatus(PlanStatus status) => status.ToString();
    
    // Custom mapping for DailyRoutes
    [MapProperty(nameof(Plan.DailyRoutes), nameof(PlanDto.DailyRoutes))]
    private static List<Routes.DTOs.DailyRouteDto> MapDailyRoutes(IReadOnlyList<DailyRoute> dailyRoutes)
    {
        return dailyRoutes.Select(DailyRouteMapper.ToDto).ToList();
    }
    
    // Creation mapping (DTO to entity)
    [MapperIgnoreTarget(nameof(Plan.Id))]
    [MapperIgnoreTarget(nameof(Plan.CreatedAt))]
    [MapperIgnoreTarget(nameof(Plan.UpdatedAt))]
    [MapperIgnoreTarget(nameof(Plan.DailyRoutes))]
    [MapperIgnoreTarget(nameof(Plan.Status))]
    public static partial Plan ToEntity(CreatePlanDto dto);
}