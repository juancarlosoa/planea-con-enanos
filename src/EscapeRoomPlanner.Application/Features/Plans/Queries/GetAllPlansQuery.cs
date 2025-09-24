using MediatR;
using EscapeRoomPlanner.Application.Features.Plans.DTOs;
using EscapeRoomPlanner.Application.Features.Routes.DTOs;

namespace EscapeRoomPlanner.Application.Features.Plans.Queries;

public record GetAllPlansQuery() : IRequest<List<PlanDto>>;

public record GetPlanByIdQuery(Guid Id) : IRequest<PlanDto?>;

public record GetDailyRouteQuery(Guid PlanId, DateOnly Date) : IRequest<DailyRouteDto?>;

public record ExportPlanToPdfQuery(Guid PlanId) : IRequest<ExportPdfResult?>;

public record GetPublicPlanQuery(string ShareToken) : IRequest<PlanDto?>;

// Result types
public record ExportPdfResult(byte[] Content, string FileName);