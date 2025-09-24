using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.ValueObjects;

namespace EscapeRoomPlanner.Infrastructure.Data.Configurations;

public class EscapeRoomConfiguration : IEntityTypeConfiguration<EscapeRoom>
{
    public void Configure(EntityTypeBuilder<EscapeRoom> builder)
    {
        builder.ToTable("EscapeRooms");
        
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(e => e.Description)
            .HasMaxLength(2000);
            
        builder.Property(e => e.EstimatedDuration)
            .IsRequired();
            
        builder.Property(e => e.Difficulty)
            .IsRequired()
            .HasConversion<string>();
            
        builder.Property(e => e.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Configure Address value object
        builder.OwnsOne(e => e.Address, address =>
        {
            address.Property(a => a.Street)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnName("Address_Street");
                
            address.Property(a => a.City)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("Address_City");
                
            address.Property(a => a.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("Address_PostalCode");
                
            address.Property(a => a.Country)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("Address_Country");
        });

        // Configure Coordinates value object
        builder.OwnsOne(e => e.Location, location =>
        {
            location.Property(l => l.Latitude)
                .IsRequired()
                .HasPrecision(10, 8)
                .HasColumnName("Location_Latitude");
                
            location.Property(l => l.Longitude)
                .IsRequired()
                .HasPrecision(11, 8)
                .HasColumnName("Location_Longitude");
        });

        // Configure PriceRange value object
        builder.OwnsOne(e => e.PriceRange, priceRange =>
        {
            priceRange.Property(p => p.MinPrice)
                .IsRequired()
                .HasPrecision(10, 2)
                .HasColumnName("PriceRange_MinPrice");
                
            priceRange.Property(p => p.MaxPrice)
                .IsRequired()
                .HasPrecision(10, 2)
                .HasColumnName("PriceRange_MaxPrice");
                
            priceRange.Property(p => p.Currency)
                .IsRequired()
                .HasMaxLength(3)
                .HasColumnName("PriceRange_Currency");
        });

        // Configure ContactInfo value object
        builder.OwnsOne(e => e.ContactInfo, contactInfo =>
        {
            contactInfo.Property(c => c.Phone)
                .HasMaxLength(20)
                .HasColumnName("ContactInfo_Phone");
                
            contactInfo.Property(c => c.Email)
                .HasMaxLength(100)
                .HasColumnName("ContactInfo_Email");
                
            contactInfo.Property(c => c.Website)
                .HasMaxLength(500)
                .HasColumnName("ContactInfo_Website");
        });

        // Configure GooglePlacesInfo value object (optional)
        builder.OwnsOne(e => e.GooglePlacesInfo, googlePlaces =>
        {
            googlePlaces.Property(g => g.PlaceId)
                .HasMaxLength(100)
                .HasColumnName("GooglePlaces_PlaceId");
                
            googlePlaces.Property(g => g.Rating)
                .HasPrecision(3, 2)
                .HasColumnName("GooglePlaces_Rating");
                
            googlePlaces.Property(g => g.ReviewCount)
                .HasColumnName("GooglePlaces_ReviewCount");
                
            googlePlaces.Property(g => g.LastUpdated)
                .HasColumnName("GooglePlaces_LastUpdated");
        });

        // Configure Schedule value object - using PostgreSQL JSONB for better performance
        builder.OwnsOne(e => e.Schedule, schedule =>
        {
            // Store weekly schedule as JSONB (PostgreSQL native JSON with indexing)
            schedule.Property(s => s.WeeklySchedule)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<DayOfWeek, TimeRange>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<DayOfWeek, TimeRange>())
                .HasColumnName("Schedule_WeeklySchedule")
                .HasColumnType("jsonb");
                
            // Store special dates as JSONB
            schedule.Property(s => s.SpecialDates)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<SpecialSchedule>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<SpecialSchedule>())
                .HasColumnName("Schedule_SpecialDates")
                .HasColumnType("jsonb");
        });

        // Configure base entity properties
        builder.Property(e => e.CreatedAt)
            .IsRequired();
            
        builder.Property(e => e.UpdatedAt)
            .IsRequired();

        // Indexes for better query performance
        builder.HasIndex(e => e.Name);
        builder.HasIndex(e => e.Difficulty);
        builder.HasIndex(e => e.IsActive);
    }
}