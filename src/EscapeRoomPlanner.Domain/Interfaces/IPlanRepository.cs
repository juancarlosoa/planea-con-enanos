using EscapeRoomPlanner.Domain.Entities;

namespace EscapeRoomPlanner.Domain.Interfaces;

public interface IPlanRepository : IRepository<Plan>
{
    Task<List<Plan>> GetPlansByUserAsync(Guid userId);
    Task<List<Plan>> GetActivePlansAsync();
    Task<List<Plan>> GetPlansByDateRangeAsync(DateOnly startDate, DateOnly endDate);
    Task<Plan?> GetPlanWithDailyRoutesAsync(Guid planId);
    Task<Plan?> GetPlanByShareTokenAsync(string shareToken);
}