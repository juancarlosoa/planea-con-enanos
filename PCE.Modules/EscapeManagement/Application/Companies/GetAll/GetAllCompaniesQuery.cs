using MediatR;
using PCE.Modules.EscapeManagement.Application.Companies.DTOs;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.Companies.GetAll;

public record GetAllCompaniesQuery() : IRequest<Result<List<CompanyDto>>>;
