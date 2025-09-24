using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.ValueObjects;

namespace EscapeRoomPlanner.Domain.Interfaces;

public interface IEscapeRoomRepository : IRepository<EscapeRoom>
{
    Task<IEnumerable<EscapeRoom>> SearchByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<IEnumerable<EscapeRoom>> SearchByCityAsync(string city, CancellationToken cancellationToken = default);
    Task<IEnumerable<EscapeRoom>> SearchByDifficultyAsync(DifficultyLevel difficulty, CancellationToken cancellationToken = default);
    Task<IEnumerable<EscapeRoom>> SearchNearLocationAsync(Coordinates location, double radiusKm, CancellationToken cancellationToken = default);
    Task<IEnumerable<EscapeRoom>> SearchByPriceRangeAsync(decimal minPrice, decimal maxPrice, CancellationToken cancellationToken = default);
    Task<IEnumerable<EscapeRoom>> GetActiveEscapeRoomsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<EscapeRoom>> SearchWithFiltersAsync(EscapeRoomSearchFilters filters, CancellationToken cancellationToken = default);
}

public class EscapeRoomSearchFilters
{
    public string? Name { get; set; }
    public string? City { get; set; }
    public DifficultyLevel? Difficulty { get; set; }
    public Coordinates? Location { get; set; }
    public double? RadiusKm { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public TimeSpan? MaxDuration { get; set; }
    public bool? IsActive { get; set; }
    public double? MinRating { get; set; }
}