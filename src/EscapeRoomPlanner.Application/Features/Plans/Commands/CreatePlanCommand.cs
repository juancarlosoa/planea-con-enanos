using MediatR;
using EscapeRoomPlanner.Application.Features.Plans.DTOs;
using EscapeRoomPlanner.Application.Features.Routes.DTOs;

namespace EscapeRoomPlanner.Application.Features.Plans.Commands;

public record CreatePlanCommand(
    string Name,
    string Description,
    DateOnly StartDate,
    DateOnly EndDate,
    Guid CreatedBy
) : IRequest<PlanDto>;

public record UpdatePlanCommand(
    Guid Id,
    string Name,
    string Description
) : IRequest<PlanDto?>;

public record UpdatePlanDateRangeCommand(
    Guid Id,
    DateOnly StartDate,
    DateOnly EndDate
) : IRequest<PlanDto?>;

public record DeletePlanCommand(Guid Id) : IRequest<bool>;

public record ActivatePlanCommand(Guid Id) : IRequest<PlanDto?>;

public record CompletePlanCommand(Guid Id) : IRequest<PlanDto?>;

public record CancelPlanCommand(Guid Id) : IRequest<PlanDto?>;

// Daily Route Commands
public record AddStopToDayCommand(
    Guid PlanId,
    DateOnly Date,
    Guid EscapeRoomId
) : IRequest<DailyRouteDto?>;

public record RemoveStopFromDayCommand(
    Guid PlanId,
    DateOnly Date,
    Guid EscapeRoomId
) : IRequest<DailyRouteDto?>;

public record MoveStopBetweenDaysCommand(
    Guid PlanId,
    DateOnly FromDate,
    Guid EscapeRoomId,
    DateOnly TargetDate
) : IRequest<MoveStopBetweenDaysResult?>;

public record ReorderStopsInDayCommand(
    Guid PlanId,
    DateOnly Date,
    List<Guid> EscapeRoomIds
) : IRequest<DailyRouteDto?>;

public record UpdateDailyRouteTransportCommand(
    Guid PlanId,
    DateOnly Date,
    string PreferredTransportMode,
    string MultiModalStrategy
) : IRequest<DailyRouteDto?>;

// Route Optimization Commands
public record OptimizeDailyRouteCommand(
    Guid PlanId,
    DateOnly Date
) : IRequest<DailyRouteDto?>;

public record OptimizeAllRoutesCommand(Guid PlanId) : IRequest<PlanDto?>;

// Sharing Commands
public record GeneratePublicLinkCommand(Guid PlanId) : IRequest<GeneratePublicLinkResult?>;

// Result types
public record MoveStopBetweenDaysResult(DailyRouteDto FromRoute, DailyRouteDto ToRoute);
public record GeneratePublicLinkResult(string PublicUrl, DateTime ExpiresAt);