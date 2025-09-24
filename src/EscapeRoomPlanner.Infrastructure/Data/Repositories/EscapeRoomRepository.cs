using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.Interfaces;
using EscapeRoomPlanner.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace EscapeRoomPlanner.Infrastructure.Data.Repositories;

public class EscapeRoomRepository : Repository<EscapeRoom>, IEscapeRoomRepository
{
    public EscapeRoomRepository(EscapeRoomPlannerDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<EscapeRoom>> SearchByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.EscapeRooms
            .Where(er => er.IsActive && er.Name.Contains(name))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<EscapeRoom>> SearchByCityAsync(string city, CancellationToken cancellationToken = default)
    {
        return await _context.EscapeRooms
            .Where(er => er.IsActive && er.Address.City.Contains(city))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<EscapeRoom>> SearchByDifficultyAsync(DifficultyLevel difficulty, CancellationToken cancellationToken = default)
    {
        return await _context.EscapeRooms
            .Where(er => er.IsActive && er.Difficulty == difficulty)
            .ToListAsync(cancellationToken);
    }
    
    public async Task<IEnumerable<EscapeRoom>> SearchNearLocationAsync(Coordinates location, double radiusKm, CancellationToken cancellationToken = default)
    {
        // Simple distance calculation using Haversine formula approximation
        // For production, consider using PostGIS for more accurate geospatial queries
        var escapeRooms = await _context.EscapeRooms
            .Where(er => er.IsActive)
            .ToListAsync(cancellationToken);

        return escapeRooms.Where(er => er.Location.DistanceTo(location) <= radiusKm);
    }

    public async Task<IEnumerable<EscapeRoom>> SearchByPriceRangeAsync(decimal minPrice, decimal maxPrice, CancellationToken cancellationToken = default)
    {
        return await _context.EscapeRooms
            .Where(er => er.IsActive && 
                        er.PriceRange.MinPrice >= minPrice && 
                        er.PriceRange.MaxPrice <= maxPrice)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<EscapeRoom>> GetActiveEscapeRoomsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.EscapeRooms
            .Where(er => er.IsActive)
            .OrderBy(er => er.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<EscapeRoom>> SearchWithFiltersAsync(EscapeRoomSearchFilters filters, CancellationToken cancellationToken = default)
    {
        var query = _context.EscapeRooms.AsQueryable();

        // Apply active filter (default to true if not specified)
        if (filters.IsActive.HasValue)
        {
            query = query.Where(er => er.IsActive == filters.IsActive.Value);
        }
        else
        {
            query = query.Where(er => er.IsActive);
        }

        // Apply name filter
        if (!string.IsNullOrEmpty(filters.Name))
        {
            query = query.Where(er => er.Name.Contains(filters.Name));
        }

        // Apply city filter
        if (!string.IsNullOrEmpty(filters.City))
        {
            query = query.Where(er => er.Address.City.Contains(filters.City));
        }

        // Apply difficulty filter
        if (filters.Difficulty.HasValue)
        {
            query = query.Where(er => er.Difficulty == filters.Difficulty.Value);
        }

        // Apply price range filters
        if (filters.MinPrice.HasValue)
        {
            query = query.Where(er => er.PriceRange.MaxPrice >= filters.MinPrice.Value);
        }

        if (filters.MaxPrice.HasValue)
        {
            query = query.Where(er => er.PriceRange.MinPrice <= filters.MaxPrice.Value);
        }

        // Apply duration filter
        if (filters.MaxDuration.HasValue)
        {
            query = query.Where(er => er.EstimatedDuration <= filters.MaxDuration.Value);
        }

        // Apply rating filter (if Google Places info exists)
        if (filters.MinRating.HasValue)
        {
            query = query.Where(er => er.GooglePlacesInfo != null && 
                                     er.GooglePlacesInfo.Rating >= filters.MinRating.Value);
        }

        var results = await query.OrderBy(er => er.Name).ToListAsync(cancellationToken);

        // Apply location-based filtering if specified
        if (filters.Location != null && filters.RadiusKm.HasValue)
        {
            results = results.Where(er => er.Location.DistanceTo(filters.Location) <= filters.RadiusKm.Value).ToList();
        }

        return results;
    }
}