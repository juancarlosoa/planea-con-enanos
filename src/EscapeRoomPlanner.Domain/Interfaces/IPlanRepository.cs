using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;

namespace EscapeRoomPlanner.Domain.Interfaces;

public interface IPlanRepository : IRepository<Plan>
{
    Task<IEnumerable<Plan>> GetPlansByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Plan>> GetPlansByStatusAsync(PlanStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<Plan>> GetPlansByDateRangeAsync(DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);
    Task<Plan?> GetPlanWithRoutesAsync(Guid planId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Plan>> GetActivePlansForUserAsync(Guid userId, CancellationToken cancellationToken = default);
}