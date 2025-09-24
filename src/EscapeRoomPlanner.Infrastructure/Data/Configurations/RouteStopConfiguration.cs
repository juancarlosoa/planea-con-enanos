using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;

namespace EscapeRoomPlanner.Infrastructure.Data.Configurations;

public class RouteStopConfiguration : IEntityTypeConfiguration<RouteStop>
{
    public void Configure(EntityTypeBuilder<RouteStop> builder)
    {
        builder.ToTable("RouteStops");
        
        builder.HasKey(rs => rs.Id);
        
        builder.Property(rs => rs.EscapeRoomId)
            .IsRequired();
            
        builder.Property(rs => rs.DailyRouteId)
            .IsRequired();
            
        builder.Property(rs => rs.Order)
            .IsRequired();
            
        builder.Property(rs => rs.EstimatedArrivalTime)
            .IsRequired();
            
        builder.Property(rs => rs.EstimatedTravelTime)
            .IsRequired();
            
        builder.Property(rs => rs.Notes)
            .HasMaxLength(500);
            
        builder.Property(rs => rs.TransportModeToNext)
            .HasConversion<string>();
            
        builder.Property(rs => rs.IsMultiModalSegment)
            .IsRequired()
            .HasDefaultValue(false);

        // Configure base entity properties
        builder.Property(rs => rs.CreatedAt)
            .IsRequired();
            
        builder.Property(rs => rs.UpdatedAt)
            .IsRequired();

        // Configure relationship with EscapeRoom
        builder.HasOne<EscapeRoom>()
            .WithMany()
            .HasForeignKey(rs => rs.EscapeRoomId)
            .OnDelete(DeleteBehavior.Restrict); // Don't delete escape rooms if they're referenced in routes

        // Indexes for better query performance
        builder.HasIndex(rs => rs.DailyRouteId);
        builder.HasIndex(rs => rs.EscapeRoomId);
        builder.HasIndex(rs => new { rs.DailyRouteId, rs.Order })
            .IsUnique(); // Each daily route can have only one stop per order
        builder.HasIndex(rs => new { rs.DailyRouteId, rs.EscapeRoomId })
            .IsUnique(); // Each escape room can appear only once per daily route
    }
}