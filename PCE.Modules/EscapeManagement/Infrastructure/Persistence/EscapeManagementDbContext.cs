using Microsoft.EntityFrameworkCore;
using PCE.Modules.EscapeManagement.Domain.Companies.Entities;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Entities;
using PCE.Shared.Abstractions.Domain;

namespace PCE.Modules.EscapeManagement.Infrastructure.Persistence;

using PCE.Shared.Abstractions.Persistence;

public class EscapeManagementDbContext(DbContextOptions<EscapeManagementDbContext> options) : DbContext(options), IUnitOfWork
{
      public DbSet<Company> Companies { get; set; } = null!;
      public DbSet<EscapeRoom> EscapeRooms { get; set; } = null!;

      protected override void OnModelCreating(ModelBuilder modelBuilder)
      {
            modelBuilder.Entity<Company>(entity =>
            {
                  entity.ToTable("Companies");
                  entity.HasKey(e => e.Id);

                  entity.Property(e => e.Id).ValueGeneratedNever();
                  entity.Property(e => e.Slug)
                    .IsRequired()
                    .HasMaxLength(255)
                    .HasConversion(
                        v => v.Value,
                        v => Slug.Create(v));
                  entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(255);
                  entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255);
                  entity.Property(e => e.Phone)
                    .IsRequired()
                    .HasMaxLength(50);
                  entity.Property(e => e.Address)
                    .HasMaxLength(1000);
                  entity.Property(e => e.Website)
                    .HasMaxLength(255);
                  entity.Property(e => e.CreatedAt)
                    .IsRequired();
                  entity.Property(e => e.UpdatedAt);

                  entity.HasIndex(e => e.Slug).IsUnique();

                  entity.HasMany(c => c.EscapeRooms)
                    .WithOne(e => e.Company)
                    .HasForeignKey(e => e.CompanyId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity<EscapeRoom>(entity =>
            {
                  entity.ToTable("EscapeRooms");
                  entity.HasKey(e => e.Id);

                  entity.Property(e => e.Id).ValueGeneratedNever();
                  entity.Property(e => e.Slug)
                    .IsRequired()
                    .HasMaxLength(255)
                    .HasConversion(
                        v => v.Value,
                        v => Slug.Create(v));
                  entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(255);
                  entity.Property(e => e.Description)
                    .IsRequired()
                    .HasMaxLength(4000);
                  entity.Property(e => e.MaxPlayers)
                    .IsRequired();
                  entity.Property(e => e.MinPlayers)
                    .IsRequired();
                  entity.Property(e => e.DurationMinutes)
                    .IsRequired();
                  entity.Property(e => e.DifficultyLevel)
                    .IsRequired()
                    .HasMaxLength(50);
                  entity.Property(e => e.PricePerPerson)
                    .IsRequired()
                    .HasColumnType("decimal(10,2)");
                  entity.Property(e => e.IsActive)
                    .IsRequired();

                  entity.HasIndex(e => e.Slug).IsUnique();
            });

            base.OnModelCreating(modelBuilder);
      }
}