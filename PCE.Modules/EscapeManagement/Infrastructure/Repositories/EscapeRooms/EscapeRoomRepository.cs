using Microsoft.EntityFrameworkCore;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Entities;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Repositories;
using PCE.Modules.EscapeManagement.Infrastructure.Persistence;
using PCE.Shared.Abstractions.Domain;

namespace PCE.Modules.EscapeManagement.Infrastructure.Repositories.EscapeRooms;

public class EscapeRoomRepository : IEscapeRoomRepository
{
    private readonly EscapeManagementDbContext _context;

    public EscapeRoomRepository(EscapeManagementDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(EscapeRoom entity, CancellationToken ct = default)
        => await _context.EscapeRooms.AddAsync(entity, ct);

    public async Task<EscapeRoom?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.EscapeRooms
            .FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<EscapeRoom?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await _context.EscapeRooms
            .FirstOrDefaultAsync(e => e.Slug == Slug.Create(slug), ct);

    public async Task<List<EscapeRoom>> ListAsync(CancellationToken ct = default)
        => await _context.EscapeRooms
            .ToListAsync(ct);

    public void Remove(EscapeRoom entity)
        => _context.EscapeRooms.Remove(entity);

    public async Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default)
        => await _context.EscapeRooms.AnyAsync(e => e.Slug == Slug.Create(slug), ct);

    public void Update(EscapeRoom entity)
        => _context.EscapeRooms.Update(entity);
}