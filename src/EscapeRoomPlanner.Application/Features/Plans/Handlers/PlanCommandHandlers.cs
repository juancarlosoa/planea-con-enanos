using MediatR;
using EscapeRoomPlanner.Application.Features.Plans.Commands;
using EscapeRoomPlanner.Application.Features.Plans.DTOs;
using EscapeRoomPlanner.Application.Features.Plans.Mappers;
using EscapeRoomPlanner.Application.Features.Routes.DTOs;
using EscapeRoomPlanner.Application.Features.Routes.Mappers;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.Interfaces;

namespace EscapeRoomPlanner.Application.Features.Plans.Handlers;

public class CreatePlanCommandHandler : IRequestHandler<CreatePlanCommand, PlanDto>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePlanCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PlanDto> Handle(CreatePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = new Plan(request.Name, request.Description, request.StartDate, request.EndDate, request.CreatedBy);
        
        await _planRepository.AddAsync(plan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Initialize daily routes after the plan has an Id
        plan.InitializeDailyRoutes();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return PlanMapper.ToDto(plan);
    }
}

public class UpdatePlanCommandHandler : IRequestHandler<UpdatePlanCommand, PlanDto?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePlanCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PlanDto?> Handle(UpdatePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.Id, cancellationToken);
        if (plan == null) return null;

        plan.UpdateBasicInfo(request.Name, request.Description);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return PlanMapper.ToDto(plan);
    }
}

public class UpdatePlanDateRangeCommandHandler : IRequestHandler<UpdatePlanDateRangeCommand, PlanDto?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePlanDateRangeCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PlanDto?> Handle(UpdatePlanDateRangeCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.Id, cancellationToken);
        if (plan == null) return null;

        plan.UpdateDateRange(request.StartDate, request.EndDate);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return PlanMapper.ToDto(plan);
    }
}

public class DeletePlanCommandHandler : IRequestHandler<DeletePlanCommand, bool>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeletePlanCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeletePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.Id, cancellationToken);
        if (plan == null) return false;

        await _planRepository.DeleteAsync(plan.Id);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}

public class ActivatePlanCommandHandler : IRequestHandler<ActivatePlanCommand, PlanDto?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ActivatePlanCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PlanDto?> Handle(ActivatePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.Id, cancellationToken);
        if (plan == null) return null;

        plan.ActivatePlan();
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return PlanMapper.ToDto(plan);
    }
}

public class CompletePlanCommandHandler : IRequestHandler<CompletePlanCommand, PlanDto?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CompletePlanCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PlanDto?> Handle(CompletePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.Id, cancellationToken);
        if (plan == null) return null;

        plan.CompletePlan();
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return PlanMapper.ToDto(plan);
    }
}

public class CancelPlanCommandHandler : IRequestHandler<CancelPlanCommand, PlanDto?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelPlanCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PlanDto?> Handle(CancelPlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.Id, cancellationToken);
        if (plan == null) return null;

        plan.CancelPlan();
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return PlanMapper.ToDto(plan);
    }
}

// Daily Route Command Handlers
public class AddStopToDayCommandHandler : IRequestHandler<AddStopToDayCommand, DailyRouteDto?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddStopToDayCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DailyRouteDto?> Handle(AddStopToDayCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null) return null;

        plan.AddStopToDay(request.Date, request.EscapeRoomId);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        var dailyRoute = plan.GetRouteForDate(request.Date);
        return dailyRoute != null ? DailyRouteMapper.ToDto(dailyRoute) : null;
    }
}

public class RemoveStopFromDayCommandHandler : IRequestHandler<RemoveStopFromDayCommand, DailyRouteDto?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveStopFromDayCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DailyRouteDto?> Handle(RemoveStopFromDayCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null) return null;

        plan.RemoveStopFromDay(request.Date, request.EscapeRoomId);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        var dailyRoute = plan.GetRouteForDate(request.Date);
        return dailyRoute != null ? DailyRouteMapper.ToDto(dailyRoute) : null;
    }
}

