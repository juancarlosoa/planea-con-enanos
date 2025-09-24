using EscapeRoomPlanner.Domain.Enums;

namespace EscapeRoomPlanner.Domain.Entities;

public class DailyRoute : BaseEntity
{
    public DateOnly Date { get; private set; }
    public Guid PlanId { get; private set; }
    public TimeSpan EstimatedTotalTime { get; private set; }
    public decimal EstimatedCost { get; private set; }
    public TransportMode PreferredTransportMode { get; private set; }
    public MultiModalStrategy MultiModalStrategy { get; private set; }
    
    private readonly List<RouteStop> _stops = new();
    public IReadOnlyList<RouteStop> Stops => _stops.AsReadOnly();

    private DailyRoute() { } // For EF Core

    public DailyRoute(DateOnly date, Guid planId, TransportMode preferredTransportMode = TransportMode.Driving, MultiModalStrategy strategy = MultiModalStrategy.SingleMode)
    {
        if (planId == Guid.Empty)
            throw new ArgumentException("Plan ID cannot be empty", nameof(planId));

        Date = date;
        PlanId = planId;
        PreferredTransportMode = preferredTransportMode;
        MultiModalStrategy = strategy;
        EstimatedTotalTime = TimeSpan.Zero;
        EstimatedCost = 0;
    }

    public void AddStop(Guid escapeRoomId)
    {
        if (escapeRoomId == Guid.Empty)
            throw new ArgumentException("Escape room ID cannot be empty", nameof(escapeRoomId));

        if (_stops.Any(s => s.EscapeRoomId == escapeRoomId))
            throw new InvalidOperationException("Escape room is already in this route");

        var order = _stops.Count + 1;
        var stop = new RouteStop(escapeRoomId, order, Id);
        _stops.Add(stop);
        
        RecalculateRoute();
        UpdateTimestamp();
    }

    public void RemoveStop(Guid escapeRoomId)
    {
        var stop = _stops.FirstOrDefault(s => s.EscapeRoomId == escapeRoomId);
        if (stop == null)
            throw new InvalidOperationException("Escape room is not in this route");

        _stops.Remove(stop);
        
        // Reorder remaining stops
        for (int i = 0; i < _stops.Count; i++)
        {
            _stops[i].UpdateOrder(i + 1);
        }
        
        RecalculateRoute();
        UpdateTimestamp();
    }

    public void ReorderStops(List<Guid> escapeRoomIds)
    {
        if (escapeRoomIds.Count != _stops.Count)
            throw new ArgumentException("Number of escape room IDs must match number of stops");

        if (escapeRoomIds.Distinct().Count() != escapeRoomIds.Count)
            throw new ArgumentException("Duplicate escape room IDs are not allowed");

        if (!escapeRoomIds.All(id => _stops.Any(s => s.EscapeRoomId == id)))
            throw new ArgumentException("All escape room IDs must exist in current stops");

        // Reorder stops based on provided order
        var reorderedStops = new List<RouteStop>();
        for (int i = 0; i < escapeRoomIds.Count; i++)
        {
            var stop = _stops.First(s => s.EscapeRoomId == escapeRoomIds[i]);
            stop.UpdateOrder(i + 1);
            reorderedStops.Add(stop);
        }

        _stops.Clear();
        _stops.AddRange(reorderedStops);
        
        RecalculateRoute();
        UpdateTimestamp();
    }

    public void UpdateTransportMode(TransportMode transportMode, MultiModalStrategy strategy = MultiModalStrategy.SingleMode)
    {
        PreferredTransportMode = transportMode;
        MultiModalStrategy = strategy;
        RecalculateRoute();
        UpdateTimestamp();
    }

    public void UpdateEstimatedTimes(List<(Guid EscapeRoomId, TimeSpan ArrivalTime, TimeSpan TravelTime)> timeUpdates)
    {
        foreach (var update in timeUpdates)
        {
            var stop = _stops.FirstOrDefault(s => s.EscapeRoomId == update.EscapeRoomId);
            if (stop != null)
            {
                stop.UpdateTimes(update.ArrivalTime, update.TravelTime);
            }
        }
        
        RecalculateRoute();
        UpdateTimestamp();
    }

    public void UpdateEstimatedCost(decimal cost)
    {
        if (cost < 0)
            throw new ArgumentException("Cost cannot be negative", nameof(cost));

        EstimatedCost = cost;
        UpdateTimestamp();
    }

    private void RecalculateRoute()
    {
        // Calculate total time (sum of travel times between stops)
        EstimatedTotalTime = TimeSpan.FromTicks(_stops.Sum(s => s.EstimatedTravelTime.Ticks));
        
        // Note: Actual travel time calculation would be done by external service
        // This is just a placeholder for the domain logic
    }

    public RouteStop? GetStopByOrder(int order)
    {
        return _stops.FirstOrDefault(s => s.Order == order);
    }

    public RouteStop? GetStopByEscapeRoom(Guid escapeRoomId)
    {
        return _stops.FirstOrDefault(s => s.EscapeRoomId == escapeRoomId);
    }

    public bool HasEscapeRoom(Guid escapeRoomId)
    {
        return _stops.Any(s => s.EscapeRoomId == escapeRoomId);
    }

    public int GetStopCount()
    {
        return _stops.Count;
    }

    public List<Guid> GetEscapeRoomIds()
    {
        return _stops.OrderBy(s => s.Order).Select(s => s.EscapeRoomId).ToList();
    }

    public void EnableParkAndWalk()
    {
        MultiModalStrategy = MultiModalStrategy.ParkAndWalk;
        RecalculateRoute();
        UpdateTimestamp();
    }

    public void EnablePublicTransportAndWalk()
    {
        MultiModalStrategy = MultiModalStrategy.PublicTransportAndWalk;
        RecalculateRoute();
        UpdateTimestamp();
    }

    public void EnableAutomaticOptimization()
    {
        MultiModalStrategy = MultiModalStrategy.Automatic;
        RecalculateRoute();
        UpdateTimestamp();
    }

    public bool IsMultiModalEnabled()
    {
        return MultiModalStrategy != MultiModalStrategy.SingleMode;
    }
}