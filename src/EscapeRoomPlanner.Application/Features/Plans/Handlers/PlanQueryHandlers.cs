using MediatR;
using EscapeRoomPlanner.Application.Features.Plans.Queries;
using EscapeRoomPlanner.Application.Features.Plans.DTOs;
using EscapeRoomPlanner.Application.Features.Plans.Mappers;
using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using EscapeRoomPlanner.Application.Features.Routes.Mappers;
using EscapeRoomPlanner.Domain.Interfaces;

namespace EscapeRoomPlanner.Application.Features.Plans.Handlers;

public class GetAllPlansQueryHandler : IRequestHandler<GetAllPlansQuery, List<PlanDto>>
{
    private readonly IPlanRepository _planRepository;

    public GetAllPlansQueryHandler(IPlanRepository planRepository)
    {
        _planRepository = planRepository;
    }

    public async Task<List<PlanDto>> Handle(GetAllPlansQuery request, CancellationToken cancellationToken)
    {
        var plans = await _planRepository.GetAllAsync(cancellationToken);
        return plans.Select(PlanMapper.ToDto).ToList();
    }
}

public class GetPlanByIdQueryHandler : IRequestHandler<GetPlanByIdQuery, PlanDto?>
{
    private readonly IPlanRepository _planRepository;

    public GetPlanByIdQueryHandler(IPlanRepository planRepository)
    {
        _planRepository = planRepository;
    }

    public async Task<PlanDto?> Handle(GetPlanByIdQuery request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.Id, cancellationToken);
        return plan != null ? PlanMapper.ToDto(plan) : null;
    }
}

public class GetDailyRouteQueryHandler : IRequestHandler<GetDailyRouteQuery, DailyRouteDto?>
{
    private readonly IPlanRepository _planRepository;

    public GetDailyRouteQueryHandler(IPlanRepository planRepository)
    {
        _planRepository = planRepository;
    }

    public async Task<DailyRouteDto?> Handle(GetDailyRouteQuery request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null) return null;

        var dailyRoute = plan.GetRouteForDate(request.Date);
        return dailyRoute != null ? DailyRouteMapper.ToDto(dailyRoute) : null;
    }
}

public class ExportPlanToPdfQueryHandler : IRequestHandler<ExportPlanToPdfQuery, ExportPdfResult?>
{
    private readonly IPlanRepository _planRepository;

    public ExportPlanToPdfQueryHandler(IPlanRepository planRepository)
    {
        _planRepository = planRepository;
    }

    public async Task<ExportPdfResult?> Handle(ExportPlanToPdfQuery request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null) return null;

        // TODO: Implement PDF generation
        // This would use a PDF library to generate a formatted plan document
        var content = System.Text.Encoding.UTF8.GetBytes($"Plan: {plan.Name}");
        var fileName = $"plan-{plan.Name.Replace(" ", "-").ToLower()}-{DateTime.Now:yyyy-MM-dd}.pdf";
        
        return new ExportPdfResult(content, fileName);
    }
}

public class GetPublicPlanQueryHandler : IRequestHandler<GetPublicPlanQuery, PlanDto?>
{
    private readonly IPlanRepository _planRepository;

    public GetPublicPlanQueryHandler(IPlanRepository planRepository)
    {
        _planRepository = planRepository;
    }

    public async Task<PlanDto?> Handle(GetPublicPlanQuery request, CancellationToken cancellationToken)
    {
        // TODO: Implement public plan retrieval by share token
        // This would look up the plan by share token and verify it's not expired
        
        // For now, return null as this feature needs additional implementation
        return null;
    }
}