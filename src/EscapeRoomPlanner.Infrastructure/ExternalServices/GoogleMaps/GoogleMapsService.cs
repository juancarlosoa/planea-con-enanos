using System.Text.Json;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.Interfaces;
using EscapeRoomPlanner.Domain.ValueObjects;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EscapeRoomPlanner.Infrastructure.ExternalServices.GoogleMaps;

public class GoogleMapsService : IGoogleMapsService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly ILogger<GoogleMapsService> _logger;
    private const string BaseUrl = "https://maps.googleapis.com/maps/api";

    public GoogleMapsService(HttpClient httpClient, IConfiguration configuration, ILogger<GoogleMapsService> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["ExternalServices:GoogleMaps:ApiKey"] ?? throw new InvalidOperationException("Google Maps API key not configured");
        _logger = logger;
    }

    public async Task<TimeSpan> CalculateTravelTimeAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default)
    {
        try
        {
            var travelMode = MapTransportModeToGoogleMode(mode);
            var url = $"{BaseUrl}/distancematrix/json?origins={from.Latitude},{from.Longitude}&destinations={to.Latitude},{to.Longitude}&mode={travelMode}&key={_apiKey}";

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<GoogleDistanceMatrixResponse>(content, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });

            if (result?.Rows?.FirstOrDefault()?.Elements?.FirstOrDefault() is { } element && element.Status == "OK")
            {
                return TimeSpan.FromSeconds(element.Duration.Value);
            }

            _logger.LogWarning("Failed to calculate travel time from Google Maps API. Status: {Status}", result?.Status);
            return TimeSpan.Zero;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating travel time from {From} to {To} with mode {Mode}", from, to, mode);
            return TimeSpan.Zero;
        }
    }

    public async Task<decimal> CalculateTravelCostAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default)
    {
        try
        {
            var distance = await CalculateDistanceAsync(from, to, mode, cancellationToken);
            return EstimateCostByMode(distance, mode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating travel cost from {From} to {To} with mode {Mode}", from, to, mode);
            return 0;
        }
    }

    public async Task<RouteSegment> GetRouteSegmentAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken = default)
    {
        try
        {
            var travelMode = MapTransportModeToGoogleMode(mode);
            var url = $"{BaseUrl}/directions/json?origin={from.Latitude},{from.Longitude}&destination={to.Latitude},{to.Longitude}&mode={travelMode}&key={_apiKey}";

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<GoogleDirectionsResponse>(content, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });

            if (result?.Routes?.FirstOrDefault() is { } route)
            {
                var leg = route.Legs.First();
                var routePoints = DecodePolyline(route.OverviewPolyline.Points);

                return new RouteSegment
                {
                    From = from,
                    To = to,
                    TravelTime = TimeSpan.FromSeconds(leg.Duration.Value),
                    Distance = leg.Distance.Value / 1000.0, // Convert to km
                    Mode = mode,
                    RoutePoints = routePoints,
                    Instructions = string.Join("; ", leg.Steps.Select(s => s.HtmlInstructions)),
                    Cost = EstimateCostByMode(leg.Distance.Value / 1000.0, mode)
                };
            }

            _logger.LogWarning("No route found from Google Directions API");
            return CreateFallbackRouteSegment(from, to, mode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting route segment from {From} to {To} with mode {Mode}", from, to, mode);
            return CreateFallbackRouteSegment(from, to, mode);
        }
    }

    public async Task<List<Coordinates>> OptimizeWaypointsAsync(List<Coordinates> waypoints, TransportMode mode, CancellationToken cancellationToken = default)
    {
        if (waypoints.Count <= 2)
            return waypoints;

        try
        {
            var origin = waypoints.First();
            var destination = waypoints.Last();
            var intermediateWaypoints = waypoints.Skip(1).Take(waypoints.Count - 2).ToList();

            var waypointsParam = string.Join("|", intermediateWaypoints.Select(w => $"{w.Latitude},{w.Longitude}"));
            var travelMode = MapTransportModeToGoogleMode(mode);
            
            var url = $"{BaseUrl}/directions/json?origin={origin.Latitude},{origin.Longitude}&destination={destination.Latitude},{destination.Longitude}&waypoints=optimize:true|{waypointsParam}&mode={travelMode}&key={_apiKey}";

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<GoogleDirectionsResponse>(content, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });

            if (result?.Routes?.FirstOrDefault() is { } route && route.WaypointOrder != null)
            {
                var optimizedWaypoints = new List<Coordinates> { origin };
                
                foreach (var index in route.WaypointOrder)
                {
                    optimizedWaypoints.Add(intermediateWaypoints[index]);
                }
                
                optimizedWaypoints.Add(destination);
                return optimizedWaypoints;
            }

            return waypoints;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error optimizing waypoints with Google Maps API");
            return waypoints;
        }
    }

    private async Task<double> CalculateDistanceAsync(Coordinates from, Coordinates to, TransportMode mode, CancellationToken cancellationToken)
    {
        var travelMode = MapTransportModeToGoogleMode(mode);
        var url = $"{BaseUrl}/distancematrix/json?origins={from.Latitude},{from.Longitude}&destinations={to.Latitude},{to.Longitude}&mode={travelMode}&key={_apiKey}";

        var response = await _httpClient.GetAsync(url, cancellationToken);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        var result = JsonSerializer.Deserialize<GoogleDistanceMatrixResponse>(content, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });

        if (result?.Rows?.FirstOrDefault()?.Elements?.FirstOrDefault() is { } element && element.Status == "OK")
        {
            return element.Distance.Value / 1000.0; // Convert to km
        }

        return 0;
    }

    private static string MapTransportModeToGoogleMode(TransportMode mode) => mode switch
    {
        TransportMode.Driving => "driving",
        TransportMode.Walking => "walking",
        TransportMode.Cycling => "bicycling",
        TransportMode.PublicTransport => "transit",
        _ => "driving"
    };

    private static decimal EstimateCostByMode(double distanceKm, TransportMode mode) => mode switch
    {
        TransportMode.Driving => (decimal)(distanceKm * 0.15), // €0.15 per km (fuel + wear)
        TransportMode.PublicTransport => (decimal)(distanceKm * 0.10), // €0.10 per km average
        TransportMode.Walking => 0,
        TransportMode.Cycling => 0,
        _ => 0
    };

    private static RouteSegment CreateFallbackRouteSegment(Coordinates from, Coordinates to, TransportMode mode)
    {
        var distance = CalculateHaversineDistance(from, to);
        var estimatedTime = mode switch
        {
            TransportMode.Driving => TimeSpan.FromMinutes(distance * 2), // ~30 km/h in city
            TransportMode.Walking => TimeSpan.FromMinutes(distance * 12), // ~5 km/h
            TransportMode.Cycling => TimeSpan.FromMinutes(distance * 4), // ~15 km/h
            TransportMode.PublicTransport => TimeSpan.FromMinutes(distance * 3), // ~20 km/h average
            _ => TimeSpan.FromMinutes(distance * 2)
        };

        return new RouteSegment
        {
            From = from,
            To = to,
            TravelTime = estimatedTime,
            Distance = distance,
            Mode = mode,
            RoutePoints = new List<Coordinates> { from, to },
            Cost = EstimateCostByMode(distance, mode)
        };
    }

    private static double CalculateHaversineDistance(Coordinates from, Coordinates to)
    {
        const double R = 6371; // Earth's radius in km
        var dLat = ToRadians(to.Latitude - from.Latitude);
        var dLon = ToRadians(to.Longitude - from.Longitude);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(from.Latitude)) * Math.Cos(ToRadians(to.Latitude)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180;

    private static List<Coordinates> DecodePolyline(string encoded)
    {
        var points = new List<Coordinates>();
        var index = 0;
        var lat = 0;
        var lng = 0;

        while (index < encoded.Length)
        {
            var shift = 0;
            var result = 0;
            int b;
            do
            {
                b = encoded[index++] - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do
            {
                b = encoded[index++] - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            points.Add(new Coordinates(lat / 1E5, lng / 1E5));
        }

        return points;
    }
}