using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EscapeRoomPlanner.Infrastructure.Data.Repositories;

public class DailyRouteRepository : Repository<DailyRoute>, IDailyRouteRepository
{
    public DailyRouteRepository(EscapeRoomPlannerDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<DailyRoute>> GetRoutesByPlanAsync(Guid planId, CancellationToken cancellationToken = default)
    {
        return await _context.DailyRoutes
            .Where(dr => dr.PlanId == planId)
            .OrderBy(dr => dr.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<DailyRoute?> GetRouteByDateAsync(Guid planId, DateOnly date, CancellationToken cancellationToken = default)
    {
        return await _context.DailyRoutes
            .FirstOrDefaultAsync(dr => dr.PlanId == planId && dr.Date == date, cancellationToken);
    }

    public async Task<DailyRoute?> GetRouteWithStopsAsync(Guid routeId, CancellationToken cancellationToken = default)
    {
        return await _context.DailyRoutes
            .Include(dr => dr.Stops)
            .FirstOrDefaultAsync(dr => dr.Id == routeId, cancellationToken);
    }
}