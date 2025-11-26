using PCE.Modules.EscapeManagement.Domain.Companies.Entities;
using PCE.Shared.Abstractions.Domain;
using PCE.Shared.Data;

namespace PCE.Modules.EscapeManagement.Domain.EscapeRooms.Entities;

public class EscapeRoom : BaseEntity
{
    public Slug Slug { get; private set; } = null!;
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public int MaxPlayers { get; private set; }
    public int MinPlayers { get; private set; }
    public int DurationMinutes { get; private set; }
    public string DifficultyLevel { get; private set; } = string.Empty;
    public decimal PricePerPerson { get; private set; }
    public bool IsActive { get; private set; }
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }
    public string Address { get; private set; } = string.Empty;

    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;

    private EscapeRoom() { }

    public static EscapeRoom Create(
        string name,
        string description,
        int maxPlayers,
        int minPlayers,
        int durationMinutes,
        string difficultyLevel,
        decimal pricePerPerson,
        Guid companyId,
        double latitude,
        double longitude,
        string address)
    {
        var id = Guid.NewGuid();
        var slug = Slug.Create(name);

        return new EscapeRoom
        {
            Id = id,
            Slug = slug,
            Name = name,
            Description = description,
            MaxPlayers = maxPlayers,
            MinPlayers = minPlayers,
            DurationMinutes = durationMinutes,
            DifficultyLevel = difficultyLevel,
            PricePerPerson = pricePerPerson,
            CompanyId = companyId,
            IsActive = true,
            Latitude = latitude,
            Longitude = longitude,
            Address = address,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(
        string name,
        string description,
        int maxPlayers,
        int minPlayers,
        int durationMinutes,
        string difficultyLevel,
        decimal pricePerPerson,
        double latitude,
        double longitude,
        string address)
    {
        if (Name != name)
        {
            Slug = Slug.Create(name);
        }

        Name = name;
        Description = description;
        MaxPlayers = maxPlayers;
        MinPlayers = minPlayers;
        DurationMinutes = durationMinutes;
        DifficultyLevel = difficultyLevel;
        PricePerPerson = pricePerPerson;
        Latitude = latitude;
        Longitude = longitude;
        Address = address;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}