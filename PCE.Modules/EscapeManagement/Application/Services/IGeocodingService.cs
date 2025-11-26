namespace PCE.Modules.EscapeManagement.Application.Services;

public interface IGeocodingService
{
    Task<(double lat, double lon)> GetCoordinatesAsync(string address);
}
