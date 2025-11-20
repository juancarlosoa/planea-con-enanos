using Microsoft.EntityFrameworkCore;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Entities;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Repositories;
using PCE.Modules.EscapeManagement.Infrastructure.Persistence;

public class EscapeRoomRepository : IEscapeRoomRepository
{
    private readonly EscapeManagementDbContext _context;

    public EscapeRoomRepository(EscapeManagementDbContext context)
    {
        _context = context;
    }

    public Task AddAsync(EscapeRoom entity, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task<EscapeRoom?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public async Task<EscapeRoom?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await _context.EscapeRooms.FirstOrDefaultAsync(c => c.Slug.Value == slug, ct);

    public Task<List<EscapeRoom>> ListAsync(CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public void Remove(EscapeRoom entity)
    {
        throw new NotImplementedException();
    }

    public Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public void Update(EscapeRoom entity)
    {
        throw new NotImplementedException();
    }
}