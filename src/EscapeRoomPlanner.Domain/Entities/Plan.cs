using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.ValueObjects;

namespace EscapeRoomPlanner.Domain.Entities;

public class Plan : BaseEntity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }
    public Guid CreatedBy { get; private set; }
    public PlanStatus Status { get; private set; }
    
    private readonly List<DailyRoute> _dailyRoutes = new();
    public IReadOnlyList<DailyRoute> DailyRoutes => _dailyRoutes.AsReadOnly();

    private Plan() { } // For EF Core

    public Plan(string name, string description, DateOnly startDate, DateOnly endDate, Guid createdBy)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty", nameof(name));
        if (startDate > endDate)
            throw new ArgumentException("Start date cannot be after end date");
        if (createdBy == Guid.Empty)
            throw new ArgumentException("Created by cannot be empty", nameof(createdBy));

        Name = name;
        Description = description ?? string.Empty;
        StartDate = startDate;
        EndDate = endDate;
        CreatedBy = createdBy;
        Status = PlanStatus.Draft;

        // Daily routes will be initialized after the entity is saved and has an Id
    }

    public void InitializeDailyRoutes()
    {
        if (_dailyRoutes.Any()) return; // Already initialized
        
        var currentDate = StartDate;
        while (currentDate <= EndDate)
        {
            _dailyRoutes.Add(new DailyRoute(currentDate, Id));
            currentDate = currentDate.AddDays(1);
        }
    }
    
    private void RecreateRoutes()
    {
        _dailyRoutes.Clear();
        InitializeDailyRoutes();
    }

    public void UpdateBasicInfo(string name, string description)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty", nameof(name));

        Name = name;
        Description = description ?? string.Empty;
        UpdateTimestamp();
    }

    public void UpdateDateRange(DateOnly startDate, DateOnly endDate)
    {
        if (startDate > endDate)
            throw new ArgumentException("Start date cannot be after end date");

        StartDate = startDate;
        EndDate = endDate;
        
        // Recreate daily routes for new date range
        RecreateRoutes();
        
        UpdateTimestamp();
    }

    public void ActivatePlan()
    {
        if (Status == PlanStatus.Cancelled)
            throw new InvalidOperationException("Cannot activate a cancelled plan");

        Status = PlanStatus.Active;
        UpdateTimestamp();
    }

    public void CompletePlan()
    {
        if (Status != PlanStatus.Active)
            throw new InvalidOperationException("Only active plans can be completed");

        Status = PlanStatus.Completed;
        UpdateTimestamp();
    }

    public void CancelPlan()
    {
        if (Status == PlanStatus.Completed)
            throw new InvalidOperationException("Cannot cancel a completed plan");

        Status = PlanStatus.Cancelled;
        UpdateTimestamp();
    }

    public void ArchivePlan()
    {
        if (Status == PlanStatus.Active)
            throw new InvalidOperationException("Cannot archive an active plan");

        Status = PlanStatus.Archived;
        UpdateTimestamp();
    }

    public DailyRoute? GetRouteForDate(DateOnly date)
    {
        return _dailyRoutes.FirstOrDefault(r => r.Date == date);
    }

    public void AddStopToDay(DateOnly date, Guid escapeRoomId)
    {
        var dailyRoute = GetRouteForDate(date);
        if (dailyRoute == null)
            throw new ArgumentException($"No route exists for date {date}");

        dailyRoute.AddStop(escapeRoomId);
        UpdateTimestamp();
    }

    public void RemoveStopFromDay(DateOnly date, Guid escapeRoomId)
    {
        var dailyRoute = GetRouteForDate(date);
        if (dailyRoute == null)
            throw new ArgumentException($"No route exists for date {date}");

        dailyRoute.RemoveStop(escapeRoomId);
        UpdateTimestamp();
    }

    public TimeSpan GetTotalEstimatedTime()
    {
        return TimeSpan.FromTicks(_dailyRoutes.Sum(r => r.EstimatedTotalTime.Ticks));
    }

    public decimal GetTotalEstimatedCost()
    {
        return _dailyRoutes.Sum(r => r.EstimatedCost);
    }

    public int GetTotalDays()
    {
        return (EndDate.DayNumber - StartDate.DayNumber) + 1;
    }

    public int GetTotalEscapeRooms()
    {
        return _dailyRoutes.Sum(r => r.Stops.Count);
    }
}