using EscapeRoomPlanner.Application.Features.Plans.DTOs;
using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using EscapeRoomPlanner.Application.Features.Routes.Mappers;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using Riok.Mapperly.Abstractions;

namespace EscapeRoomPlanner.Application.Features.Plans.Mappers;

[Mapper]
public static partial class PlanMapper
{
    // Entity to DTO mappings
    public static partial PlanDto ToDto(Plan plan);
    public static partial List<PlanDto> ToDto(List<Plan> plans);
    public static partial IEnumerable<PlanDto> ToDto(IEnumerable<Plan> plans);

    // DTO to Entity mappings
    public static Plan ToEntity(CreatePlanDto dto)
    {
        return new Plan(
            dto.Name,
            dto.Description,
            dto.StartDate,
            dto.EndDate,
            dto.CreatedBy
        );
    }

    // Custom enum mappings
    [MapProperty(nameof(Plan.Status), nameof(PlanDto.Status))]
    private static string MapStatusToString(PlanStatus status) => status.ToString();

    // Custom collection mappings for DailyRoutes
    public static List<DailyRouteDto> MapDailyRoutesToDto(IReadOnlyList<DailyRoute> dailyRoutes)
    {
        return dailyRoutes.Select(DailyRouteMapper.ToDto).ToList();
    }
}