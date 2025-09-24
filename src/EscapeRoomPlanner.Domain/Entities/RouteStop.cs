using EscapeRoomPlanner.Domain.Enums;

namespace EscapeRoomPlanner.Domain.Entities;

public class RouteStop : BaseEntity
{
    public Guid EscapeRoomId { get; private set; }
    public Guid DailyRouteId { get; private set; }
    public int Order { get; private set; }
    public TimeSpan EstimatedArrivalTime { get; private set; }
    public TimeSpan EstimatedTravelTime { get; private set; }
    public string? Notes { get; private set; }
    public TransportMode? TransportModeToNext { get; private set; }
    public bool IsMultiModalSegment { get; private set; }

    private RouteStop() { } // For EF Core

    public RouteStop(Guid escapeRoomId, int order, Guid dailyRouteId)
    {
        if (escapeRoomId == Guid.Empty)
            throw new ArgumentException("Escape room ID cannot be empty", nameof(escapeRoomId));
        if (dailyRouteId == Guid.Empty)
            throw new ArgumentException("Daily route ID cannot be empty", nameof(dailyRouteId));
        if (order <= 0)
            throw new ArgumentException("Order must be positive", nameof(order));

        EscapeRoomId = escapeRoomId;
        DailyRouteId = dailyRouteId;
        Order = order;
        EstimatedArrivalTime = TimeSpan.Zero;
        EstimatedTravelTime = TimeSpan.Zero;
        IsMultiModalSegment = false;
    }

    public void UpdateOrder(int newOrder)
    {
        if (newOrder <= 0)
            throw new ArgumentException("Order must be positive", nameof(newOrder));

        Order = newOrder;
        UpdateTimestamp();
    }

    public void UpdateTimes(TimeSpan arrivalTime, TimeSpan travelTime)
    {
        if (arrivalTime < TimeSpan.Zero)
            throw new ArgumentException("Arrival time cannot be negative", nameof(arrivalTime));
        if (travelTime < TimeSpan.Zero)
            throw new ArgumentException("Travel time cannot be negative", nameof(travelTime));

        EstimatedArrivalTime = arrivalTime;
        EstimatedTravelTime = travelTime;
        UpdateTimestamp();
    }

    public void UpdateNotes(string? notes)
    {
        Notes = notes;
        UpdateTimestamp();
    }

    public void UpdateTransportToNext(TransportMode? transportMode, bool isMultiModal = false)
    {
        TransportModeToNext = transportMode;
        IsMultiModalSegment = isMultiModal;
        UpdateTimestamp();
    }

    public bool IsFirstStop()
    {
        return Order == 1;
    }

    public TimeSpan GetEstimatedDepartureTime(TimeSpan escapeRoomDuration)
    {
        return EstimatedArrivalTime.Add(escapeRoomDuration);
    }
}