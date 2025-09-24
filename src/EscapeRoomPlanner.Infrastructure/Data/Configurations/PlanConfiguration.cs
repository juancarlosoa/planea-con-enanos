using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EscapeRoomPlanner.Domain.Entities;

namespace EscapeRoomPlanner.Infrastructure.Data.Configurations;

public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("Plans");
        
        builder.HasKey(p => p.Id);
        
        // Basic properties
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(p => p.Description)
            .HasMaxLength(2000);
            
        builder.Property(p => p.StartDate)
            .IsRequired();
            
        builder.Property(p => p.EndDate)
            .IsRequired();
            
        builder.Property(p => p.CreatedBy)
            .IsRequired();
            
        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>();
        
        // Relationships
        builder.HasMany(p => p.DailyRoutes)
            .WithOne()
            .HasForeignKey(dr => dr.PlanId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Indexes
        builder.HasIndex(p => p.CreatedBy);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.StartDate);
        builder.HasIndex(p => p.EndDate);
        builder.HasIndex(p => new { p.StartDate, p.EndDate });
    }
}