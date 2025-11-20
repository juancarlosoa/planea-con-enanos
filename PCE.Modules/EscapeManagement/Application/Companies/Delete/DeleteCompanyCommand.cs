using MediatR;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.Companies.Delete;

public record DeleteCompanyCommand(string Slug) : IRequest<Result>;
