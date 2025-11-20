using PCE.Shared.Abstractions.Domain;

namespace PCE.Shared.Abstractions.Persistence;

public interface IRepository<T> where T : class, IEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<T>> ListAsync(CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
}