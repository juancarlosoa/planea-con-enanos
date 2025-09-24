using EscapeRoomPlanner.Domain.Interfaces;
using EscapeRoomPlanner.Infrastructure.Data.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace EscapeRoomPlanner.Infrastructure.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly EscapeRoomPlannerDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(EscapeRoomPlannerDbContext context)
    {
        _context = context;
        EscapeRooms = new EscapeRoomRepository(_context);
        Plans = new PlanRepository(_context);
        DailyRoutes = new DailyRouteRepository(_context);
    }

    public IEscapeRoomRepository EscapeRooms { get; }
    public IPlanRepository Plans { get; }
    public IDailyRouteRepository DailyRoutes { get; }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}