using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.ValueObjects;

namespace EscapeRoomPlanner.Domain.Interfaces;

public interface IGooglePlacesService
{
    Task<GooglePlaceDetails?> GetPlaceDetailsAsync(string placeId, CancellationToken cancellationToken = default);
    Task<List<GoogleReview>> GetReviewsAsync(string placeId, CancellationToken cancellationToken = default);
    Task<List<EscapeRoom>> SearchNearbyEscapeRoomsAsync(Coordinates center, int radiusKm, CancellationToken cancellationToken = default);
    Task<string?> FindPlaceIdAsync(string name, Address address, CancellationToken cancellationToken = default);
    Task UpdateEscapeRoomWithGoogleDataAsync(EscapeRoom escapeRoom, CancellationToken cancellationToken = default);
}

public class GooglePlaceDetails
{
    public string PlaceId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public Address? Address { get; set; }
    public Coordinates? Location { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Website { get; set; }
    public List<GoogleReview> Reviews { get; set; } = new();
}

public class GoogleReview
{
    public string AuthorName { get; set; } = string.Empty;
    public double Rating { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime Time { get; set; }
    public string Language { get; set; } = string.Empty;
}