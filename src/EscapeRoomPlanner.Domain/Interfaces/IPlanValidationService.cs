using EscapeRoomPlanner.Domain.Entities;

namespace EscapeRoomPlanner.Domain.Interfaces;

public interface IPlanValidationService
{
    Task<PlanValidationResult> ValidatePlanAsync(Plan plan, CancellationToken cancellationToken = default);
    Task<RouteValidationResult> ValidateDailyRouteAsync(DailyRoute dailyRoute, List<EscapeRoom> escapeRooms, CancellationToken cancellationToken = default);
    Task<List<PlanConflict>> CheckScheduleConflictsAsync(Plan plan, List<EscapeRoom> escapeRooms, CancellationToken cancellationToken = default);
    Task<List<PlanSuggestion>> GetOptimizationSuggestionsAsync(Plan plan, List<EscapeRoom> escapeRooms, CancellationToken cancellationToken = default);
}

public class PlanValidationResult
{
    public bool IsValid { get; set; }
    public List<ValidationError> Errors { get; set; } = new();
    public List<ValidationWarning> Warnings { get; set; } = new();
    public List<PlanSuggestion> Suggestions { get; set; } = new();
}

public class RouteValidationResult
{
    public bool IsValid { get; set; }
    public List<ValidationError> Errors { get; set; } = new();
    public List<ValidationWarning> Warnings { get; set; } = new();
    public TimeSpan TotalTime { get; set; }
    public decimal TotalCost { get; set; }
}

public class ValidationError
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Field { get; set; }
    public object? Value { get; set; }
}

public class ValidationWarning
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Suggestion { get; set; }
}

public class PlanConflict
{
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public Guid EscapeRoomId { get; set; }
    public string? Resolution { get; set; }
}

public class PlanSuggestion
{
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public double Priority { get; set; }
}