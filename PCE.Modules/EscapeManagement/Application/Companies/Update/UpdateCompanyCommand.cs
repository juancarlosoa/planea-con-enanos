using MediatR;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.Companies.Update;

public record UpdateCompanyCommand(
    string Slug,
    string Name,
    string Email,
    string Phone,
    double? Latitude,
    double? Longitude,
    string? Address,
    string? Website) : IRequest<Result<string>>;
