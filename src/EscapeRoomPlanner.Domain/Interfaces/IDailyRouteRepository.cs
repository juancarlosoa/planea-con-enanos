using EscapeRoomPlanner.Domain.Entities;

namespace EscapeRoomPlanner.Domain.Interfaces;

public interface IDailyRouteRepository : IRepository<DailyRoute>
{
    Task<List<DailyRoute>> GetRoutesByPlanIdAsync(Guid planId);
    Task<DailyRoute?> GetRouteByPlanAndDateAsync(Guid planId, DateOnly date);
    Task<List<DailyRoute>> GetRoutesByDateRangeAsync(DateOnly startDate, DateOnly endDate);
}