using Microsoft.EntityFrameworkCore;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Interfaces;
using EscapeRoomPlanner.Infrastructure.Data;

namespace EscapeRoomPlanner.Infrastructure.Data.Repositories;

public class DailyRouteRepository : Repository<DailyRoute>, IDailyRouteRepository
{
    public DailyRouteRepository(EscapeRoomPlannerDbContext context) : base(context)
    {
    }

    public async Task<List<DailyRoute>> GetRoutesByPlanIdAsync(Guid planId)
    {
        return await _context.DailyRoutes
            .Include(dr => dr.Stops)
            .Where(dr => dr.PlanId == planId)
            .OrderBy(dr => dr.Date)
            .ToListAsync();
    }

    public async Task<DailyRoute?> GetRouteByPlanAndDateAsync(Guid planId, DateOnly date)
    {
        return await _context.DailyRoutes
            .Include(dr => dr.Stops)
            .FirstOrDefaultAsync(dr => dr.PlanId == planId && dr.Date == date);
    }

    public async Task<List<DailyRoute>> GetRoutesByDateRangeAsync(DateOnly startDate, DateOnly endDate)
    {
        return await _context.DailyRoutes
            .Include(dr => dr.Stops)
            .Where(dr => dr.Date >= startDate && dr.Date <= endDate)
            .OrderBy(dr => dr.Date)
            .ToListAsync();
    }

    public override async Task<DailyRoute?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.DailyRoutes
            .Include(dr => dr.Stops)
            .FirstOrDefaultAsync(dr => dr.Id == id, cancellationToken);
    }

    public override async Task<IEnumerable<DailyRoute>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.DailyRoutes
            .Include(dr => dr.Stops)
            .OrderBy(dr => dr.Date)
            .ToListAsync(cancellationToken);
    }
}