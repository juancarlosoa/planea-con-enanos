using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.ValueObjects;

namespace EscapeRoomPlanner.Domain.Entities;

public class EscapeRoom : BaseEntity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public Address Address { get; private set; }
    public Coordinates Location { get; private set; }
    public TimeSpan EstimatedDuration { get; private set; }
    public DifficultyLevel Difficulty { get; private set; }
    public PriceRange PriceRange { get; private set; }
    public Schedule Schedule { get; private set; }
    public ContactInfo ContactInfo { get; private set; }
    public GooglePlacesInfo? GooglePlacesInfo { get; private set; }
    public bool IsActive { get; private set; }

    private EscapeRoom() { } // For EF Core

    public EscapeRoom(
        string name,
        string description,
        Address address,
        Coordinates location,
        TimeSpan estimatedDuration,
        DifficultyLevel difficulty,
        PriceRange priceRange,
        Schedule schedule,
        ContactInfo contactInfo)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty", nameof(name));
        if (estimatedDuration <= TimeSpan.Zero)
            throw new ArgumentException("Estimated duration must be positive", nameof(estimatedDuration));

        Name = name;
        Description = description ?? string.Empty;
        Address = address ?? throw new ArgumentNullException(nameof(address));
        Location = location ?? throw new ArgumentNullException(nameof(location));
        EstimatedDuration = estimatedDuration;
        Difficulty = difficulty;
        PriceRange = priceRange ?? throw new ArgumentNullException(nameof(priceRange));
        Schedule = schedule ?? throw new ArgumentNullException(nameof(schedule));
        ContactInfo = contactInfo ?? throw new ArgumentNullException(nameof(contactInfo));
        IsActive = true;
    }

    public void UpdateBasicInfo(string name, string description, TimeSpan estimatedDuration, DifficultyLevel difficulty)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty", nameof(name));
        if (estimatedDuration <= TimeSpan.Zero)
            throw new ArgumentException("Estimated duration must be positive", nameof(estimatedDuration));

        Name = name;
        Description = description ?? string.Empty;
        EstimatedDuration = estimatedDuration;
        Difficulty = difficulty;
        UpdateTimestamp();
    }

    public void UpdateLocation(Address address, Coordinates coordinates)
    {
        Address = address ?? throw new ArgumentNullException(nameof(address));
        Location = coordinates ?? throw new ArgumentNullException(nameof(coordinates));
        UpdateTimestamp();
    }

    public void UpdatePricing(PriceRange priceRange)
    {
        PriceRange = priceRange ?? throw new ArgumentNullException(nameof(priceRange));
        UpdateTimestamp();
    }

    public void UpdateSchedule(Schedule schedule)
    {
        Schedule = schedule ?? throw new ArgumentNullException(nameof(schedule));
        UpdateTimestamp();
    }

    public void UpdateContactInfo(ContactInfo contactInfo)
    {
        ContactInfo = contactInfo ?? throw new ArgumentNullException(nameof(contactInfo));
        UpdateTimestamp();
    }

    public void UpdateGooglePlacesInfo(GooglePlacesInfo googlePlacesInfo)
    {
        GooglePlacesInfo = googlePlacesInfo;
        UpdateTimestamp();
    }

    public void Activate()
    {
        IsActive = true;
        UpdateTimestamp();
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdateTimestamp();
    }

    public bool IsAvailableAt(DateTime dateTime)
    {
        return IsActive && Schedule.IsOpenAt(dateTime);
    }

    public double DistanceTo(EscapeRoom other)
    {
        if (other == null)
            throw new ArgumentNullException(nameof(other));

        return Location.DistanceTo(other.Location);
    }
}

public class ContactInfo : ValueObject
{
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public string? Website { get; private set; }

    private ContactInfo() { } // For EF Core

    public ContactInfo(string? phone = null, string? email = null, string? website = null)
    {
        Phone = phone;
        Email = email;
        Website = website;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Phone ?? string.Empty;
        yield return Email ?? string.Empty;
        yield return Website ?? string.Empty;
    }
}

public class GooglePlacesInfo : ValueObject
{
    public string PlaceId { get; private set; }
    public double Rating { get; private set; }
    public int ReviewCount { get; private set; }
    public DateTime LastUpdated { get; private set; }

    private GooglePlacesInfo() { } // For EF Core

    public GooglePlacesInfo(string placeId, double rating, int reviewCount)
    {
        if (string.IsNullOrWhiteSpace(placeId))
            throw new ArgumentException("Place ID cannot be empty", nameof(placeId));
        if (rating < 0 || rating > 5)
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 0 and 5");
        if (reviewCount < 0)
            throw new ArgumentOutOfRangeException(nameof(reviewCount), "Review count cannot be negative");

        PlaceId = placeId;
        Rating = rating;
        ReviewCount = reviewCount;
        LastUpdated = DateTime.UtcNow;
    }

    public void UpdateRating(double rating, int reviewCount)
    {
        if (rating < 0 || rating > 5)
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 0 and 5");
        if (reviewCount < 0)
            throw new ArgumentOutOfRangeException(nameof(reviewCount), "Review count cannot be negative");

        Rating = rating;
        ReviewCount = reviewCount;
        LastUpdated = DateTime.UtcNow;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return PlaceId;
        yield return Rating;
        yield return ReviewCount;
    }
}