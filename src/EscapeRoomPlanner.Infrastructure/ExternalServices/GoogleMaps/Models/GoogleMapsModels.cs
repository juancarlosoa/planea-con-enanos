using System.Text.Json.Serialization;

namespace EscapeRoomPlanner.Infrastructure.ExternalServices.GoogleMaps;

public class GoogleDistanceMatrixResponse
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("rows")]
    public List<DistanceMatrixRow> Rows { get; set; } = new();
}

public class DistanceMatrixRow
{
    [JsonPropertyName("elements")]
    public List<DistanceMatrixElement> Elements { get; set; } = new();
}

public class DistanceMatrixElement
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("distance")]
    public DistanceValue Distance { get; set; } = new();

    [JsonPropertyName("duration")]
    public DurationValue Duration { get; set; } = new();
}

public class DistanceValue
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public int Value { get; set; }
}

public class DurationValue
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public int Value { get; set; }
}

public class GoogleDirectionsResponse
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("routes")]
    public List<DirectionsRoute> Routes { get; set; } = new();
}

public class DirectionsRoute
{
    [JsonPropertyName("legs")]
    public List<DirectionsLeg> Legs { get; set; } = new();

    [JsonPropertyName("overview_polyline")]
    public Polyline OverviewPolyline { get; set; } = new();

    [JsonPropertyName("waypoint_order")]
    public int[]? WaypointOrder { get; set; }
}

public class DirectionsLeg
{
    [JsonPropertyName("distance")]
    public DistanceValue Distance { get; set; } = new();

    [JsonPropertyName("duration")]
    public DurationValue Duration { get; set; } = new();

    [JsonPropertyName("steps")]
    public List<DirectionsStep> Steps { get; set; } = new();
}

public class DirectionsStep
{
    [JsonPropertyName("html_instructions")]
    public string HtmlInstructions { get; set; } = string.Empty;

    [JsonPropertyName("distance")]
    public DistanceValue Distance { get; set; } = new();

    [JsonPropertyName("duration")]
    public DurationValue Duration { get; set; } = new();
}

public class Polyline
{
    [JsonPropertyName("points")]
    public string Points { get; set; } = string.Empty;
}