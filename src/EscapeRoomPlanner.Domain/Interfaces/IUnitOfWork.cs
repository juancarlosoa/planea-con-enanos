namespace EscapeRoomPlanner.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IEscapeRoomRepository EscapeRooms { get; }
    IPlanRepository Plans { get; }
    IDailyRouteRepository DailyRoutes { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}