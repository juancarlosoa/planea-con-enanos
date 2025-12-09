using PCE.Shared.Abstractions.Domain;
using PCE.Shared.Data;

namespace PCE.Modules.ItineraryManagement.Domain.Entities;

public class Itinerary : BaseEntity
{
    public Slug Slug { get; private set; } = null!;
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }

    private readonly List<ItineraryDay> _itineraryDays = [];
    public IReadOnlyCollection<ItineraryDay> ItineraryDays => _itineraryDays.AsReadOnly();

    public static Itinerary Create()
    {

        return new Itinerary(

        );

    }

    public void Update(
        string name
    )
    {
        Name = name;
    }
}