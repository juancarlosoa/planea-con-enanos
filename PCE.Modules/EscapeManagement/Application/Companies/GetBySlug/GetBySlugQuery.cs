using MediatR;
using PCE.Modules.EscapeManagement.Application.Companies.DTOs;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.Companies.GetBySlug;

public record GetCompanyBySlugQuery(string Slug) : IRequest<Result<CompanyDto>>;