using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace EscapeRoomPlanner.Infrastructure.Data;

public static class DatabaseExtensions
{
    public static async Task<WebApplication> MigrateDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<EscapeRoomPlannerDbContext>>();

        try
        {
            var context = services.GetRequiredService<EscapeRoomPlannerDbContext>();
            
            logger.LogInformation("Starting database initialization...");
            
            // Check if it's a relational database (PostgreSQL) or InMemory
            if (context.Database.IsRelational())
            {
                logger.LogInformation("Using relational database - running migrations...");
                await context.Database.MigrateAsync();
                logger.LogInformation("Database migration completed successfully.");
            }
            else
            {
                logger.LogInformation("Using InMemory database - ensuring created...");
                await context.Database.EnsureCreatedAsync();
                logger.LogInformation("InMemory database created successfully.");
            }

            // Seed the database with test data
            var seeder = services.GetRequiredService<DbSeeder>();
            await seeder.SeedAsync();
            logger.LogInformation("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while initializing the database.");
            throw;
        }

        return app;
    }
}