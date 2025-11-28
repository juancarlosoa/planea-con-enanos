using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using MediatR;
using PCE.Modules.Location.Application.DTOs;
using PCE.Shared.Primitives;

namespace PCE.Modules.Location.Application.SearchLocation;

public class SearchLocationQueryHandler : IRequestHandler<SearchLocationQuery, Result<List<LocationResultDto>>>
{
    private readonly HttpClient _httpClient;

    public SearchLocationQueryHandler(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<Result<List<LocationResultDto>>> Handle(SearchLocationQuery query, CancellationToken cancellationToken)
    {
        try
        {
            var url = $"https://nominatim.openstreetmap.org/search?" +
                      $"format=json&limit=5" +
                      $"&street={Uri.EscapeDataString(query.Street)}" +
                      $"&city={Uri.EscapeDataString(query.City)}" +
                      $"&state={Uri.EscapeDataString(query.State)}" +
                      $"&postalcode={Uri.EscapeDataString(query.PostalCode)}" +
                      $"&country={Uri.EscapeDataString(query.Country)}";

            Console.WriteLine(url);
            var nominatimResults = await _httpClient.GetFromJsonAsync<List<NominatimResponse>>(url, cancellationToken);

            if (nominatimResults != null && nominatimResults.Count > 0)
            {
                var results = nominatimResults.Select(r => new LocationResultDto(
                    Lat: r.Lat,
                    Lon: r.Lon,
                    DisplayName: r.DisplayName
                )).ToList();

                return Result<List<LocationResultDto>>.Success(results);
            }

            return Result<List<LocationResultDto>>.Success(new List<LocationResultDto>());
        }
        catch (Exception ex)
        {
            return Result<List<LocationResultDto>>.Failure($"Error geocoding address: {ex.Message}");
        }
    }

    // Internal class to deserialize Nominatim API response
    private class NominatimResponse
    {
        [JsonPropertyName("lat")]
        public string Lat { get; set; } = string.Empty;

        [JsonPropertyName("lon")]
        public string Lon { get; set; } = string.Empty;

        [JsonPropertyName("display_name")]
        public string DisplayName { get; set; } = string.Empty;
    }
}