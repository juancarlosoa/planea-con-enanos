using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using EscapeRoomPlanner.Infrastructure.Data;
using EscapeRoomPlanner.Infrastructure.Data.Repositories;
using EscapeRoomPlanner.Infrastructure.ExternalServices.GoogleMaps;
using EscapeRoomPlanner.Infrastructure.Services;
using EscapeRoomPlanner.Domain.Interfaces;

namespace EscapeRoomPlanner.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure database provider based on configuration
        var databaseProvider = configuration.GetValue<string>("DatabaseProvider") ?? "PostgreSQL";
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<EscapeRoomPlannerDbContext>(options =>
        {
            switch (databaseProvider.ToLower())
            {
                case "inmemory":
                    options.UseInMemoryDatabase("EscapeRoomPlannerDb");
                    break;
                case "postgresql":
                default:
                    options.UseNpgsql(connectionString);
                    break;
            }
        });

        // Add repositories
        services.AddScoped<IEscapeRoomRepository, EscapeRoomRepository>();
        services.AddScoped<IPlanRepository, PlanRepository>();
        services.AddScoped<IDailyRouteRepository, DailyRouteRepository>();
        
        // Add Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Add database seeder
        services.AddScoped<DbSeeder>();

        // Add external services
        services.AddHttpClient<IGoogleMapsService, GoogleMapsService>();
        services.AddScoped<IRouteOptimizationService, RouteOptimizationService>();

        // Add Redis (commented out for now, will be configured later)
        // services.AddStackExchangeRedisCache(options =>
        // {
        //     options.Configuration = configuration.GetConnectionString("Redis");
        // });

        return services;
    }
}