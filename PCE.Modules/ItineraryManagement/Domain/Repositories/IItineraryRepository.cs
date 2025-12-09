using PCE.Modules.ItineraryManagement.Domain.Entities;
using PCE.Shared.Abstractions.Persistence;

namespace PCE.Modules.ItineraryManagement.Domain.Repositories;

public interface IItineraryRepository : IRepository<Itinerary>
{
    Task<Itinerary?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default);
}