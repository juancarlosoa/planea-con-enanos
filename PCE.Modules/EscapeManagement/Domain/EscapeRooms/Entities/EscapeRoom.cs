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
        Guid companyId)
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
        decimal pricePerPerson)
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
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}