using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;

namespace EscapeRoomPlanner.Infrastructure.Data.Configurations;

public class DailyRouteConfiguration : IEntityTypeConfiguration<DailyRoute>
{
    public void Configure(EntityTypeBuilder<DailyRoute> builder)
    {
        builder.ToTable("DailyRoutes");
        
        builder.HasKey(dr => dr.Id);
        
        builder.Property(dr => dr.Date)
            .IsRequired()
            .HasColumnType("date");
            
        builder.Property(dr => dr.PlanId)
            .IsRequired();
            
        builder.Property(dr => dr.EstimatedTotalTime)
            .IsRequired();
            
        builder.Property(dr => dr.EstimatedCost)
            .IsRequired()
            .HasPrecision(10, 2)
            .HasDefaultValue(0);
            
        builder.Property(dr => dr.PreferredTransportMode)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(TransportMode.Driving);
            
        builder.Property(dr => dr.MultiModalStrategy)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(MultiModalStrategy.SingleMode);

        // Configure base entity properties
        builder.Property(dr => dr.CreatedAt)
            .IsRequired();
            
        builder.Property(dr => dr.UpdatedAt)
            .IsRequired();

        // Configure relationship with RouteStops
        builder.HasMany(dr => dr.Stops)
            .WithOne()
            .HasForeignKey(rs => rs.DailyRouteId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for better query performance
        builder.HasIndex(dr => dr.PlanId);
        builder.HasIndex(dr => dr.Date);
        builder.HasIndex(dr => new { dr.PlanId, dr.Date })
            .IsUnique(); // Each plan can have only one route per date
    }
}