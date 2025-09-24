namespace EscapeRoomPlanner.Domain.ValueObjects;

public class Schedule : ValueObject
{
    public Dictionary<DayOfWeek, TimeRange> WeeklySchedule { get; private set; }
    public List<SpecialSchedule> SpecialDates { get; private set; }

    private Schedule() 
    { 
        WeeklySchedule = new Dictionary<DayOfWeek, TimeRange>();
        SpecialDates = new List<SpecialSchedule>();
    }

    public Schedule(Dictionary<DayOfWeek, TimeRange> weeklySchedule, List<SpecialSchedule>? specialDates = null)
    {
        WeeklySchedule = weeklySchedule ?? throw new ArgumentNullException(nameof(weeklySchedule));
        SpecialDates = specialDates ?? new List<SpecialSchedule>();
    }

    public bool IsOpenAt(DateTime dateTime)
    {
        var date = dateTime.Date;
        var time = dateTime.TimeOfDay;

        // Check special dates first (they override regular schedule)
        var specialSchedule = SpecialDates.FirstOrDefault(s => s.Date == date);
        if (specialSchedule != null)
        {
            return specialSchedule.IsClosed ? false : specialSchedule.TimeRange.Contains(time);
        }

        // Check regular weekly schedule
        var dayOfWeek = dateTime.DayOfWeek;
        if (WeeklySchedule.TryGetValue(dayOfWeek, out var timeRange))
        {
            return timeRange.Contains(time);
        }

        return false; // Closed if no schedule defined for this day
    }

    public TimeRange? GetScheduleForDate(DateTime date)
    {
        // Check special dates first
        var specialSchedule = SpecialDates.FirstOrDefault(s => s.Date == date.Date);
        if (specialSchedule != null)
        {
            return specialSchedule.IsClosed ? null : specialSchedule.TimeRange;
        }

        // Check regular weekly schedule
        if (WeeklySchedule.TryGetValue(date.DayOfWeek, out var timeRange))
        {
            return timeRange;
        }

        return null;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        foreach (var kvp in WeeklySchedule.OrderBy(x => x.Key))
        {
            yield return kvp.Key;
            yield return kvp.Value;
        }

        foreach (var special in SpecialDates.OrderBy(x => x.Date))
        {
            yield return special;
        }
    }
}

public class TimeRange : ValueObject
{
    public TimeSpan StartTime { get; private set; }
    public TimeSpan EndTime { get; private set; }

    private TimeRange() { } // For EF Core

    public TimeRange(TimeSpan startTime, TimeSpan endTime)
    {
        if (startTime >= endTime)
            throw new ArgumentException("Start time must be before end time");

        StartTime = startTime;
        EndTime = endTime;
    }

    public bool Contains(TimeSpan time)
    {
        return time >= StartTime && time <= EndTime;
    }

    public TimeSpan Duration => EndTime - StartTime;

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return StartTime;
        yield return EndTime;
    }

    public override string ToString()
    {
        return $"{StartTime:hh\\:mm} - {EndTime:hh\\:mm}";
    }
}

public class SpecialSchedule : ValueObject
{
    public DateTime Date { get; private set; }
    public TimeRange? TimeRange { get; private set; }
    public bool IsClosed { get; private set; }
    public string? Description { get; private set; }

    private SpecialSchedule() { } // For EF Core

    public SpecialSchedule(DateTime date, TimeRange? timeRange = null, bool isClosed = false, string? description = null)
    {
        if (isClosed && timeRange != null)
            throw new ArgumentException("Cannot have time range when marked as closed");

        Date = date.Date;
        TimeRange = timeRange;
        IsClosed = isClosed;
        Description = description;
    }

    public static SpecialSchedule CreateClosedDay(DateTime date, string? description = null)
    {
        return new SpecialSchedule(date, null, true, description);
    }

    public static SpecialSchedule CreateSpecialHours(DateTime date, TimeRange timeRange, string? description = null)
    {
        return new SpecialSchedule(date, timeRange, false, description);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Date;
        yield return TimeRange;
        yield return IsClosed;
        yield return Description ?? string.Empty;
    }
}