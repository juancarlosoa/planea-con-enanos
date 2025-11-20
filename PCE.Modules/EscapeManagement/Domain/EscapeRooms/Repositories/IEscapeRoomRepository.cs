using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Entities;
using PCE.Shared.Abstractions.Persistence;

namespace PCE.Modules.EscapeManagement.Domain.EscapeRooms.Repositories;

public interface IEscapeRoomRepository : IRepository<EscapeRoom>
{
    Task<EscapeRoom?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default);
}