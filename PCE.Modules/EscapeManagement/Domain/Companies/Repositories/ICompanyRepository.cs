using PCE.Modules.EscapeManagement.Domain.Companies.Entities;
using PCE.Shared.Abstractions.Persistence;

namespace PCE.Modules.EscapeManagement.Domain.Companies.Repositories;

public interface ICompanyRepository : IRepository<Company>
{
    Task<Company?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default);
    Task<Company?> GetByEmailAsync(string email, CancellationToken ct = default);
}