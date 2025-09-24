using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EscapeRoomPlanner.Infrastructure.Data;

public class DbSeeder
{
    private readonly EscapeRoomPlannerDbContext _context;
    private readonly ILogger<DbSeeder> _logger;

    public DbSeeder(EscapeRoomPlannerDbContext context, ILogger<DbSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            // Ensure database is created
            await _context.Database.EnsureCreatedAsync();

            // Check if data already exists
            if (await _context.EscapeRooms.AnyAsync())
            {
                _logger.LogInformation("Database already contains data. Skipping seeding.");
                return;
            }

            _logger.LogInformation("Starting database seeding...");

            // Seed Escape Rooms
            await SeedEscapeRoomsAsync();

            await _context.SaveChangesAsync();
            _logger.LogInformation("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    private async Task SeedEscapeRoomsAsync()
    {
        var escapeRooms = new List<EscapeRoom>
        {
            // Barcelona Escape Rooms
            new EscapeRoom(
                "The Lost Temple",
                "Descubre los secretos del templo perdido en esta aventura llena de misterios y acertijos arqueológicos.",
                new Address("Carrer de Mallorca, 234", "Barcelona", "08008", "España"),
                new Coordinates(41.3851, 2.1734),
                TimeSpan.FromMinutes(60),
                DifficultyLevel.Medium,
                new PriceRange(25, 35, "EUR"),
                CreateWeeklySchedule(),
                new ContactInfo("934567890", "info@losttemple.com", "https://losttemple.com")
            ),

            new EscapeRoom(
                "Zombie Apocalypse",
                "Sobrevive al apocalipsis zombie en esta experiencia de terror y supervivencia extrema.",
                new Address("Carrer del Consell de Cent, 156", "Barcelona", "08015", "España"),
                new Coordinates(41.3869, 2.1654),
                TimeSpan.FromMinutes(75),
                DifficultyLevel.Hard,
                new PriceRange(30, 40, "EUR"),
                CreateWeeklySchedule(),
                new ContactInfo("933456789", "reservas@zombieapocalypse.es", "https://zombieapocalypse.es")
            ),

            new EscapeRoom(
                "Sherlock's Mystery",
                "Ayuda al famoso detective a resolver el caso más complejo de su carrera en el Londres victoriano.",
                new Address("Carrer de Balmes, 78", "Barcelona", "08007", "España"),
                new Coordinates(41.3917, 2.1649),
                TimeSpan.FromMinutes(60),
                DifficultyLevel.Medium,
                new PriceRange(28, 38, "EUR"),
                CreateWeeklySchedule(),
                new ContactInfo("932345678", "contacto@sherlocksmystery.com", "https://sherlocksmystery.com")
            ),

            new EscapeRoom(
                "Space Station Omega",
                "Misión espacial crítica: repara la estación espacial antes de que sea demasiado tarde.",
                new Address("Carrer de Provença, 321", "Barcelona", "08037", "España"),
                new Coordinates(41.3956, 2.1619),
                TimeSpan.FromMinutes(90),
                DifficultyLevel.Expert,
                new PriceRange(35, 45, "EUR"),
                CreateWeeklySchedule(),
                new ContactInfo("931234567", "info@spaceomega.com", "https://spaceomega.com")
            ),

            new EscapeRoom(
                "Pirates' Treasure",
                "Encuentra el tesoro perdido del capitán Barbanegra en esta aventura pirata familiar.",
                new Address("Carrer de Girona, 45", "Barcelona", "08009", "España"),
                new Coordinates(41.3889, 2.1701),
                TimeSpan.FromMinutes(45),
                DifficultyLevel.Easy,
                new PriceRange(20, 30, "EUR"),
                CreateWeeklySchedule(),
                new ContactInfo("930123456", "ahoy@piratestreasure.es", "https://piratestreasure.es")
            ),

            new EscapeRoom(
                "The Haunted Mansion",
                "Explora la mansión embrujada y descubre los secretos que ocultan sus fantasmas.",
                new Address("Carrer de Valencia, 187", "Barcelona", "08011", "España"),
                new Coordinates(41.3912, 2.1598),
                TimeSpan.FromMinutes(70),
                DifficultyLevel.Hard,
                new PriceRange(32, 42, "EUR"),
                CreateWeeklySchedule(),
                new ContactInfo("929012345", "boo@hauntedmansion.com", "https://hauntedmansion.com")
            ),

            new EscapeRoom(
                "Bank Heist",
                "Planifica y ejecuta el robo perfecto en este thriller de alta tensión.",
                new Address("Carrer de Aragó, 298", "Barcelona", "08009", "España"),
                new Coordinates(41.3934, 2.1567),
                TimeSpan.FromMinutes(80),
                DifficultyLevel.Expert,
                new PriceRange(38, 48, "EUR"),
                CreateWeeklySchedule(),
                new ContactInfo("928901234", "heist@bankheist.es", "https://bankheist.es")
            ),

            new EscapeRoom(
                "Alice in Wonderland",
                "Sigue al Conejo Blanco por el País de las Maravillas en esta aventura familiar mágica.",
                new Address("Carrer de Rosselló, 156", "Barcelona", "08036", "España"),
                new Coordinates(41.3978, 2.1543),
                TimeSpan.FromMinutes(50),
                DifficultyLevel.Beginner,
                new PriceRange(22, 32, "EUR"),
                CreateWeeklySchedule(),
                new ContactInfo("927890123", "alice@wonderland.com", "https://alicewonderland.com")
            )
        };

        // Add Google Places info to some escape rooms
        escapeRooms[0].UpdateGooglePlacesInfo(new GooglePlacesInfo("ChIJd8BlQ2a0ahMRAFVjk5HtQgQ", 4.5, 127));
        escapeRooms[1].UpdateGooglePlacesInfo(new GooglePlacesInfo("ChIJd8BlQ2a0ahMRAFVjk5HtQgR", 4.2, 89));
        escapeRooms[2].UpdateGooglePlacesInfo(new GooglePlacesInfo("ChIJd8BlQ2a0ahMRAFVjk5HtQgS", 4.7, 156));

        await _context.EscapeRooms.AddRangeAsync(escapeRooms);
    }

    private static Schedule CreateWeeklySchedule()
    {
        var weeklySchedule = new Dictionary<DayOfWeek, TimeRange>
        {
            { DayOfWeek.Monday, new TimeRange(TimeSpan.FromHours(16), TimeSpan.FromHours(22)) },
            { DayOfWeek.Tuesday, new TimeRange(TimeSpan.FromHours(16), TimeSpan.FromHours(22)) },
            { DayOfWeek.Wednesday, new TimeRange(TimeSpan.FromHours(16), TimeSpan.FromHours(22)) },
            { DayOfWeek.Thursday, new TimeRange(TimeSpan.FromHours(16), TimeSpan.FromHours(22)) },
            { DayOfWeek.Friday, new TimeRange(TimeSpan.FromHours(16), TimeSpan.FromHours(24)) },
            { DayOfWeek.Saturday, new TimeRange(TimeSpan.FromHours(10), TimeSpan.FromHours(24)) },
            { DayOfWeek.Sunday, new TimeRange(TimeSpan.FromHours(10), TimeSpan.FromHours(22)) }
        };

        var specialDates = new List<SpecialSchedule>
        {
            SpecialSchedule.CreateClosedDay(new DateTime(2024, 12, 25), "Navidad"),
            SpecialSchedule.CreateClosedDay(new DateTime(2024, 1, 1), "Año Nuevo"),
            SpecialSchedule.CreateSpecialHours(
                new DateTime(2024, 12, 31), 
                new TimeRange(TimeSpan.FromHours(10), TimeSpan.FromHours(18)), 
                "Nochevieja - Horario reducido"
            )
        };

        return new Schedule(weeklySchedule, specialDates);
    }
}