namespace EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;

public record EscapeRoomDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public AddressDto Address { get; init; } = null!;
    public CoordinatesDto Location { get; init; } = null!;
    public TimeSpan EstimatedDuration { get; init; }
    public string Difficulty { get; init; } = string.Empty;
    public PriceRangeDto PriceRange { get; init; } = null!;
    public ScheduleDto Schedule { get; init; } = null!;
    public ContactInfoDto ContactInfo { get; init; } = null!;
    public GooglePlacesInfoDto? GooglePlacesInfo { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record CreateEscapeRoomDto
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public AddressDto Address { get; init; } = null!;
    public CoordinatesDto Location { get; init; } = null!;
    public TimeSpan EstimatedDuration { get; init; }
    public string Difficulty { get; init; } = string.Empty;
    public PriceRangeDto PriceRange { get; init; } = null!;
    public ScheduleDto Schedule { get; init; } = null!;
    public ContactInfoDto ContactInfo { get; init; } = null!;
}

public record UpdateEscapeRoomDto
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public TimeSpan EstimatedDuration { get; init; }
    public string Difficulty { get; init; } = string.Empty;
}

public record AddressDto
{
    public string Street { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
}

public record CoordinatesDto
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }
}

public record PriceRangeDto
{
    public decimal MinPrice { get; init; }
    public decimal MaxPrice { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record ContactInfoDto
{
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? Website { get; init; }
}

public record GooglePlacesInfoDto
{
    public string PlaceId { get; init; } = string.Empty;
    public double Rating { get; init; }
    public int ReviewCount { get; init; }
    public DateTime LastUpdated { get; init; }
}

public record ScheduleDto
{
    public Dictionary<DayOfWeek, TimeRangeDto> WeeklySchedule { get; init; } = new();
    public List<SpecialScheduleDto> SpecialDates { get; init; } = new();
}

public record TimeRangeDto
{
    public TimeSpan StartTime { get; init; }
    public TimeSpan EndTime { get; init; }
}

public record SpecialScheduleDto
{
    public DateTime Date { get; init; }
    public TimeRangeDto? TimeRange { get; init; }
    public bool IsClosed { get; init; }
    public string? Description { get; init; }
}