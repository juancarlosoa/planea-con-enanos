using PCE.Shared.Data;
namespace PCE.Modules.ItineraryManagement.Domain.Entities;

public class ItineraryDay : BaseEntity
{
    public int DayNumber { get; private set; }
    public DateOnly Date { get; private set; }

    public Guid ItineraryId { get; private set; }
    public Itinerary Itinerary { get; private set; } = null!;

    private readonly List<ItineraryStop> _itineraryStops = [];
    public IReadOnlyCollection<ItineraryStop> ItineraryStops => _itineraryStops.AsReadOnly();
}