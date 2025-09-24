using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;

namespace EscapeRoomPlanner.Infrastructure.Data.Configurations;

public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("Plans");
        
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(p => p.Description)
            .HasMaxLength(2000);
            
        builder.Property(p => p.StartDate)
            .IsRequired()
            .HasColumnType("date");
            
        builder.Property(p => p.EndDate)
            .IsRequired()
            .HasColumnType("date");
            
        builder.Property(p => p.CreatedBy)
            .IsRequired();
            
        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(PlanStatus.Draft);

        // Configure base entity properties
        builder.Property(p => p.CreatedAt)
            .IsRequired();
            
        builder.Property(p => p.UpdatedAt)
            .IsRequired();

        // Configure relationship with DailyRoutes
        builder.HasMany(p => p.DailyRoutes)
            .WithOne()
            .HasForeignKey(dr => dr.PlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for better query performance
        builder.HasIndex(p => p.CreatedBy);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => new { p.StartDate, p.EndDate });
        builder.HasIndex(p => p.CreatedAt);
    }
}