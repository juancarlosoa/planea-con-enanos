using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EscapeRoomPlanner.Domain.Entities;

namespace EscapeRoomPlanner.Infrastructure.Data.Configurations;

public class RouteStopConfiguration : IEntityTypeConfiguration<RouteStop>
{
    public void Configure(EntityTypeBuilder<RouteStop> builder)
    {
        builder.ToTable("RouteStops");
        
        builder.HasKey(rs => rs.Id);
        
        // Properties
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
            .HasMaxLength(50);
            
        builder.Property(rs => rs.IsMultiModalSegment)
            .IsRequired()
            .HasDefaultValue(false);
        
        // Relationships
        builder.HasOne<EscapeRoom>()
            .WithMany()
            .HasForeignKey(rs => rs.EscapeRoomId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne<DailyRoute>()
            .WithMany(dr => dr.Stops)
            .HasForeignKey(rs => rs.DailyRouteId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Indexes
        builder.HasIndex(rs => rs.DailyRouteId);
        builder.HasIndex(rs => rs.EscapeRoomId);
        builder.HasIndex(rs => new { rs.DailyRouteId, rs.Order })
            .IsUnique();
        builder.HasIndex(rs => new { rs.DailyRouteId, rs.EscapeRoomId })
            .IsUnique();
    }
}