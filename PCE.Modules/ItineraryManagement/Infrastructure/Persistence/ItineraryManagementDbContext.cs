using Microsoft.EntityFrameworkCore;
using PCE.Modules.ItineraryManagement.Domain.Entities;
using PCE.Shared.Abstractions.Persistence;

namespace PCE.Modules.ItineraryManagement.Infrastructure.Persistence;

public class ItineraryManagementDbContext(DbContextOptions<ItineraryManagementDbContext> options) : DbContext(options), IUnitOfWork
{
    public DbSet<Itinerary> Itineraries { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Itinerary>(entity =>
        {
            entity.ToTable("Itineraries");

            entity.HasKey(i => i.Id);

            entity.Property(i => i.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasIndex(e => e.Slug).IsUnique();

            entity.HasMany(i => i.ItineraryDays)
                .WithOne(d => d.Itinerary)
                .HasForeignKey(d => d.ItineraryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        base.OnModelCreating(modelBuilder);
    }
}