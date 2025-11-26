using System.Net.Http.Json;
using PCE.Modules.EscapeManagement.Application.Services;

namespace PCE.Modules.EscapeManagement.Infrastructure.Services;

public class NominatimGeocodingService : IGeocodingService
{
    private readonly HttpClient _httpClient;

    public NominatimGeocodingService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("PlaneaConEnanosApp");
    }

    public async Task<(double lat, double lon)> GetCoordinatesAsync(string address)
    {
        try
        {
            var url = $"https://nominatim.openstreetmap.org/search?format=json&q={Uri.EscapeDataString(address)}";
            var results = await _httpClient.GetFromJsonAsync<List<NominatimResult>>(url);

            var first = results?.FirstOrDefault();
            return first is null ? (0, 0) : (double.Parse(first.lat, System.Globalization.CultureInfo.InvariantCulture), double.Parse(first.lon, System.Globalization.CultureInfo.InvariantCulture));
        }
        catch (Exception)
        {
            return (0, 0);
        }
    }

    public record NominatimResult(string lat, string lon);
}
