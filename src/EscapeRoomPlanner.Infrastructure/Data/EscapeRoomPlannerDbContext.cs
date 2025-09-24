using Microsoft.EntityFrameworkCore;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Infrastructure.Data.Configurations;

namespace EscapeRoomPlanner.Infrastructure.Data;

public class EscapeRoomPlannerDbContext : DbContext
{
    public EscapeRoomPlannerDbContext(DbContextOptions<EscapeRoomPlannerDbContext> options)
        : base(options)
    {
    }

    public DbSet<EscapeRoom> EscapeRooms { get; set; }
    public DbSet<Plan> Plans { get; set; }
    public DbSet<DailyRoute> DailyRoutes { get; set; }
    public DbSet<RouteStop> RouteStops { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations
        modelBuilder.ApplyConfiguration(new EscapeRoomConfiguration());
        modelBuilder.ApplyConfiguration(new PlanConfiguration());
        modelBuilder.ApplyConfiguration(new DailyRouteConfiguration());
        modelBuilder.ApplyConfiguration(new RouteStopConfiguration());

        // Configure global query filters for soft delete if needed
        // modelBuilder.Entity<EscapeRoom>().HasQueryFilter(e => e.IsActive);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Update timestamps for modified entities
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.Entity is BaseEntity && (
                e.State == EntityState.Added ||
                e.State == EntityState.Modified));

        foreach (var entityEntry in entries)
        {
            var entity = (BaseEntity)entityEntry.Entity;
            
            if (entityEntry.State == EntityState.Added)
            {
                entity.UpdateTimestamp();
            }
            else if (entityEntry.State == EntityState.Modified)
            {
                entity.UpdateTimestamp();
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}