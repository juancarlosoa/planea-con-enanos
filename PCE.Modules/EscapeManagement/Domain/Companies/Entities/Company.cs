using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Entities;
using PCE.Shared.Abstractions.Domain;
using PCE.Shared.Data;

namespace PCE.Modules.EscapeManagement.Domain.Companies.Entities;

public class Company : BaseEntity
{
    public Slug Slug { get; private set; } = null!;
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string? Address { get; private set; }
    
    public string? Website { get; private set; }
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }

    private readonly List<EscapeRoom> _escapeRooms = new();
    public IReadOnlyCollection<EscapeRoom> EscapeRooms => _escapeRooms.AsReadOnly();

    private Company() { }

    public static Company Create(string name, string email, string phone, double latitude, double longitude, string? address = null, string? website = null)
    {
        return new Company
        {
            Id = Guid.NewGuid(),
            Name = name,
            Slug = Slug.Create(name),
            Email = email,
            Phone = phone,
            Address = address,
            Website = website,
            Latitude = latitude,
            Longitude = longitude,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(string name, string email, string phone, double latitude, double longitude, string? address = null, string? website = null)
    {
        if (Name != name)
        {
            Slug = Slug.Create(name);
        }

        Name = name;
        Email = email;
        Phone = phone;
        Address = address;
        Website = website;
        Latitude = latitude;
        Longitude = longitude;
        UpdatedAt = DateTime.UtcNow;
    }
}