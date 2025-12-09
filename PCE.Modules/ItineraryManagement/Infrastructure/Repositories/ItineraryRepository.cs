using Microsoft.EntityFrameworkCore;
using PCE.Modules.ItineraryManagement.Domain.Entities;
using PCE.Modules.ItineraryManagement.Domain.Repositories;
using PCE.Modules.ItineraryManagement.Infrastructure.Persistence;
using PCE.Shared.Abstractions.Domain;

namespace PCE.Modules.ItineraryManagement.Infrastructure.Repositories;

public class ItineraryRepository : IItineraryRepository
{
    private readonly ItineraryManagementDbContext _context;

    public ItineraryRepository(ItineraryManagementDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Itinerary entity, CancellationToken ct = default)
            => await _context.Itineraries.AddAsync(entity, ct);

    public void Remove(Itinerary entity) => _context.Itineraries.Remove(entity);

    public void Update(Itinerary entity) => _context.Itineraries.Update(entity);

    public async Task<Itinerary?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Itineraries.Include(c => c.ItineraryDays)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<List<Itinerary>> ListAsync(CancellationToken ct = default)
        => await _context.Itineraries.ToListAsync(ct);

    public async Task<Itinerary?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await _context.Itineraries.Include(c => c.ItineraryDays)
            .ThenInclude(d => d.ItineraryStops)
            .FirstOrDefaultAsync(c => c.Slug == Slug.Create(slug), ct);

    public async Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default)
        => await _context.Itineraries.AnyAsync(c => c.Slug == Slug.Create(slug), ct);
}