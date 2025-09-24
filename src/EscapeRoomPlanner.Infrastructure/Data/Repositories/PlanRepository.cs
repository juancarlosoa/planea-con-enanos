using Microsoft.EntityFrameworkCore;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.Interfaces;
using EscapeRoomPlanner.Infrastructure.Data;

namespace EscapeRoomPlanner.Infrastructure.Data.Repositories;

public class PlanRepository : Repository<Plan>, IPlanRepository
{
    public PlanRepository(EscapeRoomPlannerDbContext context) : base(context)
    {
    }

    public async Task<List<Plan>> GetPlansByUserAsync(Guid userId)
    {
        return await _context.Plans
            .Include(p => p.DailyRoutes)
                .ThenInclude(dr => dr.Stops)
            .Where(p => p.CreatedBy == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Plan>> GetActivePlansAsync()
    {
        return await _context.Plans
            .Include(p => p.DailyRoutes)
                .ThenInclude(dr => dr.Stops)
            .Where(p => p.Status == PlanStatus.Active)
            .OrderBy(p => p.StartDate)
            .ToListAsync();
    }

    public async Task<List<Plan>> GetPlansByDateRangeAsync(DateOnly startDate, DateOnly endDate)
    {
        return await _context.Plans
            .Include(p => p.DailyRoutes)
                .ThenInclude(dr => dr.Stops)
            .Where(p => p.StartDate <= endDate && p.EndDate >= startDate)
            .OrderBy(p => p.StartDate)
            .ToListAsync();
    }

    public async Task<Plan?> GetPlanWithDailyRoutesAsync(Guid planId)
    {
        return await _context.Plans
            .Include(p => p.DailyRoutes)
                .ThenInclude(dr => dr.Stops)
            .FirstOrDefaultAsync(p => p.Id == planId);
    }

    public async Task<Plan?> GetPlanByShareTokenAsync(string shareToken)
    {
        // TODO: Implement share token lookup
        // This would require a separate ShareToken entity or field in Plan
        // For now, return null as this feature needs additional implementation
        return null;
    }

    public override async Task<Plan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Plans
            .Include(p => p.DailyRoutes)
                .ThenInclude(dr => dr.Stops)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public override async Task<IEnumerable<Plan>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Plans
            .Include(p => p.DailyRoutes)
                .ThenInclude(dr => dr.Stops)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}