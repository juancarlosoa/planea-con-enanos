using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EscapeRoomPlanner.Infrastructure.Data;

public class DbContextValidator
{
    public static bool ValidateDbContextConfiguration()
    {
        try
        {
            var options = new DbContextOptionsBuilder<EscapeRoomPlannerDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb")
                .Options;

            using var context = new EscapeRoomPlannerDbContext(options);
            
            // Try to get the model - this will validate all configurations
            var model = context.Model;
            
            // Check that all expected entity types are configured
            var entityTypes = model.GetEntityTypes().Select(e => e.ClrType.Name).ToList();
            
            var expectedEntities = new[] { "EscapeRoom", "Plan", "DailyRoute", "RouteStop" };
            var missingEntities = expectedEntities.Where(e => !entityTypes.Contains(e)).ToList();
            
            if (missingEntities.Any())
            {
                Console.WriteLine($"Missing entities: {string.Join(", ", missingEntities)}");
                return false;
            }
            
            Console.WriteLine("✅ DbContext configuration is valid!");
            Console.WriteLine($"Configured entities: {string.Join(", ", entityTypes)}");
            
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ DbContext configuration error: {ex.Message}");
            return false;
        }
    }
}