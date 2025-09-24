using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EscapeRoomPlanner.Infrastructure.Data.Repositories;

public class PlanRepository : Repository<Plan>, IPlanRepository
{
    public PlanRepository(EscapeRoomPlannerDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Plan>> GetPlansByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Plans
            .Where(p => p.CreatedBy == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Plan>> GetPlansByStatusAsync(PlanStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Plans
            .Where(p => p.Status == status)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Plan>> GetPlansByDateRangeAsync(DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default)
    {
        return await _context.Plans
            .Where(p => p.StartDate >= startDate && p.EndDate <= endDate)
            .OrderBy(p => p.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<Plan?> GetPlanWithRoutesAsync(Guid planId, CancellationToken cancellationToken = default)
    {
        return await _context.Plans
            .Include(p => p.DailyRoutes)
            .ThenInclude(dr => dr.Stops)
            .FirstOrDefaultAsync(p => p.Id == planId, cancellationToken);
    }

    public async Task<IEnumerable<Plan>> GetActivePlansForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Plans
            .Where(p => p.CreatedBy == userId && p.Status != PlanStatus.Completed && p.Status != PlanStatus.Cancelled)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}