public class MoveStopBetweenDaysCommandHandler : IRequestHandler<MoveStopBetweenDaysCommand, MoveStopBetweenDaysResult?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MoveStopBetweenDaysCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<MoveStopBetweenDaysResult?> Handle(MoveStopBetweenDaysCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null) return null;

        // Remove from source day and add to target day
        plan.RemoveStopFromDay(request.FromDate, request.EscapeRoomId);
        plan.AddStopToDay(request.TargetDate, request.EscapeRoomId);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        var fromRoute = plan.GetRouteForDate(request.FromDate);
        var toRoute = plan.GetRouteForDate(request.TargetDate);
        
        if (fromRoute == null || toRoute == null) return null;
        
        return new MoveStopBetweenDaysResult(
            DailyRouteMapper.ToDto(fromRoute),
            DailyRouteMapper.ToDto(toRoute)
        );
    }
}

public class ReorderStopsInDayCommandHandler : IRequestHandler<ReorderStopsInDayCommand, DailyRouteDto?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ReorderStopsInDayCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DailyRouteDto?> Handle(ReorderStopsInDayCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null) return null;

        var dailyRoute = plan.GetRouteForDate(request.Date);
        if (dailyRoute == null) return null;

        dailyRoute.ReorderStops(request.EscapeRoomIds);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return DailyRouteMapper.ToDto(dailyRoute);
    }
}

public class UpdateDailyRouteTransportCommandHandler : IRequestHandler<UpdateDailyRouteTransportCommand, DailyRouteDto?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateDailyRouteTransportCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DailyRouteDto?> Handle(UpdateDailyRouteTransportCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null) return null;

        var dailyRoute = plan.GetRouteForDate(request.Date);
        if (dailyRoute == null) return null;

        if (Enum.TryParse<TransportMode>(request.PreferredTransportMode, out var transportMode) &&
            Enum.TryParse<MultiModalStrategy>(request.MultiModalStrategy, out var strategy))
        {
            dailyRoute.UpdateTransportMode(transportMode, strategy);
        }
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return DailyRouteMapper.ToDto(dailyRoute);
    }
}

// Route Optimization Command Handlers
public class OptimizeDailyRouteCommandHandler : IRequestHandler<OptimizeDailyRouteCommand, DailyRouteDto?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IRouteOptimizationService _routeOptimizationService;
    private readonly IUnitOfWork _unitOfWork;

    public OptimizeDailyRouteCommandHandler(
        IPlanRepository planRepository, 
        IRouteOptimizationService routeOptimizationService,
        IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _routeOptimizationService = routeOptimizationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<DailyRouteDto?> Handle(OptimizeDailyRouteCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null) return null;

        var dailyRoute = plan.GetRouteForDate(request.Date);
        if (dailyRoute == null) return null;

        // TODO: Implement route optimization logic
        // This would involve calling the route optimization service
        // and updating the daily route with optimized times and order
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return DailyRouteMapper.ToDto(dailyRoute);
    }
}

public class OptimizeAllRoutesCommandHandler : IRequestHandler<OptimizeAllRoutesCommand, PlanDto?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IRouteOptimizationService _routeOptimizationService;
    private readonly IUnitOfWork _unitOfWork;

    public OptimizeAllRoutesCommandHandler(
        IPlanRepository planRepository, 
        IRouteOptimizationService routeOptimizationService,
        IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _routeOptimizationService = routeOptimizationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<PlanDto?> Handle(OptimizeAllRoutesCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null) return null;

        // TODO: Implement optimization for all daily routes
        // This would optimize each daily route in the plan
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return PlanMapper.ToDto(plan);
    }
}

// Sharing Command Handlers
public class GeneratePublicLinkCommandHandler : IRequestHandler<GeneratePublicLinkCommand, GeneratePublicLinkResult?>
{
    private readonly IPlanRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GeneratePublicLinkCommandHandler(IPlanRepository planRepository, IUnitOfWork unitOfWork)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<GeneratePublicLinkResult?> Handle(GeneratePublicLinkCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null) return null;

        // TODO: Implement public link generation
        // This would create a share token and store it in the database
        var shareToken = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddDays(30); // 30 days expiration
        
        var publicUrl = $"/shared/plans/{shareToken}";
        
        return new GeneratePublicLinkResult(publicUrl, expiresAt);
    }
}