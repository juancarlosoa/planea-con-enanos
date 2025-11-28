using PCE.Modules.Location.Application.SearchLocation;

namespace PCE.Modules.Location;

public static class LocationModule
{
    public static IServiceCollection AddLocationModule(this IServiceCollection services, IConfiguration configuration)
    {
        // Register MediatR for Location module
        services.AddMediatR(cfg => 
            cfg.RegisterServicesFromAssembly(typeof(LocationModule).Assembly));

        // Register HttpClient for Nominatim API with proper headers
        services.AddHttpClient<SearchLocationQueryHandler>(client =>
        {
            // Nominatim requires a valid User-Agent
            client.DefaultRequestHeaders.Add("User-Agent", "PlaneaConEnanos/1.0 (https://github.com/yourproject; contact@youremail.com)");
            
            // Add Referer header (recommended by Nominatim)
            client.DefaultRequestHeaders.Add("Referer", "https://planeaconenanos.com");
            
            // Add Accept-Language
            client.DefaultRequestHeaders.Add("Accept-Language", "es-ES,es;q=0.9,en;q=0.8");
            
            // Set timeout
            client.Timeout = TimeSpan.FromSeconds(10);
        });

        return services;
    }
}
