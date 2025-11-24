using Microsoft.EntityFrameworkCore;
using PCE.Modules.EscapeManagement.Domain.Companies.Entities;
using PCE.Modules.EscapeManagement.Domain.Companies.Repositories;
using PCE.Modules.EscapeManagement.Infrastructure.Persistence;
using PCE.Shared.Abstractions.Domain;

namespace PCE.Modules.EscapeManagement.Infrastructure.Repositories.Companies;

public class CompanyRepository : ICompanyRepository
{
    private readonly EscapeManagementDbContext _context;

    public CompanyRepository(EscapeManagementDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Company entity, CancellationToken ct = default)
            => await _context.Companies.AddAsync(entity, ct);

    public void Remove(Company entity) => _context.Companies.Remove(entity);

    public void Update(Company entity) => _context.Companies.Update(entity);

    public async Task<Company?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Companies.Include(c => c.EscapeRooms).FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<List<Company>> ListAsync(CancellationToken ct = default)
        => await _context.Companies.Include(c => c.EscapeRooms).ToListAsync(ct);

    public async Task<Company?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await _context.Companies.Include(c => c.EscapeRooms).FirstOrDefaultAsync(c => c.Slug == Slug.Create(slug), ct);

    public async Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default)
        => await _context.Companies.AnyAsync(c => c.Slug == Slug.Create(slug), ct);

    public async Task<Company?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await _context.Companies.FirstOrDefaultAsync(c => c.Email == email, ct);
}
