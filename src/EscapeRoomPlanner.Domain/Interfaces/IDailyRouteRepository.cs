using EscapeRoomPlanner.Domain.Entities;

namespace EscapeRoomPlanner.Domain.Interfaces;

public interface IDailyRouteRepository : IRepository<DailyRoute>
{
    Task<IEnumerable<DailyRoute>> GetRoutesByPlanAsync(Guid planId, CancellationToken cancellationToken = default);
    Task<DailyRoute?> GetRouteByDateAsync(Guid planId, DateOnly date, CancellationToken cancellationToken = default);
    Task<DailyRoute?> GetRouteWithStopsAsync(Guid routeId, CancellationToken cancellationToken = default);
}